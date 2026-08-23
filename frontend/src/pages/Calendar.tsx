import React, { useEffect, useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Gift,
  Heart,
  Briefcase,
  Star,
  PartyPopper,
  CalendarDays,
  List,
  RefreshCw,
  Cake,
  Users,
  MessageCircle,
  Mail,
  Copy,
  ExternalLink,
  Search,
  Check,
  Send,
  Sliders,
  Filter,
} from 'lucide-react';
import { api } from '../services/api';
import { CommemorativeDate, UpcomingEvent, Client, MessageTemplate } from '../types';
import { Modal } from '../components/Modal';
import { EventTypeBadge } from '../components/Badge';
import {
  detectCommemorativeAudience,
  filterClientsByAudience,
  getEligibleBroadcastRecipients,
  BroadcastRecipient,
  AudienceFilterKey,
} from '../utils/audienceMatcher';

interface CalendarProps {
  defaultTab?: 'year' | 'fixed' | 'agenda';
}

const MONTHS_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const WEEKDAYS_SHORT = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const RELATIONSHIP_LABELS: Record<string, string> = {
  SPOUSE: 'Cônjuge / Esposo(a)',
  CHILD: 'Filho(a)',
  SON: 'Filho',
  DAUGHTER: 'Filha',
  MOTHER: 'Mãe',
  FATHER: 'Pai',
  SIBLING: 'Irmão(ã)',
  OTHER: 'Familiar',
};

const RELATIONSHIP_POSSESSIVE: Record<string, string> = {
  SPOUSE: 'seu(sua) cônjuge',
  CHILD: 'seu(sua) filho(a)',
  SON: 'seu filho',
  DAUGHTER: 'sua filha',
  MOTHER: 'sua mãe',
  FATHER: 'seu pai',
  SIBLING: 'seu(sua) irmão(ã)',
  OTHER: 'seu familiar',
};

export interface UnifiedCalendarEvent {
  id: string;
  name: string;
  day: number;
  month: number;
  year?: number | null;
  category: 'FIXED' | 'CULTURAL' | 'CORPORATE' | 'CLIENT_BIRTHDAY' | 'FAMILY_BIRTHDAY';
  targetAudience?: string;
  description?: string | null;
  active?: boolean;
  clientId?: string;
  clientName?: string;
  familyMemberId?: string;
  familyMemberName?: string;
  relationship?: string;
  phone?: string | null;
  email?: string | null;
  isCustomDate?: boolean;
  rawDateObject?: CommemorativeDate;
}

function parseDayAndMonth(dateStr: string | Date | null | undefined): { day: number; month: number } | null {
  if (!dateStr) return null;
  try {
    const str = typeof dateStr === 'string' ? dateStr : dateStr.toISOString();
    const cleanDate = str.split('T')[0];
    const parts = cleanDate.split('-');
    if (parts.length === 3) {
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      if (!isNaN(day) && !isNaN(month)) {
        return { day, month };
      }
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return { day: d.getUTCDate(), month: d.getUTCMonth() + 1 };
    }
  } catch (err) {
    console.error('Erro ao fazer parse de data:', dateStr, err);
  }
  return null;
}

function interpolateMessage(
  templateText: string,
  data: {
    nome_cliente?: string;
    primeiro_nome?: string;
    nome_familiar?: string;
    nome_homenageado?: string;
    primeiro_nome_homenageado?: string;
    parentesco?: string;
    parentesco_possessivo?: string;
    nome_empresa?: string;
    ano_atual?: string;
  }
): string {
  let result = templateText;
  const company = data.nome_empresa || 'Enlace CRM';
  const currentYear = data.ano_atual || String(new Date().getFullYear());

  result = result.replace(/\{\{nome_cliente\}\}/g, data.nome_cliente || 'Cliente');
  result = result.replace(/\{\{primeiro_nome\}\}/g, data.primeiro_nome || data.nome_cliente?.split(' ')[0] || 'Cliente');
  result = result.replace(/\{\{nome_familiar\}\}/g, data.nome_familiar || data.nome_homenageado || 'seu familiar');
  result = result.replace(/\{\{nome_homenageado\}\}/g, data.nome_homenageado || data.nome_familiar || 'Homenageado');
  result = result.replace(/\{\{primeiro_nome_homenageado\}\}/g, data.primeiro_nome_homenageado || data.nome_homenageado?.split(' ')[0] || 'Homenageado');
  result = result.replace(/\{\{parentesco\}\}/g, data.parentesco || 'familiar');
  result = result.replace(/\{\{parentesco_possessivo\}\}/g, data.parentesco_possessivo || 'seu familiar');
  result = result.replace(/\{\{nome_empresa\}\}/g, company);
  result = result.replace(/\{\{ano_atual\}\}/g, currentYear);
  return result;
}

