import { prisma } from '../utils/prisma';
import { CallMeBotProvider } from '../providers/notification/CallMeBotProvider';

export interface ListAlertsParams {
  date?: string; // YYYY-MM-DD
  sentToClientManual?: boolean;
  eventType?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class AlertService {
  /**
   * Lista os alertas com filtros avançados
   */
  static async listAlerts(params: ListAlertsParams = {}) {
    const {
      date,
      sentToClientManual,
      eventType,
      search,
      page = 1,
      limit = 50,
    } = params;

    const where: any = {};

    if (date) {
      const startOfDay = new Date(`${date}T00:00:00.000Z`);
      const endOfDay = new Date(`${date}T23:59:59.999Z`);
      where.alertDate = { gte: startOfDay, lte: endOfDay };
    }

    if (typeof sentToClientManual === 'boolean') {
      where.sentToClientManual = sentToClientManual;
    }

    if (eventType) {
      where.eventType = eventType;
    }

    if (search && search.trim()) {
      where.OR = [
        { clientName: { contains: search } },
        { targetName: { contains: search } },
        { clientPhone: { contains: search } },
        { renderedMessage: { contains: search } },
      ];
    }

    const skip = (page - 1) * limit;

    const [total, alerts] = await Promise.all([
      prisma.alert.count({ where }),
      prisma.alert.findMany({
        where,
        include: {
          client: true,
          familyMember: true,
          commemorativeDate: true,
          template: true,
        },
        orderBy: [{ alertDate: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
    ]);

    return {
      data: alerts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Alterna a marcação de "Enviado ao cliente manualmente"
   */
  static async toggleSentManual(id: string, sentManual?: boolean) {
    const existing = await prisma.alert.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Alerta não encontrado');
    }

    const newStatus = typeof sentManual === 'boolean' ? sentManual : !existing.sentToClientManual;
    const sentAt = newStatus ? new Date() : null;

    const updated = await prisma.alert.update({
      where: { id },
      data: {
        sentToClientManual: newStatus,
        sentToClientManualAt: sentAt,
      },
      include: {
        client: true,
        familyMember: true,
      },
    });

    return updated;
  }

  /**
   * Reenvia o resumo consolidado de alertas do dia para o WhatsApp do dono via CallMeBot
   */
  static async resendDailyNotification(date: Date = new Date()) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const alerts = await prisma.alert.findMany({
      where: {
        alertDate: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (alerts.length === 0) {
      return {
        success: false,
        message: 'Nenhum alerta registrado para esta data.',
      };
    }

    const settings = await prisma.companySettings.findFirst();
    if (!settings || !settings.ownerWhatsappPhone) {
      return {
        success: false,
        message: 'Número de WhatsApp do dono não configurado no sistema.',
      };
    }

    const formattedAlerts = alerts.map((a) => ({
      clientName: a.clientName,
      targetName: a.targetName,
      context: a.contextDescription,
      phone: a.clientPhone,
      renderedMessage: a.renderedMessage,
    }));

    const result = await CallMeBotProvider.sendDailySummary({
      ownerPhone: settings.ownerWhatsappPhone,
      apiKey: settings.callmebotApiKey || '',
      date,
      alerts: formattedAlerts,
    });

    // Atualiza status nos alertas do dia
    const newStatus = result.simulated ? 'SIMULATED' : result.success ? 'SENT' : 'FAILED';
    await prisma.alert.updateMany({
      where: {
        id: { in: alerts.map((a) => a.id) },
      },
      data: {
        notificationStatus: newStatus,
        notificationError: result.error || null,
      },
    });

    return {
      success: result.success,
      simulated: result.simulated,
      error: result.error,
      alertsCount: alerts.length,
    };
  }

  /**
   * Retorna os KPIs do Dashboard
   */
  static async getDashboardStats() {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const [
      totalClients,
      totalFamilyMembers,
      todayAlerts,
      todaySentManual,
      todayPendingManual,
    ] = await Promise.all([
      prisma.client.count({ where: { status: 'ACTIVE' } }),
      prisma.familyMember.count(),
      prisma.alert.count({
        where: { alertDate: { gte: startOfDay, lte: endOfDay } },
      }),
      prisma.alert.count({
        where: {
          alertDate: { gte: startOfDay, lte: endOfDay },
          sentToClientManual: true,
        },
      }),
      prisma.alert.count({
        where: {
          alertDate: { gte: startOfDay, lte: endOfDay },
          sentToClientManual: false,
        },
      }),
    ]);

    // Próximos aniversariantes / alertas de hoje
    const todayAlertsList = await prisma.alert.findMany({
      where: { alertDate: { gte: startOfDay, lte: endOfDay } },
      include: { client: true, familyMember: true },
      orderBy: { createdAt: 'asc' },
    });

    return {
      totalClients,
      totalFamilyMembers,
      todayAlerts,
      todaySentManual,
      todayPendingManual,
      todayAlertsList,
    };
  }
}
