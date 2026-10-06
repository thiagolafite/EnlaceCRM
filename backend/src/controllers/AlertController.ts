import { Response, NextFunction } from 'express';
import { AlertService } from '../services/AlertService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { AppError } from '../utils/AppError';

export class AlertController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { date, sentToClientManual, eventType, search, page, limit } = req.query;

      let sentManualBool: boolean | undefined = undefined;
      if (sentToClientManual === 'true') sentManualBool = true;
      if (sentToClientManual === 'false') sentManualBool = false;

      const result = await AlertService.listAlerts(
        {
          date: date as string,
          sentToClientManual: sentManualBool,
          eventType: eventType as string,
          search: search as string,
          page: page ? Number(page) : 1,
          limit: limit ? Math.min(Number(limit), 100) : 50,
        },
        req.user
      );

      return res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async toggleSent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { sentManual } = req.body;
      if (!id) throw new AppError('ID do alerta é obrigatório', 400);

      const alert = await AlertService.toggleSentManual(id, sentManual, req.user);
      return res.json(alert);
    } catch (err) {
      next(err);
    }
  }

  static async resendNotification(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { date } = req.body;
      const result = await AlertService.resendDailyNotification(date, req.user);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const stats = await AlertService.getStats(req.user);
      return res.json(stats);
    } catch (err) {
      next(err);
    }
  }
}
