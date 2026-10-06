import { prisma } from '../utils/prisma';
import { scopeByCompany, AuthenticatedUserContext } from '../utils/tenant';
import { AppError } from '../utils/AppError';

export interface CreateFamilyMemberDTO {
  clientId: string;
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
}

export class FamilyMemberService {
  static async create(data: CreateFamilyMemberDTO, currentUser?: AuthenticatedUserContext | null) {
    if (!data.clientId) {
      throw new AppError('ID do cliente é obrigatório', 400);
    }
    if (!data.name || !data.name.trim()) {
      throw new AppError('Nome do familiar é obrigatório', 400);
    }
    if (!data.birthDate) {
      throw new AppError('Data de nascimento é obrigatória', 400);
    }

    const companyScope = scopeByCompany(currentUser);
    const client = await prisma.client.findFirst({
      where: {
        id: data.clientId,
        ...companyScope,
      },
    });

    if (!client) {
      throw new AppError('Cliente associado não encontrado', 404);
    }

    // Se marcado como "mesmo endereço do cliente", copia dados do cliente se os campos estiverem vazios
    let zipCode = data.zipCode?.trim() || null;
    let address = data.address?.trim() || null;
    let addressNumber = data.addressNumber?.trim() || null;
    let addressComplement = data.addressComplement?.trim() || null;
    let neighborhood = data.neighborhood?.trim() || null;
    let city = data.city?.trim() || null;
    let state = data.state?.trim() || null;

    if (data.sameAddressAsClient) {
      zipCode = client.zipCode || zipCode;
      address = client.address || address;
      addressNumber = client.addressNumber || addressNumber;
      addressComplement = client.addressComplement || addressComplement;
      neighborhood = client.neighborhood || neighborhood;
      city = client.city || city;
      state = client.state || state;
    }

    const member = await prisma.familyMember.create({
      data: {
        clientId: data.clientId,
        name: data.name.trim(),
        gender: data.gender || 'NOT_SPECIFIED',
        relationship: data.relationship || 'OTHER',
        birthDate: data.birthDate,
        phone: data.phone?.trim() || null,
        email: data.email?.toLowerCase().trim() || null,
        sameAddressAsClient: data.sameAddressAsClient || false,
        zipCode,
        address,
        addressNumber,
        addressComplement,
        neighborhood,
        city,
        state,
        notes: data.notes?.trim() || null,
      },
    });

    return member;
  }

  static async update(id: string, data: Partial<CreateFamilyMemberDTO>, currentUser?: AuthenticatedUserContext | null) {
    const companyScope = scopeByCompany(currentUser);
    const existing = await prisma.familyMember.findFirst({
      where: {
        id,
        client: companyScope,
      },
    });

    if (!existing) {
      throw new AppError('Familiar não encontrado', 404);
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.relationship !== undefined) updateData.relationship = data.relationship;
    if (data.birthDate !== undefined) updateData.birthDate = data.birthDate;
    if (data.phone !== undefined) updateData.phone = data.phone?.trim() || null;
    if (data.email !== undefined) updateData.email = data.email?.toLowerCase().trim() || null;

    if (data.sameAddressAsClient !== undefined) updateData.sameAddressAsClient = data.sameAddressAsClient;
    if (data.zipCode !== undefined) updateData.zipCode = data.zipCode?.trim() || null;
    if (data.address !== undefined) updateData.address = data.address?.trim() || null;
    if (data.addressNumber !== undefined) updateData.addressNumber = data.addressNumber?.trim() || null;
    if (data.addressComplement !== undefined) updateData.addressComplement = data.addressComplement?.trim() || null;
    if (data.neighborhood !== undefined) updateData.neighborhood = data.neighborhood?.trim() || null;
    if (data.city !== undefined) updateData.city = data.city?.trim() || null;
    if (data.state !== undefined) updateData.state = data.state?.trim() || null;

    if (data.notes !== undefined) updateData.notes = data.notes?.trim() || null;

    const updated = await prisma.familyMember.update({
      where: { id: existing.id },
      data: updateData,
    });

    return updated;
  }

  static async delete(id: string, currentUser?: AuthenticatedUserContext | null) {
    const companyScope = scopeByCompany(currentUser);
    const existing = await prisma.familyMember.findFirst({
      where: {
        id,
        client: companyScope,
      },
    });

    if (!existing) {
      throw new AppError('Familiar não encontrado', 404);
    }

    await prisma.familyMember.delete({ where: { id: existing.id } });
    return { success: true };
  }

  static async listByClient(clientId: string, currentUser?: AuthenticatedUserContext | null) {
    const companyScope = scopeByCompany(currentUser);
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        ...companyScope,
      },
    });

    if (!client) {
      throw new AppError('Cliente associado não encontrado', 404);
    }

    return prisma.familyMember.findMany({
      where: { clientId: client.id },
      orderBy: { name: 'asc' },
    });
  }
}
