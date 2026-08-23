export interface ClientAudienceProfile {
  id: string;
  name: string;
  gender?: string | null;
  isMother?: boolean | null;
  isFather?: boolean | null;
  profession?: string | null;
  document?: string | null;
  companyName?: string | null;
  familyMembers?: Array<{
    id?: string;
    name: string;
    relationship: string;
    gender?: string | null;
  }>;
}

export interface CommemorativeDateAudience {
  id?: string;
  name: string;
  targetAudience?: string | null;
  category?: string | null;
}

export function detectAudienceType(commemorativeDate: CommemorativeDateAudience): string {
  const name = commemorativeDate.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const target = commemorativeDate.targetAudience || 'ALL_CLIENTS';

  if (target === 'MOTHERS_ONLY' || name.includes('mae') || name.includes('maes') || name.includes('maternidade')) {
    return 'MOTHERS_ONLY';
  }
  if (target === 'FATHERS_ONLY' || name.includes('pai') || name.includes('pais') || name.includes('paternidade')) {
    return 'FATHERS_ONLY';
  }
  if (target === 'WOMEN_ONLY' || name.includes('mulher') || name.includes('mulheres') || name.includes('feminino') || name.includes('menina')) {
    return 'WOMEN_ONLY';
  }
  if (target === 'MEN_ONLY' || name.includes('homem') || name.includes('homens') || name.includes('masculino')) {
    return 'MEN_ONLY';
  }
  if (name.includes('avo') || name.includes('avos')) {
    return 'GRANDPARENTS_ONLY';
  }
  if (name.includes('crianca') || name.includes('criancas') || name.includes('filho') || name.includes('filhos')) {
    return 'PARENTS_WITH_CHILDREN';
  }
  if (target === 'CORPORATE_ONLY' || name.includes('empresario') || name.includes('empresa') || name.includes('comerciante') || name.includes('cliente')) {
    return 'CORPORATE_ONLY';
  }
  if (target === 'PARENTS_ONLY') {
    return 'PARENTS_ONLY';
  }

  return 'ALL_CLIENTS';
}

export function matchesAudience(
  client: ClientAudienceProfile,
  commemorativeDate: CommemorativeDateAudience
): { matches: boolean; reason: string } {
  const audienceType = detectAudienceType(commemorativeDate);
  const family = client.familyMembers || [];

  // Checar familiares
  const hasChildren = family.some((fm) => ['CHILD', 'SON', 'DAUGHTER'].includes(fm.relationship));
  const hasMother = family.some((fm) => fm.relationship === 'MOTHER');
  const hasFather = family.some((fm) => fm.relationship === 'FATHER');
  const hasGrandparent = family.some((fm) => ['GRANDMOTHER', 'GRANDFATHER'].includes(fm.relationship));

  const isFemale = client.gender === 'FEMALE';
  const isMale = client.gender === 'MALE';

  switch (audienceType) {
    case 'MOTHERS_ONLY':
      if (client.isMother) {
        return { matches: true, reason: 'Cliente cadastrada como Mãe' };
      }
      if (isFemale && hasChildren) {
        return { matches: true, reason: 'Cliente feminina com filho(s) cadastrado(s)' };
      }
      if (hasMother) {
        return { matches: true, reason: 'Possui mãe cadastrada no perfil familiar' };
      }
      return { matches: false, reason: 'Não identificada como mãe' };

    case 'FATHERS_ONLY':
      if (client.isFather) {
        return { matches: true, reason: 'Cliente cadastrado como Pai' };
      }
      if (isMale && hasChildren) {
        return { matches: true, reason: 'Cliente masculino com filho(s) cadastrado(s)' };
      }
      if (hasFather) {
        return { matches: true, reason: 'Possui pai cadastrado no perfil familiar' };
      }
      return { matches: false, reason: 'Não identificado como pai' };

    case 'WOMEN_ONLY':
      if (isFemale || client.isMother) {
        return { matches: true, reason: 'Cliente do gênero feminino' };
      }
      return { matches: false, reason: 'Não identificada como mulher' };

    case 'MEN_ONLY':
      if (isMale || client.isFather) {
        return { matches: true, reason: 'Cliente do gênero masculino' };
      }
      return { matches: false, reason: 'Não identificado como homem' };

    case 'GRANDPARENTS_ONLY':
      if (hasGrandparent) {
        return { matches: true, reason: 'Possui avô/avó cadastrado no perfil familiar' };
      }
      return { matches: false, reason: 'Sem avós vinculados' };

    case 'PARENTS_WITH_CHILDREN':
    case 'PARENTS_ONLY':
      if (client.isMother || client.isFather || hasChildren) {
        return { matches: true, reason: 'Cliente possui filhos/família vinculada' };
      }
      return { matches: false, reason: 'Sem filhos cadastrados' };

    case 'CORPORATE_ONLY':
      if (client.companyName || (client.document && client.document.replace(/\D/g, '').length === 14)) {
        return { matches: true, reason: 'Cliente Pessoa Jurídica / Corporativo' };
      }
      return { matches: true, reason: 'Todos os clientes elegíveis' };

    case 'ALL_CLIENTS':
    default:
      return { matches: true, reason: 'Válido para todos os clientes ativos' };
  }
}
