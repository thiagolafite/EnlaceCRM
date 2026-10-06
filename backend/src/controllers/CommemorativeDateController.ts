import { Response, NextFunction } from 'express';
import { CommemorativeDateService } from '../services/CommemorativeDateService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { createCommemorativeDateSchema, updateCommemorativeDateSchema } from '../validators';
import { AppError } from '../utils/AppError';

export class CommemorativeDateController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const dates = await CommemorativeDateService.list(req.user);
      return res.json(dates);
    } catch (err) {
      next(err);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const parsed = createCommemorativeDateSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0]?.message || 'Dados de data comemorativa inválidos', 400);
      }

      const date = await CommemorativeDateService.create(parsed.data as any, req.user);
      return res.status(201).json(date);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('ID da data comemorativa é obrigatório', 400);

      const parsed = updateCommemorativeDateSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0]?.message || 'Dados de atualização inválidos', 400);
      }

      const date = await CommemorativeDateService.update(id, parsed.data as any, req.user);
      return res.json(date);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('ID da data comemorativa é obrigatório', 400);

      const result = await CommemorativeDateService.delete(id, req.user);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async getUpcoming(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const days = req.query.days ? Number(req.query.days) : 30;
      const safeDays = Math.min(Math.max(days, 1), 365);
      const events = await CommemorativeDateService.getUpcomingEvents(safeDays, req.user);
      return res.json(events);
    } catch (err) {
      next(err);
    }
  }
}