export function Calendar({ defaultTab = 'year' }: CalendarProps) {
  const [dates, setDates] = useState<CommemorativeDate[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'year' | 'agenda' | 'fixed'>(defaultTab);
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'BIRTHDAYS' | 'FIXED'>('ALL');

  // Copy Feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal para criar/editar data fixa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDate, setEditingDate] = useState<CommemorativeDate | null>(null);
  const [form, setForm] = useState({
    name: '',
    day: 1,
    month: 1,
    year: '',
    description: '',
    category: 'FIXED',
    targetAudience: 'ALL_CLIENTS',
    active: true,
  });

  // Modal de Envio Rápido de Aniversário (Item 3)
  const [selectedBirthday, setSelectedBirthday] = useState<UnifiedCalendarEvent | null>(null);
  const [isBirthdayModalOpen, setIsBirthdayModalOpen] = useState(false);
  const [birthdayChannel, setBirthdayChannel] = useState<'WHATSAPP' | 'EMAIL'>('WHATSAPP');

  // Modal de Disparo de Feriado / Data Fixa com Seleção de Clientes (Item 4)
  const [selectedHoliday, setSelectedHoliday] = useState<CommemorativeDate | null>(null);
  const [isHolidayBroadcastModalOpen, setIsHolidayBroadcastModalOpen] = useState(false);
  const [holidayChannel, setHolidayChannel] = useState<'WHATSAPP' | 'EMAIL'>('WHATSAPP');
  const [holidayAudienceFilter, setHolidayAudienceFilter] = useState<AudienceFilterKey>('AUTO');
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [holidaySearch, setHolidaySearch] = useState('');

  useEffect(() => {
    if (defaultTab) {
      setSelectedTab(defaultTab);
    }
  }, [defaultTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [datesData, upcomingData, clientsRes, tplsData] = await Promise.all([
        api.getDates(),
        api.getUpcomingEvents(60),
        api.getClients({ limit: 1000 }),
        api.getTemplates(),
      ]);
      setDates(Array.isArray(datesData) ? datesData : []);
      setUpcoming(Array.isArray(upcomingData) ? upcomingData : []);
      setTemplates(Array.isArray(tplsData) ? tplsData : []);

      const clientsList = Array.isArray(clientsRes)
        ? clientsRes
        : (clientsRes as any)?.data && Array.isArray((clientsRes as any).data)
        ? (clientsRes as any).data
        : [];
      setClients(clientsList);
    } catch (err) {
      console.error('Erro ao carregar dados do calendário:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Mesclar todas as datas comemorativas fixas + aniversários de clientes e familiares
  const unifiedEvents: UnifiedCalendarEvent[] = [];

  // 1. Inserir Datas Comemorativas Fixas
  dates.forEach((d) => {
    unifiedEvents.push({
      id: d.id,
      name: d.name,
      day: d.day,
      month: d.month,
      year: d.year,
      category: d.category as any,
      targetAudience: d.targetAudience,
      description: d.description,
      active: d.active,
      isCustomDate: true,
      rawDateObject: d,
    });
  });

  // 2. Inserir Aniversários de Clientes (Cadastrados Automaticamente)
  clients.forEach((c) => {
    if (c.birthDate) {
      const parsed = parseDayAndMonth(c.birthDate);
      if (parsed) {
        unifiedEvents.push({
          id: `client-${c.id}`,
          name: `Aniversário de ${c.name}`,
          day: parsed.day,
          month: parsed.month,
          category: 'CLIENT_BIRTHDAY',
          description: `Cliente Titular ${c.companyName ? `• ${c.companyName}` : ''}`,
          clientId: c.id,
          clientName: c.name,
          phone: c.phone,
          email: c.email,
        });
      }
    }

    // 3. Inserir Aniversários dos Familiares do Cliente
    if (c.familyMembers && Array.isArray(c.familyMembers)) {
      c.familyMembers.forEach((fm) => {
        if (fm.birthDate) {
          const parsedFm = parseDayAndMonth(fm.birthDate);
          if (parsedFm) {
            const relText = RELATIONSHIP_LABELS[fm.relationship] || 'Familiar';
            unifiedEvents.push({
              id: `family-${fm.id}`,
              name: `Aniversário de ${fm.name} (${relText})`,
              day: parsedFm.day,
              month: parsedFm.month,
              category: 'FAMILY_BIRTHDAY',
              description: `Familiar do cliente ${c.name}`,
              clientId: c.id,
              clientName: c.name,
              familyMemberId: fm.id,
              familyMemberName: fm.name,
              relationship: fm.relationship,
              phone: fm.phone || c.phone,
              email: fm.email || c.email,
            });
          }
        }
      });
    }
  });

  const handleOpenModal = (item?: CommemorativeDate, defaultMonth?: number, defaultDay?: number) => {
    if (item) {
      setEditingDate(item);
      setForm({
        name: item.name,
        day: item.day,
        month: item.month,
        year: item.year ? String(item.year) : '',
        description: item.description || '',
        category: item.category,
        targetAudience: item.targetAudience,
        active: item.active,
      });
    } else {
      setEditingDate(null);
      setForm({
        name: '',
        day: defaultDay || new Date().getDate(),
        month: defaultMonth || new Date().getMonth() + 1,
        year: '',
        description: '',
        category: 'FIXED',
        targetAudience: 'ALL_CLIENTS',
        active: true,
      });
    }
    setIsModalOpen(true);
  };

  // Abrir Modal de Envio Rápido de Aniversário (Item 3)
  const handleOpenBirthdayModal = (event: UnifiedCalendarEvent) => {
    setSelectedBirthday(event);
    setBirthdayChannel('WHATSAPP');
    setIsBirthdayModalOpen(true);
  };

  // Abrir Modal de Disparo de Feriado / Data Fixa (Item 4) com Filtro Inteligente de Público e Destinatários
  const handleOpenHolidayBroadcastModal = (dateObj: CommemorativeDate) => {
    setSelectedHoliday(dateObj);
    setHolidayChannel('WHATSAPP');
    setHolidayAudienceFilter('AUTO');

    // Auto-detectar público-alvo da data e selecionar apenas os destinatários correspondentes
    const detected = detectCommemorativeAudience(dateObj);
    const eligible = getEligibleBroadcastRecipients(clients, 'AUTO', detected.key);
    setSelectedClientIds(eligible.map((r) => r.id));
    setHolidaySearch('');
    setIsHolidayBroadcastModalOpen(true);
  };

  const handleAudienceFilterChange = (newKey: AudienceFilterKey) => {
    setHolidayAudienceFilter(newKey);
    if (selectedHoliday) {
      const detected = detectCommemorativeAudience(selectedHoliday);
      const eligible = getEligibleBroadcastRecipients(clients, newKey, detected.key);
      setSelectedClientIds(eligible.map((r) => r.id));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        name: form.name,
        day: Number(form.day),
        month: Number(form.month),
        year: form.year ? Number(form.year) : null,
        description: form.description,
        category: form.category,
        targetAudience: form.targetAudience,
        active: form.active,
      };

      if (editingDate) {
        await api.updateDate(editingDate.id, payload);
      } else {
        await api.createDate(payload);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar data comemorativa');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deseja remover a data "${name}"?`)) return;
    try {
      await api.deleteDate(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir data');
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Helper para gerar a matriz de dias de um mês específico
  const getMonthMatrix = (year: number, monthIndex: number) => {
    const firstDay = new Date(year, monthIndex, 1).getDay(); // 0 = Domingo
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const days: Array<{ day: number | null }> = [];
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ day: d });
    }
    return days;
  };

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'CLIENT_BIRTHDAY':
        return {
          badge: 'bg-amber-500 text-white shadow-amber-500/40 ring-2 ring-amber-300',
          card: 'bg-amber-50/95 text-amber-950 dark:bg-amber-950/70 dark:text-amber-200 border-amber-300 dark:border-amber-700/80',
          dot: 'bg-amber-500',
          tag: '🎂 Aniversário de Cliente',
          icon: Cake,
        };
      case 'FAMILY_BIRTHDAY':
        return {
          badge: 'bg-rose-500 text-white shadow-rose-500/40 ring-2 ring-rose-300',
          card: 'bg-rose-50/95 text-rose-950 dark:bg-rose-950/70 dark:text-rose-200 border-rose-300 dark:border-rose-700/80',
          dot: 'bg-rose-500',
          tag: '💐 Aniversário de Familiar',
          icon: Heart,
        };
      case 'FIXED':
        return {
          badge: 'bg-purple-600 text-white shadow-purple-600/30',
          card: 'bg-purple-50/90 text-purple-950 dark:bg-purple-950/70 dark:text-purple-200 border-purple-200 dark:border-purple-800/80',
          dot: 'bg-purple-600',
          tag: 'Feriado Nacional',
          icon: Star,
        };
      case 'CULTURAL':
        return {
          badge: 'bg-indigo-600 text-white shadow-indigo-600/30',
          card: 'bg-indigo-50/90 text-indigo-950 dark:bg-indigo-950/70 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800/80',
          dot: 'bg-indigo-600',
          tag: 'Comemorativa / Cultural',
          icon: Sparkles,
        };
      case 'CORPORATE':
        return {
          badge: 'bg-emerald-600 text-white shadow-emerald-600/30',
          card: 'bg-emerald-50/90 text-emerald-950 dark:bg-emerald-950/70 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800/80',
          dot: 'bg-emerald-600',
          tag: 'Corporativa / Clientes',
          icon: Briefcase,
        };
      default:
        return {
          badge: 'bg-slate-700 text-white shadow-slate-700/30',
          card: 'bg-slate-50 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700',
          dot: 'bg-slate-600',
          tag: 'Geral',
          icon: CalendarIcon,
        };
    }
  };

  const totalBirthdaysCount = unifiedEvents.filter(
    (e) => e.category === 'CLIENT_BIRTHDAY' || e.category === 'FAMILY_BIRTHDAY'
  ).length;

  // Obter texto renderizado de mensagem de aniversário
  const getBirthdayRenderedMessage = (event: UnifiedCalendarEvent, channel: 'WHATSAPP' | 'EMAIL') => {
    const isClient = event.category === 'CLIENT_BIRTHDAY';
    const eventType = isClient ? 'CLIENT_BIRTHDAY' : 'FAMILY_BIRTHDAY';

    const matchedTpl = templates.find((t) => t.eventType === eventType && t.channel === channel);

    const defaultContent = isClient
      ? channel === 'WHATSAPP'
        ? `Olá, {{primeiro_nome}}! 🎉🎂\n\nHoje é um dia muito especial! Toda a equipe da {{nome_empresa}} deseja a você um feliz aniversário, com muita saúde, paz, prosperidade e momentos inesquecíveis.\n\nÉ um imenso privilégio ter você como nosso cliente. Parabéns pelo seu dia! ✨🎈`
        : `Prezado(a) {{nome_cliente}},\n\nHoje é um dia de celebração! 🎂✨\n\nToda a equipe da {{nome_empresa}} deseja a você um Feliz Aniversário, com muita saúde e realizações!\n\nAtenciosamente,\nEquipe {{nome_empresa}}`
      : channel === 'WHATSAPP'
      ? `Olá, {{primeiro_nome}}! 💐🥳\n\nSoubemos que hoje {{parentesco_possessivo}}, {{nome_familiar}}, está celebrando mais um ano de vida!\n\nNós da {{nome_empresa}} queremos estender nossos mais afetuosos parabéns e desejar um dia maravilhoso para toda a sua família! 🥂✨`
      : `Olá, {{primeiro_nome}},\n\nFicamos muito felizes em saber que hoje é aniversário de {{parentesco_possessivo}}, {{nome_familiar}}! 🥳🎂\n\nDesejamos muitas felicidades e saúde para toda a família.\n\nUm grande abraço,\nEquipe {{nome_empresa}}`;

    const rawContent = matchedTpl?.content || defaultContent;
    const rawSubject = matchedTpl?.subject || `🎉 Feliz Aniversário da Equipe {{nome_empresa}}!`;

    const renderedBody = interpolateMessage(rawContent, {
      nome_cliente: event.clientName || 'Cliente',
      primeiro_nome: event.clientName?.split(' ')[0] || 'Cliente',
      nome_familiar: event.familyMemberName || 'Familiar',
      parentesco: event.relationship ? RELATIONSHIP_LABELS[event.relationship] : 'familiar',
      parentesco_possessivo: event.relationship ? RELATIONSHIP_POSSESSIVE[event.relationship] : 'seu familiar',
      nome_empresa: 'Enlace CRM',
      ano_atual: String(currentYear),
    });

    const renderedSubject = interpolateMessage(rawSubject, {
      nome_cliente: event.clientName || 'Cliente',
      primeiro_nome: event.clientName?.split(' ')[0] || 'Cliente',
      nome_familiar: event.familyMemberName || 'Familiar',
      nome_empresa: 'Enlace CRM',
      ano_atual: String(currentYear),
    });

    return { subject: renderedSubject, body: renderedBody };
  };

  // Obter texto renderizado de mensagem de Feriado / Data Comemorativa Fixa para um Destinatário (Cliente ou Familiar)
  const getHolidayRenderedMessage = (
    holiday: CommemorativeDate,
    recipient: BroadcastRecipient,
    channel: 'WHATSAPP' | 'EMAIL'
  ) => {
    const matchedTpl = templates.find(
      (t) =>
        t.eventType === 'FIXED_DATE' &&
        t.channel === channel &&
        (t.commemorativeDateId === holiday.id || t.name.toLowerCase().includes(holiday.name.toLowerCase()))
    );

    const isDirect = recipient.type === 'CLIENT' || recipient.isDirectContact;
    const targetFirstName = recipient.targetName.split(' ')[0];
    const clientFirstName = recipient.clientName.split(' ')[0];

    let defaultContent = '';
    let defaultSubject = `🌟 Votos de Feliz ${holiday.name} — {{nome_empresa}}`;

    if (recipient.type === 'CLIENT') {
      defaultContent =
        channel === 'WHATSAPP'
          ? `Olá, ${targetFirstName}! ✨\n\nNeste(a) *${holiday.name}*, a equipe da {{nome_empresa}} deseja a você muitas felicidades, reconhecimento e um dia maravilhoso!\n\nUm grande abraço!`
          : `Prezada(o) ${recipient.targetName},\n\nEm celebração ao(à) ${holiday.name}, a {{nome_empresa}} deseja a você um excelente dia, com harmonia e realizações.\n\nCordialmente,\nEquipe {{nome_empresa}}`;
    } else if (recipient.isDirectContact) {
      // Familiar com WhatsApp/contato direto
      defaultContent =
        channel === 'WHATSAPP'
          ? `Olá, ${targetFirstName}! ✨\n\nNeste(a) *${holiday.name}*, a equipe da {{nome_empresa}} deseja a você um dia especial, repleto de homenagens, saúde e alegrias!\n\nParabéns pelo seu dia!`
          : `Prezada(o) ${recipient.targetName},\n\nEm celebração ao(à) ${holiday.name}, a {{nome_empresa}} envia a você votos de muita saúde, paz e realizações.\n\nCordialmente,\nEquipe {{nome_empresa}}`;
    } else {
      // Familiar sem WhatsApp cadastrado (enviando pelo WhatsApp do cliente titular)
      defaultContent =
        channel === 'WHATSAPP'
          ? `Olá, ${clientFirstName}! ✨\n\nNeste(a) *${holiday.name}*, a equipe da {{nome_empresa}} pede licença para enviar um carinhoso abraço e felicitações especiais para sua *${recipient.relationshipLabel.toLowerCase()}*, *${recipient.targetName}*! 🎉\n\nQue a família de vocês tenha um dia muito especial!`
          : `Prezado(a) ${recipient.clientName},\n\nEm celebração ao(à) ${holiday.name}, a {{nome_empresa}} envia votos afetuosos para sua ${recipient.relationshipLabel.toLowerCase()}, ${recipient.targetName}.\n\nCordialmente,\nEquipe {{nome_empresa}}`;
      defaultSubject = `🌟 Feliz ${holiday.name} para sua ${recipient.relationshipLabel} — {{nome_empresa}}`;
    }

    const rawContent = matchedTpl?.content || defaultContent;
    const rawSubject = matchedTpl?.subject || defaultSubject;

    const renderedBody = interpolateMessage(rawContent, {
      nome_cliente: recipient.clientName,
      primeiro_nome: clientFirstName,
      nome_homenageado: recipient.targetName,
      primeiro_nome_homenageado: targetFirstName,
      parentesco: recipient.relationshipLabel,
      nome_empresa: 'Enlace CRM',
      ano_atual: String(currentYear),
    });

    const renderedSubject = interpolateMessage(rawSubject, {
      nome_cliente: recipient.clientName,
      primeiro_nome: clientFirstName,
      nome_homenageado: recipient.targetName,
      primeiro_nome_homenageado: targetFirstName,
      parentesco: recipient.relationshipLabel,
      nome_empresa: 'Enlace CRM',
      ano_atual: String(currentYear),
    });

    return { subject: renderedSubject, body: renderedBody };
  };

  // Disparar WhatsApp Web / App
  const handleOpenWhatsApp = (phone: string, text: string) => {
    let clean = phone.replace(/\D/g, '');
    if (!clean.startsWith('55') && clean.length <= 11) {
      clean = '55' + clean;
    }
    const url = `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Disparar Cliente de E-mail
  const handleOpenEmail = (email: string, subject: string, body: string) => {
    const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, '_blank');
  };

  // Detecção de público-alvo da data selecionada
  const detectedHolidayAudience = selectedHoliday ? detectCommemorativeAudience(selectedHoliday) : null;
  
  // Obter destinatários elegíveis para o público ativo
  const audienceEligibleRecipients = getEligibleBroadcastRecipients(
    clients,
    holidayAudienceFilter,
    detectedHolidayAudience?.key
  );

  // Filtrar destinatários na modal de feriado (combinando público-alvo e texto de busca)
  const filteredBroadcastRecipients = audienceEligibleRecipients.filter((r) => {
    if (!holidaySearch) return true;
    const s = holidaySearch.toLowerCase();
    return (
      r.targetName.toLowerCase().includes(s) ||
      r.clientName.toLowerCase().includes(s) ||
      (r.phone && r.phone.includes(s)) ||
      (r.email && r.email.toLowerCase().includes(s)) ||
      r.relationshipLabel.toLowerCase().includes(s)
    );
  });

  const handleToggleSelectAllRecipients = () => {
    const visibleIds = filteredBroadcastRecipients.map((r) => r.id);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedClientIds.includes(id));
    if (allVisibleSelected) {
      setSelectedClientIds(selectedClientIds.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedClientIds(Array.from(new Set([...selectedClientIds, ...visibleIds])));
    }
  };

  const handleToggleRecipient = (id: string) => {
    if (selectedClientIds.includes(id)) {
      setSelectedClientIds(selectedClientIds.filter((item) => item !== id));
    } else {
      setSelectedClientIds([...selectedClientIds, id]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <CalendarDays className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Datas Comemorativas & Calendário Anual
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Calendário completo com feriados, datas comemorativas e **aniversários preenchidos automaticamente com envio facilitado via WhatsApp e E-mail**.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl flex items-center shadow-sm">
            <button
              onClick={() => setSelectedTab('year')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedTab === 'year'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" /> Calendário Anual
            </button>
            <button
              onClick={() => setSelectedTab('agenda')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedTab === 'agenda'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Agenda 60 Dias
            </button>
            <button
              onClick={() => setSelectedTab('fixed')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedTab === 'fixed'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <List className="w-3.5 h-3.5" /> Datas Fixas ({dates.length})
            </button>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" /> Nova Data Comemorativa
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 1. VISÃO: CALENDÁRIO ANUAL DOS 12 MESES (COM BOTÕES FACILITADORES) */}
      {/* ==================================================================== */}
      {selectedTab === 'year' && (
        <div className="space-y-6">
          {/* Year Navigator, Filters & Legend */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4 transition-colors">
            {/* Year Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentYear((prev) => prev - 1)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                {currentYear}
              </span>
              <button
                onClick={() => setCurrentYear((prev) => prev + 1)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => loadData()}
                title="Atualizar dados do calendário"
                className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Event Category Filter Buttons */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setCategoryFilter('ALL')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  categoryFilter === 'ALL'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Todos ({unifiedEvents.length})
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('BIRTHDAYS')}
                className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  categoryFilter === 'BIRTHDAYS'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-amber-600'
                }`}
              >
                🎂 Aniversários ({totalBirthdaysCount})
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('FIXED')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  categoryFilter === 'FIXED'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-purple-600'
                }`}
              >
                📅 Feriados & Fixas ({dates.length})
              </button>
            </div>

            {/* Legenda de Categorias */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
              <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800">
                <span className="w-2 h-2 rounded-full bg-amber-500 shadow-xs"></span> Aniversários de Clientes
              </span>
              <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-800">
                <span className="w-2 h-2 rounded-full bg-rose-500 shadow-xs"></span> Familiares
              </span>
              <span className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-lg border border-purple-200 dark:border-purple-800">
                <span className="w-2 h-2 rounded-full bg-purple-600 shadow-xs"></span> Feriados / Fixas
              </span>
            </div>
          </div>

          {/* Grade dos 12 Meses (3x4 ou 4x3) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {MONTHS_PT.map((monthName, monthIndex) => {
              const monthNum = monthIndex + 1;

              // Filtrar eventos do mês atual
              const monthEvents = unifiedEvents
                .filter((d) => {
                  if (d.month !== monthNum) return false;
                  if (d.year && d.year !== currentYear) return false;
                  if (categoryFilter === 'BIRTHDAYS') {
                    return d.category === 'CLIENT_BIRTHDAY' || d.category === 'FAMILY_BIRTHDAY';
                  }
                  if (categoryFilter === 'FIXED') {
                    return d.category !== 'CLIENT_BIRTHDAY' && d.category !== 'FAMILY_BIRTHDAY';
                  }
                  return true;
                })
                .sort((a, b) => a.day - b.day);

              const matrix = getMonthMatrix(currentYear, monthIndex);

              return (
                <div
                  key={monthName}
                  className="p-4 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm flex flex-col justify-between transition-all group"
                >
                  <div>
                    {/* Month Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-3">
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>
                        {monthName}
                      </h3>

                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80">
                        {monthEvents.length} evento{monthEvents.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    {/* Mini Calendar Grid Matrix */}
                    <div className="mb-3 bg-slate-50 dark:bg-slate-950/70 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                      {/* Weekday headers */}
                      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1">
                        {WEEKDAYS_SHORT.map((wd, i) => (
                          <span key={i} className={i === 0 ? 'text-rose-400' : ''}>
                            {wd}
                          </span>
                        ))}
                      </div>

                      {/* Day cells */}
                      <div className="grid grid-cols-7 gap-1 text-center text-xs">
                        {matrix.map((cell, idx) => {
                          if (cell.day === null) {
                            return <span key={idx} className="h-6"></span>;
                          }

                          const hasEvent = monthEvents.find((e) => e.day === cell.day);
                          const isToday =
                            new Date().getDate() === cell.day &&
                            new Date().getMonth() === monthIndex &&
                            new Date().getFullYear() === currentYear;

                          const theme = hasEvent ? getCategoryTheme(hasEvent.category) : null;

                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                if (hasEvent) {
                                  if (hasEvent.isCustomDate && hasEvent.rawDateObject) {
                                    handleOpenHolidayBroadcastModal(hasEvent.rawDateObject);
                                  } else {
                                    handleOpenBirthdayModal(hasEvent);
                                  }
                                } else {
                                  handleOpenModal(undefined, monthNum, cell.day || undefined);
                                }
                              }}
                              title={
                                hasEvent
                                  ? `${cell.day}/${monthNum} - ${hasEvent.name}`
                                  : `Criar data em ${cell.day}/${monthNum}`
                              }
                              className={`h-6 w-full rounded-md text-[11px] font-bold flex items-center justify-center transition-all ${
                                hasEvent && theme
                                  ? `${theme.badge} shadow-xs hover:scale-110 font-extrabold`
                                  : isToday
                                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                              }`}
                            >
                              {cell.day}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Preenchimento das Comemorações & Aniversários do Mês */}
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Comemorações de {monthName}:
                      </div>

                      {monthEvents.length === 0 ? (
                        <div className="text-xs text-slate-400 italic py-2 text-center">
                          Nenhum evento neste mês.
                        </div>
                      ) : (
                        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                          {monthEvents.map((evt) => {
                            const theme = getCategoryTheme(evt.category);
                            const isBirthday = evt.category === 'CLIENT_BIRTHDAY' || evt.category === 'FAMILY_BIRTHDAY';

                            return (
                              <button
                                key={evt.id}
                                type="button"
                                onClick={() => {
                                  if (isBirthday) {
                                    handleOpenBirthdayModal(evt);
                                  } else if (evt.rawDateObject) {
                                    handleOpenHolidayBroadcastModal(evt.rawDateObject);
                                  }
                                }}
                                className={`w-full p-2 rounded-xl border text-left text-xs transition-all hover:scale-[1.01] flex items-start gap-2 shadow-xs ${theme.card} group/btn`}
                              >
                                <span className="font-mono font-black text-[11px] shrink-0 bg-white/80 dark:bg-slate-900/90 px-1.5 py-0.5 rounded-lg border border-current shadow-xs">
                                  {String(evt.day).padStart(2, '0')}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <div className="font-bold truncate text-[11px] flex items-center justify-between gap-1">
                                    <span className="truncate">{evt.name}</span>
                                    <span className="shrink-0 text-[10px] opacity-0 group-hover/btn:opacity-100 transition-opacity text-indigo-600 dark:text-indigo-400 font-extrabold">
                                      {isBirthday ? 'Enviar ➔' : 'Disparo ➔'}
                                    </span>
                                  </div>
                                  <div className="text-[10px] opacity-75 truncate">{theme.tag}</div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Add event button inside month */}
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleOpenModal(undefined, monthNum)}
                      className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Adicionar em {monthName}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. VISÃO: AGENDA PRÓXIMOS 60 DIAS (LINHA DO TEMPO) */}
      {/* ==================================================================== */}
      {selectedTab === 'agenda' && (
        <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 transition-colors">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Linha do Tempo de Felicitações (Próximos 60 Dias)
          </h3>

          {loading ? (
            <div className="py-12 text-center text-slate-400">Calculando datas e aniversários...</div>
          ) : upcoming.length === 0 ? (
            <div className="py-12 text-center text-slate-400">Nenhum evento previsto para os próximos 60 dias.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcoming.map((evt, idx) => {
                const isBirthday = evt.type === 'CLIENT_BIRTHDAY' || evt.type === 'FAMILY_BIRTHDAY';
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      evt.isToday
                        ? 'bg-indigo-50 dark:bg-gradient-to-br dark:from-indigo-950/80 dark:to-slate-900 border-indigo-300 dark:border-indigo-500/50 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-center w-14 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
                        <span className="block text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                          {MONTHS_PT[evt.month - 1].substring(0, 3)}
                        </span>
                        <span className="block text-lg font-extrabold text-slate-900 dark:text-white">
                          {String(evt.day).padStart(2, '0')}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <EventTypeBadge type={evt.type} />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{evt.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{evt.subtitle}</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400 font-semibold">
                        {evt.isToday ? '🔥 Acontece Hoje!' : `Em ${evt.daysRemaining} dias`}
                      </span>
                      <span className="text-[11px] text-indigo-600 dark:text-indigo-300 font-bold">
                        {isBirthday ? 'Aniversário' : 'Data Fixa'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. VISÃO: LISTA DE DATAS FIXAS CADASTRADAS (CARDS) */}
      {/* ==================================================================== */}
      {selectedTab === 'fixed' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dates.map((item) => {
            const theme = getCategoryTheme(item.category);
            return (
              <div
                key={item.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-center w-12 py-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                        {MONTHS_PT[item.month - 1].substring(0, 3)}
                      </span>
                      <span className="block text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                        {String(item.day).padStart(2, '0')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenHolidayBroadcastModal(item)}
                        title="Disparar para Clientes"
                        className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenModal(item)}
                        title="Editar data"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        title="Excluir data"
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${theme.card}`}>
                      {theme.tag}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{item.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {item.description || 'Sem descrição informada.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
                  <button
                    type="button"
                    onClick={() => handleOpenHolidayBroadcastModal(item)}
                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 text-xs"
                  >
                    <Send className="w-3.5 h-3.5" /> Disparar para Clientes
                  </button>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.active
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {item.active ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 1: CRIAR / EDITAR DATA COMEMORATIVA */}
      {/* ==================================================================== */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDate ? 'Editar Data Comemorativa' : 'Nova Data Comemorativa'}
        subtitle="Cadastre uma data fixa de calendário para parabenizar seus clientes"
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nome da Data *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Dia das Mães, Dia do Cliente, Natal"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Dia *</label>
              <input
                type="number"
                min="1"
                max="31"
                required
                value={form.day}
                onChange={(e) => setForm({ ...form, day: Number(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Mês *</label>
              <select
                value={form.month}
                onChange={(e) => setForm({ ...form, month: Number(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none"
              >
                {MONTHS_PT.map((m, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1} - {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Categoria
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none"
            >
              <option value="FIXED">Feriado Nacional / Oficial</option>
              <option value="CULTURAL">Comemorativa / Familiar / Cultural</option>
              <option value="CORPORATE">Corporativa / Relacionamento com Clientes</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Ano Específico (Opcional - deixe vazio para recorrente anual)
            </label>
            <input
              type="number"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              placeholder="Ex: 2026 (ou em branco para todos os anos)"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Votos e contexto da celebração..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="activeDate"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
            />
            <label htmlFor="activeDate" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer font-semibold">
              Data comemorativa ativa no motor de automação
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30"
            >
              {editingDate ? 'Atualizar Data' : 'Salvar Data'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ==================================================================== */}
      {/* MODAL 2: ENVIAR MENSAGEM DE ANIVERSÁRIO (FACILITADOR WHATSAPP & E-MAIL - ITEM 3) */}
      {/* ==================================================================== */}
      <Modal
        isOpen={isBirthdayModalOpen}
        onClose={() => setIsBirthdayModalOpen(false)}
        title="Enviar Felicitações de Aniversário"
        subtitle="Mensagem personalizada pronta para envio imediato"
        maxWidth="lg"
      >
        {selectedBirthday && (() => {
          const msg = getBirthdayRenderedMessage(selectedBirthday, birthdayChannel);
          const hasPhone = Boolean(selectedBirthday.phone);
          const hasEmail = Boolean(selectedBirthday.email);

          return (
            <div className="space-y-4">
              {/* Header do aniversariante */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-extrabold text-xl shrink-0 shadow-md shadow-amber-500/30">
                    🎂
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {selectedBirthday.name}
                    </h4>
                    <p className="text-xs text-amber-800 dark:text-amber-300 font-semibold">
                      Dia {String(selectedBirthday.day).padStart(2, '0')} de {MONTHS_PT[selectedBirthday.month - 1]}
                      {selectedBirthday.clientName && ` • Cliente: ${selectedBirthday.clientName}`}
                    </p>
                  </div>
                </div>

                {/* Channel Selector */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/80">
                  <button
                    type="button"
                    onClick={() => setBirthdayChannel('WHATSAPP')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                      birthdayChannel === 'WHATSAPP'
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => setBirthdayChannel('EMAIL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                      birthdayChannel === 'EMAIL'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" /> E-mail
                  </button>
                </div>
              </div>

              {/* Subject if email */}
              {birthdayChannel === 'EMAIL' && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                  <strong className="text-slate-500">Assunto:</strong>{' '}
                  <span className="font-bold text-slate-900 dark:text-slate-100">{msg.subject}</span>
                </div>
              )}

              {/* Message Preview Box */}
              <div>
                <div className="flex items-center justify-between mb-1 text-xs">
                  <span className="font-bold text-slate-600 dark:text-slate-400">Mensagem Pronta:</span>
                  <button
                    type="button"
                    onClick={() => handleCopyText(msg.body, 'bday-copy')}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                  >
                    {copiedId === 'bday-copy' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedId === 'bday-copy' ? 'Copiado!' : 'Copiar Texto'}
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-line font-mono leading-relaxed max-h-60 overflow-y-auto">
                  {msg.body}
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBirthdayModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  Fechar
                </button>

                {birthdayChannel === 'WHATSAPP' ? (
                  <button
                    type="button"
                    disabled={!hasPhone}
                    onClick={() => handleOpenWhatsApp(selectedBirthday.phone!, msg.body)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {hasPhone ? `Enviar no WhatsApp (${selectedBirthday.phone})` : 'Telefone não informado'}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!hasEmail}
                    onClick={() => handleOpenEmail(selectedBirthday.email!, msg.subject, msg.body)}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    <Mail className="w-4 h-4" />
                    {hasEmail ? `Enviar E-mail (${selectedBirthday.email})` : 'E-mail não informado'}
                  </button>
                )}
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* ==================================================================== */}
      {/* MODAL 3: DISPARO DE FERIADO / DATA FIXA COM SELEÇÃO DE CLIENTES (ITEM 4) */}
      {/* ==================================================================== */}
      <Modal
        isOpen={isHolidayBroadcastModalOpen}
        onClose={() => setIsHolidayBroadcastModalOpen(false)}
        title={`Felicitações: ${selectedHoliday?.name}`}
        subtitle="Selecione os clientes para enviar mensagens personalizadas deste feriado ou data comemorativa"
        maxWidth="3xl"
      >
        {selectedHoliday && (
          <div className="space-y-4">
            {/* Header info & channel switcher */}
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Data Comemorativa / Feriado
                </span>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Star className="w-4 h-4 text-purple-600" /> {selectedHoliday.name} (Dia {String(selectedHoliday.day).padStart(2, '0')}/{String(selectedHoliday.month).padStart(2, '0')})
                </h4>
              </div>

              {/* Channel Selector */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/80">
                <button
                  type="button"
                  onClick={() => setHolidayChannel('WHATSAPP')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    holidayChannel === 'WHATSAPP'
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setHolidayChannel('EMAIL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    holidayChannel === 'EMAIL'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" /> E-mail
                </button>
              </div>
            </div>

            {/* Smart Audience Filter Banner */}
            {detectedHolidayAudience && (
              <div className={`p-3.5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${detectedHolidayAudience.badgeColor}`}>
                <div className="flex items-center gap-2.5">
                  <span className="text-xl shrink-0">{detectedHolidayAudience.iconText}</span>
                  <div>
                    <div className="text-xs font-black flex items-center gap-1.5">
                      <span>Filtro Automático de Público:</span>
                      <span className="underline underline-offset-2">{detectedHolidayAudience.label}</span>
                      <span className="text-[11px] font-normal opacity-80">({audienceEligibleRecipients.length} homenageados elegíveis)</span>
                    </div>
                    <p className="text-[11px] opacity-90 mt-0.5">
                      {detectedHolidayAudience.description}
                    </p>
                  </div>
                </div>

                {/* Audience Switcher Dropdown */}
                <div className="flex items-center gap-2 shrink-0">
                  <label className="text-[11px] font-bold opacity-80 flex items-center gap-1">
                    <Filter className="w-3 h-3" /> Filtrar:
                  </label>
                  <select
                    value={holidayAudienceFilter}
                    onChange={(e) => handleAudienceFilterChange(e.target.value as any)}
                    className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-1 px-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 outline-none shadow-xs"
                  >
                    <option value="AUTO">🤖 Automático ({detectedHolidayAudience.label})</option>
                    <option value="MOTHERS_ONLY">🌸 Apenas Mães</option>
                    <option value="FATHERS_ONLY">👔 Apenas Pais</option>
                    <option value="WOMEN_ONLY">💐 Apenas Mulheres</option>
                    <option value="MEN_ONLY">🎩 Apenas Homens</option>
                    <option value="PARENTS_ONLY">👨‍👩‍👧 Pais com Filhos</option>
                    <option value="CORPORATE_ONLY">🏢 Clientes Corporativos / PJ</option>
                    <option value="ALL">🌐 Toda a Base</option>
                  </select>
                </div>
              </div>
            )}

            {/* Recipients Selection Controls & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleSelectAllRecipients}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {filteredBroadcastRecipients.length > 0 &&
                  filteredBroadcastRecipients.every((r) => selectedClientIds.includes(r.id))
                    ? 'Desmarcar Filtrados'
                    : 'Selecionar Filtrados'}
                </button>
                <span className="text-xs font-bold text-slate-500">
                  {selectedClientIds.length} selecionado(s) de {filteredBroadcastRecipients.length} homenageado(s)
                </span>
              </div>

              {/* Search recipients */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={holidaySearch}
                  onChange={(e) => setHolidaySearch(e.target.value)}
                  placeholder="Buscar familiar ou cliente..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-1.5 pl-8 pr-3 text-xs text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>
            </div>

            {/* Recipients Table with Individual Sending Action */}
            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-80 overflow-y-auto">
              {filteredBroadcastRecipients.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 space-y-1">
                  <p className="font-bold text-slate-600 dark:text-slate-300">Nenhum homenageado atende aos critérios do filtro atual.</p>
                  <p className="text-[11px]">Você pode alterar a opção de público no seletor acima ou cadastrar novos contatos.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200/80 dark:divide-slate-800/80">
                  {filteredBroadcastRecipients.map((recipient) => {
                    const isSelected = selectedClientIds.includes(recipient.id);
                    const msg = getHolidayRenderedMessage(selectedHoliday, recipient, holidayChannel);
                    const hasPhone = Boolean(recipient.phone);
                    const hasEmail = Boolean(recipient.email);

                    return (
                      <div
                        key={recipient.id}
                        className={`p-3.5 flex items-center justify-between gap-3 transition-colors ${
                          isSelected ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : 'opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleRecipient(recipient.id)}
                            className="w-4 h-4 rounded text-indigo-600 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 cursor-pointer shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate flex items-center gap-1.5 flex-wrap">
                              <span>{recipient.targetName}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${recipient.badgeColor || 'bg-indigo-100 text-indigo-800'}`}>
                                {recipient.matchReason}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {recipient.type === 'FAMILY_MEMBER' ? (
                                <span>
                                  Familiar de <strong className="font-semibold text-slate-700 dark:text-slate-300">{recipient.clientName}</strong>
                                  {' • '}
                                  {recipient.isDirectContact ? (
                                    <span>WhatsApp Direto: {recipient.phone}</span>
                                  ) : (
                                    <span>Enviar via {recipient.clientName} ({recipient.phone || 'Sem Telefone'})</span>
                                  )}
                                </span>
                              ) : (
                                <span>
                                  Cliente Titular • {holidayChannel === 'WHATSAPP' ? recipient.phone || 'Sem WhatsApp' : recipient.email || 'Sem E-mail'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Individual Quick Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopyText(msg.body, `h-${recipient.id}`)}
                            title="Copiar mensagem"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                          >
                            {copiedId === `h-${recipient.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {holidayChannel === 'WHATSAPP' ? (
                            <button
                              type="button"
                              disabled={!hasPhone}
                              onClick={() => handleOpenWhatsApp(recipient.phone!, msg.body)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-[11px] font-bold text-white shadow-md shadow-emerald-600/20 flex items-center gap-1 transition-all disabled:opacity-40"
                            >
                              <MessageCircle className="w-3.5 h-3.5" /> Enviar WhatsApp
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={!hasEmail}
                              onClick={() => handleOpenEmail(recipient.email!, msg.subject, msg.body)}
                              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-[11px] font-bold text-white shadow-md shadow-indigo-600/20 flex items-center gap-1 transition-all disabled:opacity-40"
                            >
                              <Mail className="w-3.5 h-3.5" /> Enviar E-mail
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  const allMsgs = filteredBroadcastRecipients
                    .filter((r) => selectedClientIds.includes(r.id))
                    .map((r) => {
                      const m = getHolidayRenderedMessage(selectedHoliday, r, holidayChannel);
                      return `=== [${r.targetName} (${r.relationshipLabel}) - ${r.phone || r.email || ''}] ===\n${m.body}\n`;
                    })
                    .join('\n');
                  handleCopyText(allMsgs, 'copy-all-broadcast');
                }}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                {copiedId === 'copy-all-broadcast' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copiedId === 'copy-all-broadcast'
                  ? 'Todas as mensagens copiadas!'
                  : 'Copiar Mensagens de Todos Selecionados'}
              </button>

              <button
                type="button"
                onClick={() => setIsHolidayBroadcastModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Concluir
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
