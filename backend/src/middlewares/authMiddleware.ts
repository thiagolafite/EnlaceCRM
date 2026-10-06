import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { prisma } from '../utils/prisma';
import { AuthenticatedUserContext } from '../utils/tenant';

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUserContext;
}

interface CachedUser {
  user: AuthenticatedUserContext;
  status: string;
  cachedAt: number;
}

const userCache = new Map<string, CachedUser>();
const CACHE_TTL_MS = 45000; // 45 segundos de cache

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido' });
  }

  const [, token] = authHeader.split(' ');

  if (!token) {
    return res.status(401).json({ error: 'Formato de token inválido' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as {
      id: string;
      email: string;
    };

    const now = Date.now();
    const cached = userCache.get(decoded.id);

    if (cached && now - cached.cachedAt < CACHE_TTL_MS) {
      if (cached.status === 'BLOCKED') {
        return res.status(403).json({ error: 'Sua conta está bloqueada pelo administrador.' });
      }
      if (cached.status === 'PENDING_APPROVAL') {
        return res.status(403).json({ error: 'Sua conta está aguardando aprovação do administrador Master.' });
      }
      req.user = cached.user;
      return next();
    }

    // Busca atualizada no banco de dados
    const freshUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        companyId: true,
      },
    });

    if (!freshUser) {
      userCache.delete(decoded.id);
      return res.status(401).json({ error: 'Usuário não encontrado ou removido' });
    }

    // Atualiza cache
    userCache.set(decoded.id, {
      user: {
        id: freshUser.id,
        name: freshUser.name,
        email: freshUser.email,
        role: freshUser.role,
        companyId: freshUser.companyId,
        status: freshUser.status,
      },
      status: freshUser.status,
      cachedAt: now,
    });

    // Verificação de bloqueio e pendência
    if (freshUser.status === 'BLOCKED') {
      return res.status(403).json({ error: 'Sua conta está bloqueada pelo administrador.' });
    }

    if (freshUser.status === 'PENDING_APPROVAL') {
      return res.status(403).json({ error: 'Sua conta está aguardando aprovação do administrador Master.' });
    }

    req.user = {
      id: freshUser.id,
      name: freshUser.name,
      email: freshUser.email,
      role: freshUser.role,
      companyId: freshUser.companyId,
      status: freshUser.status,
    };

    return next();
  } catch (err: any) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

/**
 * Invalida o cache do usuário quando status ou role for alterado
 */
export function invalidateUserCache(userId: string) {
  userCache.delete(userId);
}
