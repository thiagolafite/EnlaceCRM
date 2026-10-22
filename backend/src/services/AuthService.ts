import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { config } from '../config';
import { LogService } from './LogService';
import { AppError } from '../utils/AppError';
import { EmailProvider } from '../providers/notification/EmailProvider';

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
    if (!password || password.length < 6) {
      throw new AppError('A senha deve ter no mínimo 6 caracteres', 400);
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

  static async forgotPassword(email: string, origin?: string, reqContext?: { ip?: string; userAgent?: string }) {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) {
      throw new AppError('E-mail é obrigatório', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    const standardResponse = {
      success: true,
      message: 'Se o e-mail informado estiver cadastrado em nossa base, você receberá um link com instruções para redefinir sua senha em instantes.',
    };

    if (!user) {
      await bcrypt.compare('dummy_password_timing', DUMMY_HASH);
      await LogService.createLog({
        level: 'WARN',
        category: 'AUTH',
        action: 'FORGOT_PASSWORD_USER_NOT_FOUND',
        message: `Tentativa de recuperação para e-mail não existente: ${cleanEmail}`,
        userEmail: cleanEmail,
        ipAddress: reqContext?.ip,
        userAgent: reqContext?.userAgent,
      });
      return standardResponse;
    }

    if (user.status === 'BLOCKED') {
      await LogService.createLog({
        level: 'SECURITY',
        category: 'AUTH',
        action: 'FORGOT_PASSWORD_BLOCKED_USER',
        message: `Tentativa de recuperação para usuário bloqueado: ${cleanEmail}`,
        userId: user.id,
        userEmail: user.email,
        ipAddress: reqContext?.ip,
        userAgent: reqContext?.userAgent,
      });
      throw new AppError('Esta conta está bloqueada pelo administrador. Entre em contato com o suporte.', 403);
    }

    const resetSecret = `${config.jwtSecret}_${user.passwordHash}`;
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        type: 'pwd_reset',
      },
      resetSecret,
      { expiresIn: '1h' }
    );

    const baseUrl = (origin || config.appUrl || 'https://enlace-crm.vercel.app').replace(/\/+$/, '');
    const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

    await EmailProvider.sendPasswordResetEmail(user.email, user.name, resetUrl);

    await LogService.createLog({
      level: 'INFO',
      category: 'AUTH',
      action: 'PASSWORD_RESET_REQUESTED',
      message: `Link de recuperação de senha gerado e enviado para ${user.email}`,
      userId: user.id,
      userEmail: user.email,
      companyId: user.companyId || undefined,
      ipAddress: reqContext?.ip,
      userAgent: reqContext?.userAgent,
    });

    return standardResponse;
  }

  static async verifyResetToken(token: string) {
    if (!token || typeof token !== 'string') {
      throw new AppError('Token de recuperação é obrigatório', 400);
    }

    let decoded: any;
    try {
      decoded = jwt.decode(token);
    } catch {
      throw new AppError('Token de recuperação inválido ou corrompido', 400);
    }

    if (!decoded || !decoded.sub || decoded.type !== 'pwd_reset') {
      throw new AppError('Token de recuperação inválido ou com formato incorreto', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
    });

    if (!user) {
      throw new AppError('Usuário associado a este token não foi encontrado', 404);
    }

    const resetSecret = `${config.jwtSecret}_${user.passwordHash}`;
    try {
      jwt.verify(token, resetSecret);
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new AppError('Este link de recuperação expirou. Por motivos de segurança, solicite um novo link.', 400);
      }
      throw new AppError('Este link de recuperação é inválido ou já foi utilizado anteriormente.', 400);
    }

    return {
      valid: true,
      email: user.email,
      name: user.name,
    };
  }

  static async resetPassword(token: string, password: string, reqContext?: { ip?: string; userAgent?: string }) {
    if (!token) {
      throw new AppError('Token de recuperação é obrigatório', 400);
    }

    if (!password || password.length < 6) {
      throw new AppError('A nova senha deve ter no mínimo 6 caracteres', 400);
    }

    let decoded: any;
    try {
      decoded = jwt.decode(token);
    } catch {
      throw new AppError('Token de recuperação inválido ou corrompido', 400);
    }

    if (!decoded || !decoded.sub || decoded.type !== 'pwd_reset') {
      throw new AppError('Token de recuperação inválido', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    const resetSecret = `${config.jwtSecret}_${user.passwordHash}`;
    try {
      jwt.verify(token, resetSecret);
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new AppError('Este link de recuperação expirou. Por favor, solicite um novo link.', 400);
      }
      throw new AppError('Este link de recuperação é inválido ou já foi utilizado.', 400);
    }

    const newPasswordHash = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    await LogService.createLog({
      level: 'INFO',
      category: 'AUTH',
      action: 'PASSWORD_RESET_SUCCESS',
      message: `Senha redefinida com sucesso para o usuário ${user.name} (${user.email})`,
      userId: user.id,
      userEmail: user.email,
      companyId: user.companyId || undefined,
      ipAddress: reqContext?.ip,
      userAgent: reqContext?.userAgent,
    });

    return {
      success: true,
      message: 'Sua senha foi redefinida com sucesso! Você já pode realizar o login com suas novas credenciais.',
    };
  }
}
