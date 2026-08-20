import { RELATIONSHIP_LABELS, RELATIONSHIP_POSSESSIVE, calculateAge } from './dateUtils';

export interface InterpolationContext {
  clientName?: string;
  familyMemberName?: string;
  familyName?: string;
  relationship?: string;
  companyName?: string;
  commemorativeDateName?: string;
  birthDate?: Date;
  currentDate?: Date;
}

export function interpolateTemplate(template: string, ctx: InterpolationContext): string {
  if (!template) return '';

  const clientName = ctx.clientName || 'Cliente';
  const clientFirstName = clientName.split(' ')[0] || clientName;

  const familyMemberName = ctx.familyMemberName || ctx.familyName || '';
  const familyMemberFirstName = familyMemberName ? familyMemberName.split(' ')[0] : '';

  const rawRel = ctx.relationship || '';
  const parentesco = RELATIONSHIP_LABELS[rawRel] || rawRel || 'Familiar';
  const parentescoPossessivo = RELATIONSHIP_POSSESSIVE[rawRel] || `seu(sua) ${rawRel.toLowerCase()}`;

  const companyName = ctx.companyName || 'Nossa Equipe';
  const eventName = ctx.commemorativeDateName || 'Data Especial';

  let ageStr = '';
  if (ctx.birthDate) {
    const age = calculateAge(ctx.birthDate, ctx.currentDate || new Date());
    ageStr = age > 0 ? String(age) : '';
  }

  const replacements: Record<string, string> = {
    '{{nome_cliente}}': clientName,
    '{{primeiro_nome}}': clientFirstName,
    '{{primeiro_nome_cliente}}': clientFirstName,
    '{{nome_familiar}}': familyMemberName,
    '{{primeiro_nome_familiar}}': familyMemberFirstName,
    '{{parentesco}}': parentesco,
    '{{parentesco_possessivo}}': parentescoPossessivo,
    '{{nome_empresa}}': companyName,
    '{{data_comemorativa}}': eventName,
    '{{evento}}': eventName,
    '{{idade}}': ageStr,
  };

  let result = template;
  for (const [key, value] of Object.entries(replacements)) {
    // Replace all case-insensitively
    const escapedKey = key.replace(/[{}]/g, '\\$&');
    result = result.replace(new RegExp(escapedKey, 'gi'), value);
  }

  return result;
}

export const AVAILABLE_VARIABLES = [
  { tag: '{{nome_cliente}}', description: 'Nome completo do cliente' },
  { tag: '{{primeiro_nome}}', description: 'Primeiro nome do cliente' },
  { tag: '{{nome_familiar}}', description: 'Nome do familiar (se aniversário de familiar)' },
  { tag: '{{primeiro_nome_familiar}}', description: 'Primeiro nome do familiar' },
  { tag: '{{parentesco}}', description: 'Grau de parentesco formatado (ex: Mãe, Filho, Esposa)' },
  { tag: '{{parentesco_possessivo}}', description: 'Parentesco com possessivo (ex: sua mãe, seu filho)' },
  { tag: '{{nome_empresa}}', description: 'Nome da sua empresa' },
  { tag: '{{data_comemorativa}}', description: 'Nome da data comemorativa (ex: Dia das Mães, Natal)' },
  { tag: '{{idade}}', description: 'Idade que o aniversariante está completando' },
];
