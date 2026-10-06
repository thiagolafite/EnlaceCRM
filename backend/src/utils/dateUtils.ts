import {
  getBirthDateUtcParts,
  isLeapYear,
  matchesBirthdaySP,
  todayInSaoPaulo,
} from './time';

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
 * Extrai dia e mês (0-11) lendo estritamente em UTC
 */
export function getDayAndMonth(date: Date | string): { day: number; month: number } {
  const parts = getBirthDateUtcParts(date);
  return {
    day: parts.day,
    month: parts.month - 1, // 0-indexed para retrocompatibilidade
  };
}

export function isSameDayAndMonth(dateA: Date | string, dateB: Date | string = new Date()): boolean {
  const partsB = getBirthDateUtcParts(dateB);
  if (partsB.day === -1) return false;

  return matchesBirthdaySP(dateA, {
    day: partsB.day,
    month: partsB.month,
    year: partsB.year,
    hours: 0,
    minutes: 0,
    seconds: 0,
    dateKey: `${partsB.year}-${String(partsB.month).padStart(2, '0')}-${String(partsB.day).padStart(2, '0')}`,
  });
}

export function formatDateBr(date: Date | string | null | undefined): string {
  if (!date) return '';
  const parts = getBirthDateUtcParts(date);
  if (parts.day === -1) return '';
  return `${String(parts.day).padStart(2, '0')}/${String(parts.month).padStart(2, '0')}/${parts.year}`;
}

export function calculateAge(birthDate: Date | string, targetDate: Date | string = new Date()): number {
  const targetParts = typeof targetDate === 'string'
    ? getBirthDateUtcParts(targetDate)
    : { day: targetDate.getDate(), month: targetDate.getMonth() + 1, year: targetDate.getFullYear() };

  const { day: bDay, month: bMonth, year: bYear } = getBirthDateUtcParts(birthDate);
  if (bYear <= 0) return 0;

  let age = targetParts.year - bYear;
  if (targetParts.month < bMonth || (targetParts.month === bMonth && targetParts.day < bDay)) {
    age--;
  }
  return Math.max(0, age);
}

export { isLeapYear, matchesBirthdaySP, todayInSaoPaulo };
