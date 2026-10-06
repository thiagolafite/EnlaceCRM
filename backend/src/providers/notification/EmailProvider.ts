import nodemailer from 'nodemailer';
import { config } from '../../config';
import {
  NotificationProvider,
  NotificationOptions,
  NotificationResponse,
} from './NotificationProvider';

export class EmailProvider implements NotificationProvider {
  name = 'EMAIL';

  async sendNotification(message: string, options: NotificationOptions): Promise<NotificationResponse> {
    const to = options.recipientEmail;

    if (!to) {
      return {
        success: false,
        channel: 'EMAIL',
        error: 'E-mail de destino não informado.',
      };
    }

    if (options.simulate) {
      if (config.nodeEnv !== 'production') {
        console.log(`[EmailProvider - SIMULAÇÃO] Para: ${to} | Assunto: ${options.subject || 'Notificação Enlace CRM'}`);
      }
      return {
        success: true,
        channel: 'SIMULATED',
        simulated: true,
      };
    }

    try {
      // Cria transportador para envio de e-mail (usando stream/mock em desenvolvimento caso não haja SMTP configurado)
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || '',
        },
      });

      const subject = options.subject || `🔔 Resumo Diário de Felicitações — ${options.companyName || 'Enlace CRM'}`;
      const html = `<pre style="font-family: sans-serif; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</pre>`;

      const info = await transporter.sendMail({
        from: `"${options.companyName || 'Enlace CRM'}" <${process.env.SMTP_FROM || 'noreply@enlacecrm.com.br'}>`,
        to,
        subject,
        text: message,
        html,
      });

      return {
        success: true,
        channel: 'EMAIL',
        messageId: info.messageId,
      };
    } catch (err: any) {
      return {
        success: false,
        channel: 'EMAIL',
        error: err.message || 'Erro ao enviar e-mail de notificação.',
      };
    }
  }
}
