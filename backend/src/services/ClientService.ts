import { prisma } from '../utils/prisma';
import { scopeByCompany, AuthenticatedUserContext } from '../utils/tenant';
import { AppError } from '../utils/AppError';

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

  lgpdConsent?: boolean;
  notes?: string | null;
  familyMembers?: Array<{
    name: string;
    gender?: 'FEMALE' | 'MALE' | 'OTHER' | 'NOT_SPECIFIED';
    relationship: string;
    birthDate: Date;
    phone?: string | null;
    email?: string | null;
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

    return client;
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
        400
      );
    }

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
        lgpdConsent: typeof data.lgpdConsent === 'boolean' ? data.lgpdConsent : true,
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

    return client;
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
      updateData.lgpdConsentDate = new Date();
    }

    const updated = await prisma.client.update({
      where: { id: existing.id },
      data: updateData,
      include: {
        familyMembers: true,
      },
    });

    return updated;
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

  static async toggleLgpdConsent(id: string, consent: boolean, currentUser?: AuthenticatedUserContext | null) {
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

    const client = await prisma.client.update({
      where: { id: existing.id },
      data: {
        lgpdConsent: consent,
        lgpdConsentDate: new Date(),
      },
    });

    return client;
  }

  static async getStats(currentUser?: AuthenticatedUserContext | null) {
    const companyScope = scopeByCompany(currentUser);

    const [totalClients, activeClients, totalFamilyMembers, optOutCount] = await Promise.all([
      prisma.client.count({ where: companyScope }),
      prisma.client.count({ where: { ...companyScope, status: 'ACTIVE', lgpdConsent: true } }),
      prisma.familyMember.count({
        where: { client: companyScope },
      }),
      prisma.client.count({ where: { ...companyScope, lgpdConsent: false } }),
    ]);

    return {
      totalClients,
      activeClients,
      totalFamilyMembers,
      optOutCount,
    };
  }
}
