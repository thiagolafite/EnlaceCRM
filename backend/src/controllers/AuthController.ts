import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
      }

      const result = await AuthService.login(email, password);
      return res.json(result);
    } catch (err: any) {
      return res.status(401).json({ error: err.message || 'Erro ao realizar login' });
    }
  }

  static async me(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Não autenticado' });
      }

      const user = await AuthService.me(req.user.id);
      return res.json(user);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
