import { prisma } from '../utils/prisma';
import { isSameDayAndMonth, calculateAge, RELATIONSHIP_LABELS } from '../utils/dateUtils';
import { interpolateTemplate } from '../utils/interpolator';
import { CallMeBotProvider } from '../providers/notification/CallMeBotProvider';
import { detectAudienceType } from '../utils/audienceMatcher';
import { AuthenticatedUserContext } from '../utils/tenant';
import { decrypt } from '../utils/crypto';
import { AppError } from '../utils/AppError';

export interface DailyAutomationReport {
  executionDate: string;
  companyId?: string;
  clientsScanned: number;
  clientBirthdaysFound: number;
  familyBirthdaysFound: number;
  fixedDatesFound: number;
  alertsGenerated: number;
  alreadyGeneratedSkipped: number;
  lgpdSkipped: number;
  ownerNotified: boolean;
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
  }>;
}

export class AutomationService {
  /**
   * Executa a varredura para uma empresa específica
   */
  static async scanAndDispatchForCompany(
    targetCompanyId: string,
    referenceDate: Date = new Date(),
    isDryRun: boolean = false
  ): Promise<DailyAutomationReport> {
    const report: DailyAutomationReport = {
      executionDate: referenceDate.toISOString(),
      companyId: targetCompanyId,
      clientsScanned: 0,
      clientBirthdaysFound: 0,
      familyBirthdaysFound: 0,
      fixedDatesFound: 0,
      alertsGenerated: 0,
      alreadyGeneratedSkipped: 0,
      lgpdSkipped: 0,
      ownerNotified: false,
      ownerNotificationStatus: 'NO_ALERTS',
      details: [],
    };

    const targetDay = referenceDate.getDate();
    const targetMonth = referenceDate.getMonth() + 1; // 1-12

    // 1. Carregar configurações da empresa
    const company = await prisma.company.findUnique({
      where: { id: targetCompanyId },
      include: { settings: true },
    });

    if (!company) {
      throw new AppError('Empresa não encontrada', 404);
    }

    const settings = company.settings;
    const companyName = company.tradeName || company.name || 'Enlace CRM';

    // 2. Carregar todos os clientes ativos da empresa com consentimento LGPD
    const allClients = await prisma.client.findMany({
      where: { companyId: targetCompanyId },
      include: {
        familyMembers: true,
      },
    });
    report.clientsScanned = allClients.length;

    // 3. Carregar datas comemorativas ativas (globais e da empresa)
    const fixedDates = await prisma.commemorativeDate.findMany({
      where: {
        active: true,
        OR: [
          { companyId: null },
          { companyId: targetCompanyId },
        ],
      },
    });

    const activeFixedDatesForToday = fixedDates.filter(
      (fd) => fd.day === targetDay && fd.month === targetMonth
    );
    report.fixedDatesFound = activeFixedDatesForToday.length;

    // 4. Carregar templates (globais e da empresa)
    const templates = await prisma.messageTemplate.findMany({
      where: {
        active: true,
        OR: [
          { companyId: null },
          { companyId: targetCompanyId },
        ],
      },
    });

    const getTemplate = (eventType: string, commDateId?: string | null) => {
      if (commDateId) {
        const specific = templates.find(
          (t) => t.commemorativeDateId === commDateId && t.eventType === eventType
        );
        if (specific) return specific;
      }
      return templates.find((t) => t.eventType === eventType);
    };

    // Início e fim do dia para checar duplicidades
    const startOfDay = new Date(referenceDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(referenceDate);
    endOfDay.setHours(23, 59, 59, 999);

    const alertsToNotify: Array<{
      clientName: string;
      targetName: string;
      context: string;
      phone?: string | null;
      renderedMessage: string;
    }> = [];

    const createdAlertIds: string[] = [];

    // =========================================================================
    // LOOP PRINCIPAL DE CLIENTES DA EMPRESA
    // =========================================================================
    for (const client of allClients) {
      if (client.status !== 'ACTIVE' || !client.lgpdConsent) {
        report.lgpdSkipped++;
        continue;
      }

      // -------------------------------------------------------------
      // CENÁRIO A: ANIVERSÁRIO DO PRÓPRIO CLIENTE
      // -------------------------------------------------------------
      if (client.birthDate && isSameDayAndMonth(client.birthDate, referenceDate)) {
        report.clientBirthdaysFound++;
        const age = calculateAge(client.birthDate, referenceDate);
        const contextDesc = `Aniversário do Cliente${age > 0 ? ` (${age} anos)` : ''}`;

        // Verificar se alerta já foi gerado hoje
        const alreadyCreated = await prisma.alert.findFirst({
          where: {
            companyId: targetCompanyId,
            clientId: client.id,
            eventType: 'CLIENT_BIRTHDAY',
            alertDate: { gte: startOfDay, lte: endOfDay },
          },
        });

        if (alreadyCreated && !isDryRun) {
          report.alreadyGeneratedSkipped++;
          report.details.push({
            eventType: 'CLIENT_BIRTHDAY',
            clientName: client.name,
            targetName: client.name,
            context: contextDesc,
            clientPhone: client.phone,
            renderedMessage: alreadyCreated.renderedMessage,
            status: 'ALREADY_GENERATED',
          });
          alertsToNotify.push({
            clientName: client.name,
            targetName: client.name,
            context: contextDesc,
            phone: client.phone,
            renderedMessage: alreadyCreated.renderedMessage,
          });
        } else {
          const template = getTemplate('CLIENT_BIRTHDAY');
          const content = template?.content || 'Olá, *{{primeiro_nome}}*! Parabéns pelo seu aniversário! 🎉 Desejamos muita saúde e sucesso. — {{nome_empresa}}';

          const renderedMessage = interpolateTemplate(content, {
            clientName: client.name,
            companyName,
          });

          if (!isDryRun) {
            const newAlert = await prisma.alert.create({
              data: {
                companyId: targetCompanyId,
                clientId: client.id,
                templateId: template?.id || null,
                eventType: 'CLIENT_BIRTHDAY',
                clientName: client.name,
                clientPhone: client.phone,
                targetName: client.name,
                contextDescription: contextDesc,
                renderedMessage,
                alertDate: referenceDate,
                notificationStatus: 'PENDING',
              },
            });
            createdAlertIds.push(newAlert.id);
            report.alertsGenerated++;
          }

          report.details.push({
            eventType: 'CLIENT_BIRTHDAY',
            clientName: client.name,
            targetName: client.name,
            context: contextDesc,
            clientPhone: client.phone,
            renderedMessage,
            status: isDryRun ? 'SIMULATED_READY' : 'GENERATED',
          });

          alertsToNotify.push({
            clientName: client.name,
            targetName: client.name,
            context: contextDesc,
            phone: client.phone,
            renderedMessage,
          });
        }
      }

      // -------------------------------------------------------------
      // CENÁRIO B: ANIVERSÁRIO DE FAMILIAR DO CLIENTE
      // -------------------------------------------------------------
      for (const fm of client.familyMembers) {
        if (fm.birthDate && isSameDayAndMonth(fm.birthDate, referenceDate)) {
          report.familyBirthdaysFound++;
          const relName = RELATIONSHIP_LABELS[fm.relationship] || 'Familiar';
          const age = calculateAge(fm.birthDate, referenceDate);
          const contextDesc = `Aniversário de ${relName}: ${fm.name}${age > 0 ? ` (${age} anos)` : ''}`;

          const alreadyCreated = await prisma.alert.findFirst({
            where: {
              companyId: targetCompanyId,
              clientId: client.id,
              familyMemberId: fm.id,
              eventType: 'FAMILY_BIRTHDAY',
              alertDate: { gte: startOfDay, lte: endOfDay },
            },
          });

          if (alreadyCreated && !isDryRun) {
            report.alreadyGeneratedSkipped++;
            report.details.push({
              eventType: 'FAMILY_BIRTHDAY',
              clientName: client.name,
              targetName: `${fm.name} (${relName})`,
              context: contextDesc,
              clientPhone: client.phone,
              renderedMessage: alreadyCreated.renderedMessage,
              status: 'ALREADY_GENERATED',
            });
            alertsToNotify.push({
              clientName: client.name,
              targetName: `${fm.name} (${relName})`,
              context: contextDesc,
              phone: client.phone,
              renderedMessage: alreadyCreated.renderedMessage,
            });
          } else {
            const template = getTemplate('FAMILY_BIRTHDAY');
            const content = template?.content || 'Olá, *{{nome_familiar}}*! 💐🎂 Hoje é o seu dia especial! Toda a equipe da {{nome_empresa}} deseja a você um feliz aniversário, com muita saúde, paz e realizações ao lado de toda a sua família! ✨🎈';

            const renderedMessage = interpolateTemplate(content, {
              clientName: client.name,
              familyName: fm.name,
              relationship: relName,
              companyName,
            });

            if (!isDryRun) {
              const newAlert = await prisma.alert.create({
                data: {
                  companyId: targetCompanyId,
                  clientId: client.id,
                  familyMemberId: fm.id,
                  templateId: template?.id || null,
                  eventType: 'FAMILY_BIRTHDAY',
                  clientName: client.name,
                  clientPhone: client.phone,
                  targetName: `${fm.name} (${relName})`,
                  contextDescription: contextDesc,
                  renderedMessage,
                  alertDate: referenceDate,
                  notificationStatus: 'PENDING',
                },
              });
              createdAlertIds.push(newAlert.id);
              report.alertsGenerated++;
            }

            report.details.push({
              eventType: 'FAMILY_BIRTHDAY',
              clientName: client.name,
              targetName: `${fm.name} (${relName})`,
              context: contextDesc,
              clientPhone: client.phone,
              renderedMessage,
              status: isDryRun ? 'SIMULATED_READY' : 'GENERATED',
            });

            alertsToNotify.push({
              clientName: client.name,
              targetName: `${fm.name} (${relName})`,
              context: contextDesc,
              phone: client.phone,
              renderedMessage,
            });
          }
        }
      }

      // -------------------------------------------------------------
      // CENÁRIO C: DATAS FIXAS DO CALENDÁRIO COM FILTRO DE PÚBLICO
      // -------------------------------------------------------------
      for (const fd of activeFixedDatesForToday) {
        const audType = detectAudienceType(fd);
        const family = client.familyMembers || [];
        const isClientFemale = client.gender === 'FEMALE';
        const isClientMale = client.gender === 'MALE';
        const hasChildren = family.some((fm) => ['CHILD', 'SON', 'DAUGHTER'].includes(fm.relationship));

        let clientMatches = false;
        let clientReason = '';

        if (audType === 'MOTHERS_ONLY' && (client.isMother || (isClientFemale && hasChildren))) {
          clientMatches = true;
          clientReason = '🌸 Cliente Marcada como Mãe';
        } else if (audType === 'FATHERS_ONLY' && (client.isFather || (isClientMale && hasChildren))) {
          clientMatches = true;
          clientReason = '👔 Cliente Marcado como Pai';
        } else if (audType === 'WOMEN_ONLY' && (isClientFemale || client.isMother)) {
          clientMatches = true;
          clientReason = '💐 Cliente do Gênero Feminino';
        } else if (audType === 'MEN_ONLY' && (isClientMale || client.isFather)) {
          clientMatches = true;
          clientReason = '🎩 Cliente do Gênero Masculino';
        } else if (audType === 'PARENTS_ONLY' && (client.isMother || client.isFather || hasChildren)) {
          clientMatches = true;
          clientReason = '👨‍👩‍👧 Cliente com Filhos/Família';
        } else if (audType === 'ALL_CLIENTS' || audType === 'CORPORATE_ONLY') {
          clientMatches = true;
          clientReason = '🌐 Cliente Ativo';
        }

        if (clientMatches) {
          const contextDesc = `Data Comemorativa (${clientReason}): ${fd.name}`;
          const alreadyCreated = await prisma.alert.findFirst({
            where: {
              companyId: targetCompanyId,
              clientId: client.id,
              familyMemberId: null,
              commemorativeDateId: fd.id,
              eventType: 'FIXED_DATE',
              alertDate: { gte: startOfDay, lte: endOfDay },
            },
          });

          if (alreadyCreated && !isDryRun) {
            report.alreadyGeneratedSkipped++;
            report.details.push({
              eventType: 'FIXED_DATE',
              clientName: client.name,
              targetName: fd.name,
              context: contextDesc,
              clientPhone: client.phone,
              renderedMessage: alreadyCreated.renderedMessage,
              status: 'ALREADY_GENERATED',
            });
            alertsToNotify.push({
              clientName: client.name,
              targetName: fd.name,
              context: contextDesc,
              phone: client.phone,
              renderedMessage: alreadyCreated.renderedMessage,
            });
          } else {
            const template = getTemplate('FIXED_DATE', fd.id);
            const content = template?.content || 'Olá, *{{primeiro_nome}}*! Desejamos a você um excelente dia comemorativo de {{nome_empresa}}! ✨';
            const renderedMessage = interpolateTemplate(content, {
              clientName: client.name,
              companyName,
            });

            if (!isDryRun) {
              const newAlert = await prisma.alert.create({
                data: {
                  companyId: targetCompanyId,
                  clientId: client.id,
                  commemorativeDateId: fd.id,
                  templateId: template?.id || null,
                  eventType: 'FIXED_DATE',
                  clientName: client.name,
                  clientPhone: client.phone,
                  targetName: fd.name,
                  contextDescription: contextDesc,
                  renderedMessage,
                  alertDate: referenceDate,
                  notificationStatus: 'PENDING',
                },
              });
              createdAlertIds.push(newAlert.id);
              report.alertsGenerated++;
            }

            report.details.push({
              eventType: 'FIXED_DATE',
              clientName: client.name,
              targetName: fd.name,
              context: contextDesc,
              clientPhone: client.phone,
              renderedMessage,
              status: isDryRun ? 'SIMULATED_READY' : 'GENERATED',
            });

            alertsToNotify.push({
              clientName: client.name,
              targetName: fd.name,
              context: contextDesc,
              phone: client.phone,
              renderedMessage,
            });
          }
        }
      }
    }

    // =========================================================================
    // NOTIFICAÇÃO VIA CALLMEBOT PARA O DONO DO SISTEMA / OPERADOR DA EMPRESA
    // =========================================================================
    if (!isDryRun && alertsToNotify.length > 0) {
      if (settings && settings.callmebotEnabled && settings.ownerWhatsappPhone) {
        let rawApiKey = '';
        if (settings.callmebotApiKey && settings.callmebotApiKeyIv && settings.callmebotApiKeyTag) {
          rawApiKey = decrypt(settings.callmebotApiKey, settings.callmebotApiKeyIv, settings.callmebotApiKeyTag);
        } else if (settings.callmebotApiKey) {
          rawApiKey = settings.callmebotApiKey;
        }

        const notifResult = await CallMeBotProvider.sendDailySummary({
          ownerPhone: settings.ownerWhatsappPhone,
          apiKey: rawApiKey,
          date: referenceDate,
          alerts: alertsToNotify,
        });

        report.ownerNotified = notifResult.success;
        report.ownerNotificationStatus = notifResult.simulated
          ? 'SIMULATED'
          : notifResult.success
          ? 'SENT'
          : 'FAILED';
        report.ownerNotificationError = notifResult.error;

        if (createdAlertIds.length > 0) {
          await prisma.alert.updateMany({
            where: { id: { in: createdAlertIds } },
            data: {
              notificationStatus: report.ownerNotificationStatus,
              notificationError: notifResult.error || null,
            },
          });
        }
      } else {
        report.ownerNotificationStatus = 'DISABLED';
      }
    } else if (alertsToNotify.length === 0) {
      report.ownerNotificationStatus = 'NO_ALERTS';
    }

    return report;
  }

  /**
   * Executa a varredura para a empresa do usuário autenticado
   */
  static async scanAndDispatch(
    currentUser?: AuthenticatedUserContext | null,
    referenceDate: Date = new Date(),
    isDryRun: boolean = false
  ): Promise<DailyAutomationReport> {
    if (!currentUser?.companyId) {
      throw new AppError('Empresa não identificada no usuário autenticado', 400);
    }

    return this.scanAndDispatchForCompany(currentUser.companyId, referenceDate, isDryRun);
  }

  /**
   * Executa a varredura para todas as empresas ativas (usado pelo scheduler/cron global)
   */
  static async scanAndDispatchAll(referenceDate: Date = new Date()): Promise<DailyAutomationReport[]> {
    const activeCompanies = await prisma.company.findMany({
      where: {
        status: { in: ['ACTIVE', 'TRIAL'] },
      },
    });

    const reports: DailyAutomationReport[] = [];
    for (const company of activeCompanies) {
      try {
        const report = await this.scanAndDispatchForCompany(company.id, referenceDate, false);
        reports.push(report);
      } catch (err) {
        console.error(`Erro ao rodar automação para empresa ${company.id}:`, err);
      }
    }

    return reports;
  }
}
