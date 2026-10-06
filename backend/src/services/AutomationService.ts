import { prisma } from '../utils/prisma';
import {
  todayInSaoPaulo,
  matchesBirthdaySP,
  calculateAgeSP,
  DatePartsSP,
  startOfDaySP,
  endOfDaySP,
} from '../utils/time';
import { RELATIONSHIP_LABELS, RELATIONSHIP_POSSESSIVE } from '../utils/dateUtils';
import { interpolateTemplate } from '../utils/interpolator';
import { notificationDispatcher } from '../providers/notification/NotificationDispatcher';
import { matchesAudience } from '../utils/audienceMatcher';
import { AuthenticatedUserContext } from '../utils/tenant';
import { decrypt } from '../utils/crypto';
import { AppError } from '../utils/AppError';
import { config } from '../config';

export interface DailyAutomationReport {
  executionDate: string;
  dateKey: string;
  companyId: string;
  companyName: string;
  clientsScanned: number;
  clientBirthdaysFound: number;
  familyBirthdaysFound: number;
  fixedDatesFound: number;
  alertsGenerated: number;
  alreadyGeneratedSkipped: number;
  lgpdSkipped: number;
  ownerNotified: boolean;
  ownerNotificationChannel: 'CALLMEBOT' | 'ULTRAMSG' | 'EMAIL' | 'SIMULATED' | 'DISABLED';
  ownerNotificationStatus: 'SENT' | 'FAILED' | 'SIMULATED' | 'NO_ALERTS' | 'DISABLED';
  ownerNotificationError?: string;
  details: Array<{
    eventType: 'CLIENT_BIRTHDAY' | 'FAMILY_BIRTHDAY' | 'FIXED_DATE';
    clientName: string;
    targetName: string;
    context: string;
    clientPhone?: string | null;
    renderedMessage: string;
    status: string;
    dedupeKey: string;
  }>;
}

interface CandidateEvent {
  dedupeKey: string;
  eventType: 'CLIENT_BIRTHDAY' | 'FAMILY_BIRTHDAY' | 'FIXED_DATE';
  clientId: string;
  clientName: string;
  clientPhone?: string | null;
  familyMemberId?: string | null;
  commemorativeDateId?: string | null;
  templateId?: string | null;
  targetName: string;
  contextDescription: string;
  renderedMessage: string;
}

