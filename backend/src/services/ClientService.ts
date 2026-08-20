import { prisma } from '../utils/prisma';

export interface CreateClientDTO {
  name: string;
  document?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  birthDate?: string | Date;
  
  // Endereço
  zipCode?: string;
  address?: string;
  addressNumber?: string;
  addressComplement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;

  status?: 'ACTIVE' | 'INACTIVE';
  lgpdConsent?: boolean;
  notes?: string;
  familyMembers?: Array<{
    name: string;
    relationship: string;
    birthDate: string | Date;
    phone?: string;
    email?: string;
    sameAddressAsClient?: boolean;
    zipCode?: string;
    address?: string;
    addressNumber?: string;
    addressComplement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    notes?: string;
  }>;
}

export class ClientService {
  static async list(params: {
    search?: string;
    status?: string;
    lgpdConsent?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = params.page && params.page > 0 ? Number(params.page) : 1;
    const limit = params.limit && params.limit > 0 ? Number(params.limit) : 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search) {
      const s = params.search.trim();
      where.OR = [
        { name: { contains: s } },
        { document: { contains: s } },
        { email: { contains: s } },
        { phone: { contains: s } },
        { companyName: { contains: s } },
        { city: { contains: s } },
        { neighborhood: { contains: s } },
      ];
    }

    if (params.status) {
      where.status = params.status;
    }

    if (typeof params.lgpdConsent === 'boolean') {
      where.lgpdConsent = params.lgpdConsent;
    }

    const [total, clients] = await Promise.all([
      prisma.client.count({ where }),
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          familyMembers: true,
        },
      }),
    ]);

    return {
      data: clients,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(id: string) {
    const client = await prisma.client.findUnique({
      where: { id },
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
      throw new Error('Cliente não encontrado');
    }

    return client;
  }

  static async create(data: CreateClientDTO) {
    if (!data.name || !data.name.trim()) {
      throw new Error('O nome do cliente é obrigatório');
    }

    const birthDate = data.birthDate ? new Date(data.birthDate) : null;

    const client = await prisma.client.create({
      data: {
        name: data.name.trim(),
        document: data.document?.trim() || null,
        email: data.email?.toLowerCase().trim() || null,
        phone: data.phone?.trim() || null,
        companyName: data.companyName?.trim() || null,
        birthDate,

        zipCode: data.zipCode?.trim() || null,
        address: data.address?.trim() || null,
        addressNumber: data.addressNumber?.trim() || null,
        addressComplement: data.addressComplement?.trim() || null,
        neighborhood: data.neighborhood?.trim() || null,
        city: data.city?.trim() || null,
        state: data.state?.trim() || null,

        status: data.status || 'ACTIVE',
        lgpdConsent: typeof data.lgpdConsent === 'boolean' ? data.lgpdConsent : true,
        notes: data.notes?.trim() || null,
        familyMembers: data.familyMembers?.length
          ? {
              create: data.familyMembers.map((fm) => ({
                name: fm.name.trim(),
                relationship: fm.relationship,
                birthDate: new Date(fm.birthDate),
                phone: fm.phone?.trim() || null,
                email: fm.email?.toLowerCase().trim() || null,
                sameAddressAsClient: fm.sameAddressAsClient || false,
                zipCode: fm.zipCode?.trim() || null,
                address: fm.address?.trim() || null,
                addressNumber: fm.addressNumber?.trim() || null,
                addressComplement: fm.addressComplement?.trim() || null,
                neighborhood: fm.neighborhood?.trim() || null,
                city: fm.city?.trim() || null,
                state: fm.state?.trim() || null,
                notes: fm.notes?.trim() || null,
              })),
            }
          : undefined,
      },
      include: {
        familyMembers: true,
      },
    });

    return client;
  }

  static async update(id: string, data: Partial<CreateClientDTO>) {
    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Cliente não encontrado');
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.document !== undefined) updateData.document = data.document?.trim() || null;
    if (data.email !== undefined) updateData.email = data.email?.toLowerCase().trim() || null;
    if (data.phone !== undefined) updateData.phone = data.phone?.trim() || null;
    if (data.companyName !== undefined) updateData.companyName = data.companyName?.trim() || null;
    if (data.birthDate !== undefined) updateData.birthDate = data.birthDate ? new Date(data.birthDate) : null;

    if (data.zipCode !== undefined) updateData.zipCode = data.zipCode?.trim() || null;
    if (data.address !== undefined) updateData.address = data.address?.trim() || null;
    if (data.addressNumber !== undefined) updateData.addressNumber = data.addressNumber?.trim() || null;
    if (data.addressComplement !== undefined) updateData.addressComplement = data.addressComplement?.trim() || null;
    if (data.neighborhood !== undefined) updateData.neighborhood = data.neighborhood?.trim() || null;
    if (data.city !== undefined) updateData.city = data.city?.trim() || null;
    if (data.state !== undefined) updateData.state = data.state?.trim() || null;

    if (data.status !== undefined) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes?.trim() || null;
    if (typeof data.lgpdConsent === 'boolean') {
      updateData.lgpdConsent = data.lgpdConsent;
      updateData.lgpdConsentDate = new Date();
    }

    const updated = await prisma.client.update({
      where: { id },
      data: updateData,
      include: {
        familyMembers: true,
      },
    });

    return updated;
  }

  static async delete(id: string) {
    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Cliente não encontrado');
    }

    await prisma.client.delete({ where: { id } });
    return { success: true };
  }

  static async toggleLgpdConsent(id: string, consent: boolean) {
    const client = await prisma.client.update({
      where: { id },
      data: {
        lgpdConsent: consent,
        lgpdConsentDate: new Date(),
      },
    });

    return client;
  }

  static async getStats() {
    const [totalClients, activeClients, totalFamilyMembers, optOutCount] = await Promise.all([
      prisma.client.count(),
      prisma.client.count({ where: { status: 'ACTIVE', lgpdConsent: true } }),
      prisma.familyMember.count(),
      prisma.client.count({ where: { lgpdConsent: false } }),
    ]);

    return {
      totalClients,
      activeClients,
      totalFamilyMembers,
      optOutCount,
    };
  }
}
