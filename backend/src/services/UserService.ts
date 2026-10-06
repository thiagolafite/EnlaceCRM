import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { LogService } from './LogService';
import { scopeByCompany, AuthenticatedUserContext } from '../utils/tenant';
import { AppError } from '../utils/AppError';
import { invalidateUserCache } from '../middlewares/authMiddleware';

export interface CreateUserDTO {
  name: string;
  email: string;
  password?: string;
  role?: 'MASTER' | 'ADMIN' | 'OPERATOR';
  status?: 'ACTIVE' | 'PENDING_APPROVAL' | 'BLOCKED';
  companyId?: string;
}

export class UserService {
  static async list(currentUser?: AuthenticatedUserContext | null) {
    const isMaster = currentUser?.role === 'MASTER';
    const where: any = {};

    // Se não for MASTER, lista apenas usuários da mesma empresa/tenant
    if (!isMaster) {
      const companyScope = scopeByCompany(currentUser);
      where.companyId = companyScope.companyId;
    }

    return prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: {
            id: true,
            name: true,
            tradeName: true,
            status: true,
            plan: true,
          },
        },
      },
      orderBy: [{ status: 'asc' }, { name: 'asc' }],
    });
  }

  static async getById(id: string, currentUser?: AuthenticatedUserContext | null) {
    const isMaster = currentUser?.role === 'MASTER';
    const where: any = { id };

    if (!isMaster) {
      const companyScope = scopeByCompany(currentUser);
      where.companyId = companyScope.companyId;
    }

    const user = await prisma.user.findFirst({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: {
            id: true,
            name: true,
            tradeName: true,
            status: true,
            plan: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    return user;
  }

  static async create(data: CreateUserDTO, currentUser?: AuthenticatedUserContext | null) {
    if (!data.name || !data.name.trim()) {
      throw new AppError('Nome do usuário é obrigatório', 400);
    }
    if (!data.email || !data.email.trim()) {
      throw new AppError('E-mail é obrigatório', 400);
    }
    if (!data.password || data.password.length < 10) {
      throw new AppError('A senha deve ter no mínimo 10 caracteres', 400);
    }

    const email = data.email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError('Já existe um usuário cadastrado com este e-mail', 400);
    }

    const isMaster = currentUser?.role === 'MASTER';
    let targetCompanyId = currentUser?.companyId;

    if (isMaster && data.companyId) {
      targetCompanyId = data.companyId;
    }

    if (!targetCompanyId) {
      throw new AppError('Empresa não identificada para o usuário', 400);
    }

    let role = data.role || 'OPERATOR';
    if (role === 'MASTER' && !isMaster) {
      throw new AppError('Apenas o MASTER pode criar usuários com perfil MASTER', 403);
    }

    const status = isMaster && data.status ? data.status : 'ACTIVE';
    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email,
        passwordHash,
        role,
        status,
        companyId: targetCompanyId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await LogService.createLog({
      level: 'INFO',
      category: 'AUTH',
      action: 'USER_CREATED_BY_ADMIN',
      message: `Usuário ${user.name} (${user.email}) criado por ${currentUser?.name || 'Admin'} [Perfil: ${role}]`,
      userId: user.id,
      userEmail: user.email,
      companyId: user.companyId,
    });

    return user;
  }

  static async update(id: string, data: Partial<CreateUserDTO>, currentUser?: AuthenticatedUserContext | null) {
    const isMaster = currentUser?.role === 'MASTER';
    const where: any = { id };

    if (!isMaster) {
      const companyScope = scopeByCompany(currentUser);
      where.companyId = companyScope.companyId;
    }

    const existing = await prisma.user.findFirst({ where });
    if (!existing) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Não-master não pode alterar um usuário MASTER
    if (existing.role === 'MASTER' && !isMaster) {
      throw new AppError('Acesso não permitido a este usuário', 403);
    }

    // Usuário comum não pode alterar o próprio perfil/role ou se auto-bloquear
    if (existing.id === currentUser?.id) {
      if (data.role && data.role !== existing.role) {
        throw new AppError('Você não pode alterar o seu próprio perfil de acesso', 400);
      }
      if (data.status && data.status !== existing.status) {
        throw new AppError('Você não pode alterar o status da sua própria conta', 400);
      }
    }

    // Proteção contra bloqueio/rebaixamento do último ADMIN da empresa
    if (
      existing.role === 'ADMIN' &&
      existing.status === 'ACTIVE' &&
      (data.status === 'BLOCKED' || data.status === 'PENDING_APPROVAL' || (data.role && data.role !== 'ADMIN'))
    ) {
      const activeAdminsCount = await prisma.user.count({
        where: {
          companyId: existing.companyId,
          role: 'ADMIN',
          status: 'ACTIVE',
        },
      });

      if (activeAdminsCount <= 1) {
        throw new AppError(
          'Operação não permitida: a empresa deve possuir no mínimo um Administrador ativo.',
          400
        );
      }
    }

    const updateData: any = {};

    if (data.name !== undefined) {
      if (!data.name.trim()) throw new AppError('Nome não pode ser vazio', 400);
      updateData.name = data.name.trim();
    }

    if (data.email !== undefined) {
      const email = data.email.toLowerCase().trim();
      if (!email) throw new AppError('E-mail não pode ser vazio', 400);

      if (email !== existing.email) {
        const emailInUse = await prisma.user.findUnique({ where: { email } });
        if (emailInUse) {
          throw new AppError('Este e-mail já está sendo utilizado por outro usuário', 400);
        }
        updateData.email = email;
      }
    }

    if (data.role !== undefined) {
      if (data.role === 'MASTER' && !isMaster) {
        throw new AppError('Apenas o MASTER pode atribuir este perfil', 403);
      }
      updateData.role = data.role;
    }

    if (data.status !== undefined) {
      if (data.status === 'ACTIVE' && existing.status === 'PENDING_APPROVAL') {
        await LogService.createLog({
          level: 'INFO',
          category: 'SECURITY',
          action: 'USER_APPROVED_BY_ADMIN',
          message: `Conta de ${existing.name} (${existing.email}) foi ativada por ${currentUser?.name || 'Admin'}!`,
          userId: existing.id,
          userEmail: existing.email,
          companyId: existing.companyId,
        });
      }
      updateData.status = data.status;
    }

    if (data.companyId !== undefined && isMaster) {
      updateData.companyId = data.companyId;
    }

    if (data.password && data.password.trim()) {
      if (data.password.length < 10) {
        throw new AppError('A nova senha deve ter no mínimo 10 caracteres', 400);
      }
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }

    const updated = await prisma.user.update({
      where: { id: existing.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    invalidateUserCache(existing.id);

    return updated;
  }

  static async toggleApproval(id: string, approve: boolean, currentUser?: AuthenticatedUserContext | null) {
    const isMaster = currentUser?.role === 'MASTER';
    if (!isMaster) {
      throw new AppError('Apenas o usuário MASTER tem permissão para aprovar ou rejeitar novos cadastros.', 403);
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const newStatus = approve ? 'ACTIVE' : 'BLOCKED';

    // Se aprovando, ativa também a Company associada caso esteja em TRIAL
    if (approve && user.company) {
      await prisma.company.update({
        where: { id: user.company.id },
        data: { status: 'ACTIVE' },
      });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { status: newStatus },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        companyId: true,
      },
    });

    invalidateUserCache(user.id);

    await LogService.createLog({
      level: 'INFO',
      category: 'SECURITY',
      action: approve ? 'USER_APPROVED' : 'USER_REJECTED',
      message: `O usuário Master ${approve ? 'APROVOU' : 'BLOQUEOU'} a conta de ${user.name} (${user.email})`,
      userId: user.id,
      userEmail: user.email,
      companyId: user.companyId,
    });

    return updated;
  }

  static async delete(id: string, currentUser?: AuthenticatedUserContext | null) {
    if (id === currentUser?.id) {
      throw new AppError('Você não pode excluir sua própria conta enquanto estiver conectado', 400);
    }

    const isMaster = currentUser?.role === 'MASTER';
    const where: any = { id };

    if (!isMaster) {
      const companyScope = scopeByCompany(currentUser);
      where.companyId = companyScope.companyId;
    }

    const targetUser = await prisma.user.findFirst({ where });
    if (!targetUser) {
      throw new AppError('Usuário não encontrado', 404);
    }

    if (targetUser.role === 'MASTER') {
      throw new AppError('O usuário MASTER principal não pode ser excluído', 403);
    }

    // Proteger último administrador da empresa
    if (targetUser.role === 'ADMIN') {
      const activeAdminsCount = await prisma.user.count({
        where: {
          companyId: targetUser.companyId,
          role: 'ADMIN',
          status: 'ACTIVE',
        },
      });

      if (activeAdminsCount <= 1) {
        throw new AppError(
          'Operação não permitida: a empresa deve possuir no mínimo um Administrador.',
          400
        );
      }
    }

    await prisma.user.delete({ where: { id: targetUser.id } });
    invalidateUserCache(targetUser.id);

    return { success: true };
  }
}
