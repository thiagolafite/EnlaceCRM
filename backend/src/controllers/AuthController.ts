import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators';
import { AppError } from '../utils/AppError';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0]?.message || 'Dados de login inválidos', 400);
      }

      const { email, password } = parsed.data;
      const reqContext = {
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      const result = await AuthService.login(email, password, reqContext);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0]?.message || 'Dados de cadastro inválidos', 400);
      }

      const { name, email, password } = parsed.data;
      const reqContext = {
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      const result = await AuthService.register(name, email, password, reqContext);
      return res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.id) {
        throw new AppError('Não autenticado', 401);
      }

      const user = await AuthService.me(req.user.id);
      return res.json(user);
    } catch (err) {
      next(err);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = forgotPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0]?.message || 'E-mail inválido', 400);
      }

      let origin = req.headers.origin as string | undefined;
      if (!origin && req.headers.referer) {
        try {
          origin = new URL(req.headers.referer as string).origin;
        } catch {
          // ignora se referer for inválido
        }
      }

      const reqContext = {
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      const result = await AuthService.forgotPassword(parsed.data.email, origin, reqContext);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async verifyResetToken(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.query.token as string;
      if (!token) {
        throw new AppError('Token de recuperação é obrigatório', 400);
      }

      const result = await AuthService.verifyResetToken(token);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = resetPasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.errors[0]?.message || 'Dados de redefinição inválidos', 400);
      }

      const reqContext = {
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      };

      const result = await AuthService.resetPassword(parsed.data.token, parsed.data.password, reqContext);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }
}
