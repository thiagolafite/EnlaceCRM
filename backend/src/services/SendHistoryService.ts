import { prisma } from '../utils/prisma';
import { MessageQueue } from '../queues/MessageQueue';

export interface ListHistoryParams {
  clientId?: string;
  channel?: string;
  status?: string;
  eventType?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export class SendHistoryService {
  static async list(params: ListHistoryParams) {
    const page = params.page && params.page > 0 ? Number(params.page) : 1;
    const limit = params.limit && params.limit > 0 ? Number(params.limit) : 30;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.clientId) where.clientId = params.clientId;
    if (params.channel) where.channel = params.channel;
    if (params.status) where.status = params.status;
    if (params.eventType) where.eventType = params.eventType;

    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = new Date(params.startDate);
      if (params.endDate) where.createdAt.lte = new Date(params.endDate);
    }

    if (params.search) {
      const s = params.search.trim();
      where.OR = [
        { recipientContact: { contains: s } },
        { renderedBody: { contains: s } },
        { client: { name: { contains: s } } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.sendHistory.count({ where }),
      prisma.sendHistory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: {
            select: { id: true, name: true, phone: true, email: true },
          },
          familyMember: {
            select: { id: true, name: true, relationship: true },
          },
          commemorativeDate: {
            select: { id: true, name: true },
          },
          template: {
            select: { id: true, name: true },
          },
        },
      }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(id: string) {
    const history = await prisma.sendHistory.findUnique({
      where: { id },
      include: {
        client: true,
        familyMember: true,
        commemorativeDate: true,
        template: true,
      },
    });

    if (!history) {
      throw new Error('Registro de histórico não encontrado');
    }

    return history;
  }

  static async retrySingle(id: string) {
    const history = await prisma.sendHistory.findUnique({
      where: { id },
      include: { client: true, template: true },
    });

    if (!history) {
      throw new Error('Histórico não encontrado');
    }

    if (!history.client || history.client.status !== 'ACTIVE' || !history.client.lgpdConsent) {
      throw new Error('Cliente está inativo ou revogou o consentimento LGPD');
    }

    // Reset status to PENDING
    await prisma.sendHistory.update({
      where: { id },
      data: {
        status: 'PENDING',
        errorMessage: null,
      },
    });

    // Enqueue
    const jobId = await MessageQueue.enqueueSendMessage({
      sendHistoryId: history.id,
      clientId: history.clientId,
      channel: history.channel as 'WHATSAPP' | 'EMAIL',
      recipientContact: history.recipientContact,
      subject: history.renderedSubject || undefined,
      body: history.renderedBody,
      metaTemplateName: history.template?.metaTemplateName || undefined,
      clientName: history.client.name,
    });

    return { success: true, jobId };
  }

  static async retryAllFailed() {
    const failedList = await prisma.sendHistory.findMany({
      where: {
        status: 'FAILED',
        client: {
          status: 'ACTIVE',
          lgpdConsent: true,
        },
      },
      include: { client: true, template: true },
      take: 50,
    });

    let count = 0;
    for (const item of failedList) {
      await prisma.sendHistory.update({
        where: { id: item.id },
        data: { status: 'PENDING', errorMessage: null },
      });

      await MessageQueue.enqueueSendMessage({
        sendHistoryId: item.id,
        clientId: item.clientId,
        channel: item.channel as 'WHATSAPP' | 'EMAIL',
        recipientContact: item.recipientContact,
        subject: item.renderedSubject || undefined,
        body: item.renderedBody,
        metaTemplateName: item.template?.metaTemplateName || undefined,
        clientName: item.client.name,
      });

      count++;
    }

    return { retriedCount: count };
  }
}
