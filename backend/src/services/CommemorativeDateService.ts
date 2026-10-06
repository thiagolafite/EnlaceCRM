import { prisma } from '../utils/prisma';
import { RELATIONSHIP_LABELS, calculateAge, getDayAndMonth } from '../utils/dateUtils';
import { scopeByCompany, AuthenticatedUserContext } from '../utils/tenant';
import { AppError } from '../utils/AppError';

export interface CreateCommemorativeDateDTO {
  name: string;
  day: number;
  month: number;
  year?: number | null;
  description?: string | null;
  category?: 'FIXED' | 'CULTURAL' | 'CORPORATE';
  targetAudience?: 'ALL_CLIENTS' | 'MOTHERS_ONLY' | 'FATHERS_ONLY' | 'CUSTOM';
  active?: boolean;
  isGlobal?: boolean;
}

export class CommemorativeDateService {
  static async list(currentUser?: AuthenticatedUserContext | null) {
    const where: any = {};

    if (currentUser?.role === 'MASTER') {
      // MASTER vê datas globais e de todas as empresas
    } else if (currentUser?.companyId) {
      where.OR = [
        { companyId: null },
        { companyId: currentUser.companyId },
      ];
    } else {
      where.companyId = null;
    }

    return prisma.commemorativeDate.findMany({
      where,
      orderBy: [{ month: 'asc' }, { day: 'asc' }],
      include: {
        _count: {
          select: { templates: true, alerts: true },
        },
      },
    });
  }

  static async create(data: CreateCommemorativeDateDTO, currentUser?: AuthenticatedUserContext | null) {
    if (!data.name || !data.name.trim()) {
      throw new AppError('Nome da data comemorativa é obrigatório', 400);
    }
    if (!data.day || data.day < 1 || data.day > 31) {
      throw new AppError('Dia inválido (1-31)', 400);
    }
    if (!data.month || data.month < 1 || data.month > 12) {
      throw new AppError('Mês inválido (1-12)', 400);
    }

    let targetCompanyId: string | null = currentUser?.companyId || null;
    if (currentUser?.role === 'MASTER' && data.isGlobal) {
      targetCompanyId = null;
    }

    return prisma.commemorativeDate.create({
      data: {
        name: data.name.trim(),
        day: Number(data.day),
        month: Number(data.month),
        year: data.year ? Number(data.year) : null,
        description: data.description?.trim() || null,
        category: data.category || 'FIXED',
        targetAudience: data.targetAudience || 'ALL_CLIENTS',
        active: typeof data.active === 'boolean' ? data.active : true,
        companyId: targetCompanyId,
      },
    });
  }

  static async update(id: string, data: Partial<CreateCommemorativeDateDTO>, currentUser?: AuthenticatedUserContext | null) {
    const existing = await prisma.commemorativeDate.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Data comemorativa não encontrada', 404);
    }

    // Regra: datas globais só podem ser modificadas pelo MASTER
    if (existing.companyId === null && currentUser?.role !== 'MASTER') {
      throw new AppError('Datas comemorativas globais do sistema só podem ser alteradas pelo Master', 403);
    }

