/**
 * Utilitários de Fuso Horário e Datas — America/Sao_Paulo
 * Centraliza a fonte de verdade para varreduras, scheduler e idempotência
 */

export const TIMEZONE_SAO_PAULO = 'America/Sao_Paulo';

/**
 * Retorna se um determinado ano é bissexto
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export interface DatePartsSP {
  year: number;
  month: number; // 1-12 (1-indexed para facilidade)
  day: number;   // 1-31
  hours: number;
  minutes: number;
  seconds: number;
  dateKey: string; // "YYYY-MM-DD"
}

/**
 * Obtém os componentes da data no fuso de São Paulo (America/Sao_Paulo)
 */
export function getSaoPauloParts(referenceDate: Date = new Date()): DatePartsSP {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE_SAO_PAULO,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(referenceDate);
  const findPart = (type: string): number => {
    const p = parts.find((x) => x.type === type);
    return p ? parseInt(p.value, 10) : 0;
  };

  const year = findPart('year');
  const month = findPart('month');
  const day = findPart('day');
  const hours = findPart('hour');
  const minutes = findPart('minute');
  const seconds = findPart('second');

  const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  return {
    year,
    month,
    day,
    hours,
    minutes,
    seconds,
    dateKey,
  };
}

/**
 * Retorna as informações do dia atual em São Paulo
 */
export function todayInSaoPaulo(referenceDate?: Date): DatePartsSP {
  return getSaoPauloParts(referenceDate || new Date());
}

/**
 * Retorna o início do dia (00:00:00.000) em São Paulo
 */
export function startOfDaySP(referenceDate?: Date): Date {
  const parts = getSaoPauloParts(referenceDate);
  // Constrói ISO string com offset aproximado de SP (UTC-3)
  return new Date(`${parts.dateKey}T00:00:00.000-03:00`);
}

/**
 * Retorna o fim do dia (23:59:59.999) em São Paulo
 */
export function endOfDaySP(referenceDate?: Date): Date {
  const parts = getSaoPauloParts(referenceDate);
  return new Date(`${parts.dateKey}T23:59:59.999-03:00`);
}

/**
 * Extrai dia e mês de birthDate lendo estritamente em UTC
 * birthDate é persistido como meia-noite UTC (YYYY-MM-DDT00:00:00.000Z)
 */
export function getBirthDateUtcParts(birthDate: Date | string): { day: number; month: number; year: number } {
  if (typeof birthDate === 'string') {
    const match = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return {
        year: parseInt(match[1], 10),
        month: parseInt(match[2], 10), // 1-12
        day: parseInt(match[3], 10),
      };
    }
  }

  const d = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  if (isNaN(d.getTime())) {
    return { day: -1, month: -1, year: -1 };
  }

  return {
    day: d.getUTCDate(),
    month: d.getUTCMonth() + 1, // 1-12
    year: d.getUTCFullYear(),
  };
}

/**
 * Compara se um aniversário (em UTC) coincide com a data de referência em São Paulo.
 * Regra de 29/02: em anos não bissextos, celebra em 28/02.
 */
export function matchesBirthdaySP(
  birthDate: Date | string,
  targetSP: DatePartsSP
): boolean {
  const { day: bDay, month: bMonth } = getBirthDateUtcParts(birthDate);
  if (bDay === -1) return false;

  // Aniversário normal
  if (bDay === targetSP.day && bMonth === targetSP.month) {
    return true;
  }

  // Tratamento especial para 29/02 em anos não bissextos
  if (bMonth === 2 && bDay === 29) {
    const targetIsLeap = isLeapYear(targetSP.year);
    if (!targetIsLeap && targetSP.month === 2 && targetSP.day === 28) {
      return true;
    }
  }

  return false;
}

/**
 * Calcula a idade com precisão usando birthDate UTC vs target SP
 */
export function calculateAgeSP(birthDate: Date | string, targetSP: DatePartsSP): number {
  const { day: bDay, month: bMonth, year: bYear } = getBirthDateUtcParts(birthDate);
  if (bYear <= 0) return 0;

  let age = targetSP.year - bYear;
  if (targetSP.month < bMonth || (targetSP.month === bMonth && targetSP.day < bDay)) {
    age--;
  }
  return Math.max(0, age);
}
