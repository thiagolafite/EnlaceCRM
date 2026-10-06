export type TargetAudienceType =
  | 'ALL_CLIENTS'
  | 'ALL'
  | 'MOTHERS_ONLY'
  | 'FATHERS_ONLY'
  | 'WOMEN_ONLY'
  | 'MEN_ONLY'
  | 'CUSTOM';

export interface EvaluatedPerson {
  isClient: boolean;
  gender?: string | null;
  isMother?: boolean | null;
  isFather?: boolean | null;
  relationship?: string | null;
}

/**
 * Avalia se uma pessoa (cliente titular ou familiar) pertence ao público-alvo de uma data comemorativa.
 *
 * Regras estritas:
 * 1. ALL_CLIENTS / ALL: qualquer pessoa ativa é elegível.
 * 2. MOTHERS_ONLY:
 *    - Se for cliente titular: deve ter `isMother === true`.
 *    - Se for familiar: deve ter `relationship === 'MOTHER'` ou `isMother === true`.
 * 3. FATHERS_ONLY:
 *    - Se for cliente titular: deve ter `isFather === true`.
 *    - Se for familiar: deve ter `relationship === 'FATHER'` ou `isFather === true`.
 * 4. WOMEN_ONLY:
 *    - Deve possuir `gender === 'FEMALE'` explicitamente.
 *    - Não aceita homem com flag `isMother` (ex: inconsistência de cadastro).
 * 5. MEN_ONLY:
 *    - Deve possuir `gender === 'MALE'` explicitamente.
 *    - Não aceita mulher com flag `isFather`.
 */
export function matchesAudience(
  targetAudience: string | undefined | null,
  person: EvaluatedPerson
): boolean {
  const audience = (targetAudience || 'ALL_CLIENTS').toUpperCase().trim();

  // 1. Público Geral
  if (audience === 'ALL_CLIENTS' || audience === 'ALL' || !audience) {
    return true;
  }

  // 2. Mães
  if (audience === 'MOTHERS_ONLY' || audience === 'MOTHERS') {
    if (person.isMother === true) return true;
    if (person.relationship === 'MOTHER') return true;
    return false;
  }

  // 3. Pais
  if (audience === 'FATHERS_ONLY' || audience === 'FATHERS') {
    if (person.isFather === true) return true;
    if (person.relationship === 'FATHER') return true;
    return false;
  }

  // 4. Apenas Mulheres (estritamente por gênero feminino)
  if (audience === 'WOMEN_ONLY' || audience === 'WOMEN') {
    return person.gender === 'FEMALE';
  }

  // 5. Apenas Homens (estritamente por gênero masculino)
  if (audience === 'MEN_ONLY' || audience === 'MEN') {
    return person.gender === 'MALE';
  }

  // 6. Customizado / Padrão fallback
  return true;
}