export class AutomationService {
  /**
   * Executa a varredura e disparo de notificações para uma empresa individual
   */
  static async scanAndDispatchForCompany(
    targetCompanyId: string,
    referenceDate: Date = new Date(),
    isDryRun: boolean = false
  ): Promise<DailyAutomationReport> {
    const targetSP: DatePartsSP = todayInSaoPaulo(referenceDate);

    // 1. Carregar dados e configurações da empresa
    const company = await prisma.company.findUnique({
      where: { id: targetCompanyId },
      include: { settings: true },
    });

    if (!company) {
      throw new AppError('Empresa não encontrada no sistema', 404, 'Verifique se a empresa ainda está ativa no CRM.');
    }

    const companyName = company.tradeName || company.name || 'Enlace CRM';
    const settings = company.settings;

    const report: DailyAutomationReport = {
      executionDate: referenceDate.toISOString(),
      dateKey: targetSP.dateKey,
      companyId: targetCompanyId,
      companyName,
      clientsScanned: 0,
      clientBirthdaysFound: 0,
      familyBirthdaysFound: 0,
      fixedDatesFound: 0,
      alertsGenerated: 0,
      alreadyGeneratedSkipped: 0,
      lgpdSkipped: 0,
      ownerNotified: false,
      ownerNotificationChannel: 'DISABLED',
      ownerNotificationStatus: 'NO_ALERTS',
      details: [],
    };

    // 2. Carregar todos os clientes ativos da empresa com seus familiares
    const clients = await prisma.client.findMany({
      where: { companyId: targetCompanyId },
      include: {
        familyMembers: true,
      },
      orderBy: { name: 'asc' },
    });
    report.clientsScanned = clients.length;

    // 3. Carregar datas comemorativas ativas (globais e da empresa)
    const commemorativeDates = await prisma.commemorativeDate.findMany({
      where: {
        active: true,
        OR: [
          { companyId: null },
          { companyId: targetCompanyId },
        ],
      },
    });

    const activeFixedDatesForToday = commemorativeDates.filter(
      (fd) => fd.day === targetSP.day && fd.month === targetSP.month
    );
    report.fixedDatesFound = activeFixedDatesForToday.length;

    // 4. Carregar templates (globais e da empresa) para resolução de fallback
    const allTemplates = await prisma.messageTemplate.findMany({
      where: {
        active: true,
        OR: [
          { companyId: null },
          { companyId: targetCompanyId },
        ],
      },
    });

    // Função de resolução de template com prioridade para o template da empresa
    const resolveTemplate = (eventType: string, commDateId?: string | null) => {
      if (commDateId) {
        // 1. Template da própria empresa para a data específica
        const companySpecific = allTemplates.find(
          (t) => t.companyId === targetCompanyId && t.commemorativeDateId === commDateId && t.eventType === eventType
        );
        if (companySpecific) return companySpecific;

        // 2. Template global para a data específica
        const globalSpecific = allTemplates.find(
          (t) => t.companyId === null && t.commemorativeDateId === commDateId && t.eventType === eventType
        );
        if (globalSpecific) return globalSpecific;
      }

      // 3. Template genérico da própria empresa
      const companyGeneric = allTemplates.find(
        (t) => t.companyId === targetCompanyId && t.eventType === eventType && !t.commemorativeDateId
      );
      if (companyGeneric) return companyGeneric;

      // 4. Template genérico global
      return allTemplates.find(
        (t) => t.companyId === null && t.eventType === eventType && !t.commemorativeDateId
      );
    };

    // 5. Mapear candidatos a eventos do dia
    const candidates: CandidateEvent[] = [];

    for (const client of clients) {
      // 1. Governança LGPD: Ignora clientes inativos, sem consentimento ou com opt-out registrado
      if (client.status !== 'ACTIVE' || !client.lgpdConsent || client.optOutAt) {
        report.lgpdSkipped++;
        continue;
      }

      // 2. Proteção a Menores: Por padrão, não gera mensagens para clientes menores de 18 anos
      const clientAge = client.birthDate ? calculateAgeSP(client.birthDate, targetSP) : null;
      if (clientAge !== null && clientAge < 18) {
        report.lgpdSkipped++;
        continue;
      }

      // -------------------------------------------------------------
      // CENÁRIO A: Aniversário do Próprio Cliente Titular
      // -------------------------------------------------------------
      if (client.birthDate && matchesBirthdaySP(client.birthDate, targetSP)) {
        report.clientBirthdaysFound++;
        const age = clientAge ?? calculateAgeSP(client.birthDate, targetSP);
        const contextDescription = `Aniversário do Cliente${age > 0 ? ` (${age} anos)` : ''}`;
        const dedupeKey = `${targetCompanyId}|${client.id}|||CLIENT_BIRTHDAY|${targetSP.dateKey}`;

        const template = resolveTemplate('CLIENT_BIRTHDAY');
        const defaultCopy = 'Olá, *{{primeiro_nome}}*! 🎉 Parabéns pelo seu aniversário! Toda a equipe da {{nome_empresa}} deseja a você muita saúde, paz e prosperidade!';
        const renderedMessage = interpolateTemplate(template?.content || defaultCopy, {
          clientName: client.name,
          companyName,
        });

        candidates.push({
          dedupeKey,
          eventType: 'CLIENT_BIRTHDAY',
          clientId: client.id,
          clientName: client.name,
          clientPhone: client.phone,
          templateId: template?.id || null,
          targetName: client.name,
          contextDescription,
          renderedMessage,
        });
      }

      // -------------------------------------------------------------
      // CENÁRIO B: Aniversário de Familiares do Cliente
      // -------------------------------------------------------------
      for (const fm of client.familyMembers) {
        // Governança LGPD Familiar: ignora familiar com opt-out ou sem confirmação do titular
        if (fm.optOutAt || !fm.consentHolderConfirmed) {
          continue;
        }

        const fmAge = fm.birthDate ? calculateAgeSP(fm.birthDate, targetSP) : null;
        // Proteção a menores: ignora menores de 18 anos exceto se allowMinorNotifications for explicitamente verdadeiro
        if (fmAge !== null && fmAge < 18 && !fm.allowMinorNotifications) {
          continue;
        }

        if (fm.birthDate && matchesBirthdaySP(fm.birthDate, targetSP)) {
          report.familyBirthdaysFound++;
          const relLabel = RELATIONSHIP_LABELS[fm.relationship] || 'Familiar';
          const relPossessive = RELATIONSHIP_POSSESSIVE[fm.relationship] || 'seu familiar';
          const age = fmAge ?? calculateAgeSP(fm.birthDate, targetSP);
          const contextDescription = `Aniversário de ${relLabel}: ${fm.name}${age > 0 ? ` (${age} anos)` : ''}`;
          const dedupeKey = `${targetCompanyId}|${client.id}|${fm.id}||FAMILY_BIRTHDAY|${targetSP.dateKey}`;

          const template = resolveTemplate('FAMILY_BIRTHDAY');
          const defaultCopy = 'Olá, *{{primeiro_nome}}*! 💐 Soubemos que {{parentesco_possessivo}}, {{nome_familiar}}, está de aniversário hoje! Desejamos um dia repleto de alegrias e celebração para toda a família! — {{nome_empresa}}';
          const renderedMessage = interpolateTemplate(template?.content || defaultCopy, {
            clientName: client.name,
            familyName: fm.name,
            relationship: relLabel,
            relationshipPossessive: relPossessive,
            companyName,
          });

          candidates.push({
            dedupeKey,
            eventType: 'FAMILY_BIRTHDAY',
            clientId: client.id,
            clientName: client.name,
            clientPhone: client.phone,
            familyMemberId: fm.id,
            templateId: template?.id || null,
            targetName: `${fm.name} (${relLabel})`,
            contextDescription,
            renderedMessage,
          });
        }
      }

      // -------------------------------------------------------------
      // CENÁRIO C: Datas Comemorativas Fixas do Calendário
      // -------------------------------------------------------------
      for (const fd of activeFixedDatesForToday) {
        const clientMatches = matchesAudience(fd.targetAudience, {
          isClient: true,
          gender: client.gender,
          isMother: client.isMother,
          isFather: client.isFather,
        });

        if (clientMatches) {
          const contextDescription = `Data Comemorativa: ${fd.name}`;
          const dedupeKey = `${targetCompanyId}|${client.id}||${fd.id}|FIXED_DATE|${targetSP.dateKey}`;

          const template = resolveTemplate('FIXED_DATE', fd.id);
          const defaultCopy = 'Olá, *{{primeiro_nome}}*! A equipe da {{nome_empresa}} deseja a você um excelente dia em celebração a *{{nome_homenageado}}*! ✨';
          const renderedMessage = interpolateTemplate(template?.content || defaultCopy, {
            clientName: client.name,
            targetName: fd.name,
            companyName,
          });

          candidates.push({
            dedupeKey,
            eventType: 'FIXED_DATE',
            clientId: client.id,
            clientName: client.name,
            clientPhone: client.phone,
            commemorativeDateId: fd.id,
            templateId: template?.id || null,
            targetName: fd.name,
            contextDescription,
            renderedMessage,
          });
        }
      }
    }

    // 6. Eliminar N+1: Buscar todos os alertas existentes de uma só vez
    const candidateKeys = candidates.map((c) => c.dedupeKey);
    const existingAlerts = candidateKeys.length > 0
      ? await prisma.alert.findMany({
          where: {
            companyId: targetCompanyId,
            dedupeKey: { in: candidateKeys },
          },
          select: {
            dedupeKey: true,
            renderedMessage: true,
          },
        })
      : [];

    const existingMap = new Map<string, string>();
    existingAlerts.forEach((a) => {
      if (a.dedupeKey) {
        existingMap.set(a.dedupeKey, a.renderedMessage);
      }
    });

    const alertsToCreate: any[] = [];
    const alertsToNotify: Array<{
      clientName: string;
      targetName: string;
      context: string;
      phone?: string | null;
      renderedMessage: string;
    }> = [];

    const startOfToday = startOfDaySP(referenceDate);

    for (const cand of candidates) {
      const isAlreadyCreated = existingMap.has(cand.dedupeKey);

      if (isAlreadyCreated) {
        report.alreadyGeneratedSkipped++;
        const message = existingMap.get(cand.dedupeKey) || cand.renderedMessage;

        report.details.push({
          eventType: cand.eventType,
          clientName: cand.clientName,
          targetName: cand.targetName,
          context: cand.contextDescription,
          clientPhone: cand.clientPhone,
          renderedMessage: message,
          status: 'ALREADY_GENERATED',
          dedupeKey: cand.dedupeKey,
        });

        alertsToNotify.push({
          clientName: cand.clientName,
          targetName: cand.targetName,
          context: cand.contextDescription,
          phone: cand.clientPhone,
          renderedMessage: message,
        });
      } else {
        report.alertsGenerated++;
        report.details.push({
          eventType: cand.eventType,
          clientName: cand.clientName,
          targetName: cand.targetName,
          context: cand.contextDescription,
          clientPhone: cand.clientPhone,
          renderedMessage: cand.renderedMessage,
          status: isDryRun ? 'SIMULATED_READY' : 'GENERATED',
          dedupeKey: cand.dedupeKey,
        });

        alertsToNotify.push({
          clientName: cand.clientName,
          targetName: cand.targetName,
          context: cand.contextDescription,
          phone: cand.clientPhone,
          renderedMessage: cand.renderedMessage,
        });

        if (!isDryRun) {
          alertsToCreate.push({
            companyId: targetCompanyId,
            clientId: cand.clientId,
            familyMemberId: cand.familyMemberId || null,
            commemorativeDateId: cand.commemorativeDateId || null,
            templateId: cand.templateId || null,
            eventType: cand.eventType,
            clientName: cand.clientName,
            clientPhone: cand.clientPhone || null,
            targetName: cand.targetName,
            contextDescription: cand.contextDescription,
            renderedMessage: cand.renderedMessage,
            dedupeKey: cand.dedupeKey,
            alertDate: startOfToday,
            notificationStatus: 'PENDING',
          });
        }
      }
    }

    // 7. Gravação idempotente em lote
    if (!isDryRun && alertsToCreate.length > 0) {
      await prisma.alert.createMany({
        data: alertsToCreate,
        skipDuplicates: true,
      });
    }

    // 8. Disparo de notificação para o Dono/Operador da Empresa
    // Apenas dispara se houver NOVOS alertas criados ou se for execução manual com alertas existentes
    if (!isDryRun && alertsToNotify.length > 0) {
      if (settings && settings.callmebotEnabled && settings.ownerWhatsappPhone) {
        let rawApiKey = '';
        if (settings.callmebotApiKey && settings.callmebotApiKeyIv && settings.callmebotApiKeyTag) {
          rawApiKey = decrypt(settings.callmebotApiKey, settings.callmebotApiKeyIv, settings.callmebotApiKeyTag);
        } else if (settings.callmebotApiKey) {
          rawApiKey = settings.callmebotApiKey;
        }

        // Formatação do resumo diário
        const dateFormatted = `${String(targetSP.day).padStart(2, '0')}/${String(targetSP.month).padStart(2, '0')}/${targetSP.year}`;
        const total = alertsToNotify.length;

        let summaryText = `🔔 *${companyName.toUpperCase()} — Resumo de Felicitações (${dateFormatted})*\n\n`;
        summaryText += `Identificamos *${total}* ${total === 1 ? 'comemoração para hoje' : 'comemorações para hoje'}:\n\n`;

        alertsToNotify.forEach((item, index) => {
          summaryText += `━━━━━━━━━━━━━━━━━━━\n`;
          summaryText += `👤 *${index + 1}. ${item.clientName}*\n`;
          summaryText += `🎉 *Contexto:* ${item.context}\n`;
          if (item.phone) {
            summaryText += `📱 *WhatsApp:* ${item.phone}\n`;
          }
          summaryText += `\n💬 *Mensagem para Enviar:*\n${item.renderedMessage}\n\n`;
        });

        summaryText += `━━━━━━━━━━━━━━━━━━━\n`;
        summaryText += `👉 *Acesse o painel do Enlace:* ${config.appUrl}\n`;

        const adminUser = await prisma.user.findFirst({
          where: { companyId: targetCompanyId, role: { in: ['ADMIN', 'MASTER'] } },
          select: { email: true },
        });

        const dispatchResult = await notificationDispatcher.dispatch(summaryText, {
          recipientPhone: settings.ownerWhatsappPhone,
          recipientEmail: adminUser?.email || undefined,
          apiKey: rawApiKey,
          companyName,
          companyId: targetCompanyId,
          simulate: settings.callmebotSimulateMode || !rawApiKey,
        });

        report.ownerNotified = dispatchResult.success;
        report.ownerNotificationChannel = dispatchResult.channel;
        report.ownerNotificationStatus = dispatchResult.simulated
          ? 'SIMULATED'
          : dispatchResult.success
          ? 'SENT'
          : 'FAILED';
        report.ownerNotificationError = dispatchResult.error;

        // Atualiza o status dos alertas gravados hoje
        const newDedupeKeys = alertsToCreate.map((a) => a.dedupeKey);
        if (newDedupeKeys.length > 0) {
          await prisma.alert.updateMany({
            where: {
              companyId: targetCompanyId,
              dedupeKey: { in: newDedupeKeys },
            },
            data: {
              notificationStatus: report.ownerNotificationStatus,
              notificationChannel: dispatchResult.channel,
              notificationError: dispatchResult.error || null,
            },
          });
        }
      } else {
        report.ownerNotificationChannel = 'DISABLED';
        report.ownerNotificationStatus = 'DISABLED';
      }
    } else if (alertsToNotify.length === 0) {
      report.ownerNotificationStatus = 'NO_ALERTS';
    }

    return report;
  }

