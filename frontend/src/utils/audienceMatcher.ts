import { Client, CommemorativeDate } from '../types';

export type AudienceFilterKey =
  | 'AUTO'
  | 'ALL'
  | 'MOTHERS_ONLY'
  | 'FATHERS_ONLY'
  | 'WOMEN_ONLY'
  | 'MEN_ONLY'
  | 'PARENTS_ONLY'
  | 'CORPORATE_ONLY';

export interface AudienceDetectionResult {
  key: AudienceFilterKey;
  label: string;
  badgeColor: string;
  iconText: string;
  description: string;
}

export function detectCommemorativeAudience(date: CommemorativeDate): AudienceDetectionResult {
  const name = date.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const target = String(date.targetAudience || 'ALL_CLIENTS');

  if (target === 'MOTHERS_ONLY' || name.includes('mae') || name.includes('maes') || name.includes('maternidade')) {
    return {
      key: 'MOTHERS_ONLY',
      label: 'Apenas Mães',
      badgeColor: 'bg-pink-100 dark:bg-pink-950/80 text-pink-800 dark:text-pink-300 border-pink-300 dark:border-pink-800',
      iconText: '🌸',
      description: 'Filtrando automaticamente clientes que são mães ou possuem familiares mães',
    };
  }

  if (target === 'FATHERS_ONLY' || name.includes('pai') || name.includes('pais') || name.includes('paternidade')) {
    return {
      key: 'FATHERS_ONLY',
      label: 'Apenas Pais',
      badgeColor: 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800',
      iconText: '👔',
      description: 'Filtrando automaticamente clientes que são pais ou possuem familiares pais',
    };
  }

  if (target === 'WOMEN_ONLY' || name.includes('mulher') || name.includes('mulheres') || name.includes('feminino') || name.includes('menina')) {
    return {
      key: 'WOMEN_ONLY',
      label: 'Apenas Mulheres',
      badgeColor: 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800',
      iconText: '💐',
      description: 'Filtrando automaticamente todas as clientes do gênero feminino',
    };
  }

  if (target === 'MEN_ONLY' || name.includes('homem') || name.includes('homens') || name.includes('masculino')) {
    return {
      key: 'MEN_ONLY',
      label: 'Apenas Homens',
      badgeColor: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
      iconText: '🎩',
      description: 'Filtrando automaticamente todos os clientes do gênero masculino',
    };
  }

  if (name.includes('crianca') || name.includes('criancas') || name.includes('filho') || name.includes('filhos')) {
    return {
      key: 'PARENTS_ONLY',
      label: 'Pais com Filhos',
      badgeColor: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      iconText: '👨‍👩‍👧',
      description: 'Filtrando clientes que possuem filhos ou são pais/mães',
    };
  }

  if (target === 'CORPORATE_ONLY' || name.includes('empresario') || name.includes('empresa') || name.includes('comerciante') || name.includes('cliente')) {
    return {
      key: 'CORPORATE_ONLY',
      label: 'Clientes Corporativos / PJ',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      iconText: '🏢',
      description: 'Filtrando clientes cadastrados como Pessoa Jurídica ou com empresa vinculada',
    };
  }

  return {
    key: 'ALL',
    label: 'Todos os Clientes',
    badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    iconText: '🌐',
    description: 'Data comemorativa geral aplicável a toda a base de clientes',
  };
}

export function filterClientsByAudience(
  clients: Client[],
  audienceKey: AudienceFilterKey,
  detectedDefaultKey?: AudienceFilterKey
): { filtered: Client[]; matchedReasons: Record<string, string> } {
  const activeKey = audienceKey === 'AUTO' ? detectedDefaultKey || 'ALL' : audienceKey;
  const matchedReasons: Record<string, string> = {};

  if (activeKey === 'ALL') {
    clients.forEach((c) => {
      matchedReasons[c.id] = 'Cliente ativo cadastrado';
    });
    return { filtered: clients, matchedReasons };
  }

  const filtered = clients.filter((c) => {
    const family = c.familyMembers || [];
    const hasChildren = family.some((fm) => ['CHILD', 'SON', 'DAUGHTER'].includes(fm.relationship));
    const hasMother = family.some((fm) => fm.relationship === 'MOTHER');
    const hasFather = family.some((fm) => fm.relationship === 'FATHER');
    const hasGrandparent = family.some((fm) => ['GRANDMOTHER', 'GRANDFATHER'].includes(fm.relationship));
    const hasFemaleFamily = family.some((fm) => fm.gender === 'FEMALE' || ['MOTHER', 'DAUGHTER', 'SISTER', 'GRANDMOTHER'].includes(fm.relationship));
    const hasMaleFamily = family.some((fm) => fm.gender === 'MALE' || ['FATHER', 'SON', 'BROTHER', 'GRANDFATHER'].includes(fm.relationship));

    const isFemale = c.gender === 'FEMALE';
    const isMale = c.gender === 'MALE';

    switch (activeKey) {
      case 'MOTHERS_ONLY':
        if (c.isMother) {
          matchedReasons[c.id] = '🌸 Marcada como Mãe';
          return true;
        }
        if (isFemale && hasChildren) {
          matchedReasons[c.id] = '🌸 Cliente feminina com filho(s)';
          return true;
        }
        if (hasMother) {
          const mom = family.find((fm) => fm.relationship === 'MOTHER');
          matchedReasons[c.id] = `🌸 Possui Mãe (${mom?.name})`;
          return true;
        }
        return false;

      case 'FATHERS_ONLY':
        if (c.isFather) {
          matchedReasons[c.id] = '👔 Marcado como Pai';
          return true;
        }
        if (isMale && hasChildren) {
          matchedReasons[c.id] = '👔 Cliente masculino com filho(s)';
          return true;
        }
        if (hasFather) {
          const dad = family.find((fm) => fm.relationship === 'FATHER');
          matchedReasons[c.id] = `👔 Possui Pai (${dad?.name})`;
          return true;
        }
        return false;

      case 'WOMEN_ONLY':
        if (isFemale || c.isMother) {
          matchedReasons[c.id] = '💐 Gênero Feminino';
          return true;
        }
        if (hasFemaleFamily) {
          const femaleMem = family.find((fm) => fm.gender === 'FEMALE' || ['MOTHER', 'DAUGHTER', 'SISTER', 'GRANDMOTHER'].includes(fm.relationship));
          matchedReasons[c.id] = `💐 Familiar feminina (${femaleMem?.name})`;
          return true;
        }
        return false;

      case 'MEN_ONLY':
        if (isMale || c.isFather) {
          matchedReasons[c.id] = '🎩 Gênero Masculino';
          return true;
        }
        if (hasMaleFamily) {
          const maleMem = family.find((fm) => fm.gender === 'MALE' || ['FATHER', 'SON', 'BROTHER', 'GRANDFATHER'].includes(fm.relationship));
          matchedReasons[c.id] = `🎩 Familiar masculino (${maleMem?.name})`;
          return true;
        }
        return false;

      case 'PARENTS_ONLY':
        if (c.isMother || c.isFather || hasChildren) {
          matchedReasons[c.id] = '👨‍👩‍👧 Possui filhos/família';
          return true;
        }
        return false;

      case 'CORPORATE_ONLY':
        if (c.companyName || (c.document && c.document.replace(/\D/g, '').length === 14)) {
          matchedReasons[c.id] = '🏢 Cliente Pessoa Jurídica / PJ';
          return true;
        }
        return false;

      default:
        matchedReasons[c.id] = 'Cliente ativo';
        return true;
    }
  });

  return { filtered, matchedReasons };
}
