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

export interface BroadcastRecipient {
  id: string; // "client-<id>" ou "family-<id>"
  type: 'CLIENT' | 'FAMILY_MEMBER';
  clientId: string;
  familyMemberId?: string;
  targetName: string; // Nome da pessoa homenageada (ex: Rosilania Silva Almeida ou Mariana)
  clientName: string; // Nome do cliente titular associado
  relationshipLabel: string; // "Cliente Titular", "Mãe", "Pai", "Filha", "Esposa", etc.
  gender?: 'FEMALE' | 'MALE' | 'OTHER' | 'NOT_SPECIFIED' | null;
  phone?: string | null; // Telefone direto do familiar se houver, ou telefone do cliente
  email?: string | null;
  isDirectContact: boolean; // true se o telefone é direto do homenageado, false se é do cliente titular
  matchReason: string; // Motivo visual do filtro
  badgeColor?: string;
}

const RELATIONSHIP_LABELS: Record<string, string> = {
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

export function getEligibleBroadcastRecipients(
  clients: Client[],
  audienceKey: AudienceFilterKey,
  detectedDefaultKey?: AudienceFilterKey
): BroadcastRecipient[] {
  const activeKey = audienceKey === 'AUTO' ? detectedDefaultKey || 'ALL' : audienceKey;
  const recipients: BroadcastRecipient[] = [];

  for (const client of clients) {
    const family = client.familyMembers || [];
    const isClientFemale = client.gender === 'FEMALE';
    const isClientMale = client.gender === 'MALE';
    const hasChildren = family.some((fm) => ['CHILD', 'SON', 'DAUGHTER'].includes(fm.relationship));

    switch (activeKey) {
      case 'MOTHERS_ONLY': {
        // 1. Cliente Titular se for mãe
        if (client.isMother || (isClientFemale && hasChildren)) {
          recipients.push({
            id: `client-${client.id}`,
            type: 'CLIENT',
            clientId: client.id,
            targetName: client.name,
            clientName: client.name,
            relationshipLabel: 'Cliente Titular',
            gender: client.gender,
            phone: client.phone,
            email: client.email,
            isDirectContact: true,
            matchReason: '🌸 Marcada como Mãe',
            badgeColor: 'bg-pink-100 text-pink-800 dark:bg-pink-950/80 dark:text-pink-300',
          });
        }
        // 2. Familiares que são mães
        for (const fm of family) {
          if (fm.relationship === 'MOTHER' || (fm.gender === 'FEMALE' && ['MOTHER', 'GRANDMOTHER'].includes(fm.relationship))) {
            recipients.push({
              id: `family-${fm.id}`,
              type: 'FAMILY_MEMBER',
              clientId: client.id,
              familyMemberId: fm.id,
              targetName: fm.name,
              clientName: client.name,
              relationshipLabel: RELATIONSHIP_LABELS[fm.relationship] || 'Mãe',
              gender: fm.gender,
              phone: fm.phone || client.phone,
              email: fm.email || client.email,
              isDirectContact: Boolean(fm.phone),
              matchReason: `🌸 Mãe de ${client.name}`,
              badgeColor: 'bg-pink-100 text-pink-800 dark:bg-pink-950/80 dark:text-pink-300',
            });
          }
        }
        break;
      }

      case 'FATHERS_ONLY': {
        // 1. Cliente Titular se for pai
        if (client.isFather || (isClientMale && hasChildren)) {
          recipients.push({
            id: `client-${client.id}`,
            type: 'CLIENT',
            clientId: client.id,
            targetName: client.name,
            clientName: client.name,
            relationshipLabel: 'Cliente Titular',
            gender: client.gender,
            phone: client.phone,
            email: client.email,
            isDirectContact: true,
            matchReason: '👔 Marcado como Pai',
            badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300',
          });
        }
        // 2. Familiares que são pais
        for (const fm of family) {
          if (fm.relationship === 'FATHER' || (fm.gender === 'MALE' && ['FATHER', 'GRANDFATHER'].includes(fm.relationship))) {
            recipients.push({
              id: `family-${fm.id}`,
              type: 'FAMILY_MEMBER',
              clientId: client.id,
              familyMemberId: fm.id,
              targetName: fm.name,
              clientName: client.name,
              relationshipLabel: RELATIONSHIP_LABELS[fm.relationship] || 'Pai',
              gender: fm.gender,
              phone: fm.phone || client.phone,
              email: fm.email || client.email,
              isDirectContact: Boolean(fm.phone),
              matchReason: `👔 Pai de ${client.name}`,
              badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300',
            });
          }
        }
        break;
      }

      case 'WOMEN_ONLY': {
        // 1. Cliente Titular se for mulher
        if (isClientFemale || client.isMother) {
          recipients.push({
            id: `client-${client.id}`,
            type: 'CLIENT',
            clientId: client.id,
            targetName: client.name,
            clientName: client.name,
            relationshipLabel: 'Cliente Titular',
            gender: 'FEMALE',
            phone: client.phone,
            email: client.email,
            isDirectContact: true,
            matchReason: '💐 Mulher (Cliente Titular)',
            badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300',
          });
        }
        // 2. Familiares do gênero feminino
        for (const fm of family) {
          const isFmFemale = fm.gender === 'FEMALE' || ['MOTHER', 'DAUGHTER', 'SISTER', 'GRANDMOTHER'].includes(fm.relationship);
          if (isFmFemale) {
            recipients.push({
              id: `family-${fm.id}`,
              type: 'FAMILY_MEMBER',
              clientId: client.id,
              familyMemberId: fm.id,
              targetName: fm.name,
              clientName: client.name,
              relationshipLabel: RELATIONSHIP_LABELS[fm.relationship] || 'Familiar',
              gender: 'FEMALE',
              phone: fm.phone || client.phone,
              email: fm.email || client.email,
              isDirectContact: Boolean(fm.phone),
              matchReason: `💐 ${RELATIONSHIP_LABELS[fm.relationship] || 'Familiar'} de ${client.name}`,
              badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300',
            });
          }
        }
        break;
      }

      case 'MEN_ONLY': {
        // 1. Cliente Titular se for homem
        if (isClientMale || client.isFather) {
          recipients.push({
            id: `client-${client.id}`,
            type: 'CLIENT',
            clientId: client.id,
            targetName: client.name,
            clientName: client.name,
            relationshipLabel: 'Cliente Titular',
            gender: 'MALE',
            phone: client.phone,
            email: client.email,
            isDirectContact: true,
            matchReason: '🎩 Homem (Cliente Titular)',
            badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300',
          });
        }
        // 2. Familiares do gênero masculino
        for (const fm of family) {
          const isFmMale = fm.gender === 'MALE' || ['FATHER', 'SON', 'BROTHER', 'GRANDFATHER'].includes(fm.relationship);
          if (isFmMale) {
            recipients.push({
              id: `family-${fm.id}`,
              type: 'FAMILY_MEMBER',
              clientId: client.id,
              familyMemberId: fm.id,
              targetName: fm.name,
              clientName: client.name,
              relationshipLabel: RELATIONSHIP_LABELS[fm.relationship] || 'Familiar',
              gender: 'MALE',
              phone: fm.phone || client.phone,
              email: fm.email || client.email,
              isDirectContact: Boolean(fm.phone),
              matchReason: `🎩 ${RELATIONSHIP_LABELS[fm.relationship] || 'Familiar'} de ${client.name}`,
              badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300',
            });
          }
        }
        break;
      }

      case 'PARENTS_ONLY': {
        if (client.isMother || client.isFather || hasChildren) {
          recipients.push({
            id: `client-${client.id}`,
            type: 'CLIENT',
            clientId: client.id,
            targetName: client.name,
            clientName: client.name,
            relationshipLabel: 'Cliente Titular',
            gender: client.gender,
            phone: client.phone,
            email: client.email,
            isDirectContact: true,
            matchReason: '👨‍👩‍👧 Possui Filhos/Família',
            badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300',
          });
        }
        break;
      }

      case 'CORPORATE_ONLY': {
        if (client.companyName || (client.document && client.document.replace(/\D/g, '').length === 14)) {
          recipients.push({
            id: `client-${client.id}`,
            type: 'CLIENT',
            clientId: client.id,
            targetName: client.name,
            clientName: client.name,
            relationshipLabel: 'Empresa / PJ',
            gender: client.gender,
            phone: client.phone,
            email: client.email,
            isDirectContact: true,
            matchReason: '🏢 Cliente PJ / Empresa',
            badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300',
          });
        }
        break;
      }

      default: {
        // ALL
        recipients.push({
          id: `client-${client.id}`,
          type: 'CLIENT',
          clientId: client.id,
          targetName: client.name,
          clientName: client.name,
          relationshipLabel: 'Cliente Titular',
          gender: client.gender,
          phone: client.phone,
          email: client.email,
          isDirectContact: true,
          matchReason: '🌐 Cliente Ativo',
          badgeColor: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
        });
        break;
      }
    }
  }

  return recipients;
}

export function filterClientsByAudience(
  clients: Client[],
  audienceKey: AudienceFilterKey,
  detectedDefaultKey?: AudienceFilterKey
): { filtered: Client[]; matchedReasons: Record<string, string> } {
  const recipients = getEligibleBroadcastRecipients(clients, audienceKey, detectedDefaultKey);
  const matchedReasons: Record<string, string> = {};
  const clientMap = new Map<string, Client>();

  clients.forEach((c) => {
    clientMap.set(c.id, c);
  });

  const filteredClients: Client[] = [];
  const addedIds = new Set<string>();

  for (const r of recipients) {
    const c = clientMap.get(r.clientId);
    if (c && !addedIds.has(c.id)) {
      addedIds.add(c.id);
      filteredClients.push(c);
      matchedReasons[c.id] = r.matchReason;
    }
  }

  return { filtered: filteredClients, matchedReasons };
}
