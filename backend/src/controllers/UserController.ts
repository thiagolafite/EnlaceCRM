import { Request, Response } from 'express';
import { UserService } from '../services/UserService';

export class UserController {
  static async list(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;
      const users = await UserService.list(currentUser);
      return res.json(users);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Erro ao listar usuários' });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;
      const user = await UserService.getById(id, currentUser);
      return res.json(user);
    } catch (err: any) {
      return res.status(404).json({ error: err.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;
      const user = await UserService.create(req.body, currentUser);
      return res.status(201).json(user);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;
      const user = await UserService.update(id, req.body, currentUser);
      return res.json(user);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const currentUser = (req as any).user;
      const result = await UserService.delete(id, currentUser);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
