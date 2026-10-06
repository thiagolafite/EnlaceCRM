import { Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { createUserSchema, updateUserSchema } from '../validators';
import { AppError } from '../utils/AppError';

export class UserController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const users = await UserService.list(req.user);
      return res.json(users);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('ID do usuário é obrigatório', 400);

      const user = await UserService.getById(id, req.user);
      return res.json(user);
    } catch (err) {
      next(err);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const parsed = createUserSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0]?.message || 'Dados de usuário inválidos', 400);
      }

      const user = await UserService.create(parsed.data as any, req.user);
      return res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('ID do usuário é obrigatório', 400);

      const parsed = updateUserSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0]?.message || 'Dados de atualização inválidos', 400);
      }

      const user = await UserService.update(id, parsed.data as any, req.user);
      return res.json(user);
    } catch (err) {
      next(err);
    }
  }

  static async toggleApproval(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { approve } = req.body;
      if (!id) throw new AppError('ID do usuário é obrigatório', 400);

      const user = await UserService.toggleApproval(id, Boolean(approve), req.user);
      return res.json(user);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('ID do usuário é obrigatório', 400);

      const result = await UserService.delete(id, req.user);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }
}