  /**
   * Executa a varredura para a empresa do usuário logado
   */
  static async scanAndDispatch(
    currentUser?: AuthenticatedUserContext | null,
    referenceDate: Date = new Date(),
    isDryRun: boolean = false
  ): Promise<DailyAutomationReport> {
    if (!currentUser?.companyId) {
      throw new AppError('Empresa não associada ao usuário autenticado.', 400, 'Faça login com uma conta vinculada a uma empresa.');
    }

    return this.scanAndDispatchForCompany(currentUser.companyId, referenceDate, isDryRun);
  }

  /**
   * Reenvia manualmente a notificação consolidada do dia para o WhatsApp/E-mail do dono da empresa
   */
  static async resendDailyNotification(
    companyId: string,
    referenceDate: Date = new Date(),
    currentUser?: AuthenticatedUserContext | null
  ): Promise<{ success: boolean; channel: string; totalAlerts: number; message: string }> {
    if (currentUser && currentUser.role !== 'MASTER' && currentUser.companyId !== companyId) {
      throw new AppError('Você não tem permissão para disparar notificações desta empresa.', 403, 'Acesse apenas os recursos da sua própria empresa.');
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: { settings: true },
    });

    if (!company) {
      throw new AppError('Empresa não encontrada.', 404);
    }

