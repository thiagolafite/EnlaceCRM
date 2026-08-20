import { prisma } from '../utils/prisma';
import { EmailProvider } from '../providers/email/EmailProvider';
import { WhatsAppProvider } from '../providers/whatsapp/WhatsAppProvider';

export interface SendMessagePayload {
  sendHistoryId: string;
  clientId: string;
  channel: 'WHATSAPP' | 'EMAIL';
  recipientContact: string;
  subject?: string;
  body: string;
  metaTemplateName?: string;
  metaTemplateParameters?: string[];
  clientName?: string;
}

export class MessageQueue {
  private static isRunning = false;
  private static workerInterval: NodeJS.Timeout | null = null;

  /**
   * Enfileira um novo envio para processamento assíncrono
   */
  static async enqueueSendMessage(payload: SendMessagePayload, delayMs: number = 0): Promise<string> {
    const scheduledFor = new Date(Date.now() + delayMs);

    const job = await prisma.queueJob.create({
      data: {
        type: 'SEND_MESSAGE',
        payload: JSON.stringify(payload),
        status: 'PENDING',
        scheduledFor,
      },
    });

    // Atualiza status do histórico para QUEUED
    await prisma.sendHistory.update({
      where: { id: payload.sendHistoryId },
      data: { status: 'QUEUED' },
    });

    // Trigger processamento imediato se worker estiver rodando
    setImmediate(() => {
      this.processNextJobs().catch((err) => console.error('[Queue Error]:', err));
    });

    return job.id;
  }

  /**
   * Processa os próximos jobs pendentes que já passaram do scheduledFor
   */
  static async processNextJobs(limit: number = 5): Promise<number> {
    const now = new Date();

    const jobs = await prisma.queueJob.findMany({
      where: {
        status: 'PENDING',
        scheduledFor: { lte: now },
      },
      take: limit,
      orderBy: { createdAt: 'asc' },
    });

    if (jobs.length === 0) return 0;

    for (const job of jobs) {
      await this.processJob(job);
    }

    return jobs.length;
  }

  /**
   * Executa um job específico com controle de retry
   */
  private static async processJob(job: {
    id: string;
    type: string;
    payload: string;
    attempts: number;
    maxAttempts: number;
  }) {
    // Marca como PROCESSING
    await prisma.queueJob.update({
      where: { id: job.id },
      data: {
        status: 'PROCESSING',
        attempts: job.attempts + 1,
      },
    });

    try {
      if (job.type === 'SEND_MESSAGE') {
        const payload: SendMessagePayload = JSON.parse(job.payload);
        await this.handleSendMessage(payload, job);
      }
    } catch (err: any) {
      console.error(`[MessageQueue Job ${job.id} Error]:`, err);
      const nextAttempt = job.attempts + 1;
      const willRetry = nextAttempt < job.maxAttempts;

      const backoffSeconds = Math.pow(2, nextAttempt) * 10; // 20s, 40s, 80s
      const nextSchedule = new Date(Date.now() + backoffSeconds * 1000);

      await prisma.queueJob.update({
        where: { id: job.id },
        data: {
          status: willRetry ? 'PENDING' : 'FAILED',
          error: err.message || 'Erro no processamento',
          scheduledFor: willRetry ? nextSchedule : undefined,
        },
      });

      if (!willRetry) {
        // Marca o SendHistory como FAILED se não houver mais tentativas
        const payload: SendMessagePayload = JSON.parse(job.payload);
        await prisma.sendHistory.update({
          where: { id: payload.sendHistoryId },
          data: {
            status: 'FAILED',
            errorMessage: err.message || 'Excedido o número máximo de tentativas de envio',
            lastAttemptAt: new Date(),
          },
        });
      }
    }
  }

  /**
   * Realiza o envio via provedor e atualiza o histórico
   */
  private static async handleSendMessage(payload: SendMessagePayload, job: { id: string; attempts: number; maxAttempts: number }) {
    let result: { success: boolean; externalMessageId?: string; error?: string };

    if (payload.channel === 'EMAIL') {
      result = await EmailProvider.send({
        to: payload.recipientContact,
        subject: payload.subject || 'Felicitações Especiais',
        body: payload.body,
        clientName: payload.clientName,
      });
    } else {
      result = await WhatsAppProvider.send({
        toPhone: payload.recipientContact,
        message: payload.body,
        templateName: payload.metaTemplateName,
        templateParameters: payload.metaTemplateParameters,
        clientName: payload.clientName,
      });
    }

    if (result.success) {
      // Sucesso no envio
      await prisma.queueJob.update({
        where: { id: job.id },
        data: {
          status: 'COMPLETED',
          processedAt: new Date(),
          error: null,
        },
      });

      await prisma.sendHistory.update({
        where: { id: payload.sendHistoryId },
        data: {
          status: 'SENT',
          externalMessageId: result.externalMessageId,
          sentAt: new Date(),
          lastAttemptAt: new Date(),
          attempts: job.attempts,
          errorMessage: null,
        },
      });
    } else {
      // Falha no envio
      throw new Error(result.error || 'Falha ao enviar mensagem pelo canal');
    }
  }

  /**
   * Inicia o loop contínuo do worker da fila
   */
  static startWorkerLoop(intervalMs: number = 3000) {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log(`[MessageQueue] Worker iniciado (polling a cada ${intervalMs}ms)`);

    this.workerInterval = setInterval(async () => {
      try {
        await this.processNextJobs(10);
      } catch (err) {
        console.error('[MessageQueue Polling Error]:', err);
      }
    }, intervalMs);
  }

  /**
   * Para o worker da fila
   */
  static stopWorkerLoop() {
    if (this.workerInterval) {
      clearInterval(this.workerInterval);
      this.workerInterval = null;
    }
    this.isRunning = false;
    console.log('[MessageQueue] Worker finalizado');
  }
}
