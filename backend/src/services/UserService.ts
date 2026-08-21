import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';

export interface CreateUserDTO {
  name: string;
  email: string;
  password?: string;
  role?: 'MASTER' | 'ADMIN' | 'OPERATOR';
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
        companyId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: 'asc' },
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
    
    // Se o criador for MASTER e informar companyId, usa. Senão, herda do criador.
    let targetCompanyId = currentUser?.companyId || 'default_company';
    if (currentUser?.role === 'MASTER' && data.companyId) {
      targetCompanyId = data.companyId;
    }

    let role = data.role || 'ADMIN';
    if (role === 'MASTER' && currentUser?.role !== 'MASTER') {
      role = 'ADMIN';
    }

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email,
        passwordHash,
        role,
        companyId: targetCompanyId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
      },
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
        companyId: true,
        createdAt: true,
        updatedAt: true,
      },
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