    const settings = company.settings;
    if (!settings || !settings.ownerWhatsappPhone) {
      throw new AppError(
        'Número de WhatsApp do operador não configurado.',
        400,
        'Acesse Configurações do Sistema e cadastre o seu número de WhatsApp com DDD.'
      );
    }

    let rawApiKey = '';
    if (settings.callmebotApiKey && settings.callmebotApiKeyIv && settings.callmebotApiKeyTag) {
      rawApiKey = decrypt(settings.callmebotApiKey, settings.callmebotApiKeyIv, settings.callmebotApiKeyTag);
    } else if (settings.callmebotApiKey) {
      rawApiKey = settings.callmebotApiKey;
    }

    if (!rawApiKey && !settings.callmebotSimulateMode) {
      throw new AppError(
        'Chave de API do WhatsApp (CallMeBot) não configurada.',
        400,
        'Acesse Configurações do Sistema e informe sua API Key do CallMeBot ou ative o Modo Simulação.'
      );
    }

    const targetSP = todayInSaoPaulo(referenceDate);
    const startOfToday = startOfDaySP(referenceDate);
    const endOfToday = endOfDaySP(referenceDate);

    const alerts = await prisma.alert.findMany({
      where: {
        companyId,
        alertDate: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (alerts.length === 0) {
      return {
        success: true,
        channel: 'NO_ALERTS',
        totalAlerts: 0,
        message: 'Nenhum alerta registrado para a data especificada.',
      };
    }

    const companyName = company.tradeName || company.name || 'Enlace CRM';
    const dateFormatted = `${String(targetSP.day).padStart(2, '0')}/${String(targetSP.month).padStart(2, '0')}/${targetSP.year}`;
    const total = alerts.length;

    let summaryText = `🔔 *${companyName.toUpperCase()} — Reenvio de Felicitações (${dateFormatted})*\n\n`;
    summaryText += `Total de *${total}* ${total === 1 ? 'comemoração do dia' : 'comemorações do dia'}:\n\n`;

    alerts.forEach((alert, index) => {
      summaryText += `━━━━━━━━━━━━━━━━━━━\n`;
      summaryText += `👤 *${index + 1}. ${alert.clientName}*\n`;
      summaryText += `🎉 *Contexto:* ${alert.contextDescription}\n`;
      if (alert.clientPhone) {
        summaryText += `📱 *WhatsApp:* ${alert.clientPhone}\n`;
      }
      summaryText += `\n💬 *Mensagem para Enviar:*\n${alert.renderedMessage}\n\n`;
    });

    const adminUser = await prisma.user.findFirst({
      where: { companyId, role: { in: ['ADMIN', 'MASTER'] } },
      select: { email: true },
    });

    const dispatchResult = await notificationDispatcher.dispatch(summaryText, {
      recipientPhone: settings.ownerWhatsappPhone,
      recipientEmail: adminUser?.email || undefined,
      apiKey: rawApiKey,
      companyName,
      companyId,
      simulate: settings.callmebotSimulateMode || !rawApiKey,
    });

    if (!dispatchResult.success) {
      throw new AppError(
        `Falha ao reenviar notificação: ${dispatchResult.error || 'Erro de conexão'}`,
        502,
        'Verifique se o seu número do WhatsApp está cadastrado no bot ou tente novamente em alguns instantes.'
      );
    }

    // Atualiza o status de notificação de todos os alertas daquele dia
    await prisma.alert.updateMany({
      where: {
        id: { in: alerts.map((a) => a.id) },
      },
      data: {
        notificationStatus: dispatchResult.simulated ? 'SIMULATED' : 'SENT',
        notificationChannel: dispatchResult.channel,
        notificationError: null,
      },
    });

    return {
      success: true,
      channel: dispatchResult.channel,
      totalAlerts: alerts.length,
      message: dispatchResult.simulated
        ? `Simulação concluída com sucesso (${alerts.length} alertas exibidos no console).`
        : `Resumo com ${alerts.length} alertas reenviado com sucesso para ${settings.ownerWhatsappPhone}!`,
    };
  }

  /**
   * Orquestrador Global de Scheduler — Executa a cada minuto avaliando o horário de cada empresa
   * A falha de uma empresa NÃO interrompe a execução das demais
   */
  static async runGlobalSchedulerTick(referenceDate: Date = new Date()): Promise<{
    executedCompanies: number;
    errors: Array<{ companyId: string; error: string }>;
  }> {
    const currentSP = todayInSaoPaulo(referenceDate);

    // Carrega empresas ativas ou em trial com agendamento ligado
    const companies = await prisma.company.findMany({
      where: {
        status: { in: ['ACTIVE', 'TRIAL'] },
        settings: {
          schedulerEnabled: true,
          schedulerHour: currentSP.hours,
          schedulerMinute: currentSP.minutes,
        },
      },
      include: {
        settings: true,
      },
    });

    const result = {
      executedCompanies: 0,
      errors: [] as Array<{ companyId: string; error: string }>,
    };

    for (const company of companies) {
      try {
        await this.scanAndDispatchForCompany(company.id, referenceDate, false);
        result.executedCompanies++;
      } catch (err: any) {
        const errorMsg = err.message || 'Erro desconhecido na automação';
        result.errors.push({ companyId: company.id, error: errorMsg });

        // Registra o erro no SystemLog com isolamento
        try {
          await prisma.systemLog.create({
            data: {
              level: 'ERROR',
              category: 'AUTOMATION',
              action: 'SCHEDULER_COMPANY_FAILED',
              companyId: company.id,
              message: `Falha no scheduler da empresa ${company.name} (${company.id}): ${errorMsg}`,
              details: JSON.stringify({ error: errorMsg, currentSP }),
            },
          });
        } catch {
          // Ignora falha de log para não quebrar fluxo
        }
      }
    }

    return result;
  }
}
