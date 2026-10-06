import { Response, NextFunction } from 'express';
import { SettingsService } from '../services/SettingsService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { updateSettingsSchema } from '../validators';
import { AppError } from '../utils/AppError';
import { restartDailyScheduler } from '../jobs/scheduler';

export class SettingsController {
  static async get(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const settings = await SettingsService.getSettings(req.user);
      return res.json(settings);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const parsed = updateSettingsSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0]?.message || 'Configurações inválidas', 400);
      }

      const settings = await SettingsService.updateSettings(parsed.data as any, req.user);

      // Reinicia o scheduler se o horário foi alterado
      if (
        parsed.data.schedulerHour !== undefined ||
        parsed.data.schedulerMinute !== undefined ||
        parsed.data.schedulerEnabled !== undefined
      ) {
        restartDailyScheduler();
      }

      return res.json(settings);
    } catch (err) {
      next(err);
    }
  }

  static async testCallMeBot(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { phone, apiKey } = req.body;
      const result = await SettingsService.testCallMeBot(phone, apiKey, req.user);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }
}
