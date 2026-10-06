import { CallMeBotProvider } from './CallMeBotProvider';
import { UltraMsgProvider } from './UltraMsgProvider';
import { EmailProvider } from './EmailProvider';
import {
  NotificationOptions,
  NotificationResponse,
  NotificationProvider,
} from './NotificationProvider';

export class NotificationDispatcher {
  private callmebot = new CallMeBotProvider();
  private ultramsg = new UltraMsgProvider();
  private email = new EmailProvider();

  /**
   * Executa uma função com retry e backoff exponencial (até maxRetries tentativas)
   */
  private async executeWithRetry(
    provider: NotificationProvider,
    message: string,
    options: NotificationOptions,
    maxRetries: number = 3
  ): Promise<NotificationResponse> {
    let lastError = '';

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await provider.sendNotification(message, options);
        if (result.success) {
          return result;
        }
        lastError = result.error || 'Erro desconhecido no provedor';
      } catch (err: any) {
        lastError = err.message || 'Exceção não tratada no envio';
      }

      // Se não for a última tentativa, aguarda com backoff (500ms, 1000ms, 2000ms)
      if (attempt < maxRetries) {
        const delayMs = Math.pow(2, attempt - 1) * 500;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    return {
      success: false,
      channel: provider.name as any,
      error: `Falhou após ${maxRetries} tentativas: ${lastError}`,
    };
  }

  /**
   * Envia notificação através da cadeia de fallback:
   * CallMeBot -> UltraMsg -> E-mail ao Dono
   */
  async dispatch(message: string, options: NotificationOptions): Promise<NotificationResponse> {
    // 1. Tenta CallMeBot
    if (options.recipientPhone && options.apiKey) {
      const callmebotRes = await this.executeWithRetry(this.callmebot, message, options, 3);
      if (callmebotRes.success) {
        return callmebotRes;
      }
    }

    // 2. Tenta UltraMsg se credenciais estiverem configuradas
    if (options.recipientPhone && options.instanceId) {
      const ultramsgRes = await this.executeWithRetry(this.ultramsg, message, options, 3);
      if (ultramsgRes.success) {
        return ultramsgRes;
      }
    }

    // 3. Fallback: E-mail ao Dono/Operador
    if (options.recipientEmail) {
      const emailRes = await this.executeWithRetry(this.email, message, {
        ...options,
        subject: `⚠️ [Aviso de Envio] ${options.subject || 'Resumo Diário de Felicitações'}`,
      }, 3);

      if (emailRes.success) {
        return emailRes;
      }
    }

    // Se todos falharem:
    return {
      success: false,
      channel: 'CALLMEBOT',
      error: 'Todos os canais de notificação (WhatsApp e E-mail) falharam após múltiplas tentativas.',
    };
  }
}

export const notificationDispatcher = new NotificationDispatcher();
