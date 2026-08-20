import { prisma } from '../utils/prisma';
import { interpolateTemplate, AVAILABLE_VARIABLES } from '../utils/interpolator';

export interface CreateTemplateDTO {
  name: string;
  eventType: 'CLIENT_BIRTHDAY' | 'FAMILY_BIRTHDAY' | 'FIXED_DATE';
  channel: 'WHATSAPP' | 'EMAIL';
  commemorativeDateId?: string | null;
  subject?: string | null;
  content: string;
  metaTemplateName?: string | null;
  active?: boolean;
}

export class TemplateService {
  static async list(params?: { eventType?: string; channel?: string }) {
    const where: any = {};
    if (params?.eventType) where.eventType = params.eventType;
    if (params?.channel) where.channel = params.channel;

    return prisma.messageTemplate.findMany({
      where,
      include: {
        commemorativeDate: true,
      },
      orderBy: [{ eventType: 'asc' }, { channel: 'asc' }, { name: 'asc' }],
    });
  }

  static async getById(id: string) {
    const template = await prisma.messageTemplate.findUnique({
      where: { id },
      include: { commemorativeDate: true },
    });

    if (!template) {
      throw new Error('Template não encontrado');
    }

    return template;
  }

  static async create(data: CreateTemplateDTO) {
    if (!data.name || !data.name.trim()) {
      throw new Error('Nome do template é obrigatório');
    }
    if (!data.content || !data.content.trim()) {
      throw new Error('Conteúdo da mensagem é obrigatório');
    }

    return prisma.messageTemplate.create({
      data: {
        name: data.name.trim(),
        eventType: data.eventType,
        channel: data.channel,
        commemorativeDateId: data.commemorativeDateId || null,
        subject: data.subject?.trim() || null,
        content: data.content,
        metaTemplateName: data.metaTemplateName?.trim() || null,
        active: typeof data.active === 'boolean' ? data.active : true,
      },
    });
  }

  static async update(id: string, data: Partial<CreateTemplateDTO>) {
    const existing = await prisma.messageTemplate.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Template não encontrado');
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.eventType !== undefined) updateData.eventType = data.eventType;
    if (data.channel !== undefined) updateData.channel = data.channel;
    if (data.commemorativeDateId !== undefined) updateData.commemorativeDateId = data.commemorativeDateId || null;
    if (data.subject !== undefined) updateData.subject = data.subject?.trim() || null;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.metaTemplateName !== undefined) updateData.metaTemplateName = data.metaTemplateName?.trim() || null;
    if (typeof data.active === 'boolean') updateData.active = data.active;

    return prisma.messageTemplate.update({
      where: { id },
      data: updateData,
    });
  }

  static async delete(id: string) {
    const existing = await prisma.messageTemplate.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Template não encontrado');
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
      if (!template) throw new Error('Template não encontrado');
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
