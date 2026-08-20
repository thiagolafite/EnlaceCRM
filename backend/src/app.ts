import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();

app.use(cors());
app.use(express.json());

// Rota de Healthcheck
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    system: 'Enlace CRM API',
    timestamp: new Date().toISOString(),
  });
});

// Rotas Principais
app.use('/api', routes);

// Middleware de Tratamento de Erros Global
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Application Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno no servidor',
  });
});

export default app;
