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

  static async sendPasswordResetEmail(to: string, userName: string, resetUrl: string): Promise<{ success: boolean; error?: string }> {
    const subject = 'Recuperação de Senha — Enlace CRM';
    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Recuperação de Senha — Enlace CRM</title>
</head>
<body style="margin: 0; padding: 32px 16px; background-color: #F4F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18191D;">
  <div style="max-width: 520px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E2E2E8; padding: 36px 32px; box-shadow: 0 4px 16px rgba(0,0,0,0.04);">
    <div style="text-align: center; margin-bottom: 28px;">
      <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; border-radius: 12px; background-color: #18191D; color: #FFFFFF; font-weight: bold; font-size: 20px; text-align: center;">
        E
      </div>
      <h1 style="margin: 12px 0 4px 0; font-size: 20px; font-weight: 700; color: #18191D; letter-spacing: -0.02em;">Enlace CRM</h1>
      <p style="margin: 0; font-size: 11px; color: #686971; font-family: monospace; text-transform: uppercase; letter-spacing: 0.1em;">Redefinição de Senha</p>
    </div>

    <div style="font-size: 14px; line-height: 1.6; color: #33343A;">
      <p>Olá, <strong>${userName || 'Usuário'}</strong>,</p>
      <p>Recebemos uma solicitação para redefinir a senha de acesso da sua conta associada ao e-mail <strong>${to}</strong> no Enlace CRM.</p>
      <p>Para definir uma nova senha, clique no botão seguro abaixo:</p>
      
      <div style="text-align: center; margin: 28px 0;">
        <a href="${resetUrl}" target="_blank" style="display: inline-block; background-color: #18191D; color: #FFFFFF; padding: 13px 28px; font-size: 13px; font-weight: 600; text-decoration: none; border-radius: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.15);">
          Redefinir Minha Senha &rarr;
        </a>
      </div>

      <p style="font-size: 12px; color: #686971; line-height: 1.5;">
        Se o botão não funcionar, copie e cole o link a seguir no seu navegador:<br>
        <a href="${resetUrl}" style="color: #E54833; word-break: break-all; font-family: monospace; font-size: 11px;">${resetUrl}</a>
      </p>

      <div style="margin-top: 24px; padding: 12px 16px; background-color: #EEEEF1; border-radius: 8px; font-size: 12px; color: #686971;">
        ⏱ <strong>Atenção:</strong> Por motivos de segurança, este link é válido por <strong>60 minutos</strong> e expira automaticamente após o primeiro uso.
      </div>

      <p style="font-size: 12px; color: #8F9098; margin-top: 24px;">
        Se você não fez essa solicitação, pode ignorar este e-mail com segurança. Sua senha atual permanecerá inalterada.
      </p>
    </div>

    <div style="border-top: 1px solid #E2E2E8; margin-top: 28px; padding-top: 20px; text-align: center; font-size: 11px; color: #8F9098; font-family: monospace;">
      Enlace CRM • Segurança & Proteção de Dados
    </div>
  </div>
</body>
</html>
    `;
    const text = `Olá, ${userName || 'Usuário'}!\n\nRecebemos uma solicitação para redefinir a senha da sua conta no Enlace CRM.\n\nPara redefinir sua senha, acesse o link abaixo (válido por 60 minutos):\n${resetUrl}\n\nSe você não solicitou a alteração, ignore este e-mail.\n\nEnlace CRM`;

    const hasSmtp = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);
    if (!hasSmtp) {
      console.log(`[EmailProvider - RESET SENHA SIMULADO/DEV] Destinatário: ${to} | Link: ${resetUrl}`);
      return { success: true };
    }

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS || '',
        },
      });

      await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'Enlace CRM'}" <${process.env.SMTP_FROM || 'noreply@enlacecrm.com.br'}>`,
        to,
        subject,
        text,
        html,
      });

      return { success: true };
    } catch (err: any) {
      console.error('[EmailProvider] Erro ao enviar e-mail de recuperação:', err.message);
      console.log(`[EmailProvider - LINK DE RECUPERAÇÃO DE EMERGÊNCIA]: ${resetUrl}`);
      return { success: false, error: err.message };
    }
  }
}

