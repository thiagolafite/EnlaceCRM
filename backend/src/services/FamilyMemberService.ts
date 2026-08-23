import { prisma } from '../utils/prisma';

export interface CreateFamilyMemberDTO {
  clientId: string;
  name: string;
  gender?: 'FEMALE' | 'MALE' | 'OTHER' | 'NOT_SPECIFIED';
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
}

export class FamilyMemberService {
  static async create(data: CreateFamilyMemberDTO) {
    if (!data.clientId) {
      throw new Error('ID do cliente é obrigatório');
    }
    if (!data.name || !data.name.trim()) {
      throw new Error('Nome do familiar é obrigatório');
    }
    if (!data.birthDate) {
      throw new Error('Data de nascimento é obrigatória');
    }

    const client = await prisma.client.findUnique({ where: { id: data.clientId } });
    if (!client) {
      throw new Error('Cliente associado não encontrado');
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
        birthDate: new Date(data.birthDate),
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

  static async update(id: string, data: Partial<CreateFamilyMemberDTO>) {
    const existing = await prisma.familyMember.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Familiar não encontrado');
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.relationship !== undefined) updateData.relationship = data.relationship;
    if (data.birthDate !== undefined) updateData.birthDate = new Date(data.birthDate);
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
      where: { id },
      data: updateData,
    });

    return updated;
  }

  static async delete(id: string) {
    const existing = await prisma.familyMember.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Familiar não encontrado');
    }

    await prisma.familyMember.delete({ where: { id } });
    return { success: true };
  }

  static async listByClient(clientId: string) {
    return prisma.familyMember.findMany({
      where: { clientId },
      orderBy: { name: 'asc' },
    });
  }
}
