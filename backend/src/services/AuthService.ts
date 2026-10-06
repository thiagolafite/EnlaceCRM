import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { config } from '../config';
import { LogService } from './LogService';
import { AppError } from '../utils/AppError';

// Hash fictício de tamanho realista para evitar timing attacks quando o usuário não existe
const DUMMY_HASH = '$2a$10$7EqJtq98hPqEX7fNZaFWoO9y9bL/o5l7m3Y3wz3Wq1j.9H1rY/m4q';

export class AuthService {
  static async login(email: string, password: string, reqContext?: { ip?: string; userAgent?: string }) {
    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      // Realiza comparação fictícia para equalizar tempo de resposta
      await bcrypt.compare(password, DUMMY_HASH);
      
      await LogService.createLog({
        level: 'SECURITY',
        category: 'AUTH',
        action: 'LOGIN_FAILED_USER_NOT_FOUND',
        message: `Tentativa de login falhou: e-mail não cadastrado (${cleanEmail})`,
        userEmail: cleanEmail,
        ipAddress: reqContext?.ip,
        userAgent: reqContext?.userAgent,
      });
      throw new AppError('Credenciais inválidas', 401);
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
      throw new AppError('Credenciais inválidas', 401);
    }

    // Verificação de status e role a partir do banco de dados
    const role = user.role;
    const status = user.status;

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
      throw new AppError('🔒 Sua conta foi criada, mas está aguardando liberação e aprovação pelo administrador Master para ser ativada.', 403);
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
      throw new AppError('⛔ Sua conta está bloqueada ou desativada pelo administrador. Entre em contato com o suporte.', 403);
    }

    // Token JWT com validade reduzida de 8 horas
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role,
        companyId: user.companyId,
      },
      config.jwtSecret,
      { expiresIn: '8h' }
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
        companyId: user.companyId,
      },
      token,
    };
  }

  static async register(name: string, email: string, password: string, reqContext?: { ip?: string; userAgent?: string }) {
    const cleanName = name.trim();
    const cleanEmail = email.toLowerCase().trim();

    if (!cleanName) {
      throw new AppError('Nome é obrigatório', 400);
    }
    if (!cleanEmail) {
      throw new AppError('E-mail é obrigatório', 400);
    }
    if (!password || password.length < 10) {
      throw new AppError('A senha deve ter no mínimo 10 caracteres', 400);
    }

    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      throw new AppError('Já existe uma conta cadastrada com este e-mail', 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    // Criação transacional da Empresa (Company), CompanySettings e Usuário ADMIN com status TRIAL e PENDING_APPROVAL
    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 dias de teste

    const company = await prisma.company.create({
      data: {
        name: `${cleanName}'s Workspace`,
        tradeName: cleanName,
        status: 'TRIAL',
        plan: 'STARTER',
        maxClients: 500,
        trialEndsAt,
        settings: {
          create: {
            ownerWhatsappPhone: '',
            callmebotApiKey: '',
            callmebotEnabled: true,
            callmebotSimulateMode: false,
            schedulerHour: 6,
            schedulerMinute: 0,
            schedulerEnabled: true,
          },
        },
      },
    });

    const user = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        passwordHash,
        role: 'ADMIN',
        status: 'PENDING_APPROVAL',
        companyId: company.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        companyId: true,
      },
    });

    // Registrar log de novo cadastro
    await LogService.createLog({
      level: 'WARN',
      category: 'SECURITY',
      action: 'USER_REGISTERED_PENDING_APPROVAL',
      message: `🚨 Novo cadastro realizado: ${user.name} (${user.email}) — Empresa: ${company.name} — Aguardando aprovação do Master!`,
      userId: user.id,
      userEmail: user.email,
      companyId: user.companyId,
      ipAddress: reqContext?.ip,
      userAgent: reqContext?.userAgent,
    });

    return {
      pendingApproval: true,
      message: 'Cadastro recebido com sucesso! Por questões de segurança, sua conta foi enviada para análise e só será ativada mediante aprovação do administrador Master.',
      user,
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
        company: {
          select: {
            id: true,
            name: true,
            tradeName: true,
            status: true,
            plan: true,
            maxClients: true,
            trialEndsAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    return user;
  }
}
