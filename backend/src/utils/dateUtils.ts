export const RELATIONSHIP_LABELS: Record<string, string> = {
  MOTHER: 'Mãe',
  FATHER: 'Pai',
  SON: 'Filho',
  DAUGHTER: 'Filha',
  SPOUSE: 'Cônjuge',
  BROTHER: 'Irmão',
  SISTER: 'Irmã',
  GRANDFATHER: 'Avô',
  GRANDMOTHER: 'Avó',
  OTHER: 'Familiar',
};

export const RELATIONSHIP_POSSESSIVE: Record<string, string> = {
  MOTHER: 'sua mãe',
  FATHER: 'seu pai',
  SON: 'seu filho',
  DAUGHTER: 'sua filha',
  SPOUSE: 'seu(sua) cônjuge',
  BROTHER: 'seu irmão',
  SISTER: 'sua irmã',
  GRANDFATHER: 'seu avô',
  GRANDMOTHER: 'sua avó',
  OTHER: 'seu familiar',
};

/**
 * Extrai dia e mês (0-11) de forma resiliente a fusos horários
 */
export function getDayAndMonth(date: Date | string): { day: number; month: number } {
  if (typeof date === 'string') {
    const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return {
        month: parseInt(match[2], 10) - 1, // 0-indexed
        day: parseInt(match[3], 10),
      };
    }
  }

  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) {
    return { day: -1, month: -1 };
  }

  // Datas gravadas como UTC midnight (ex: 2026-08-19T00:00:00.000Z) devem usar UTC para não regredir um dia no Brasil (UTC-3)
  if (d.getUTCHours() === 0 && d.getUTCMinutes() === 0) {
    return {
      day: d.getUTCDate(),
      month: d.getUTCMonth(),
    };
  }

  return {
    day: d.getDate(),
    month: d.getMonth(),
  };
}

export function isSameDayAndMonth(dateA: Date | string, dateB: Date | string = new Date()): boolean {
  const { day: dayA, month: monthA } = getDayAndMonth(dateA);

  const dB = typeof dateB === 'string' ? new Date(dateB) : dateB;
  const dayB = dB.getDate();
  const monthB = dB.getMonth();

  if (monthA === monthB && dayA === dayB) {
    return true;
  }

  // Tratar 29 de fevereiro em anos não bissextos (comemora em 28 de fevereiro)
  if (monthA === 1 && dayA === 29 && monthB === 1 && dayB === 28) {
    const isLeapYear = (year: number) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    if (!isLeapYear(dB.getFullYear())) {
      return true;
    }
  }

  return false;
}

export function formatDateBr(date: Date | string | null | undefined): string {
  if (!date) return '';
  const { day, month } = getDayAndMonth(date);
  if (day === -1) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getUTCFullYear() || d.getFullYear();
  return `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
}

export function calculateAge(birthDate: Date | string, targetDate: Date | string = new Date()): number {
  const { day: bDay, month: bMonth } = getDayAndMonth(birthDate);
  const bDate = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const tDate = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;

  const bYear = bDate.getUTCFullYear() || bDate.getFullYear();
  let age = tDate.getFullYear() - bYear;

  const monthDiff = tDate.getMonth() - bMonth;
  if (monthDiff < 0 || (monthDiff === 0 && tDate.getDate() < bDay)) {
    age--;
  }
  return Math.max(0, age);
}
