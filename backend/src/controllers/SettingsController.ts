import { Request, Response } from 'express';
import { SettingsService } from '../services/SettingsService';
import { restartDailyScheduler } from '../jobs/scheduler';

export class SettingsController {
  static async get(req: Request, res: Response) {
    try {
      const settings = await SettingsService.getSettings();
      return res.json(settings);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const settings = await SettingsService.updateSettings(req.body);

      // Reinicia o scheduler se o horário foi alterado
      if (
        req.body.schedulerHour !== undefined ||
        req.body.schedulerMinute !== undefined ||
        req.body.schedulerEnabled !== undefined
      ) {
        restartDailyScheduler();
      }

      return res.json(settings);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async testCallMeBot(req: Request, res: Response) {
    try {
      const { phone, apiKey } = req.body;
      const result = await SettingsService.testCallMeBot(phone, apiKey);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Erro ao testar CallMeBot' });
    }
  }
}
