import { Request, Response } from 'express';
import { AlertService } from '../services/AlertService';

export class AlertController {
  static async list(req: Request, res: Response) {
    try {
      const {
        date,
        sentToClientManual,
        eventType,
        search,
        page,
        limit,
      } = req.query;
      const currentUser = (req as any).user;

      let sentManualBool: boolean | undefined = undefined;
      if (sentToClientManual === 'true') sentManualBool = true;
      if (sentToClientManual === 'false') sentManualBool = false;

      const result = await AlertService.listAlerts(
        {
          date: date ? String(date) : undefined,
          sentToClientManual: sentManualBool,
          eventType: eventType ? String(eventType) : undefined,
          search: search ? String(search) : undefined,
          page: page ? Number(page) : 1,
          limit: limit ? Number(limit) : 50,
        },
        currentUser
      );

      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Erro ao listar alertas' });
    }
  }

  static async toggleSent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { sentManual } = req.body;
      const currentUser = (req as any).user;

      const updated = await AlertService.toggleSentManual(id, sentManual, currentUser);
      return res.json(updated);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Erro ao atualizar status de envio do alerta' });
    }
  }

  static async resendNotification(req: Request, res: Response) {
    try {
      const { date } = req.body;
      const currentUser = (req as any).user;

      const result = await AlertService.resendDailyNotification(date ? String(date) : undefined, currentUser);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Erro ao reenviar notificação' });
    }
  }

  static async getStats(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;
      const stats = await AlertService.getStats(currentUser);
      return res.json(stats);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Erro ao buscar métricas do dashboard' });
    }
  }
}
