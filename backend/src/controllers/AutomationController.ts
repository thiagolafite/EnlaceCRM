import { Response, NextFunction } from 'express';
import { AutomationService } from '../services/AutomationService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { AppError } from '../utils/AppError';

export class AutomationController {
  static async runToday(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const report = await AutomationService.scanAndDispatch(req.user, new Date(), false);
      return res.json({
        success: true,
        message: 'Varredura de automação executada com sucesso para sua empresa',
        report,
      });
    } catch (err) {
      next(err);
    }
  }

  static async simulate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { targetDate } = req.body;
      const dateToSimulate = targetDate ? new Date(targetDate) : new Date();

      if (isNaN(dateToSimulate.getTime())) {
        throw new AppError('Data de simulação inválida', 400);
      }

      const report = await AutomationService.scanAndDispatch(req.user, dateToSimulate, true);
      return res.json({
        success: true,
        message: `Simulação realizada para ${dateToSimulate.toLocaleDateString('pt-BR')}`,
        report,
      });
    } catch (err) {
      next(err);
    }
  }
}
