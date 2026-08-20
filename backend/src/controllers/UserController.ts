import { Request, Response } from 'express';
import { UserService } from '../services/UserService';

export class UserController {
  static async list(req: Request, res: Response) {
    try {
      const users = await UserService.list();
      return res.json(users);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Erro ao listar usuários' });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await UserService.getById(id);
      return res.json(user);
    } catch (err: any) {
      return res.status(404).json({ error: err.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const user = await UserService.create(req.body);
      return res.status(201).json(user);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await UserService.update(id, req.body);
      return res.json(user);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const currentUserId = (req as any).user?.id;
      const result = await UserService.delete(id, currentUserId);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
