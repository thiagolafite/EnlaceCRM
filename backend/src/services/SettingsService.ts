import { prisma } from '../utils/prisma';
import { CallMeBotProvider } from '../providers/notification/CallMeBotProvider';
import { scopeByCompany, AuthenticatedUserContext } from '../utils/tenant';
import { AppError } from '../utils/AppError';
import { encrypt, decrypt } from '../utils/crypto';

export interface UpdateSettingsDTO {
  companyName?: string;
  tradeName?: string;
  document?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;

  ownerWhatsappPhone?: string | null;
  callmebotApiKey?: string;
  callmebotEnabled?: boolean;
  callmebotSimulateMode?: boolean;

  schedulerHour?: number;
  schedulerMinute?: number;
  schedulerEnabled?: boolean;
}

export class SettingsService {
  static async getSettings(currentUser?: AuthenticatedUserContext | null) {
    const companyScope = scopeByCompany(currentUser);
    
    let company = await prisma.company.findUnique({
      where: { id: companyScope.companyId },
      include: { settings: true },
    });

    if (!company) {
      throw new AppError('Empresa não encontrada', 404);
    }

    let settings = company.settings;
    if (!settings) {
      settings = await prisma.companySettings.create({
        data: {
          companyId: company.id,
          ownerWhatsappPhone: '',
          callmebotApiKey: '',
          callmebotEnabled: true,
          callmebotSimulateMode: false,
          schedulerHour: 6,
          schedulerMinute: 0,
          schedulerEnabled: true,
        },
      });
    }

    const hasKey = Boolean(
      (settings.callmebotApiKey && settings.callmebotApiKeyIv) ||
      (settings.callmebotApiKey && settings.callmebotApiKey.trim().length > 0)
    );

    return {
      id: settings.id,
      companyId: company.id,
      companyName: company.name,
      tradeName: company.tradeName || '',
      document: company.document || '',
      ownerWhatsappPhone: settings.ownerWhatsappPhone || '',
      hasCallmebotApiKey: hasKey,
      callmebotApiKey: hasKey ? '••••••••' : '',
      callmebotEnabled: settings.callmebotEnabled,
      callmebotSimulateMode: settings.callmebotSimulateMode,
      schedulerHour: settings.schedulerHour,
      schedulerMinute: settings.schedulerMinute,
      schedulerEnabled: settings.schedulerEnabled,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    };
  }

  static async updateSettings(data: UpdateSettingsDTO, currentUser?: AuthenticatedUserContext | null) {
    const companyScope = scopeByCompany(currentUser);

    // 1. Atualizar dados cadastrais da Empresa (Company)
    const companyUpdateData: any = {};
    if (data.companyName !== undefined) companyUpdateData.name = data.companyName.trim();
    if (data.tradeName !== undefined) companyUpdateData.tradeName = data.tradeName?.trim() || '';
    if (data.document !== undefined) companyUpdateData.document = data.document?.trim() || '';

    if (Object.keys(companyUpdateData).length > 0) {
      await prisma.company.update({
        where: { id: companyScope.companyId },
        data: companyUpdateData,
      });
    }

    // 2. Preparar dados para CompanySettings
    const settingsUpdateData: any = {};
    if (data.ownerWhatsappPhone !== undefined) {
      settingsUpdateData.ownerWhatsappPhone = data.ownerWhatsappPhone || '';
    }
    if (data.callmebotEnabled !== undefined) {
      settingsUpdateData.callmebotEnabled = data.callmebotEnabled;
    }
    if (data.callmebotSimulateMode !== undefined) {
      settingsUpdateData.callmebotSimulateMode = data.callmebotSimulateMode;
    }
    if (data.schedulerHour !== undefined) {
      settingsUpdateData.schedulerHour = data.schedulerHour;
    }
    if (data.schedulerMinute !== undefined) {
      settingsUpdateData.schedulerMinute = data.schedulerMinute;
    }
    if (data.schedulerEnabled !== undefined) {
      settingsUpdateData.schedulerEnabled = data.schedulerEnabled;
    }

    // Criptografia em repouso da API Key com AES-256-GCM
    if (data.callmebotApiKey !== undefined && data.callmebotApiKey.trim() !== '' && data.callmebotApiKey !== '••••••••') {
      const { encrypted, iv, tag } = encrypt(data.callmebotApiKey.trim());
      settingsUpdateData.callmebotApiKey = encrypted;
      settingsUpdateData.callmebotApiKeyIv = iv;
      settingsUpdateData.callmebotApiKeyTag = tag;
    }

    await prisma.companySettings.upsert({
      where: { companyId: companyScope.companyId },
      update: settingsUpdateData,
      create: {
        companyId: companyScope.companyId,
        ownerWhatsappPhone: settingsUpdateData.ownerWhatsappPhone || '',
        callmebotApiKey: settingsUpdateData.callmebotApiKey || '',
        callmebotApiKeyIv: settingsUpdateData.callmebotApiKeyIv || null,
        callmebotApiKeyTag: settingsUpdateData.callmebotApiKeyTag || null,
        callmebotEnabled: settingsUpdateData.callmebotEnabled ?? true,
        callmebotSimulateMode: settingsUpdateData.callmebotSimulateMode ?? false,
        schedulerHour: settingsUpdateData.schedulerHour ?? 6,
        schedulerMinute: settingsUpdateData.schedulerMinute ?? 0,
        schedulerEnabled: settingsUpdateData.schedulerEnabled ?? true,
      },
    });

    return this.getSettings(currentUser);
  }

  static async testCallMeBot(phone?: string, apiKey?: string, currentUser?: AuthenticatedUserContext | null) {
    const companyScope = scopeByCompany(currentUser);
    const settings = await prisma.companySettings.findUnique({
      where: { companyId: companyScope.companyId },
    });

    let targetPhone = phone;
    if (!targetPhone) {
      targetPhone = settings?.ownerWhatsappPhone || '';
    }

    if (!targetPhone) {
      throw new AppError('Informe o número de WhatsApp do destinatário.', 400);
    }

    let targetApiKey = apiKey;
    if (!targetApiKey || targetApiKey === '••••••••') {
      if (settings?.callmebotApiKey && settings.callmebotApiKeyIv && settings.callmebotApiKeyTag) {
        targetApiKey = decrypt(settings.callmebotApiKey, settings.callmebotApiKeyIv, settings.callmebotApiKeyTag);
      } else if (settings?.callmebotApiKey) {
        targetApiKey = settings.callmebotApiKey;
      }
    }

    if (!targetApiKey) {
      throw new AppError('Informe ou configure a API Key do CallMeBot.', 400);
    }

    return CallMeBotProvider.sendTestNotification(targetPhone, targetApiKey);
  }
}
