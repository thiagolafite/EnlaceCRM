import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import routes from './routes';
import { LogService } from './services/LogService';
import { config } from './config';
import { AppError } from './utils/AppError';

const app = express();

// 1. Trust proxy para ambientes atrás de reverse proxy / load balancers (Vercel, Railway, Nginx)
app.set('trust proxy', 1);

// 2. Proteção de Headers HTTP com Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // Desabilitado para APIs RESTful
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// 3. CORS liberando Vercel (*.vercel.app), localhost e origens configuradas
app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir requisições sem origem (como apps mobile, curl, server-to-server)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/$/, '').toLowerCase();
      const allowedOrigins = config.corsOrigins.map((o) => o.trim().replace(/\/$/, '').toLowerCase());

      const isAllowed =
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(normalizedOrigin) ||
        normalizedOrigin.endsWith('.vercel.app') ||
        normalizedOrigin.startsWith('http://localhost:') ||
        normalizedOrigin.startsWith('http://127.0.0.1:');

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(null, true); // Permissivo durante fase de transição/domínio provisório
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Request-Id'],
  })
);

// 4. Limite de Payload JSON restrito a 100kb para mitigar DoS
app.use(express.json({ limit: '100kb' }));

// 5. Rate Limiters Granulares
const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 600, // Máximo de 600 requisições por IP a cada 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Por favor, tente novamente em alguns minutos.' },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // Máximo de 20 tentativas por janela
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas de login. Por favor, aguarde 15 minutos antes de tentar novamente.' },
  keyGenerator: (req) => {
    const email = req.body?.email ? String(req.body.email).toLowerCase().trim() : '';
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `${ip}_${email}`;
  },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // Máximo de 20 cadastros por IP a cada hora
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Limite de cadastros atingido para este endereço IP. Tente novamente mais tarde.' },
});

// Atribuir rate limiters específicos antes das rotas
app.use('/api/auth/login', loginLimiter);
app.use('/auth/login', loginLimiter);
app.use('/api/auth/register', registerLimiter);
app.use('/auth/register', registerLimiter);
app.use('/api', globalApiLimiter);
app.use('/', globalApiLimiter);

// 6. Rota de Healthcheck
app.get(['/api/health', '/health'], (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    system: 'Enlace CRM API',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// 7. Rotas Principais da Aplicação
app.use('/api', routes);
app.use('/', routes);

// 8. Middleware de Tratamento de Erros Global com Auditoria e Sanitização
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const requestId = crypto.randomUUID();
  const isAppError = err instanceof AppError;
  const status = isAppError ? err.statusCode : err.status || 500;
  const currentUser = (req as any).user;

  // Registrar erro no banco de dados com dados mascarados (sem senhas ou tokens)
  if (status >= 400) {
    LogService.createLog({
      level: status >= 500 ? 'ERROR' : 'WARN',
      category: 'API',
      action: isAppError ? `CLIENT_ERROR_${status}` : `SERVER_ERROR_${status}`,
      message: err.message || 'Erro durante processamento da requisição',
      details: {
        requestId,
        path: req.originalUrl || req.url,
        method: req.method,
        status,
        errorName: err.name,
        details: isAppError ? err.details : undefined,
      },
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      userId: currentUser?.id,
      userEmail: currentUser?.email,
      companyId: currentUser?.companyId,
    }).catch(() => {});
  }

  // Em produção, para erros 500 não operacionais, devolve mensagem genérica protegida
  if (config.nodeEnv === 'production' && status >= 500) {
    return res.status(status).json({
      error: 'Ocorreu um erro interno no servidor. Por favor, contate o suporte com o código do erro.',
      requestId,
      timestamp: new Date().toISOString(),
    });
  }

  return res.status(status).json({
    error: err.message || 'Erro interno no servidor',
    requestId,
    timestamp: new Date().toISOString(),
    path: req.originalUrl || req.url,
    details: isAppError ? err.details : undefined,
  });
});

export default app;
