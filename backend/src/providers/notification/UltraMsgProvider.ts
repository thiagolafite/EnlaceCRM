import { config } from '../../config';
import {
  NotificationProvider,
  NotificationOptions,
  NotificationResponse,
} from './NotificationProvider';

export class UltraMsgProvider implements NotificationProvider {
  name = 'ULTRAMSG';

  async sendNotification(message: string, options: NotificationOptions): Promise<NotificationResponse> {
    const phone = options.recipientPhone;
    const token = options.apiKey;
    const instanceId = options.instanceId;

    if (!phone || !token || !instanceId) {
      return {
        success: false,
        channel: 'ULTRAMSG',
        error: 'Credenciais UltraMsg incompletas (requer phone, instanceId e token).',
      };
    }

    if (options.simulate) {
      if (config.nodeEnv !== 'production') {
        console.log(`[UltraMsg - SIMULAÇÃO] Para: ${phone}`);
      }
      return {
        success: true,
        channel: 'SIMULATED',
        simulated: true,
      };
    }

    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const url = `https://api.ultramsg.com/${instanceId}/messages/chat`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          token,
          to: cleanPhone,
          body: message,
        }),
      });

      const data = (await response.json()) as any;

      if (data.sent === 'true' || data.id) {
        return {
          success: true,
          channel: 'ULTRAMSG',
          messageId: data.id,
        };
      }

      return {
        success: false,
        channel: 'ULTRAMSG',
        error: data.error || 'Falha no envio via UltraMsg',
      };
    } catch (err: any) {
      return {
        success: false,
        channel: 'ULTRAMSG',
        error: err.message || 'Erro ao conectar ao provedor UltraMsg',
      };
    }
  }
}
