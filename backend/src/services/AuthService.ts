import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { config } from '../config';
import { LogService } from './LogService';

const MASTER_EMAIL = 'tigolafite@gmail.com';

export class AuthService {
  static async login(email: string, password: string, reqContext?: { ip?: string; userAgent?: string }) {
    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      await LogService.createLog({
        level: 'SECURITY',
        category: 'AUTH',
        action: 'LOGIN_FAILED_USER_NOT_FOUND',
        message: `Tentativa de login falhou: e-mail não cadastrado (${cleanEmail})`,
        userEmail: cleanEmail,
        ipAddress: reqContext?.ip,
        userAgent: reqContext?.userAgent,
      });
      throw new Error('Credenciais inválidas');
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      await LogService.createLog({
        level: 'SECURITY',
        category: 'AUTH',
        action: 'LOGIN_FAILED_PASSWORD',
        message: `Tentativa de login com senha incorreta para a conta ${cleanEmail}`,
        userId: user.id,
        userEmail: user.email,
        companyId: user.companyId || undefined,
        ipAddress: reqContext?.ip,
        userAgent: reqContext?.userAgent,
      });
      throw new Error('Credenciais inválidas');
    }

    // Trava de Segurança: Verificação de status de aprovação
    const isMaster = cleanEmail === MASTER_EMAIL;
    let role = user.role;
    let status = user.status;

    if (isMaster) {
      role = 'MASTER';
      status = 'ACTIVE';
      if (user.role !== 'MASTER' || user.status !== 'ACTIVE') {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: 'MASTER', status: 'ACTIVE' },
        });
      }
    }

    // Se a conta estiver aguardando aprovação pelo Master
    if (status === 'PENDING_APPROVAL') {
      await LogService.createLog({
        level: 'WARN',
        category: 'SECURITY',
        action: 'LOGIN_BLOCKED_PENDING_APPROVAL',
        message: `Tentativa de acesso bloqueada: usuário ${user.name} (${user.email}) ainda aguarda liberação pelo Master`,
        userId: user.id,
        userEmail: user.email,
        companyId: user.companyId || undefined,
        ipAddress: reqContext?.ip,
        userAgent: reqContext?.userAgent,
      });
      throw new Error('🔒 Sua conta foi criada, mas está aguardando liberação e aprovação pelo administrador Master para ser ativada.');
    }

    // Se a conta foi desativada/bloqueada
    if (status === 'BLOCKED') {
      await LogService.createLog({
        level: 'SECURITY',
        category: 'SECURITY',
        action: 'LOGIN_BLOCKED_DISABLED_USER',
        message: `Tentativa de acesso rejeitada: usuário desativado (${user.email})`,
        userId: user.id,
        userEmail: user.email,
        companyId: user.companyId || undefined,
        ipAddress: reqContext?.ip,
        userAgent: reqContext?.userAgent,
      });
      throw new Error('⛔ Sua conta está bloqueada ou desativada pelo administrador. Entre em contato com o suporte.');
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

    // Registrar login bem-sucedido
    await LogService.createLog({
      level: 'INFO',
      category: 'AUTH',
      action: 'LOGIN_SUCCESS',
      message: `Login autorizado: ${user.name} (${user.email}) [Perfil: ${role}]`,
      userId: user.id,
      userEmail: user.email,
      companyId: user.companyId || undefined,
      ipAddress: reqContext?.ip,
      userAgent: reqContext?.userAgent,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role,
        status,
        companyId: user.companyId || 'default_company',
      },
      token,
    };
  }

  static async register(name: string, email: string, password: string, reqContext?: { ip?: string; userAgent?: string }) {
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
    const status = isMaster ? 'ACTIVE' : 'PENDING_APPROVAL';
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
        status,
        companyId,
      },
    });

    // Registrar log de novo cadastro
    await LogService.createLog({
      level: isMaster ? 'INFO' : 'WARN',
      category: 'SECURITY',
      action: isMaster ? 'MASTER_REGISTERED' : 'USER_REGISTERED_PENDING_APPROVAL',
      message: isMaster
        ? `Conta Master criada com sucesso (${user.email})`
        : `🚨 Novo cadastro realizado: ${user.name} (${user.email}) — Aguardando aprovação do usuário Master para ativação!`,
      userId: user.id,
      userEmail: user.email,
      companyId: user.companyId || undefined,
      ipAddress: reqContext?.ip,
      userAgent: reqContext?.userAgent,
    });

    // Se NÃO for o master, retorna aviso de pendência sem emitir token
    if (!isMaster) {
      return {
        pendingApproval: true,
        message: 'Cadastro recebido com sucesso! Por questões de segurança, sua conta foi enviada para análise e só será ativada mediante aprovação do administrador Master.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      };
    }

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
        status: user.status,
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
        status: true,
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
