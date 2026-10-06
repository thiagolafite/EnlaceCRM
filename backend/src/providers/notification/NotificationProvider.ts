export interface NotificationOptions {
  recipientPhone?: string;
  recipientEmail?: string;
  apiKey?: string;
  instanceId?: string;
  subject?: string;
  companyName?: string;
  companyId?: string;
  simulate?: boolean;
}

export interface NotificationResponse {
  success: boolean;
  channel: 'CALLMEBOT' | 'ULTRAMSG' | 'EMAIL' | 'SIMULATED';
  messageId?: string;
  error?: string;
  simulated?: boolean;
}

export interface NotificationProvider {
  name: string;
  sendNotification(message: string, options: NotificationOptions): Promise<NotificationResponse>;
}
