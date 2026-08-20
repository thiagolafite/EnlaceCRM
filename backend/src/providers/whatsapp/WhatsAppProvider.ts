import { prisma } from '../../utils/prisma';

export interface SendWhatsAppOptions {
  toPhone: string;
  message: string;
  templateName?: string;
  templateParameters?: string[];
  clientName?: string;
}

export interface SendResult {
  success: boolean;
  externalMessageId?: string;
  error?: string;
}

export class WhatsAppProvider {
  static sanitizePhoneNumber(phone: string): string {
    const clean = phone.replace(/\D/g, '');
    // If not starting with country code (55 for Brazil), prepend 55
    if (clean.length === 10 || clean.length === 11) {
      return `55${clean}`;
    }
    return clean;
  }

  static async send(options: SendWhatsAppOptions): Promise<SendResult> {
    try {
      const settings = await prisma.companySettings.findFirst();
      const cleanPhone = this.sanitizePhoneNumber(options.toPhone);

      if (!cleanPhone || cleanPhone.length < 8) {
        return {
          success: false,
          error: `Telefone inválido para envio de WhatsApp: ${options.toPhone}`,
        };
      }

      const simulate =
        settings?.whatsappSimulateMode !== false ||
        !settings?.metaWhatsappToken ||
        !settings?.metaWhatsappPhoneId;

      if (simulate) {
        const mockId = `wamid.HBgL${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        console.log(`[WhatsAppProvider - MOCK SIMULATION] Destinatário: +${cleanPhone}`);
        console.log(`[WhatsAppProvider - MOCK SIMULATION] Mensagem:\n${options.message}`);
        console.log(`[WhatsAppProvider - MOCK SIMULATION] WAMID Gerado: ${mockId}`);

        return {
          success: true,
          externalMessageId: mockId,
        };
      }

      // Meta Cloud API Dispatch (Official Graph API)
      const url = `https://graph.facebook.com/v19.0/${settings.metaWhatsappPhoneId}/messages`;
      
      let payload: any;
      if (options.templateName) {
        // Template message for Meta outside 24h window
        payload = {
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'template',
          template: {
            name: options.templateName,
            language: { code: 'pt_BR' },
            components: options.templateParameters?.length
              ? [
                  {
                    type: 'body',
                    parameters: options.templateParameters.map((param) => ({
                      type: 'text',
                      text: param,
                    })),
                  },
                ]
              : [],
          },
        };
      } else {
        // Free-form text message
        payload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'text',
          text: {
            preview_url: false,
            body: options.message,
          },
        };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${settings.metaWhatsappToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as any;

      if (!response.ok) {
        const errMsg = data?.error?.message || `Erro da API do WhatsApp (${response.status})`;
        console.error('[WhatsAppProvider Meta Error]:', data);
        return {
          success: false,
          error: errMsg,
        };
      }

      const wamid = data?.messages?.[0]?.id || `wamid.${Date.now()}`;
      return {
        success: true,
        externalMessageId: wamid,
      };
    } catch (err: any) {
      console.error('[WhatsAppProvider Catch Error]:', err);
      return {
        success: false,
        error: err.message || 'Erro de conexão com Meta WhatsApp API',
      };
    }
  }
}
