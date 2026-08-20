import { Request, Response } from 'express';
import { SendHistoryService } from '../services/SendHistoryService';

export class SendHistoryController {
  static async list(req: Request, res: Response) {
    try {
      const { clientId, channel, status, eventType, search, startDate, endDate, page, limit } = req.query;
      const result = await SendHistoryService.list({
        clientId: clientId as string,
        channel: channel as string,
        status: status as string,
        eventType: eventType as string,
        search: search as string,
        startDate: startDate as string,
        endDate: endDate as string,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const history = await SendHistoryService.getById(id);
      return res.json(history);
    } catch (err: any) {
      return res.status(404).json({ error: err.message });
    }
  }

  static async retrySingle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await SendHistoryService.retrySingle(id);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async retryAllFailed(req: Request, res: Response) {
    try {
      const result = await SendHistoryService.retryAllFailed();
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
