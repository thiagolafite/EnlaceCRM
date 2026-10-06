import { prisma } from '../utils/prisma';
import { scopeByCompany, AuthenticatedUserContext } from '../utils/tenant';
import { AppError } from '../utils/AppError';
import { maskDocument } from '../utils/maskDocument';

export interface CreateClientDTO {
  name: string;
  document?: string | null;
  email?: string | null;
  phone?: string | null;
  companyName?: string | null;
  birthDate?: Date | null;
  
  // Endereço
  zipCode?: string | null;
  address?: string | null;
  addressNumber?: string | null;
  addressComplement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;

  status?: 'ACTIVE' | 'INACTIVE';
  gender?: 'FEMALE' | 'MALE' | 'OTHER' | 'NOT_SPECIFIED';
  isMother?: boolean;
  isFather?: boolean;
  profession?: string | null;

  // Governança LGPD
  lgpdConsent?: boolean;
  consentSource?: string | null;
  consentNote?: string | null;
  notes?: string | null;

  familyMembers?: Array<{
    name: string;
    gender?: 'FEMALE' | 'MALE' | 'OTHER' | 'NOT_SPECIFIED';
    relationship: string;
    birthDate: Date;
    phone?: string | null;
    email?: string | null;
    consentHolderConfirmed?: boolean;
    allowMinorNotifications?: boolean;
    sameAddressAsClient?: boolean;
    zipCode?: string | null;
    address?: string | null;
    addressNumber?: string | null;
    addressComplement?: string | null;
    neighborhood?: string | null;
    city?: string | null;
    state?: string | null;
    notes?: string | null;
  }>;
}

