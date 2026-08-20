import { prisma } from '../../utils/prisma';

export interface SendAlertSummaryOptions {
  ownerPhone: string;
  apiKey: string;
  date: Date;
  alerts: Array<{
    clientName: string;
    targetName: string;
    context: string;
    phone?: string | null;
    renderedMessage: string;
  }>;
}

export interface NotificationResult {
  success: boolean;
  simulated?: boolean;
  error?: string;
}

export class CallMeBotProvider {
  /**
   * Limpa e padroniza o número de telefone para o formato internacional (apenas dígitos, ex: 5571981805744)
   */
  static sanitizePhone(phone: string): string {
    const clean = phone.replace(/\D/g, '');
    if (clean.length === 10 || clean.length === 11) {
      return `55${clean}`;
    }
    return clean;
  }

  /**
   * Envia uma mensagem de texto direta para o WhatsApp do operador via CallMeBot API
   */
  static async sendTextMessage(phone: string, text: string, apiKey: string, simulate: boolean = false): Promise<NotificationResult> {
    const cleanPhone = this.sanitizePhone(phone);

    if (!cleanPhone || cleanPhone.length < 10) {
      return {
        success: false,
        error: `Número de WhatsApp inválido para notificação: "${phone}". Informe no formato com DDD (ex: 5571981805744).`,
      };
    }

    if (simulate || !apiKey || !apiKey.trim()) {
      console.log(`\n[CallMeBot - SIMULAÇÃO] Para: +${cleanPhone}`);
      console.log(`[CallMeBot - SIMULAÇÃO] Mensagem:\n${text}\n`);
      return {
        success: true,
        simulated: true,
      };
    }

    try {
      const encodedText = encodeURIComponent(text);
      const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodedText}&apikey=${apiKey.trim()}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const responseText = await response.text();

      if (!response.ok || responseText.toLowerCase().includes('error') || responseText.toLowerCase().includes('invalid')) {
        console.error('[CallMeBot Error Response]:', responseText);
        return {
          success: false,
          error: `Falha na API do CallMeBot: ${responseText || `Status HTTP ${response.status}`}`,
        };
      }

      console.log(`✅ [CallMeBot] Notificação enviada com sucesso para +${cleanPhone}`);
      return { success: true };
    } catch (err: any) {
      const errMsg = err.name === 'AbortError' ? 'Tempo limite de conexão excedido com CallMeBot' : err.message;
      console.error('[CallMeBot Catch Error]:', errMsg);
      return {
        success: false,
        error: errMsg || 'Erro ao conectar à API do CallMeBot',
      };
    }
  }

  /**
   * Formata e envia a lista consolidada de alertas diários para o WhatsApp do operador
   */
  static async sendDailySummary(options: SendAlertSummaryOptions): Promise<NotificationResult> {
    if (!options.alerts || options.alerts.length === 0) {
      return { success: true, simulated: false };
    }

    const settings = await prisma.companySettings.findFirst();
    const simulate = settings?.callmebotSimulateMode || !options.apiKey;

    const dateFormatted = options.date.toLocaleDateString('pt-BR');
    const total = options.alerts.length;

    let body = `🔔 *ENLACE — Alertas de Felicitações do Dia (${dateFormatted})*\n\n`;
    body += `Temos *${total}* ${total === 1 ? 'comemoração identificada' : 'comemorações identificadas'} para hoje:\n\n`;

    options.alerts.forEach((alert, index) => {
      body += `━━━━━━━━━━━━━━━━━━━\n`;
      body += `👤 *${index + 1}. ${alert.clientName}*\n`;
      body += `🎉 *Contexto:* ${alert.context}\n`;
      if (alert.phone) {
        body += `📱 *WhatsApp Cliente:* ${alert.phone}\n`;
      }
      body += `\n💬 *Texto da Mensagem:*\n${alert.renderedMessage}\n`;
    });

    body += `━━━━━━━━━━━━━━━━━━━\n\n`;
    body += `👉 *Acesse o painel para copiar ou marcar como enviado:*\nhttp://localhost:5173`;

    return this.sendTextMessage(options.ownerPhone, body, options.apiKey, simulate);
  }

  /**
   * Envia mensagem de teste de validação de API Key
   */
  static async sendTestNotification(ownerPhone: string, apiKey: string): Promise<NotificationResult> {
    const testMessage = `✅ *Enlace CRM — Teste de Notificação*\n\nSua integração com o CallMeBot está configurada com sucesso!\n\nA partir de agora, você receberá aqui no seu WhatsApp as notificações diárias de aniversários e datas especiais com os textos prontos para enviar aos seus clientes.`;
    return this.sendTextMessage(ownerPhone, testMessage, apiKey, false);
  }
}
