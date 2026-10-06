/**
 * Normaliza qualquer formato de telefone brasileiro para E.164 (+55DD9XXXXXXXX)
 */
export function normalizePhoneBR(phone?: string | null): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';

  // Se já tem código de país 55 e tem 12 ou 13 dígitos
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    return `+${digits}`;
  }

  // Se tem 10 (fixo) ou 11 dígitos (celular) com DDD
  if (digits.length === 10 || digits.length === 11) {
    return `+55${digits}`;
  }

  // Caso geral
  return digits.startsWith('+') ? digits : `+${digits}`;
}
