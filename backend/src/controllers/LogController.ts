import { Request, Response } from 'express';
import { LogService } from '../services/LogService';

export class LogController {
  static async list(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;
      if (currentUser?.role !== 'MASTER' && currentUser?.email !== 'tigolafite@gmail.com') {
        // Registrar tentativa de acesso não autorizado
        await LogService.createLog({
          level: 'SECURITY',
          category: 'SECURITY',
          action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
          message: `Tentativa de acesso não autorizado ao painel de logs pelo usuário ${currentUser?.email || 'anônimo'}`,
          userId: currentUser?.id,
          userEmail: currentUser?.email,
          ipAddress: req.ip || req.socket.remoteAddress,
          userAgent: req.headers['user-agent'],
        });
        return res.status(403).json({ error: 'Acesso negado. Apenas o usuário MASTER tem permissão para visualizar os logs de auditoria.' });
      }

      const {
        level,
        category,
        action,
        search,
        page,
        limit,
        startDate,
        endDate,
      } = req.query;

      const result = await LogService.listLogs({
        level: level as string,
        category: category as string,
        action: action as string,
        search: search as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 50,
        startDate: startDate as string,
        endDate: endDate as string,
      });

      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Erro ao listar logs' });
    }
  }

  static async getMetrics(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;
      if (currentUser?.role !== 'MASTER' && currentUser?.email !== 'tigolafite@gmail.com') {
        return res.status(403).json({ error: 'Acesso restrito ao perfil MASTER' });
      }

      const metrics = await LogService.getMetrics();
      return res.json(metrics);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Erro ao obter métricas' });
    }
  }

  static async testLog(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;
      const { type = 'ERROR', message = 'Teste de log gerado manualmente pelo painel Master' } = req.body;

      const log = await LogService.createLog({
        level: type as any,
        category: type === 'SECURITY' ? 'SECURITY' : 'API',
        action: type === 'SECURITY' ? 'SECURITY_TEST_ALERT' : 'MANUAL_TEST_ERROR',
        message: message,
        details: {
          generatedBy: currentUser?.email,
          timestamp: new Date().toISOString(),
          simulatedStack: 'Error: Simulated error at MasterDashboard.tsx\n    at LogController.testLog',
        },
        userId: currentUser?.id,
        userEmail: currentUser?.email,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      });

      return res.json({ success: true, log });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async clear(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;
      if (currentUser?.role !== 'MASTER' && currentUser?.email !== 'tigolafite@gmail.com') {
        return res.status(403).json({ error: 'Acesso restrito ao perfil MASTER' });
      }

      const { olderThanDays } = req.body;
      const result = await LogService.clearLogs(olderThanDays ? Number(olderThanDays) : 30);
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}
