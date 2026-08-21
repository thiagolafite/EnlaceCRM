import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import routes from './routes';
import { LogService } from './services/LogService';

const app = express();

app.use(cors());
app.use(express.json());

// Rota de Healthcheck
app.get(['/api/health', '/health'], (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    system: 'Enlace CRM API',
    timestamp: new Date().toISOString(),
  });
});

// Rotas Principais (atende com ou sem prefixo /api para compatibilidade total com Vercel Serverless)
app.use('/api', routes);
app.use('/', routes);

// Middleware de Tratamento de Erros Global com Auditoria Automática
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Application Error:', err);

  const status = err.status || 500;
  const currentUser = (req as any).user;

  // Registrar no banco de dados para visualização no Painel Master
  LogService.createLog({
    level: status >= 500 ? 'ERROR' : 'WARN',
    category: 'API',
    action: `API_ERROR_${status}`,
    message: err.message || 'Erro interno no servidor',
    details: {
      path: req.originalUrl || req.url,
      method: req.method,
      status,
      stack: err.stack,
      body: req.body,
      query: req.query,
    },
    ipAddress: req.ip || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
    userId: currentUser?.id,
    userEmail: currentUser?.email,
    companyId: currentUser?.companyId,
  }).catch(() => {});

  res.status(status).json({
    error: err.message || 'Erro interno no servidor',
    timestamp: new Date().toISOString(),
    path: req.originalUrl || req.url,
  });
});

export default app;
