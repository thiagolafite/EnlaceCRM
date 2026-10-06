import { config } from '../../config';
import {
  NotificationProvider,
  NotificationOptions,
  NotificationResponse,
} from './NotificationProvider';

export class CallMeBotProvider implements NotificationProvider {
  name = 'CALLMEBOT';

  /**
   * Limpa e padroniza o número de telefone para dígitos internacionais (ex: 5571981805744)
   */
  static sanitizePhone(phone: string): string {
    const clean = phone.replace(/\D/g, '');
    if (clean.length === 10 || clean.length === 11) {
      return `55${clean}`;
    }
    return clean;
  }

  /**
   * Divide uma mensagem longa em pedaços de no máximo maxChunkSize caracteres
   */
  static splitMessage(message: string, maxChunkSize: number = 3200): string[] {
    if (message.length <= maxChunkSize) {
      return [message];
    }

    const chunks: string[] = [];
    const lines = message.split('\n');
    let currentChunk = '';

    for (const line of lines) {
      if ((currentChunk + '\n' + line).length > maxChunkSize) {
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = line;
      } else {
        currentChunk = currentChunk ? currentChunk + '\n' + line : line;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    if (chunks.length > 1) {
      return chunks.map((c, i) => `[Parte ${i + 1}/${chunks.length}]\n\n${c}`);
    }

    return chunks;
  }

  /**
   * Envia uma única requisição HTTP para a API do CallMeBot
   */
  private async dispatchChunk(phone: string, text: string, apiKey: string): Promise<{ success: boolean; error?: string }> {
    const cleanPhone = CallMeBotProvider.sanitizePhone(phone);
    const encodedText = encodeURIComponent(text);
    const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodedText}&apikey=${apiKey.trim()}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const responseText = await response.text();

      if (!response.ok) {
        return {
          success: false,
          error: `CallMeBot retornou HTTP ${response.status}`,
        };
      }

      // Verificação de falhas explícitas conhecidas da API CallMeBot
      const lower = responseText.toLowerCase();
      if (
        lower.includes('apikey is invalid') ||
        lower.includes('api key is invalid') ||
        lower.includes('phone number not found') ||
        lower.includes('not authorized') ||
        lower.includes('please register first')
      ) {
        return {
          success: false,
          error: 'Chave de API do CallMeBot inválida ou número não registrado no bot.',
        };
      }

      return { success: true };
    } catch (err: any) {
      const isAbort = err.name === 'AbortError';
      return {
        success: false,
        error: isAbort ? 'Tempo limite de conexão excedido com CallMeBot (15s)' : err.message || 'Falha de rede ao conectar ao CallMeBot',
      };
    }
  }

  /**
   * Implementação da interface NotificationProvider
   */
  async sendNotification(message: string, options: NotificationOptions): Promise<NotificationResponse> {
    const phone = options.recipientPhone;
    const apiKey = options.apiKey;

    if (!phone) {
      return {
        success: false,
        channel: 'CALLMEBOT',
        error: 'Telefone de destino não informado para CallMeBot.',
      };
    }

    if (options.simulate || !apiKey || !apiKey.trim()) {
      if (config.nodeEnv !== 'production') {
        console.log(`[CallMeBot - SIMULAÇÃO] Para: ${CallMeBotProvider.sanitizePhone(phone)}`);
      }
      return {
        success: true,
        channel: 'SIMULATED',
        simulated: true,
      };
    }

    const cleanPhone = CallMeBotProvider.sanitizePhone(phone);
    if (!cleanPhone || cleanPhone.length < 10) {
      return {
        success: false,
        channel: 'CALLMEBOT',
        error: `Telefone inválido: "${phone}". Use formato com DDD (ex: 5511999999999).`,
      };
    }

    const chunks = CallMeBotProvider.splitMessage(message, 3200);

    for (const chunk of chunks) {
      const res = await this.dispatchChunk(cleanPhone, chunk, apiKey);
      if (!res.success) {
        return {
          success: false,
          channel: 'CALLMEBOT',
          error: res.error,
        };
      }
    }

    return {
      success: true,
      channel: 'CALLMEBOT',
    };
  }

  /**
   * Helper estático para envio de teste
   */
  static async sendTestNotification(ownerPhone: string, apiKey: string): Promise<NotificationResponse> {
    const provider = new CallMeBotProvider();
    const testMessage = `✅ *Enlace CRM — Teste de Notificação*\n\nSua integração com o WhatsApp está configurada com sucesso!\n\nA partir de agora, você receberá aqui seus resumos matinais de aniversários e datas especiais prontos para envio.`;
    return provider.sendNotification(testMessage, {
      recipientPhone: ownerPhone,
      apiKey,
      simulate: false,
    });
  }
}