    if (
      existing.companyId !== null &&
      currentUser?.role !== 'MASTER' &&
      existing.companyId !== currentUser?.companyId
    ) {
      throw new AppError('Data comemorativa não encontrada', 404);
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.day !== undefined) updateData.day = Number(data.day);
    if (data.month !== undefined) updateData.month = Number(data.month);
    if (data.year !== undefined) updateData.year = data.year ? Number(data.year) : null;
    if (data.description !== undefined) updateData.description = data.description?.trim() || null;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.targetAudience !== undefined) updateData.targetAudience = data.targetAudience;
    if (typeof data.active === 'boolean') updateData.active = data.active;

    return prisma.commemorativeDate.update({
      where: { id },
      data: updateData,
    });
  }

  static async delete(id: string, currentUser?: AuthenticatedUserContext | null) {
    const existing = await prisma.commemorativeDate.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Data comemorativa não encontrada', 404);
    }

    if (existing.companyId === null && currentUser?.role !== 'MASTER') {
      throw new AppError('Datas comemorativas globais do sistema só podem ser excluídas pelo Master', 403);
    }

    if (
      existing.companyId !== null &&
      currentUser?.role !== 'MASTER' &&
      existing.companyId !== currentUser?.companyId
    ) {
      throw new AppError('Data comemorativa não encontrada', 404);
    }

    await prisma.commemorativeDate.delete({ where: { id } });
    return { success: true };
  }

  /**
   * Retorna os próximos eventos nos próximos N dias (aniversários de clientes, familiares e datas fixas)
   * estritamente isolados para a empresa do usuário autenticado.
   */
  static async getUpcomingEvents(daysAhead: number = 30, currentUser?: AuthenticatedUserContext | null) {
    const today = new Date();
    const companyScope = scopeByCompany(currentUser);

    const activeClients = await prisma.client.findMany({
      where: {
        ...companyScope,
        status: 'ACTIVE',
        lgpdConsent: true,
      },
      include: {
        familyMembers: true,
      },
    });

    const fixedDates = await prisma.commemorativeDate.findMany({
      where: {
        active: true,
        OR: [
          { companyId: null },
          { companyId: companyScope.companyId },
        ],
      },
    });

    const events: Array<{
      date: string;
      day: number;
      month: number;
      type: 'CLIENT_BIRTHDAY' | 'FAMILY_BIRTHDAY' | 'FIXED_DATE';
      title: string;
      subtitle: string;
      clientId?: string;
      clientName?: string;
      familyMemberId?: string;
      commemorativeDateId?: string;
      targetName?: string;
      phone?: string | null;
      email?: string | null;
      gender?: string | null;
      companyName?: string | null;
      relationship?: string | null;
      daysRemaining: number;
      isToday: boolean;
    }> = [];

    for (let offset = 0; offset <= daysAhead; offset++) {
      const targetDate = new Date();
      targetDate.setDate(today.getDate() + offset);

      const targetDay = targetDate.getDate();
      const targetMonth = targetDate.getMonth() + 1; // 1-12
      const isToday = offset === 0;

      // 1. Fixas do calendário
      for (const fd of fixedDates) {
        if (fd.day === targetDay && fd.month === targetMonth) {
          events.push({
            date: targetDate.toISOString().split('T')[0],
            day: targetDay,
            month: targetMonth,
            type: 'FIXED_DATE',
            title: fd.name,
            subtitle: fd.description || 'Data comemorativa do calendário',
            commemorativeDateId: fd.id,
            daysRemaining: offset,
            isToday,
          });
        }
      }

      // 2. Aniversários de Clientes
      for (const client of activeClients) {
        if (client.birthDate) {
          const { day: bDay, month: bMonth } = getDayAndMonth(client.birthDate);
          if (bDay === targetDay && bMonth + 1 === targetMonth) {
            const age = calculateAge(client.birthDate, targetDate);
            events.push({
              date: targetDate.toISOString().split('T')[0],
              day: targetDay,
              month: targetMonth,
              type: 'CLIENT_BIRTHDAY',
              title: `Aniversário de ${client.name}`,
              subtitle: age > 0 ? `Completando ${age} anos` : 'Aniversário do cliente',
              clientId: client.id,
              clientName: client.name,
              targetName: client.name,
              phone: client.phone,
              email: client.email,
              gender: client.gender,
              companyName: client.companyName,
              daysRemaining: offset,
              isToday,
            });
          }
        }

        // 3. Aniversários de Familiares
        for (const fm of client.familyMembers) {
          if (fm.birthDate) {
            const { day: bDay, month: bMonth } = getDayAndMonth(fm.birthDate);
            if (bDay === targetDay && bMonth + 1 === targetMonth) {
              const relName = RELATIONSHIP_LABELS[fm.relationship] || 'Familiar';
              const age = calculateAge(fm.birthDate, targetDate);
              events.push({
                date: targetDate.toISOString().split('T')[0],
                day: targetDay,
                month: targetMonth,
                type: 'FAMILY_BIRTHDAY',
                title: `Aniversário de ${fm.name} (${relName})`,
                subtitle: `Familiar do cliente ${client.name}${age > 0 ? ` (${age} anos)` : ''}`,
                clientId: client.id,
                clientName: client.name,
                familyMemberId: fm.id,
                targetName: fm.name,
                relationship: fm.relationship,
                phone: fm.phone || client.phone,
                email: fm.email || client.email,
                gender: fm.gender,
                daysRemaining: offset,
                isToday,
              });
            }
          }
        }
      }
    }

    return events;
  }
}
