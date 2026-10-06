import { Response, NextFunction } from 'express';
import { LogService } from '../services/LogService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { listLogsQuerySchema } from '../validators';
import { AppError } from '../utils/AppError';
import { config } from '../config';

export class LogController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const parsed = listLogsQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0]?.message || 'Parâmetros de busca inválidos', 400);
      }

      const result = await LogService.listLogs(parsed.data);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async getMetrics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const metrics = await LogService.getMetrics();
      return res.json(metrics);
    } catch (err) {
      next(err);
    }
  }

  static async testLog(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (config.nodeEnv === 'production') {
        throw new AppError('Endpoint de teste de log desabilitado em ambiente de produção', 404);
      }

      const currentUser = req.user;
      const { type = 'ERROR', message = 'Teste de log gerado manualmente pelo painel Master' } = req.body;

      const log = await LogService.createLog({
        level: type as any,
        category: type === 'SECURITY' ? 'SECURITY' : 'API',
        action: type === 'SECURITY' ? 'SECURITY_TEST_ALERT' : 'MANUAL_TEST_ERROR',
        message,
        details: {
          generatedBy: currentUser?.email,
          timestamp: new Date().toISOString(),
        },
        userId: currentUser?.id,
        userEmail: currentUser?.email,
        companyId: currentUser?.companyId,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      });

      return res.json({ success: true, log });
    } catch (err) {
      next(err);
    }
  }

  static async clear(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { olderThanDays } = req.body;
      const days = olderThanDays ? Math.max(Number(olderThanDays), 1) : 90;
      const result = await LogService.clearLogs(days);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }
}
