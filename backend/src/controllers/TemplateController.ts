import { Response, NextFunction } from 'express';
import { TemplateService } from '../services/TemplateService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { createTemplateSchema, updateTemplateSchema } from '../validators';
import { AppError } from '../utils/AppError';

export class TemplateController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { eventType, channel } = req.query;
      const templates = await TemplateService.list(
        {
          eventType: eventType as string,
          channel: channel as string,
        },
        req.user
      );
      return res.json(templates);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('ID do template é obrigatório', 400);

      const template = await TemplateService.getById(id, req.user);
      return res.json(template);
    } catch (err) {
      next(err);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const parsed = createTemplateSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0]?.message || 'Dados de template inválidos', 400);
      }

      const template = await TemplateService.create(parsed.data as any, req.user);
      return res.status(201).json(template);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('ID do template é obrigatório', 400);

      const parsed = updateTemplateSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0]?.message || 'Dados de atualização inválidos', 400);
      }

      const template = await TemplateService.update(id, parsed.data as any, req.user);
      return res.json(template);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('ID do template é obrigatório', 400);

      const result = await TemplateService.delete(id, req.user);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static getVariables(req: AuthenticatedRequest, res: Response) {
    const variables = TemplateService.getAvailableVariables();
    return res.json(variables);
  }

  static async preview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('ID do template é obrigatório', 400);

      const previewData = await TemplateService.preview(id, true);
      return res.json(previewData);
    } catch (err) {
      next(err);
    }
  }

  static async previewCustom(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { content } = req.body;
      if (!content) throw new AppError('Conteúdo para preview é obrigatório', 400);

      const previewData = await TemplateService.preview(content, false);
      return res.json(previewData);
    } catch (err) {
      next(err);
    }
  }
}
