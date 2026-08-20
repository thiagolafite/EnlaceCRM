import { Request, Response } from 'express';
import { CommemorativeDateService } from '../services/CommemorativeDateService';

export class CommemorativeDateController {
  static async list(req: Request, res: Response) {
    try {
      const dates = await CommemorativeDateService.list();
      return res.json(dates);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const date = await CommemorativeDateService.create(req.body);
      return res.status(201).json(date);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const date = await CommemorativeDateService.update(id, req.body);
      return res.json(date);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await CommemorativeDateService.delete(id);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async getUpcoming(req: Request, res: Response) {
    try {
      const { days } = req.query;
      const daysCount = days ? Number(days) : 30;
      const events = await CommemorativeDateService.getUpcomingEvents(daysCount);
      return res.json(events);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }
}
