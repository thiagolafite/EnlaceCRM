import nodemailer from 'nodemailer';
import { prisma } from '../../utils/prisma';

export interface SendEmailOptions {
  to: string;
  subject: string;
  body: string;
  clientName?: string;
}

export interface SendResult {
  success: boolean;
  externalMessageId?: string;
  error?: string;
}

export class EmailProvider {
  static async send(options: SendEmailOptions): Promise<SendResult> {
    try {
      const settings = await prisma.companySettings.findFirst();

      const simulate = settings?.emailSimulateMode !== false || !settings?.smtpHost;

      if (simulate) {
        const mockId = `mock_email_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        console.log(`[EmailProvider - MOCK SIMULATION] Enviando para: ${options.to}`);
        console.log(`[EmailProvider - MOCK SIMULATION] Assunto: ${options.subject}`);
        console.log(`[EmailProvider - MOCK SIMULATION] Corpo:\n${options.body}`);
        console.log(`[EmailProvider - MOCK SIMULATION] ID Gerado: ${mockId}`);

        return {
          success: true,
          externalMessageId: mockId,
        };
      }

      // Real SMTP Dispatch
      const transporter = nodemailer.createTransport({
        host: settings.smtpHost || undefined,
        port: settings.smtpPort || 587,
        secure: settings.smtpSecure || false,
        auth: settings.smtpUser
          ? {
              user: settings.smtpUser,
              pass: settings.smtpPass || '',
            }
          : undefined,
      });

      const fromAddress = `"${settings.senderEmailName || 'Enlace'}" <${settings.senderEmailAddress || 'no-reply@enlacecrm.com.br'}>`;

      const info = await transporter.sendMail({
        from: fromAddress,
        to: options.to,
        subject: options.subject,
        text: options.body,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #4f46e5; margin: 0;">${settings.tradeName || settings.companyName || 'Enlace CRM'}</h2>
            </div>
            <div style="font-size: 16px; line-height: 1.6; color: #334155; white-space: pre-line;">
              ${options.body}
            </div>
            <hr style="margin-top: 32px; border: none; border-top: 1px solid #e2e8f0;" />
            <div style="text-align: center; font-size: 12px; color: #94a3b8; margin-top: 16px;">
              Mensagem enviada por ${settings.tradeName || 'Enlace'}. Caso deseje revogar o recebimento, entre em contato.
            </div>
          </div>
        `,
      });

      return {
        success: true,
        externalMessageId: info.messageId,
      };
    } catch (err: any) {
      console.error('[EmailProvider Error]:', err);
      return {
        success: false,
        error: err.message || 'Erro desconhecido ao enviar email',
      };
    }
  }
}
