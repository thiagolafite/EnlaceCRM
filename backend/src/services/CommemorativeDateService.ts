import { prisma } from '../utils/prisma';
import { RELATIONSHIP_LABELS, calculateAge, getDayAndMonth } from '../utils/dateUtils';

export interface CreateCommemorativeDateDTO {
  name: string;
  day: number;
  month: number;
  year?: number | null;
  description?: string;
  category?: 'FIXED' | 'CULTURAL' | 'CORPORATE';
  targetAudience?: 'ALL_CLIENTS' | 'MOTHERS_ONLY' | 'FATHERS_ONLY' | 'CUSTOM';
  active?: boolean;
}

export class CommemorativeDateService {
  static async list() {
    return prisma.commemorativeDate.findMany({
      orderBy: [{ month: 'asc' }, { day: 'asc' }],
      include: {
        _count: {
          select: { templates: true, alerts: true },
        },
      },
    });
  }

  static async create(data: CreateCommemorativeDateDTO) {
    if (!data.name || !data.name.trim()) {
      throw new Error('Nome da data comemorativa é obrigatório');
    }
    if (!data.day || data.day < 1 || data.day > 31) {
      throw new Error('Dia inválido (1-31)');
    }
    if (!data.month || data.month < 1 || data.month > 12) {
      throw new Error('Mês inválido (1-12)');
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
      },
    });
  }

  static async update(id: string, data: Partial<CreateCommemorativeDateDTO>) {
    const existing = await prisma.commemorativeDate.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Data comemorativa não encontrada');
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

  static async delete(id: string) {
    const existing = await prisma.commemorativeDate.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Data comemorativa não encontrada');
    }

    await prisma.commemorativeDate.delete({ where: { id } });
    return { success: true };
  }

  /**
   * Retorna os próximos eventos nos próximos N dias (aniversários de clientes, familiares e datas fixas)
   */
  static async getUpcomingEvents(daysAhead: number = 30) {
    const today = new Date();
    const activeClients = await prisma.client.findMany({
      where: { status: 'ACTIVE', lgpdConsent: true },
      include: {
        familyMembers: true,
      },
    });

    const fixedDates = await prisma.commemorativeDate.findMany({
      where: { active: true },
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
