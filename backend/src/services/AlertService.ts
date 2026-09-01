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
   * Lista os alertas com filtros avançados e isolamento por empresa
   */
  static async listAlerts(
    params: ListAlertsParams = {},
    currentUser?: { id: string; role: string; companyId?: string | null }
  ) {
    const {
      date,
      sentToClientManual,
      eventType,
      search,
      page = 1,
      limit = 50,
    } = params;

    const where: any = {};

    // Isolamento multi-tenant
    if (currentUser?.role !== 'MASTER' && currentUser?.companyId) {
      where.companyId = currentUser.companyId;
    }

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
        { clientName: { contains: search, mode: 'insensitive' } },
        { targetName: { contains: search, mode: 'insensitive' } },
        { clientPhone: { contains: search } },
        { renderedMessage: { contains: search, mode: 'insensitive' } },
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
  static async toggleSentManual(
    id: string,
    sentManual?: boolean,
    currentUser?: { id: string; role: string; companyId?: string | null }
  ) {
    const existing = await prisma.alert.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Alerta não encontrado');
    }

    if (currentUser?.role !== 'MASTER' && currentUser?.companyId && existing.companyId !== currentUser.companyId) {
      throw new Error('Acesso não permitido a este alerta');
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
  static async resendDailyNotification(
    targetDateStr?: string,
    currentUser?: { id: string; role: string; companyId?: string | null }
  ) {
    const targetDate = targetDateStr ? new Date(targetDateStr) : new Date();
    const dateOnly = targetDate.toISOString().split('T')[0];

    const startOfDay = new Date(`${dateOnly}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateOnly}T23:59:59.999Z`);

    const where: any = {
      alertDate: { gte: startOfDay, lte: endOfDay },
    };

    if (currentUser?.role !== 'MASTER' && currentUser?.companyId) {
      where.companyId = currentUser.companyId;
    }

    const alerts = await prisma.alert.findMany({
      where,
      include: { client: true, familyMember: true },
      orderBy: { createdAt: 'asc' },
    });

    if (alerts.length === 0) {
      return {
        success: true,
        message: 'Nenhum alerta pendente para a data informada.',
        alertsCount: 0,
      };
    }

    // Buscar configurações da empresa
    const company = await prisma.companySettings.findFirst({
      where: currentUser?.companyId ? { id: currentUser.companyId } : {},
    });

    const apiKey = company?.callmebotApiKey || '';
    const ownerPhone = company?.ownerWhatsappPhone || '';
    const isSimulate = company?.callmebotSimulateMode ?? true;

    // Disparar notificação consolidada
    const result = await CallMeBotProvider.sendDailySummary(
      alerts,
      ownerPhone,
      apiKey,
      isSimulate
    );

    return {
      success: result.success,
      simulated: isSimulate,
      message: result.message,
      error: result.error,
      alertsCount: alerts.length,
    };
  }

  /**
   * Estatísticas de alertas para o Dashboard
   */
  static async getStats(currentUser?: { id: string; role: string; companyId?: string | null }) {
    const today = new Date().toISOString().split('T')[0];
    const startOfToday = new Date(`${today}T00:00:00.000Z`);
    const endOfToday = new Date(`${today}T23:59:59.999Z`);

    const whereBase: any = {};
    if (currentUser?.role !== 'MASTER' && currentUser?.companyId) {
      whereBase.companyId = currentUser.companyId;
    }

    const [
      totalToday,
      sentToday,
      pendingToday,
      birthdaysToday,
      fixedDatesToday,
      totalClients,
      totalFamilyMembers,
      todayAlertsList,
    ] = await Promise.all([
      prisma.alert.count({
        where: { ...whereBase, alertDate: { gte: startOfToday, lte: endOfToday } },
      }),
      prisma.alert.count({
        where: {
          ...whereBase,
          alertDate: { gte: startOfToday, lte: endOfToday },
          sentToClientManual: true,
        },
      }),
      prisma.alert.count({
        where: {
          ...whereBase,
          alertDate: { gte: startOfToday, lte: endOfToday },
          sentToClientManual: false,
        },
      }),
      prisma.alert.count({
        where: {
          ...whereBase,
          alertDate: { gte: startOfToday, lte: endOfToday },
          eventType: { in: ['CLIENT_BIRTHDAY', 'FAMILY_BIRTHDAY'] },
        },
      }),
      prisma.alert.count({
        where: {
          ...whereBase,
          alertDate: { gte: startOfToday, lte: endOfToday },
          eventType: 'FIXED_DATE',
        },
      }),
      prisma.client.count({
        where: { ...whereBase, status: 'ACTIVE' },
      }),
      prisma.familyMember.count({
        where: currentUser?.role !== 'MASTER' && currentUser?.companyId
          ? { client: { companyId: currentUser.companyId } }
          : {},
      }),
      prisma.alert.findMany({
        where: { ...whereBase, alertDate: { gte: startOfToday, lte: endOfToday } },
        orderBy: [{ sentToClientManual: 'asc' }, { createdAt: 'desc' }],
        take: 30,
      }),
    ]);

    return {
      totalToday,
      sentToday,
      pendingToday,
      birthdaysToday,
      fixedDatesToday,

      // Frontend compatibility aliases
      todayAlerts: totalToday,
      todaySentManual: sentToday,
      todayPendingManual: pendingToday,
      totalClients,
      totalFamilyMembers,
      todayAlertsList: todayAlertsList || [],
    };
  }
}
