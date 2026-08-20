import { prisma } from '../utils/prisma';
import { CallMeBotProvider } from '../providers/notification/CallMeBotProvider';

export interface UpdateSettingsDTO {
  companyName?: string;
  tradeName?: string;
  document?: string;
  contactEmail?: string;
  contactPhone?: string;

  ownerWhatsappPhone?: string;
  callmebotApiKey?: string;
  callmebotEnabled?: boolean;
  callmebotSimulateMode?: boolean;

  schedulerHour?: number;
  schedulerMinute?: number;
  schedulerEnabled?: boolean;
}

export class SettingsService {
  static async getSettings() {
    let settings = await prisma.companySettings.findFirst();
    if (!settings) {
      settings = await prisma.companySettings.create({
        data: {
          id: 'default_company',
          companyName: 'Enlace Soluções Corporativas',
          tradeName: 'Enlace CRM',
          ownerWhatsappPhone: '+5571981805744',
          callmebotApiKey: '',
          callmebotEnabled: true,
          callmebotSimulateMode: true,
        },
      });
    }
    return settings;
  }

  static async updateSettings(data: UpdateSettingsDTO) {
    let settings = await prisma.companySettings.findFirst();
    const id = settings ? settings.id : 'default_company';

    return prisma.companySettings.upsert({
      where: { id },
      update: data,
      create: {
        id,
        ...data,
      },
    });
  }

  static async testCallMeBot(phone: string, apiKey: string) {
    if (!phone) {
      throw new Error('Informe o número de WhatsApp do destinatário.');
    }
    if (!apiKey) {
      throw new Error('Informe a API Key do CallMeBot.');
    }
    return CallMeBotProvider.sendTestNotification(phone, apiKey);
  }
}
