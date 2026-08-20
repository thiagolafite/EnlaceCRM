import { prisma } from '../utils/prisma';
import { isSameDayAndMonth, calculateAge, RELATIONSHIP_LABELS, RELATIONSHIP_POSSESSIVE } from '../utils/dateUtils';
import { interpolateTemplate } from '../utils/interpolator';
import { CallMeBotProvider } from '../providers/notification/CallMeBotProvider';

export interface DailyAutomationReport {
  executionDate: string;
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
   * Executa a varredura de datas para um dia de referência (hoje ou data simulada)
   */
  static async scanAndDispatch(referenceDate: Date = new Date(), isDryRun: boolean = false): Promise<DailyAutomationReport> {
    const report: DailyAutomationReport = {
      executionDate: referenceDate.toISOString(),
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

    // 1. Carregar configurações da empresa e CallMeBot
    const settings = await prisma.companySettings.findFirst();
    const companyName = settings?.tradeName || settings?.companyName || 'Enlace CRM';

    // 2. Carregar todos os clientes ativos com consentimento LGPD
    const allClients = await prisma.client.findMany({
      include: {
        familyMembers: true,
      },
    });
    report.clientsScanned = allClients.length;

    // 3. Carregar datas comemorativas fixas ativas
    const fixedDates = await prisma.commemorativeDate.findMany({
      where: { active: true },
    });

    const activeFixedDatesForToday = fixedDates.filter(
      (fd) => fd.day === targetDay && fd.month === targetMonth
    );
    report.fixedDatesFound = activeFixedDatesForToday.length;

    // 4. Carregar templates padrão
    const templates = await prisma.messageTemplate.findMany({
      where: { active: true },
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
    // LOOP PRINCIPAL DE CLIENTES
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
          const relPossessive = RELATIONSHIP_POSSESSIVE[fm.relationship] || 'seu familiar';
          const age = calculateAge(fm.birthDate, referenceDate);
          const contextDesc = `Aniversário de ${relName}: ${fm.name}${age > 0 ? ` (${age} anos)` : ''}`;

          const alreadyCreated = await prisma.alert.findFirst({
            where: {
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
            const content = template?.content || 'Olá, *{{primeiro_nome}}*! Soubemos que hoje {{parentesco_possessivo}}, *{{nome_familiar}}*, está comemorando aniversário! 🥳 Parabéns para toda a família! — {{nome_empresa}}';

            const renderedMessage = interpolateTemplate(content, {
              clientName: client.name,
              familyName: fm.name,
              relationship: fm.relationship,
              companyName,
            });

            if (!isDryRun) {
              const newAlert = await prisma.alert.create({
                data: {
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
      // CENÁRIO C: DATAS FIXAS DO CALENDÁRIO
      // -------------------------------------------------------------
      for (const fd of activeFixedDatesForToday) {
        const contextDesc = `Data Comemorativa: ${fd.name}`;

        const alreadyCreated = await prisma.alert.findFirst({
          where: {
            clientId: client.id,
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

    // =========================================================================
    // NOTIFICAÇÃO VIA CALLMEBOT PARA O DONO DO SISTEMA
    // =========================================================================
    if (!isDryRun && alertsToNotify.length > 0) {
      if (settings && settings.callmebotEnabled && settings.ownerWhatsappPhone) {
        const notifResult = await CallMeBotProvider.sendDailySummary({
          ownerPhone: settings.ownerWhatsappPhone,
          apiKey: settings.callmebotApiKey || '',
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

        // Atualizar status nos alertas gravados
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
}
