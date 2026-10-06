import { Response, NextFunction } from 'express';
import { FamilyMemberService } from '../services/FamilyMemberService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { createFamilyMemberSchema, updateFamilyMemberSchema } from '../validators';
import { AppError } from '../utils/AppError';

export class FamilyMemberController {
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const parsed = createFamilyMemberSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0]?.message || 'Dados do familiar inválidos', 400);
      }

      const member = await FamilyMemberService.create(parsed.data as any, req.user);
      return res.status(201).json(member);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('ID do familiar é obrigatório', 400);

      const parsed = updateFamilyMemberSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0]?.message || 'Dados de atualização inválidos', 400);
      }

      const member = await FamilyMemberService.update(id, parsed.data as any, req.user);
      return res.json(member);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('ID do familiar é obrigatório', 400);

      const result = await FamilyMemberService.delete(id, req.user);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async optOut(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('ID do familiar é obrigatório', 400);

      const result = await FamilyMemberService.optOut(id, req.user);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async optIn(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('ID do familiar é obrigatório', 400);

      const result = await FamilyMemberService.optIn(id, req.user);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async listByClient(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { clientId } = req.params;
      if (!clientId) throw new AppError('ID do cliente é obrigatório', 400);

      const members = await FamilyMemberService.listByClient(clientId, req.user);
      return res.json(members);
    } catch (err) {
      next(err);
    }
  }
}
