import bcrypt from 'bcrypt';
import { prisma } from '../utils/prisma';

export interface CreateUserDTO {
  name: string;
  email: string;
  password?: string;
  role?: 'ADMIN' | 'OPERATOR';
}

export class UserService {
  static async list() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  static async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return user;
  }

  static async create(data: CreateUserDTO) {
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

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email,
        passwordHash,
        role: data.role || 'ADMIN',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  static async update(id: string, data: Partial<CreateUserDTO>) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Usuário não encontrado');
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
      updateData.role = data.role;
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
        createdAt: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  static async delete(id: string, currentUserId?: string) {
    if (id === currentUserId) {
      throw new Error('Você não pode excluir sua própria conta enquanto estiver conectado');
    }

    const totalAdmins = await prisma.user.count({ where: { role: 'ADMIN' } });
    const targetUser = await prisma.user.findUnique({ where: { id } });

    if (!targetUser) {
      throw new Error('Usuário não encontrado');
    }

    if (targetUser.role === 'ADMIN' && totalAdmins <= 1) {
      throw new Error('Não é possível excluir o único administrador do sistema');
    }

    await prisma.user.delete({ where: { id } });
    return { success: true };
  }
}
