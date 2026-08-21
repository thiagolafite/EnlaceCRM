import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { config } from '../config';

const MASTER_EMAIL = 'tigolafite@gmail.com';

export class AuthService {
  static async login(email: string, password: string) {
    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      throw new Error('Credenciais inválidas');
    }

    // Se for o e-mail master, garantir role MASTER
    let role = user.role;
    if (cleanEmail === MASTER_EMAIL && role !== 'MASTER') {
      role = 'MASTER';
      await prisma.user.update({
        where: { id: user.id },
        data: { role: 'MASTER' },
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role,
        companyId: user.companyId || 'default_company',
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role,
        companyId: user.companyId || 'default_company',
      },
      token,
    };
  }

  static async register(name: string, email: string, password: string) {
    if (!name || !name.trim()) {
      throw new Error('Nome é obrigatório');
    }
    if (!email || !email.trim()) {
      throw new Error('E-mail é obrigatório');
    }
    if (!password || password.length < 6) {
      throw new Error('A senha deve ter no mínimo 6 caracteres');
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      throw new Error('Já existe uma conta cadastrada com este e-mail');
    }

    const isMaster = cleanEmail === MASTER_EMAIL;
    const role = isMaster ? 'MASTER' : 'ADMIN';
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Cada novo cadastro gera sua própria empresa/tenant isolada
    const tempId = 'comp_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    const companyId = isMaster ? 'default_company' : tempId;

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        role,
        companyId,
      },
    });

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId,
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      },
      token,
    };
  }

  static async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyId: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return user;
  }
}
