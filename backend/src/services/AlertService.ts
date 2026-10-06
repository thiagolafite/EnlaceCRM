import { prisma } from '../utils/prisma';
import { CallMeBotProvider } from '../providers/notification/CallMeBotProvider';
import { scopeByCompany, AuthenticatedUserContext } from '../utils/tenant';
import { AppError } from '../utils/AppError';
import { decrypt } from '../utils/crypto';

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
    currentUser?: AuthenticatedUserContext | null
  ) {
    const {
      date,
      sentToClientManual,
      eventType,
      search,
      page = 1,
      limit = 50,
    } = params;

    const companyScope = scopeByCompany(currentUser);
    const where: any = {
      ...companyScope,
    };

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

    const maxLimit = Math.min(Number(limit), 100);
    const skip = (Math.max(Number(page), 1) - 1) * maxLimit;

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
        take: maxLimit,
      }),
    ]);

    return {
      data: alerts,
      pagination: {
        page: Number(page),
        limit: maxLimit,
        total,
        totalPages: Math.ceil(total / maxLimit),
      },
    };
  }

  /**
   * Alterna a marcação de "Enviado ao cliente manualmente"
   */
  static async toggleSentManual(
    id: string,
    sentManual?: boolean,
    currentUser?: AuthenticatedUserContext | null
  ) {
    const companyScope = scopeByCompany(currentUser);
    const existing = await prisma.alert.findFirst({
      where: {
        id,
        ...companyScope,
      },
    });

    if (!existing) {
      throw new AppError('Alerta não encontrado', 404);
    }

    const newStatus = typeof sentManual === 'boolean' ? sentManual : !existing.sentToClientManual;
    const sentAt = newStatus ? new Date() : null;

    const updated = await prisma.alert.update({
      where: { id: existing.id },
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
    currentUser?: AuthenticatedUserContext | null
  ) {
    const companyScope = scopeByCompany(currentUser);
    const targetDate = targetDateStr ? new Date(targetDateStr) : new Date();
    const dateOnly = targetDate.toISOString().split('T')[0];

    const startOfDay = new Date(`${dateOnly}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateOnly}T23:59:59.999Z`);

    const where: any = {
      ...companyScope,
      alertDate: { gte: startOfDay, lte: endOfDay },
    };

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
    const companySettings = await prisma.companySettings.findUnique({
      where: { companyId: companyScope.companyId },
    });

    let rawApiKey = '';
    if (companySettings?.callmebotApiKey && companySettings.callmebotApiKeyIv && companySettings.callmebotApiKeyTag) {
      rawApiKey = decrypt(
        companySettings.callmebotApiKey,
        companySettings.callmebotApiKeyIv,
        companySettings.callmebotApiKeyTag
      );
    } else if (companySettings?.callmebotApiKey) {
      rawApiKey = companySettings.callmebotApiKey;
    }

    const ownerPhone = companySettings?.ownerWhatsappPhone || '';
    const isSimulate = companySettings?.callmebotSimulateMode ?? true;

    // Disparar notificação consolidada
    const result = await CallMeBotProvider.sendDailySummary({
      alerts: alerts.map((a) => ({
        clientName: a.clientName,
        targetName: a.targetName,
        context: a.contextDescription,
        phone: a.clientPhone,
        renderedMessage: a.renderedMessage,
      })),
      ownerPhone,
      apiKey: rawApiKey,
      date: targetDate,
    });

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
  static async getStats(currentUser?: AuthenticatedUserContext | null) {
    const today = new Date().toISOString().split('T')[0];
    const startOfToday = new Date(`${today}T00:00:00.000Z`);
    const endOfToday = new Date(`${today}T23:59:59.999Z`);

    const companyScope = scopeByCompany(currentUser);

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
        where: { ...companyScope, alertDate: { gte: startOfToday, lte: endOfToday } },
      }),
      prisma.alert.count({
        where: {
          ...companyScope,
          alertDate: { gte: startOfToday, lte: endOfToday },
          sentToClientManual: true,
        },
      }),
      prisma.alert.count({
        where: {
          ...companyScope,
          alertDate: { gte: startOfToday, lte: endOfToday },
          sentToClientManual: false,
        },
      }),
      prisma.alert.count({
        where: {
          ...companyScope,
          alertDate: { gte: startOfToday, lte: endOfToday },
          eventType: { in: ['CLIENT_BIRTHDAY', 'FAMILY_BIRTHDAY'] },
        },
      }),
      prisma.alert.count({
        where: {
          ...companyScope,
          alertDate: { gte: startOfToday, lte: endOfToday },
          eventType: 'FIXED_DATE',
        },
      }),
      prisma.client.count({
        where: { ...companyScope, status: 'ACTIVE' },
      }),
      prisma.familyMember.count({
        where: { client: companyScope },
      }),
      prisma.alert.findMany({
        where: { ...companyScope, alertDate: { gte: startOfToday, lte: endOfToday } },
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
