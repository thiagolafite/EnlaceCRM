import { Response, NextFunction } from 'express';
import { ClientService } from '../services/ClientService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { createClientSchema, updateClientSchema, listClientQuerySchema } from '../validators';
import { AppError } from '../utils/AppError';

export class ClientController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const parsed = listClientQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0]?.message || 'Parâmetros de busca inválidos', 400);
      }

      const result = await ClientService.list(parsed.data, req.user);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('ID do cliente é obrigatório', 400);

      const client = await ClientService.getById(id, req.user);
      return res.json(client);
    } catch (err) {
      next(err);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const parsed = createClientSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0]?.message || 'Dados do cliente inválidos', 400);
      }

      const client = await ClientService.create(parsed.data as any, req.user);
      return res.status(201).json(client);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('ID do cliente é obrigatório', 400);

      const parsed = updateClientSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0]?.message || 'Dados de atualização inválidos', 400);
      }

      const client = await ClientService.update(id, parsed.data as any, req.user);
      return res.json(client);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('ID do cliente é obrigatório', 400);

      const result = await ClientService.delete(id, req.user);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async toggleLgpd(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { consent, consentSource, consentNote } = req.body;
      if (!id) throw new AppError('ID do cliente é obrigatório', 400);

      if (consent) {
        const result = await ClientService.optIn(id, consentSource || 'MANUAL', consentNote, req.user);
        return res.json(result);
      } else {
        const result = await ClientService.optOut(id, req.user);
        return res.json(result);
      }
    } catch (err) {
      next(err);
    }
  }

  static async optOut(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('ID do cliente é obrigatório', 400);

      const result = await ClientService.optOut(id, req.user);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async optIn(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { consentSource, consentNote } = req.body;
      if (!id) throw new AppError('ID do cliente é obrigatório', 400);

      const result = await ClientService.optIn(id, consentSource, consentNote, req.user);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async exportData(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('ID do cliente é obrigatório', 400);

      const report = await ClientService.exportData(id, req.user);
      return res.json(report);
    } catch (err) {
      next(err);
    }
  }

  static async anonymize(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('ID do cliente é obrigatório', 400);

      const result = await ClientService.anonymize(id, req.user);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const stats = await ClientService.getStats(req.user);
      return res.json(stats);
    } catch (err) {
      next(err);
    }
  }
}
