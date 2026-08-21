import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { LogService } from './LogService';

export interface CreateUserDTO {
  name: string;
  email: string;
  password?: string;
  role?: 'MASTER' | 'ADMIN' | 'OPERATOR';
  status?: 'ACTIVE' | 'PENDING_APPROVAL' | 'BLOCKED';
  companyId?: string;
}

export class UserService {
  static async list(currentUser?: { id: string; role: string; companyId?: string | null }) {
    const isMaster = currentUser?.role === 'MASTER';
    const where: any = {};

    // Se não for MASTER, lista apenas usuários da mesma empresa/tenant
    if (!isMaster && currentUser?.companyId) {
      where.companyId = currentUser.companyId;
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
      },
      orderBy: [{ status: 'asc' }, { name: 'asc' }],
    });
  }

  static async getById(id: string, currentUser?: { id: string; role: string; companyId?: string | null }) {
    const user = await prisma.user.findUnique({
      where: { id },
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

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    if (currentUser?.role !== 'MASTER' && currentUser?.companyId && user.companyId !== currentUser.companyId) {
      throw new Error('Acesso não permitido a este usuário');
    }

    return user;
  }

  static async create(data: CreateUserDTO, currentUser?: { id: string; role: string; companyId?: string | null }) {
    if (!data.name || !data.name.trim()) {
      throw new Error('Nome do usuário é obrigatório');
    }
    if (!data.email || !data.email.trim()) {
      throw new Error('E-mail é obrigatório');
    }
    if (!data.password || data.password.length < 6) {
      throw new Error('A senha deve ter pelo menos 6 caracteres');
    }

    const email = data.email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error('Já existe um usuário cadastrado com este e-mail');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    
    // Se o criador for MASTER, a conta pode ser ativada diretamente
    const isMaster = currentUser?.role === 'MASTER';
    let targetCompanyId = currentUser?.companyId || 'default_company';
    if (isMaster && data.companyId) {
      targetCompanyId = data.companyId;
    }

    let role = data.role || 'ADMIN';
    if (role === 'MASTER' && !isMaster) {
      role = 'ADMIN';
    }

    const status = data.status || (isMaster ? 'ACTIVE' : 'PENDING_APPROVAL');

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
      message: `Usuário ${user.name} (${user.email}) criado por ${currentUser?.role || 'Admin'} [Status: ${status}]`,
      userId: user.id,
      userEmail: user.email,
      companyId: user.companyId || undefined,
    });

    return user;
  }

  static async update(id: string, data: Partial<CreateUserDTO>, currentUser?: { id: string; role: string; companyId?: string | null }) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Usuário não encontrado');
    }

    const isMaster = currentUser?.role === 'MASTER';
    if (!isMaster && currentUser?.companyId && existing.companyId !== currentUser.companyId) {
      throw new Error('Acesso não permitido a este usuário');
    }

    const updateData: any = {};

    if (data.name !== undefined) {
      if (!data.name.trim()) throw new Error('Nome não pode ser vazio');
      updateData.name = data.name.trim();
    }

    if (data.email !== undefined) {
      const email = data.email.toLowerCase().trim();
      if (!email) throw new Error('E-mail não pode ser vazio');

      if (email !== existing.email) {
        const emailInUse = await prisma.user.findUnique({ where: { email } });
        if (emailInUse) {
          throw new Error('Este e-mail já está sendo utilizado por outro usuário');
        }
        updateData.email = email;
      }
    }

    if (data.role !== undefined) {
      if (data.role === 'MASTER' && !isMaster) {
        throw new Error('Apenas o MASTER pode atribuir este perfil');
      }
      updateData.role = data.role;
    }

    if (data.status !== undefined) {
      if (data.status === 'ACTIVE' && existing.status === 'PENDING_APPROVAL') {
        await LogService.createLog({
          level: 'INFO',
          category: 'SECURITY',
          action: 'USER_APPROVED_BY_MASTER',
          message: `Conta de ${existing.name} (${existing.email}) foi APROVADA e ativada pelo Master!`,
          userId: existing.id,
          userEmail: existing.email,
          companyId: existing.companyId || undefined,
        });
      }
      updateData.status = data.status;
    }

    if (data.companyId !== undefined && isMaster) {
      updateData.companyId = data.companyId;
    }

    if (data.password && data.password.trim()) {
      if (data.password.length < 6) {
        throw new Error('A nova senha deve ter pelo menos 6 caracteres');
      }
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
    }

    const updated = await prisma.user.update({
      where: { id },
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

    return updated;
  }

  static async toggleApproval(id: string, approve: boolean, currentUser?: { id: string; role: string; companyId?: string | null }) {
    const isMaster = currentUser?.role === 'MASTER';
    if (!isMaster) {
      throw new Error('Apenas o usuário MASTER tem permissão para aprovar ou rejeitar novos cadastros.');
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const newStatus = approve ? 'ACTIVE' : 'BLOCKED';

    const updated = await prisma.user.update({
      where: { id },
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

    await LogService.createLog({
      level: 'INFO',
      category: 'SECURITY',
      action: approve ? 'USER_APPROVED' : 'USER_REJECTED',
      message: `O usuário Master ${approve ? 'APROVOU' : 'BLOQUEOU'} a conta de ${user.name} (${user.email})`,
      userId: user.id,
      userEmail: user.email,
      companyId: user.companyId || undefined,
    });

    return updated;
  }

  static async delete(id: string, currentUser?: { id: string; role: string; companyId?: string | null }) {
    if (id === currentUser?.id) {
      throw new Error('Você não pode excluir sua própria conta enquanto estiver conectado');
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      throw new Error('Usuário não encontrado');
    }

    const isMaster = currentUser?.role === 'MASTER';
    if (!isMaster && currentUser?.companyId && targetUser.companyId !== currentUser.companyId) {
      throw new Error('Acesso não permitido a este usuário');
    }

    if (targetUser.role === 'MASTER') {
      throw new Error('O usuário MASTER principal não pode ser excluído');
    }

    await prisma.user.delete({ where: { id } });
    return { success: true };
  }
}