export class ClientService {
  static async list(
    params: {
      search?: string;
      status?: string;
      lgpdConsent?: boolean;
      optOut?: boolean;
      page?: number;
      limit?: number;
    },
    currentUser?: AuthenticatedUserContext | null
  ) {
    const page = params.page && params.page > 0 ? Number(params.page) : 1;
    const limit = params.limit && params.limit > 0 ? Math.min(Number(params.limit), 100) : 20;
    const skip = (page - 1) * limit;

    const companyScope = scopeByCompany(currentUser);
    const where: any = {
      ...companyScope,
    };

    if (params.search) {
      const s = params.search.trim();
      where.OR = [
        { name: { contains: s, mode: 'insensitive' } },
        { document: { contains: s } },
        { email: { contains: s, mode: 'insensitive' } },
        { phone: { contains: s } },
        { companyName: { contains: s, mode: 'insensitive' } },
        { city: { contains: s, mode: 'insensitive' } },
        { neighborhood: { contains: s, mode: 'insensitive' } },
      ];
    }

    if (params.status) {
      where.status = params.status;
    }

    if (typeof params.lgpdConsent === 'boolean') {
      where.lgpdConsent = params.lgpdConsent;
    }

    if (typeof params.optOut === 'boolean') {
      where.optOutAt = params.optOut ? { not: null } : null;
    }

    const [total, clients] = await Promise.all([
      prisma.client.count({ where }),
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          familyMembers: {
            orderBy: { name: 'asc' },
          },
        },
      }),
    ]);

    // Aplica mascaramento de CPF/CNPJ na listagem geral para conformidade LGPD
    const sanitizedClients = clients.map((c) => ({
      ...c,
      maskedDocument: maskDocument(c.document),
    }));

    return {
      data: sanitizedClients,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(id: string, currentUser?: AuthenticatedUserContext | null) {
    const companyScope = scopeByCompany(currentUser);
    const client = await prisma.client.findFirst({
      where: {
        id,
        ...companyScope,
      },
      include: {
        familyMembers: {
          orderBy: { name: 'asc' },
        },
        alerts: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!client) {
      throw new AppError('Cliente não encontrado', 404);
    }

    return {
      ...client,
      maskedDocument: maskDocument(client.document),
    };
  }

  static async create(data: CreateClientDTO, currentUser?: AuthenticatedUserContext | null) {
    const companyScope = scopeByCompany(currentUser);
    
    // Verificar limite do plano da empresa
    const company = await prisma.company.findUnique({
      where: { id: companyScope.companyId },
      include: {
        _count: {
          select: { clients: true },
        },
      },
    });

    if (company && company._count.clients >= company.maxClients) {
      throw new AppError(
        `Limite de clientes do seu plano (${company.maxClients}) atingido. Atualize seu plano para cadastrar mais clientes.`,
        400,
        'Entre em contato com o suporte ou faça upgrade do seu plano para aumentar o limite de clientes.'
      );
    }

    const consentGiven = typeof data.lgpdConsent === 'boolean' ? data.lgpdConsent : false;

    const client = await prisma.client.create({
      data: {
        name: data.name.trim(),
        document: data.document || null,
        email: data.email || null,
        phone: data.phone || null,
        companyName: data.companyName || null,
        birthDate: data.birthDate || null,

        zipCode: data.zipCode || null,
        address: data.address || null,
        addressNumber: data.addressNumber || null,
        addressComplement: data.addressComplement || null,
        neighborhood: data.neighborhood || null,
        city: data.city || null,
        state: data.state || null,

        status: data.status || 'ACTIVE',
        companyId: companyScope.companyId,
        gender: data.gender || 'NOT_SPECIFIED',
        isMother: Boolean(data.isMother),
        isFather: Boolean(data.isFather),
        profession: data.profession || null,

        // Governança LGPD
        lgpdConsent: consentGiven,
        consentSource: data.consentSource || 'MANUAL',
        consentNote: data.consentNote || null,
        consentUpdatedAt: new Date(),
        consentUpdatedBy: currentUser?.email || 'SYSTEM',
        lgpdConsentDate: new Date(),

        notes: data.notes || null,
        familyMembers: data.familyMembers?.length
          ? {
              create: data.familyMembers.map((fm) => ({
                name: fm.name.trim(),
                gender: fm.gender || 'NOT_SPECIFIED',
                relationship: fm.relationship,
                birthDate: fm.birthDate,
                phone: fm.phone || null,
                email: fm.email || null,
                consentHolderConfirmed: Boolean(fm.consentHolderConfirmed),
                allowMinorNotifications: Boolean(fm.allowMinorNotifications),
                sameAddressAsClient: fm.sameAddressAsClient || false,
                zipCode: fm.zipCode || null,
                address: fm.address || null,
                addressNumber: fm.addressNumber || null,
                addressComplement: fm.addressComplement || null,
                neighborhood: fm.neighborhood || null,
                city: fm.city || null,
                state: fm.state || null,
                notes: fm.notes || null,
              })),
            }
          : undefined,
      },
      include: {
        familyMembers: true,
      },
    });

    return {
      ...client,
      maskedDocument: maskDocument(client.document),
    };
  }

  static async update(id: string, data: Partial<CreateClientDTO>, currentUser?: AuthenticatedUserContext | null) {
    const companyScope = scopeByCompany(currentUser);
    const existing = await prisma.client.findFirst({
      where: {
        id,
        ...companyScope,
      },
    });

    if (!existing) {
      throw new AppError('Cliente não encontrado', 404);
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.document !== undefined) updateData.document = data.document;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.companyName !== undefined) updateData.companyName = data.companyName;
    if (data.birthDate !== undefined) updateData.birthDate = data.birthDate;

    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.isMother !== undefined) updateData.isMother = Boolean(data.isMother);
    if (data.isFather !== undefined) updateData.isFather = Boolean(data.isFather);
    if (data.profession !== undefined) updateData.profession = data.profession;

    if (data.zipCode !== undefined) updateData.zipCode = data.zipCode;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.addressNumber !== undefined) updateData.addressNumber = data.addressNumber;
    if (data.addressComplement !== undefined) updateData.addressComplement = data.addressComplement;
    if (data.neighborhood !== undefined) updateData.neighborhood = data.neighborhood;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.state !== undefined) updateData.state = data.state;

    if (data.status !== undefined) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;

    if (typeof data.lgpdConsent === 'boolean') {
      updateData.lgpdConsent = data.lgpdConsent;
      updateData.consentSource = data.consentSource || existing.consentSource || 'MANUAL';
      updateData.consentNote = data.consentNote !== undefined ? data.consentNote : existing.consentNote;
      updateData.consentUpdatedAt = new Date();
      updateData.consentUpdatedBy = currentUser?.email || 'SYSTEM';
      updateData.lgpdConsentDate = new Date();
    }

    const updated = await prisma.client.update({
      where: { id: existing.id },
      data: updateData,
      include: {
        familyMembers: true,
      },
    });

    return {
      ...updated,
      maskedDocument: maskDocument(updated.document),
    };
  }

  static async delete(id: string, currentUser?: AuthenticatedUserContext | null) {
    const companyScope = scopeByCompany(currentUser);
    const existing = await prisma.client.findFirst({
      where: {
        id,
        ...companyScope,
      },
    });

    if (!existing) {
      throw new AppError('Cliente não encontrado', 404);
    }

    await prisma.client.delete({ where: { id: existing.id } });
    return { success: true };
  }

  /**
   * Registro de Opt-Out (Revogação de Consentimento)
   */
  static async optOut(id: string, currentUser?: AuthenticatedUserContext | null) {
    const companyScope = scopeByCompany(currentUser);
    const existing = await prisma.client.findFirst({
      where: {
        id,
        ...companyScope,
      },
    });

    if (!existing) {
      throw new AppError('Cliente não encontrado', 404);
    }

    const now = new Date();

    // Registra opt-out no titular e em seus familiares
    const [updatedClient] = await prisma.$transaction([
      prisma.client.update({
        where: { id: existing.id },
        data: {
          optOutAt: now,
          lgpdConsent: false,
          consentUpdatedAt: now,
          consentUpdatedBy: currentUser?.email || 'SYSTEM',
        },
      }),
      prisma.familyMember.updateMany({
        where: { clientId: existing.id },
        data: {
          optOutAt: now,
        },
      }),
    ]);

    return {
      success: true,
      message: 'Opt-out registrado com sucesso. O cliente e seus familiares foram excluídos das automações.',
      client: updatedClient,
    };
  }

  /**
   * Registro de Reativação / Opt-In
   */
  static async optIn(
    id: string,
    consentSource: string = 'MANUAL',
    consentNote?: string,
    currentUser?: AuthenticatedUserContext | null
  ) {
    const companyScope = scopeByCompany(currentUser);
    const existing = await prisma.client.findFirst({
      where: {
        id,
        ...companyScope,
      },
    });

    if (!existing) {
      throw new AppError('Cliente não encontrado', 404);
    }

    const now = new Date();

    const updatedClient = await prisma.client.update({
      where: { id: existing.id },
      data: {
        optOutAt: null,
        lgpdConsent: true,
        consentSource,
        consentNote: consentNote || null,
        consentUpdatedAt: now,
        consentUpdatedBy: currentUser?.email || 'SYSTEM',
        lgpdConsentDate: now,
      },
    });

    return {
      success: true,
      message: 'Consentimento registrado e opt-in reativado com sucesso.',
      client: updatedClient,
    };
  }

  /**
   * LGPD Art. 18 — Portabilidade / Exportação de Dados do Titular
   */
  static async exportData(id: string, currentUser?: AuthenticatedUserContext | null) {
    const companyScope = scopeByCompany(currentUser);
    const client = await prisma.client.findFirst({
      where: {
        id,
        ...companyScope,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            tradeName: true,
          },
        },
        familyMembers: true,
        alerts: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!client) {
      throw new AppError('Cliente não encontrado', 404);
    }

    return {
      title: 'Relatório de Portabilidade de Dados Pessoais — LGPD (Art. 18, V)',
      exportedAt: new Date().toISOString(),
      controller: {
        companyId: client.company.id,
        companyName: client.company.tradeName || client.company.name,
      },
      personalData: {
        id: client.id,
        name: client.name,
        document: client.document,
        email: client.email,
        phone: client.phone,
        birthDate: client.birthDate ? client.birthDate.toISOString().split('T')[0] : null,
        gender: client.gender,
        profession: client.profession,
        isMother: client.isMother,
        isFather: client.isFather,
        address: {
          zipCode: client.zipCode,
          street: client.address,
          number: client.addressNumber,
          complement: client.addressComplement,
          neighborhood: client.neighborhood,
          city: client.city,
          state: client.state,
        },
        governance: {
          status: client.status,
          lgpdConsent: client.lgpdConsent,
          consentSource: client.consentSource,
          consentNote: client.consentNote,
          consentUpdatedAt: client.consentUpdatedAt,
          consentUpdatedBy: client.consentUpdatedBy,
          optOutAt: client.optOutAt,
          registeredAt: client.createdAt,
        },
      },
      familyMembers: client.familyMembers.map((fm) => ({
        id: fm.id,
        name: fm.name,
        relationship: fm.relationship,
        gender: fm.gender,
        birthDate: fm.birthDate.toISOString().split('T')[0],
        phone: fm.phone,
        email: fm.email,
        consentHolderConfirmed: fm.consentHolderConfirmed,
        allowMinorNotifications: fm.allowMinorNotifications,
        optOutAt: fm.optOutAt,
      })),
      communicationHistory: client.alerts.map((a) => ({
        id: a.id,
        eventType: a.eventType,
        context: a.contextDescription,
        notificationStatus: a.notificationStatus,
        notificationChannel: a.notificationChannel,
        date: a.alertDate,
      })),
    };
  }

  /**
   * LGPD Art. 18, VI — Anonimização / Direito ao Esquecimento
   */
  static async anonymize(id: string, currentUser?: AuthenticatedUserContext | null) {
    const companyScope = scopeByCompany(currentUser);
    const existing = await prisma.client.findFirst({
      where: {
        id,
        ...companyScope,
      },
      include: {
        familyMembers: true,
      },
    });

    if (!existing) {
      throw new AppError('Cliente não encontrado', 404);
    }

    const anonymizedId = existing.id.slice(0, 8);
    const now = new Date();

    // 1. Anonimizar o cliente
    await prisma.client.update({
      where: { id: existing.id },
      data: {
        name: `TITULAR_ANONIMIZADO_${anonymizedId}`,
        document: null,
        email: null,
        phone: null,
        companyName: null,
        birthDate: null,
        zipCode: null,
        address: null,
        addressNumber: null,
        addressComplement: null,
        neighborhood: null,
        city: null,
        state: null,
        notes: null,
        status: 'INACTIVE',
        lgpdConsent: false,
        optOutAt: now,
        consentNote: 'Dados pessoais anonimizados em conformidade com o Direito ao Esquecimento (LGPD Art. 18, VI).',
        consentUpdatedAt: now,
        consentUpdatedBy: currentUser?.email || 'SYSTEM',
      },
    });

    // 2. Anonimizar familiares associados
    if (existing.familyMembers.length > 0) {
      for (const fm of existing.familyMembers) {
        await prisma.familyMember.update({
          where: { id: fm.id },
          data: {
            name: `FAMILIAR_ANONIMIZADO_${fm.id.slice(0, 8)}`,
            phone: null,
            email: null,
            address: null,
            addressNumber: null,
            addressComplement: null,
            neighborhood: null,
            city: null,
            state: null,
            zipCode: null,
            notes: null,
            optOutAt: now,
          },
        });
      }
    }

    // 3. Auditoria SOC sem dados pessoais
    await prisma.systemLog.create({
      data: {
        level: 'SECURITY',
        category: 'SYSTEM',
        action: 'LGPD_DATA_ANONYMIZED',
        message: `Solicitação de anonimização (Direito ao Esquecimento) executada para o ID de cliente: ${existing.id}.`,
        details: JSON.stringify({
          clientId: existing.id,
          familyMembersCount: existing.familyMembers.length,
          timestamp: now.toISOString(),
        }),
        companyId: companyScope.companyId,
        userId: currentUser?.id || null,
        userEmail: currentUser?.email || null,
      },
    });

    return {
      success: true,
      message: 'Dados pessoais anonimizados com sucesso. Nenhum dado de identificação foi mantido.',
    };
  }

  static async getStats(currentUser?: AuthenticatedUserContext | null) {
    const companyScope = scopeByCompany(currentUser);

    const [totalClients, activeClients, totalFamilyMembers, optOutCount] = await Promise.all([
      prisma.client.count({ where: companyScope }),
      prisma.client.count({ where: { ...companyScope, status: 'ACTIVE', lgpdConsent: true, optOutAt: null } }),
      prisma.familyMember.count({
        where: { client: companyScope },
      }),
      prisma.client.count({
        where: {
          ...companyScope,
          OR: [{ lgpdConsent: false }, { optOutAt: { not: null } }],
        },
      }),
    ]);

    return {
      totalClients,
      activeClients,
      totalFamilyMembers,
      optOutCount,
    };
  }
}

