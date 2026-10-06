import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import routes from './routes';
import { LogService } from './services/LogService';
import { config } from './config';
import { formatErrorForResponse } from './utils/formatError';
import { getCronState } from './jobs/scheduler';
import { prisma } from './utils/prisma';

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
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Muitas requisições enviadas em curto período de tempo.',
    solution: 'Aguarde alguns instantes antes de realizar novas operações.',
  },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Muitas tentativas de login consecutivas.',
    solution: 'Por motivos de segurança, aguarde 15 minutos antes de tentar acessar novamente.',
  },
  keyGenerator: (req) => {
    const email = req.body?.email ? String(req.body.email).toLowerCase().trim() : '';
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `${ip}_${email}`;
  },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Limite de criação de contas atingido para este endereço de rede.',
    solution: 'Aguarde 1 hora antes de cadastrar uma nova empresa ou entre em contato com o suporte.',
  },
});

app.use('/api/auth/login', loginLimiter);
app.use('/auth/login', loginLimiter);
app.use('/api/auth/register', registerLimiter);
app.use('/auth/register', registerLimiter);
app.use('/api', globalApiLimiter);
app.use('/', globalApiLimiter);

// 6. Rota de Healthcheck com Verificação de Banco e Estado do Cron
app.get(['/api/health', '/health'], async (_req: Request, res: Response) => {
  let dbStatus = 'HEALTHY';
  let dbLatencyMs = 0;
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - start;
  } catch {
    dbStatus = 'UNHEALTHY';
  }

  const cronState = getCronState();
  const isHealthy = dbStatus === 'HEALTHY';

  return res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'degraded',
    system: 'Enlace CRM API',
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
    },
    cron: {
      lastCronRunAt: cronState.lastCronRunAt,
      lastCronStatus: cronState.lastCronStatus,
      lastCronDetails: cronState.lastCronDetails,
    },
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// 7. Rotas Principais da Aplicação
app.use('/api', routes);
app.use('/', routes);

// 8. Middleware de Tratamento de Erros Global com Auditoria, Mascaramento e Instruções Direcionais
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  const requestId = crypto.randomUUID();
  const { status, body } = formatErrorForResponse(err, requestId);
  const currentUser = (req as any).user;

  // Registrar auditoria no banco de dados para visualização pelo Master
  if (status >= 400) {
    LogService.createLog({
      level: status >= 500 ? 'ERROR' : 'WARN',
      category: 'API',
      action: `API_ERROR_${status}`,
      message: body.error,
      details: {
        requestId,
        solution: body.solution,
        path: req.originalUrl || req.url,
        method: req.method,
        status,
        originalError: err.message,
      },
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      userId: currentUser?.id,
      userEmail: currentUser?.email,
      companyId: currentUser?.companyId,
    }).catch(() => {});
  }

  return res.status(status).json(body);
});

export default app;
