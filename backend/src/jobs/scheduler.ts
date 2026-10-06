import cron, { ScheduledTask } from 'node-cron';
import { AutomationService } from '../services/AutomationService';
import { todayInSaoPaulo } from '../utils/time';

let scheduledTask: ScheduledTask | null = null;
let lastCronRunAt: string | null = null;
let lastCronStatus: 'HEALTHY' | 'ERROR' | 'IDLE' = 'IDLE';
let lastCronDetails: any = null;

export function getCronState() {
  return {
    lastCronRunAt,
    lastCronStatus,
    lastCronDetails,
  };
}

/**
 * Inicializa o agendador global executando a cada minuto
 * Avalia de forma desacoplada cada empresa com base no seu próprio schedulerHour e schedulerMinute
 */
export async function initScheduler() {
  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
  }

  // Executa a cada minuto: "* * * * *" no fuso de São Paulo
  scheduledTask = cron.schedule(
    '* * * * *',
    async () => {
      const now = new Date();
      const currentSP = todayInSaoPaulo(now);

      try {
        const result = await AutomationService.runGlobalSchedulerTick(now);
        lastCronRunAt = now.toISOString();

        if (result.executedCompanies > 0) {
          console.log(`⏰ [Scheduler Tick] Executadas ${result.executedCompanies} empresas para o minuto ${String(currentSP.hours).padStart(2, '0')}:${String(currentSP.minutes).padStart(2, '0')} (SP).`);
        }

        if (result.errors.length > 0) {
          lastCronStatus = 'ERROR';
          lastCronDetails = { errorsCount: result.errors.length, errors: result.errors };
        } else {
          lastCronStatus = 'HEALTHY';
          lastCronDetails = { executedCount: result.executedCompanies };
        }
      } catch (err: any) {
        lastCronRunAt = now.toISOString();
        lastCronStatus = 'ERROR';
        lastCronDetails = { error: err.message };
        console.error('❌ [Scheduler Critical Error]:', err);
      }
    },
    {
      timezone: 'America/Sao_Paulo',
    }
  );

  console.log('⏰ [Scheduler] Orquestrador multi-tenant ativo rodando a cada minuto em America/Sao_Paulo.');
}

export function restartDailyScheduler() {
  initScheduler().catch((err) => console.error('[Scheduler Restart Error]:', err));
}
