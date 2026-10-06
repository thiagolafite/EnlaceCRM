import { prisma } from '../utils/prisma';
import { interpolateTemplate, AVAILABLE_VARIABLES } from '../utils/interpolator';
import { AuthenticatedUserContext } from '../utils/tenant';
import { AppError } from '../utils/AppError';

export interface CreateTemplateDTO {
  name: string;
  eventType: 'CLIENT_BIRTHDAY' | 'FAMILY_BIRTHDAY' | 'FIXED_DATE';
  channel?: 'WHATSAPP' | 'EMAIL';
  commemorativeDateId?: string | null;
  subject?: string | null;
  content: string;
  active?: boolean;
  isGlobal?: boolean;
}

export class TemplateService {
  static async list(params?: { eventType?: string; channel?: string }, currentUser?: AuthenticatedUserContext | null) {
    const where: any = {};
    if (params?.eventType) where.eventType = params.eventType;
    if (params?.channel) where.channel = params.channel;

    if (currentUser?.role === 'MASTER') {
      // MASTER vê templates globais e de todas as empresas
    } else if (currentUser?.companyId) {
      where.OR = [
        { companyId: null },
        { companyId: currentUser.companyId },
      ];
    } else {
      where.companyId = null;
    }

    return prisma.messageTemplate.findMany({
      where,
      include: {
        commemorativeDate: true,
      },
      orderBy: [{ eventType: 'asc' }, { channel: 'asc' }, { name: 'asc' }],
    });
  }

  static async getById(id: string, currentUser?: AuthenticatedUserContext | null) {
    const template = await prisma.messageTemplate.findUnique({
      where: { id },
      include: { commemorativeDate: true },
    });

    if (!template) {
      throw new AppError('Template não encontrado', 404);
    }

    if (
      template.companyId !== null &&
      currentUser?.role !== 'MASTER' &&
      template.companyId !== currentUser?.companyId
    ) {
      throw new AppError('Template não encontrado', 404);
    }

    return template;
  }

  static async create(data: CreateTemplateDTO, currentUser?: AuthenticatedUserContext | null) {
    if (!data.name || !data.name.trim()) {
      throw new AppError('Nome do template é obrigatório', 400);
    }
    if (!data.content || !data.content.trim()) {
      throw new AppError('Conteúdo da mensagem é obrigatório', 400);
    }

    let targetCompanyId: string | null = currentUser?.companyId || null;
    if (currentUser?.role === 'MASTER' && data.isGlobal) {
      targetCompanyId = null;
    }

    return prisma.messageTemplate.create({
      data: {
        name: data.name.trim(),
        eventType: data.eventType,
        channel: data.channel || 'WHATSAPP',
        commemorativeDateId: data.commemorativeDateId || null,
        subject: data.subject?.trim() || null,
        content: data.content,
        active: typeof data.active === 'boolean' ? data.active : true,
        companyId: targetCompanyId,
      },
    });
  }

  static async update(id: string, data: Partial<CreateTemplateDTO>, currentUser?: AuthenticatedUserContext | null) {
    const existing = await prisma.messageTemplate.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Template não encontrado', 404);
    }

    // Regra: templates globais só podem ser modificados pelo MASTER
    if (existing.companyId === null && currentUser?.role !== 'MASTER') {
      throw new AppError('Templates globais do sistema só podem ser alterados pelo Master', 403);
    }

    if (
      existing.companyId !== null &&
      currentUser?.role !== 'MASTER' &&
      existing.companyId !== currentUser?.companyId
    ) {
      throw new AppError('Template não encontrado', 404);
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.eventType !== undefined) updateData.eventType = data.eventType;
    if (data.channel !== undefined) updateData.channel = data.channel;
    if (data.commemorativeDateId !== undefined) updateData.commemorativeDateId = data.commemorativeDateId || null;
    if (data.subject !== undefined) updateData.subject = data.subject?.trim() || null;
    if (data.content !== undefined) updateData.content = data.content;
    if (typeof data.active === 'boolean') updateData.active = data.active;

    return prisma.messageTemplate.update({
      where: { id },
      data: updateData,
    });
  }

  static async delete(id: string, currentUser?: AuthenticatedUserContext | null) {
    const existing = await prisma.messageTemplate.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Template não encontrado', 404);
    }

    if (existing.companyId === null && currentUser?.role !== 'MASTER') {
      throw new AppError('Templates globais do sistema só podem ser excluídos pelo Master', 403);
    }

    if (
      existing.companyId !== null &&
      currentUser?.role !== 'MASTER' &&
      existing.companyId !== currentUser?.companyId
    ) {
      throw new AppError('Template não encontrado', 404);
    }

    await prisma.messageTemplate.delete({ where: { id } });
    return { success: true };
  }

  static getAvailableVariables() {
    return AVAILABLE_VARIABLES;
  }

  static async preview(templateIdOrContent: string, isId: boolean = true) {
    let content = templateIdOrContent;
    let subject = '';

    if (isId) {
      const template = await prisma.messageTemplate.findUnique({ where: { id: templateIdOrContent } });
      if (!template) throw new AppError('Template não encontrado', 404);
      content = template.content;
      subject = template.subject || '';
    }

    const sampleContext = {
      clientName: 'Mariana Oliveira da Costa',
      familyMemberName: 'Dona Helena Silveira',
      relationship: 'MOTHER',
      companyName: 'Enlace CRM',
      commemorativeDateName: 'Dia das Mães',
      birthDate: new Date(1990, 4, 15),
      currentDate: new Date(),
    };

    const renderedSubject = subject ? interpolateTemplate(subject, sampleContext) : '';
    const renderedBody = interpolateTemplate(content, sampleContext);

    return {
      sampleContext,
      renderedSubject,
      renderedBody,
    };
  }
}
