/**
 * Utilitário de Validação e Mascaramento de CPF e CNPJ (Conformidade LGPD)
 */

export function cleanDocumentDigits(doc: string): string {
  return doc.replace(/\D/g, '');
}

/**
 * Validação algorítmica de CPF (dígitos verificadores módulo 11)
 */
export function validateCpf(cpf: string): boolean {
  const digits = cleanDocumentDigits(cpf);
  if (digits.length !== 11) return false;

  // Rejeita sequências de dígitos iguais (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i], 10) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(digits[9], 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i], 10) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(digits[10], 10)) return false;

  return true;
}

/**
 * Validação algorítmica de CNPJ (dígitos verificadores)
 */
export function validateCnpj(cnpj: string): boolean {
  const digits = cleanDocumentDigits(cnpj);
  if (digits.length !== 14) return false;

  if (/^(\d)\1{13}$/.test(digits)) return false;

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i], 10) * weights1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(digits[12], 10)) return false;

  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(digits[i], 10) * weights2[i];
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (digit2 !== parseInt(digits[13], 10)) return false;

  return true;
}

export function validateDocument(doc?: string | null): boolean {
  if (!doc) return true; // Opcional
  const digits = cleanDocumentDigits(doc);
  if (digits.length === 11) return validateCpf(digits);
  if (digits.length === 14) return validateCnpj(digits);
  return false;
}

/**
 * Mascara CPF/CNPJ para exibicao publica segura em conformidade com a LGPD
 * CPF:  123.456.789-01 -> 123.***.***-01
 * CNPJ: 12.345.678/0001-90 -> 12.***.*** / 0001-90
 */
export function maskDocument(doc?: string | null): string | null {
  if (!doc) return null;
  const digits = cleanDocumentDigits(doc);
  
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}.***.***-${digits.slice(9, 11)}`;
  }
  
  if (digits.length === 14) {
    return `${digits.slice(0, 2)}.***.***/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
  }

  // Se tiver outro tamanho, mascara os caracteres do meio
  if (digits.length > 4) {
    const start = digits.slice(0, 2);
    const end = digits.slice(-2);
    return `${start}${'*'.repeat(digits.length - 4)}${end}`;
  }

  return '***';
}
