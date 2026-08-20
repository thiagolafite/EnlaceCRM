import cron, { ScheduledTask } from 'node-cron';
import { prisma } from '../utils/prisma';
import { AutomationService } from '../services/AutomationService';

let scheduledTask: ScheduledTask | null = null;

export async function initScheduler() {
  try {
    const settings = await prisma.companySettings.findFirst();
    const isEnabled = settings ? settings.schedulerEnabled : true;
    const hour = settings ? settings.schedulerHour : 6;
    const minute = settings ? settings.schedulerMinute : 0;

    if (scheduledTask) {
      scheduledTask.stop();
      scheduledTask = null;
    }

    if (!isEnabled) {
      console.log('⏰ [Scheduler] O motor de automação diário está DESATIVADO nas configurações.');
      return;
    }

    // Cron syntax: minute hour day-of-month month day-of-week
    const cronExpression = `${minute} ${hour} * * *`;

    console.log(`⏰ [Scheduler] Agendador diário configurado para ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} (${cronExpression})`);

    scheduledTask = cron.schedule(
      cronExpression,
      async () => {
        console.log(`⏰ [Scheduler] Executando rotina diária de felicitações (${new Date().toISOString()})...`);
        try {
          const report = await AutomationService.scanAndDispatch(new Date(), false);
          console.log(`✅ [Scheduler] Rotina finalizada: ${report.messagesEnqueued} mensagens enfileiradas.`);
        } catch (err) {
          console.error('❌ [Scheduler Error]:', err);
        }
      },
      {
        timezone: 'America/Sao_Paulo',
      }
    );
  } catch (err) {
    console.error('❌ [Scheduler Init Error]:', err);
  }
}

export function restartDailyScheduler() {
  console.log('🔄 [Scheduler] Reiniciando agendador com novas configurações...');
  initScheduler().catch((err) => console.error('[Scheduler Restart Error]:', err));
}
