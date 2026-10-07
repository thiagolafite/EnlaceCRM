import { useEffect, useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  Clock,
  ChevronLeft,
  ChevronRight,
  Heart,
  Briefcase,
  Star,
  List,
  RefreshCw,
  Cake,
  MessageCircle,
  Mail,
  Copy,
  Search,
  Check,
  Send,
  Filter,
} from 'lucide-react';
import { api } from '../services/api';
import { CommemorativeDate, UpcomingEvent, Client, MessageTemplate } from '../types';
import { Modal } from '../components/Modal';
import { EventTypeBadge } from '../components/Badge';
import { ErrorBanner } from '../components/ErrorBanner';
import {
  detectCommemorativeAudience,
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

export function Calendar({ defaultTab = 'year' }: CalendarProps) {
  const [dates, setDates] = useState<CommemorativeDate[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingEvent[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'year' | 'fixed' | 'agenda'>(defaultTab);

  // Estados de Erro Direcionais
  const [pageError, setPageError] = useState<{ message: string; solution?: string } | null>(null);
  const [modalError, setModalError] = useState<{ message: string; solution?: string } | null>(null);

  // Filtros do Calendário Anual
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'BIRTHDAYS' | 'FIXED'>('ALL');

  // Modal State para Criar/Editar Data Comemorativa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDate, setEditingDate] = useState<CommemorativeDate | null>(null);
  const [form, setForm] = useState({
    name: '',
    day: 1,
    month: 1,
    year: '',
    description: '',
    category: 'FIXED',
    targetAudience: 'ALL',
    active: true,
  });

  // Modal State para Enviar Mensagem de Aniversário (Facilitador do Item 3)
  const [isBirthdayModalOpen, setIsBirthdayModalOpen] = useState(false);
  const [selectedBirthday, setSelectedBirthday] = useState<UnifiedCalendarEvent | null>(null);
  const [birthdayChannel, setBirthdayChannel] = useState<'WHATSAPP' | 'EMAIL'>('WHATSAPP');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State para Disparo em Massa de Feriado/Data Comemorativa (Facilitador do Item 4)
  const [isHolidayBroadcastModalOpen, setIsHolidayBroadcastModalOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<CommemorativeDate | null>(null);
  const [holidayChannel, setHolidayChannel] = useState<'WHATSAPP' | 'EMAIL'>('WHATSAPP');
  const [holidayAudienceFilter, setHolidayAudienceFilter] = useState<AudienceFilterKey>('AUTO');
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [holidaySearch, setHolidaySearch] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setPageError(null);
      const [datesData, upcomingData, clientsRes, templatesData] = await Promise.all([
        api.getDates(),
        api.getUpcomingEvents(60),
        api.getClients({ status: 'ACTIVE', limit: 500 }),
        api.getTemplates(),
      ]);
      setDates(Array.isArray(datesData) ? datesData : []);
      setUpcoming(Array.isArray(upcomingData) ? upcomingData : []);
      const clientList = Array.isArray(clientsRes)
        ? clientsRes
        : Array.isArray((clientsRes as any)?.data)
        ? (clientsRes as any).data
        : [];
      setClients(clientList);
      setTemplates(Array.isArray(templatesData) ? templatesData : []);
    } catch (err: any) {
      console.error('Erro ao carregar dados do calendário:', err);
      setPageError({
        message: err.message || 'Erro ao carregar dados do calendário.',
        solution: err.solution || 'Verifique sua conexão e tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Construir lista unificada de eventos para os 12 meses
  const unifiedEvents: UnifiedCalendarEvent[] = [];

  dates.forEach((d) => {
    if (d.active !== false) {
      unifiedEvents.push({
        id: `date-${d.id}`,
        name: d.name,
        day: d.day,
        month: d.month,
        year: d.year,
        category: (d.category as any) || 'FIXED',
        targetAudience: d.targetAudience || 'ALL',
        description: d.description,
        active: d.active,
        isCustomDate: true,
        rawDateObject: d,
      });
    }
  });

  clients.forEach((c) => {
    if (c.birthDate) {
      const parts = c.birthDate.split('T')[0].split('-');
      if (parts.length >= 3) {
        const bMonth = Number(parts[1]);
        const bDay = Number(parts[2]);
        unifiedEvents.push({
          id: `client-bday-${c.id}`,
          name: `Aniversário: ${c.name}`,
          day: bDay,
          month: bMonth,
          category: 'CLIENT_BIRTHDAY',
          clientId: c.id,
          clientName: c.name,
          phone: c.phone,
          email: c.email,
        });
      }
    }

    if (Array.isArray(c.familyMembers)) {
      c.familyMembers.forEach((fm) => {
        if (fm.birthDate) {
          const parts = fm.birthDate.split('T')[0].split('-');
          if (parts.length >= 3) {
            const bMonth = Number(parts[1]);
            const bDay = Number(parts[2]);
            const relLabel = RELATIONSHIP_LABELS[fm.relationship] || 'Familiar';
            unifiedEvents.push({
              id: `family-bday-${fm.id}`,
              name: `${fm.name} (${relLabel})`,
              day: bDay,
              month: bMonth,
              category: 'FAMILY_BIRTHDAY',
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

  const handleOpenModal = (dateToEdit?: CommemorativeDate, prefillMonth?: number, prefillDay?: number) => {
    setModalError(null);
    if (dateToEdit) {
      setEditingDate(dateToEdit);
      setForm({
        name: dateToEdit.name,
        day: dateToEdit.day,
        month: dateToEdit.month,
        year: dateToEdit.year ? String(dateToEdit.year) : '',
        description: dateToEdit.description || '',
        category: dateToEdit.category,
        targetAudience: dateToEdit.targetAudience || 'ALL',
        active: dateToEdit.active !== false,
      });
    } else {
      setEditingDate(null);
      setForm({
        name: '',
        day: prefillDay || 1,
        month: prefillMonth || 1,
        year: '',
        description: '',
        category: 'FIXED',
        targetAudience: 'ALL',
        active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenBirthdayModal = (event: UnifiedCalendarEvent) => {
    setSelectedBirthday(event);
    setBirthdayChannel('WHATSAPP');
    setIsBirthdayModalOpen(true);
  };

  const handleOpenHolidayBroadcastModal = (dateObj: CommemorativeDate) => {
    setSelectedHoliday(dateObj);
    setHolidayChannel('WHATSAPP');
    setHolidayAudienceFilter('AUTO');
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
    setModalError(null);
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
      setModalError({
        message: err.message || 'Erro ao salvar data comemorativa.',
        solution: err.solution || 'Verifique se o dia e mês foram informados corretamente.',
      });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deseja remover a data "${name}"?`)) return;
    try {
      setPageError(null);
      await api.deleteDate(id);
      await loadData();
    } catch (err: any) {
      setPageError({
        message: err.message || 'Erro ao excluir data comemorativa.',
        solution: err.solution || 'Verifique se você possui permissão de administrador.',
      });
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getMonthMatrix = (year: number, monthIndex: number) => {
    const firstDay = new Date(year, monthIndex, 1).getDay();
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
          badge: 'bg-[#E54833] text-white',
          card: 'bg-white/80 dark:bg-[#202126] text-[#18191D] dark:text-[#F4F4F6] border border-[#E54833]/40',
          dot: 'bg-[#E54833]',
          tag: '🎂 Aniversário Cliente',
          icon: Cake,
        };
      case 'FAMILY_BIRTHDAY':
        return {
          badge: 'bg-[#EEEEF1] text-[#18191D] dark:bg-[#24252B] dark:text-[#F4F4F6] border border-[#D7D7DD] dark:border-[#292A30]',
          card: 'bg-white/70 dark:bg-[#202126] text-[#18191D] dark:text-[#F4F4F6] border border-[#E2E2E8] dark:border-[#292A30]',
          dot: 'bg-[#686971]',
          tag: '💐 Aniversário Familiar',
          icon: Heart,
        };
      case 'FIXED':
        return {
          badge: 'bg-[#18191D] text-[#F4F4F6] dark:bg-[#F4F4F6] dark:text-[#18191D]',
          card: 'bg-white/70 dark:bg-[#202126] text-[#18191D] dark:text-[#F4F4F6] border border-[#E2E2E8] dark:border-[#292A30]',
          dot: 'bg-[#18191D] dark:bg-[#F4F4F6]',
          tag: 'Feriado Nacional',
          icon: Star,
        };
      case 'CULTURAL':
        return {
          badge: 'bg-[#EEEEF1] text-[#686971] dark:bg-[#24252B] dark:text-[#BFC0C7] border border-[#D7D7DD] dark:border-[#292A30]',
          card: 'bg-white/70 dark:bg-[#202126] text-[#686971] dark:text-[#BFC0C7] border border-[#E2E2E8] dark:border-[#292A30]',
          dot: 'bg-[#686971]',
          tag: 'Cultural / Celebrativa',
          icon: Sparkles,
        };
      case 'CORPORATE':
        return {
          badge: 'bg-[#1F6FEB] text-white',
          card: 'bg-white/70 dark:bg-[#202126] text-[#1F6FEB] dark:text-[#58A6FF] border border-[#1F6FEB]/30',
          dot: 'bg-[#1F6FEB]',
          tag: 'Corporativa',
          icon: Briefcase,
        };
      default:
        return {
          badge: 'bg-[#EEEEF1] text-[#686971] dark:bg-[#24252B] dark:text-[#BFC0C7]',
          card: 'bg-white/70 dark:bg-[#202126] text-[#686971] dark:text-[#BFC0C7] border border-[#E2E2E8] dark:border-[#292A30]',
          dot: 'bg-[#686971]',
          tag: 'Geral',
          icon: CalendarIcon,
        };
    }
  };

  const totalBirthdaysCount = unifiedEvents.filter(
    (e) => e.category === 'CLIENT_BIRTHDAY' || e.category === 'FAMILY_BIRTHDAY'
  ).length;

  const getBirthdayRenderedMessage = (event: UnifiedCalendarEvent, channel: 'WHATSAPP' | 'EMAIL') => {
    const isClient = event.category === 'CLIENT_BIRTHDAY';
    const eventType = isClient ? 'CLIENT_BIRTHDAY' : 'FAMILY_BIRTHDAY';

    const matchedTpl = templates.find((t) => t.eventType === eventType && t.channel === channel);

    const birthdayPersonName = isClient
      ? (event.clientName || 'Cliente')
      : (event.familyMemberName || 'Familiar');
    const birthdayFirstName = birthdayPersonName.split(' ')[0];

    const defaultContent = isClient
      ? `Olá, ${birthdayFirstName}! 🎉🎂\n\nToda a equipe da {{nome_empresa}} deseja a você um Feliz Aniversário! Que seu novo ciclo seja repleto de saúde, realizações e prosperidade.\n\nUm grande abraço!`
      : `Olá, ${event.clientName || 'Cliente'}! 🎉\n\nSoubemos que hoje é o aniversário de ${event.relationship ? RELATIONSHIP_LABELS[event.relationship]?.toLowerCase() || 'seu familiar' : 'alguém especial'}, ${event.familyMemberName || 'seu familiar'}!\n\nA equipe da {{nome_empresa}} deseja muitas felicidades e momentos de celebração em família!\n\nUm grande abraço!`;

    const defaultSubject = isClient
      ? `🎉 Feliz Aniversário, ${birthdayFirstName}! — {{nome_empresa}}`
      : `🎉 Felicitações de Aniversário — {{nome_empresa}}`;

    const rawContent = matchedTpl?.content || defaultContent;
    const rawSubject = matchedTpl?.subject || defaultSubject;

    const interpolate = (str: string) => {
      return str
        .replace(/\{\{nome_cliente\}\}/gi, event.clientName || '')
        .replace(/\{\{primeiro_nome\}\}/gi, (event.clientName || '').split(' ')[0] || '')
        .replace(/\{\{nome_familiar\}\}/gi, event.familyMemberName || '')
        .replace(/\{\{parentesco\}\}/gi, event.relationship ? RELATIONSHIP_LABELS[event.relationship] || '' : '')
        .replace(/\{\{nome_empresa\}\}/gi, 'Enlace CRM')
        .replace(/\{\{ano_atual\}\}/gi, String(currentYear));
    };

    return {
      subject: interpolate(rawSubject),
      body: interpolate(rawContent),
    };
  };

  const getHolidayRenderedMessage = (
    holiday: CommemorativeDate,
    recipient: BroadcastRecipient,
    channel: 'WHATSAPP' | 'EMAIL'
  ) => {
    const matchedTpl = templates.find(
      (t) =>
        t.channel === channel &&
        ((t.commemorativeDateId && t.commemorativeDateId === holiday.id) ||
          t.eventType === 'FIXED_DATE')
    );

    const targetFirstName = recipient.targetName.split(' ')[0];
    const clientFirstName = recipient.clientName.split(' ')[0];

    let defaultContent = '';
    let defaultSubject = `🌟 Votos de Feliz ${holiday.name} — {{nome_empresa}}`;

    if (recipient.type === 'CLIENT') {
      defaultContent =
        channel === 'WHATSAPP'
          ? `Olá, ${targetFirstName}! ✨\n\nNeste(a) *${holiday.name}*, a equipe da {{nome_empresa}} deseja a você muitas felicidades, reconhecimento e um dia maravilhoso!\n\nUm grande abraço!`
          : `Prezada(o) ${recipient.targetName},\n\nEm celebração ao(à) ${holiday.name}, a {{nome_empresa}} deseja a você um excelente dia, com harmonia e realizações.\n\nCordialmente,\nEquipe {{nome_empresa}}`;
    } else {
      defaultContent =
        channel === 'WHATSAPP'
          ? `Olá, ${clientFirstName}! ✨\n\nNeste(a) *${holiday.name}*, a equipe da {{nome_empresa}} envia um carinhoso abraço e felicitações especiais para sua *${recipient.relationshipLabel.toLowerCase()}*, *${recipient.targetName}*! 🎉\n\nQue a família de vocês tenha um dia muito especial!`
          : `Prezado(a) ${recipient.clientName},\n\nEm celebração ao(à) ${holiday.name}, a {{nome_empresa}} envia votos afetuosos para sua ${recipient.relationshipLabel.toLowerCase()}, ${recipient.targetName}.\n\nCordialmente,\nEquipe {{nome_empresa}}`;
    }

    const rawContent = matchedTpl?.content || defaultContent;
    const rawSubject = matchedTpl?.subject || defaultSubject;

    const interpolate = (str: string) => {
      return str
        .replace(/\{\{nome_cliente\}\}/gi, recipient.clientName)
        .replace(/\{\{primeiro_nome\}\}/gi, clientFirstName)
        .replace(/\{\{nome_homenageado\}\}/gi, recipient.targetName)
        .replace(/\{\{primeiro_nome_homenageado\}\}/gi, targetFirstName)
        .replace(/\{\{parentesco\}\}/gi, recipient.relationshipLabel)
        .replace(/\{\{nome_empresa\}\}/gi, 'Enlace CRM')
        .replace(/\{\{ano_atual\}\}/gi, String(currentYear));
    };

    return { subject: interpolate(rawSubject), body: interpolate(rawContent) };
  };

  const handleOpenWhatsApp = (phone: string, text: string) => {
    let clean = phone.replace(/\D/g, '');
    if (!clean.startsWith('55') && clean.length <= 11) {
      clean = '55' + clean;
    }
    const url = `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleOpenEmail = (email: string, subject: string, body: string) => {
    const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, '_blank');
  };

  const detectedHolidayAudience = selectedHoliday ? detectCommemorativeAudience(selectedHoliday) : null;
  
  const audienceEligibleRecipients = getEligibleBroadcastRecipients(
    clients,
    holidayAudienceFilter,
    detectedHolidayAudience?.key
  );

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
    <div className="space-y-6 animate-in fade-in duration-200">
      <ErrorBanner
        error={pageError?.message || null}
        solution={pageError?.solution}
        onClose={() => setPageError(null)}
        onRetry={loadData}
      />

      {/* Header Editorial */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b hairline-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E54833]"></span>
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#686971] dark:text-[#BFC0C7]">CALENDÁRIO & EVENTOS</p>
          </div>
          <h1 className="text-2xl lg:text-3xl font-sans text-[#18191D] dark:text-[#F4F4F6] font-medium tracking-tight mt-0.5">
            Calendário & Datas Comemorativas
          </h1>
          <p className="text-xs text-[#686971] dark:text-[#BFC0C7] mt-1">
            Feriados nacionais, datas comemorativas e aniversários integrados
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-[#EEEEF1] dark:bg-[#18191D] border border-[#D7D7DD] dark:border-[#292A30] p-1 rounded-xl flex items-center text-xs font-medium">
            <button
              onClick={() => setSelectedTab('year')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                selectedTab === 'year'
                  ? 'bg-white dark:bg-[#24252B] text-[#18191D] dark:text-[#F4F4F6] shadow-subtle font-medium'
                  : 'text-[#686971] hover:text-[#18191D] dark:text-[#BFC0C7]'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" /> Calendário Anual
            </button>
            <button
              onClick={() => setSelectedTab('agenda')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                selectedTab === 'agenda'
                  ? 'bg-white dark:bg-[#24252B] text-[#18191D] dark:text-[#F4F4F6] shadow-subtle font-medium'
                  : 'text-[#686971] hover:text-[#18191D] dark:text-[#BFC0C7]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Agenda 60 Dias
            </button>
            <button
              onClick={() => setSelectedTab('fixed')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                selectedTab === 'fixed'
                  ? 'bg-white dark:bg-[#24252B] text-[#18191D] dark:text-[#F4F4F6] shadow-subtle font-medium'
                  : 'text-[#686971] hover:text-[#18191D] dark:text-[#BFC0C7]'
              }`}
            >
              <List className="w-3.5 h-3.5" /> Datas Fixas ({dates.length})
            </button>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="btn-primary"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Data</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 1. VISÃO: CALENDÁRIO ANUAL DOS 12 MESES */}
      {/* ==================================================================== */}
      {selectedTab === 'year' && (
        <div className="space-y-4">
          {/* Year Navigator, Filters & Legend */}
          <div className="card-warm p-4 flex flex-col lg:flex-row items-center justify-between gap-3">
            {/* Year Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentYear((prev) => prev - 1)}
                className="p-1.5 rounded-lg border border-[#E2E2E8] dark:border-[#292A30] bg-white dark:bg-[#18191D] hover:bg-[#EEEEF1] dark:hover:bg-[#24252B] text-[#686971] dark:text-[#BFC0C7] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-lg font-mono text-[#18191D] dark:text-[#F4F4F6] px-2 font-medium">
                {currentYear}
              </span>
              <button
                onClick={() => setCurrentYear((prev) => prev + 1)}
                className="p-1.5 rounded-lg border border-[#E2E2E8] dark:border-[#292A30] bg-white dark:bg-[#18191D] hover:bg-[#EEEEF1] dark:hover:bg-[#24252B] text-[#686971] dark:text-[#BFC0C7] transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => loadData()}
                title="Atualizar dados do calendário"
                className="p-1.5 rounded-lg text-[#686971] hover:text-[#18191D] dark:hover:text-[#F4F4F6] transition-colors ml-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Event Category Filter Buttons */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#EEEEF1] dark:bg-[#18191D] border border-[#D7D7DD] dark:border-[#292A30] text-xs">
              <button
                type="button"
                onClick={() => setCategoryFilter('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  categoryFilter === 'ALL'
                    ? 'bg-white dark:bg-[#24252B] text-[#18191D] dark:text-[#F4F4F6] shadow-subtle'
                    : 'text-[#686971] dark:text-[#BFC0C7]'
                }`}
              >
                Todas ({unifiedEvents.length})
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('BIRTHDAYS')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                  categoryFilter === 'BIRTHDAYS'
                    ? 'bg-[#E54833] text-white shadow-subtle'
                    : 'text-[#686971] dark:text-[#BFC0C7] hover:text-[#18191D]'
                }`}
              >
                🎂 Aniversários ({totalBirthdaysCount})
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter('FIXED')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  categoryFilter === 'FIXED'
                    ? 'bg-[#18191D] text-[#F4F4F6] dark:bg-[#F4F4F6] dark:text-[#18191D] shadow-subtle'
                    : 'text-[#686971] dark:text-[#BFC0C7]'
                }`}
              >
                📅 Feriados & Fixas ({dates.length})
              </button>
            </div>

            {/* Legenda de Categorias */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium">
              <span className="flex items-center gap-1.5 text-[#18191D] dark:text-[#F4F4F6] bg-white dark:bg-[#202126] px-2.5 py-0.5 rounded-full border border-[#E2E2E8] dark:border-[#292A30]">
                <span className="w-2 h-2 rounded-full bg-[#E54833]"></span> Clientes
              </span>
              <span className="flex items-center gap-1.5 text-[#686971] dark:text-[#BFC0C7] bg-white dark:bg-[#202126] px-2.5 py-0.5 rounded-full border border-[#E2E2E8] dark:border-[#292A30]">
                <span className="w-2 h-2 rounded-full bg-[#686971]"></span> Familiares
              </span>
              <span className="flex items-center gap-1.5 text-[#686971] dark:text-[#BFC0C7] bg-white dark:bg-[#202126] px-2.5 py-0.5 rounded-full border border-[#E2E2E8] dark:border-[#292A30]">
                <span className="w-2 h-2 rounded-full bg-[#18191D] dark:bg-[#F4F4F6]"></span> Feriados
              </span>
            </div>
          </div>

          {/* Grade dos 12 Meses */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {MONTHS_PT.map((monthName, monthIndex) => {
              const monthNum = monthIndex + 1;

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
                  className="card-warm p-4 flex flex-col justify-between transition-all group hover:border-[#C6C7CD] dark:hover:border-[#44454B]"
                >
                  <div>
                    {/* Month Header */}
                    <div className="flex items-center justify-between border-b hairline-border pb-2.5 mb-3">
                      <h3 className="text-sm font-medium text-[#18191D] dark:text-[#F4F4F6] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E54833]"></span>
                        {monthName}
                      </h3>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#EEEEF1] dark:bg-[#24252B] text-[#686971] dark:text-[#BFC0C7] border border-[#D7D7DD] dark:border-[#292A30]">
                        {monthEvents.length}
                      </span>
                    </div>

                    {/* Mini Calendar Grid Matrix */}
                    <div className="mb-3 bg-[#F4F4F6]/70 dark:bg-[#18191D]/70 p-2.5 rounded-xl border border-[#E2E2E8] dark:border-[#292A30]">
                      {/* Weekday headers */}
                      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono text-[#74757C] mb-1">
                        {WEEKDAYS_SHORT.map((wd, i) => (
                          <span key={i} className={i === 0 ? 'text-[#E54833]' : ''}>
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
                              className={`h-6 w-full rounded-md text-[11px] font-mono font-medium flex items-center justify-center transition-all ${
                                hasEvent && theme
                                  ? `${theme.badge} shadow-subtle font-medium`
                                  : isToday
                                  ? 'bg-[#E54833] text-white font-bold'
                                  : 'text-[#18191D] dark:text-[#F4F4F6] hover:bg-white dark:hover:bg-[#24252B]'
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
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[#686971] dark:text-[#BFC0C7]">
                        Comemorações:
                      </div>

                      {monthEvents.length === 0 ? (
                        <div className="text-xs text-[#74757C] italic py-2 text-center">
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
                                className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-start gap-2 shadow-subtle ${theme.card} group/btn`}
                              >
                                <span className="font-mono font-medium text-[11px] shrink-0 bg-white/90 dark:bg-[#18191D]/90 px-1.5 py-0.5 rounded-lg border border-current">
                                  {String(evt.day).padStart(2, '0')}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium truncate text-[11px] flex items-center justify-between gap-1">
                                    <span className="truncate">{evt.name}</span>
                                    <span className="shrink-0 text-[10px] opacity-0 group-hover/btn:opacity-100 transition-opacity text-[#E54833] font-medium">
                                      {isBirthday ? 'Enviar ➔' : 'Disparo ➔'}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-[#686971] dark:text-[#BFC0C7] truncate">{theme.tag}</div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Add event button inside month */}
                  <div className="mt-3 pt-2 border-t hairline-border flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleOpenModal(undefined, monthNum)}
                      className="text-[11px] font-medium text-[#686971] dark:text-[#BFC0C7] hover:text-[#18191D] dark:hover:text-white flex items-center gap-1"
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
      {/* 2. VISÃO: AGENDA PRÓXIMOS 60 DIAS */}
      {/* ==================================================================== */}
      {selectedTab === 'agenda' && (
        <div className="card-warm p-6 space-y-4">
          <h3 className="text-lg font-medium text-[#18191D] dark:text-[#F4F4F6] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#E54833]" /> Linha do Tempo de Felicitações (Próximos 60 Dias)
          </h3>

          {loading ? (
            <div className="py-12 text-center text-[#686971] text-xs">Calculando datas e aniversários...</div>
          ) : upcoming.length === 0 ? (
            <div className="py-12 text-center text-[#686971] text-xs">Nenhum evento previsto para os próximos 60 dias.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcoming.map((evt, idx) => {
                const isBirthday = evt.type === 'CLIENT_BIRTHDAY' || evt.type === 'FAMILY_BIRTHDAY';
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      evt.isToday
                        ? 'bg-white dark:bg-[#202126] border-[#E54833] shadow-subtle'
                        : 'bg-white/70 dark:bg-[#202126]/80 border-[#E2E2E8] dark:border-[#292A30] hover:border-[#C6C7CD]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-center w-14 py-2 rounded-xl bg-[#EEEEF1] dark:bg-[#18191D] border border-[#D7D7DD] dark:border-[#292A30] shadow-subtle shrink-0">
                        <span className="block text-[10px] font-mono text-[#E54833] uppercase">
                          {MONTHS_PT[evt.month - 1].substring(0, 3)}
                        </span>
                        <span className="block text-lg font-mono font-medium text-[#18191D] dark:text-[#F4F4F6]">
                          {String(evt.day).padStart(2, '0')}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <EventTypeBadge type={evt.type} />
                        </div>
                        <h4 className="text-sm font-medium text-[#18191D] dark:text-[#F4F4F6] truncate">{evt.title}</h4>
                        <p className="text-xs font-mono text-[#686971] dark:text-[#BFC0C7] truncate mt-0.5">{evt.subtitle}</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t hairline-border flex items-center justify-between text-xs">
                      <span className={`font-mono text-[11px] font-medium ${evt.isToday ? 'text-[#E54833]' : 'text-[#686971] dark:text-[#BFC0C7]'}`}>
                        {evt.isToday ? 'Hoje' : `Em ${evt.daysRemaining} dias`}
                      </span>
                      <span className="text-[11px] font-mono text-[#686971] dark:text-[#BFC0C7]">
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
      {/* 3. VISÃO: LISTA DE DATAS FIXAS CADASTRADAS */}
      {/* ==================================================================== */}
      {selectedTab === 'fixed' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dates.map((item) => {
            const theme = getCategoryTheme(item.category);
            return (
              <div
                key={item.id}
                className="card-warm p-5 hover:border-[#C6C7CD] dark:hover:border-[#44454B] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-center w-12 py-1.5 rounded-xl bg-[#EEEEF1] dark:bg-[#18191D] border border-[#D7D7DD] dark:border-[#292A30]">
                      <span className="block text-[10px] font-mono text-[#686971] dark:text-[#BFC0C7] uppercase">
                        {MONTHS_PT[item.month - 1].substring(0, 3)}
                      </span>
                      <span className="block text-base font-mono font-medium text-[#18191D] dark:text-[#F4F4F6]">
                        {String(item.day).padStart(2, '0')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenHolidayBroadcastModal(item)}
                        title="Disparar para Clientes"
                        className="p-1.5 text-[#686971] hover:text-[#18191D] dark:hover:text-[#F4F4F6] hover:bg-[#EEEEF1] dark:hover:bg-[#24252B] rounded-lg transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenModal(item)}
                        title="Editar data"
                        className="p-1.5 text-[#686971] hover:text-[#18191D] dark:hover:text-[#F4F4F6] hover:bg-[#EEEEF1] dark:hover:bg-[#24252B] rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        title="Excluir data"
                        className="p-1.5 text-[#686971] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${theme.card}`}>
                      {theme.tag}
                    </span>
                  </div>

                  <h4 className="text-base font-medium text-[#18191D] dark:text-[#F4F4F6]">{item.name}</h4>
                  <p className="text-xs text-[#686971] dark:text-[#BFC0C7] mt-1 line-clamp-2">
                    {item.description || 'Sem descrição informada.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t hairline-border flex items-center justify-between text-xs text-[#686971] dark:text-[#BFC0C7]">
                  <button
                    type="button"
                    onClick={() => handleOpenHolidayBroadcastModal(item)}
                    className="font-medium text-[#18191D] dark:text-[#F4F4F6] hover:underline flex items-center gap-1 text-xs"
                  >
                    <Send className="w-3.5 h-3.5" /> Disparar para Clientes
                  </button>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${
                      item.active
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-[#EEEEF1] dark:bg-[#18191D] text-[#686971] border border-[#D7D7DD] dark:border-[#292A30]'
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
          <ErrorBanner
            error={modalError?.message || null}
            solution={modalError?.solution}
            onClose={() => setModalError(null)}
          />

          <div>
            <label className="block text-xs font-medium text-[#686971] dark:text-[#BFC0C7] mb-1">
              Nome da Data *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Dia das Mães, Dia do Cliente, Natal"
              className="w-full bg-white dark:bg-[#18191D] border border-[#E2E2E8] dark:border-[#292A30] focus:border-[#C6C7CD] rounded-xl py-2 px-3 text-xs text-[#18191D] dark:text-[#F4F4F6] outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#686971] dark:text-[#BFC0C7] mb-1">Dia *</label>
              <input
                type="number"
                min="1"
                max="31"
                required
                value={form.day}
                onChange={(e) => setForm({ ...form, day: Number(e.target.value) })}
                className="w-full bg-white dark:bg-[#18191D] border border-[#E2E2E8] dark:border-[#292A30] focus:border-[#C6C7CD] rounded-xl py-2 px-3 text-xs text-[#18191D] dark:text-[#F4F4F6] outline-none font-mono transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#686971] dark:text-[#BFC0C7] mb-1">Mês *</label>
              <select
                value={form.month}
                onChange={(e) => setForm({ ...form, month: Number(e.target.value) })}
                className="w-full bg-white dark:bg-[#18191D] border border-[#E2E2E8] dark:border-[#292A30] focus:border-[#C6C7CD] rounded-xl py-2 px-3 text-xs text-[#18191D] dark:text-[#F4F4F6] outline-none transition-colors"
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
            <label className="block text-xs font-medium text-[#686971] dark:text-[#BFC0C7] mb-1">
              Categoria
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full bg-white dark:bg-[#18191D] border border-[#E2E2E8] dark:border-[#292A30] focus:border-[#C6C7CD] rounded-xl py-2 px-3 text-xs text-[#18191D] dark:text-[#F4F4F6] outline-none transition-colors"
            >
              <option value="FIXED">Feriado Nacional / Oficial</option>
              <option value="CULTURAL">Comemorativa / Familiar / Cultural</option>
              <option value="CORPORATE">Corporativa / Relacionamento com Clientes</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#686971] dark:text-[#BFC0C7] mb-1">
              Ano Específico (Opcional - deixe vazio para todos os anos)
            </label>
            <input
              type="number"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
              placeholder="Ex: 2026"
              className="w-full bg-white dark:bg-[#18191D] border border-[#E2E2E8] dark:border-[#292A30] focus:border-[#C6C7CD] rounded-xl py-2 px-3 text-xs text-[#18191D] dark:text-[#F4F4F6] outline-none font-mono transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#686971] dark:text-[#BFC0C7] mb-1">Descrição</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Votos e contexto da celebração..."
              className="w-full bg-white dark:bg-[#18191D] border border-[#E2E2E8] dark:border-[#292A30] focus:border-[#C6C7CD] rounded-xl py-2 px-3 text-xs text-[#18191D] dark:text-[#F4F4F6] outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="activeDate"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="w-4 h-4 rounded text-[#E54833] bg-white dark:bg-[#18191D] border-[#D7D7DD] dark:border-[#292A30]"
            />
            <label htmlFor="activeDate" className="text-xs text-[#18191D] dark:text-[#F4F4F6] cursor-pointer font-medium">
              Data comemorativa ativa no motor de automação
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t hairline-border">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {editingDate ? 'Atualizar Data' : 'Salvar Data'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ==================================================================== */}
      {/* MODAL 2: ENVIAR MENSAGEM DE ANIVERSÁRIO */}
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
              <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#202126]/80 border border-[#E2E2E8] dark:border-[#292A30] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EEEEF1] dark:bg-[#24252B] border border-[#D7D7DD] dark:border-[#292A30] text-[#E54833] flex items-center justify-center font-bold text-base shrink-0 shadow-subtle">
                    🎂
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-[#18191D] dark:text-[#F4F4F6]">
                      {selectedBirthday.name}
                    </h4>
                    <p className="text-xs font-mono text-[#686971] dark:text-[#BFC0C7]">
                      Dia {String(selectedBirthday.day).padStart(2, '0')} de {MONTHS_PT[selectedBirthday.month - 1]}
                      {selectedBirthday.clientName && ` • Cliente: ${selectedBirthday.clientName}`}
                    </p>
                  </div>
                </div>

                {/* Channel Selector */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-[#EEEEF1] dark:bg-[#18191D] border border-[#D7D7DD] dark:border-[#292A30]">
                  <button
                    type="button"
                    onClick={() => setBirthdayChannel('WHATSAPP')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                      birthdayChannel === 'WHATSAPP'
                        ? 'bg-white dark:bg-[#24252B] text-[#18191D] dark:text-[#F4F4F6] shadow-subtle'
                        : 'text-[#686971] hover:text-[#18191D] dark:text-[#BFC0C7]'
                    }`}
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => setBirthdayChannel('EMAIL')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                      birthdayChannel === 'EMAIL'
                        ? 'bg-white dark:bg-[#24252B] text-[#18191D] dark:text-[#F4F4F6] shadow-subtle'
                        : 'text-[#686971] hover:text-[#18191D] dark:text-[#BFC0C7]'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" /> E-mail
                  </button>
                </div>
              </div>

              {/* Subject if email */}
              {birthdayChannel === 'EMAIL' && (
                <div className="p-3 rounded-xl bg-[#EEEEF1]/60 dark:bg-[#202126]/60 border border-[#E2E2E8] dark:border-[#292A30] text-xs">
                  <strong className="text-[#686971] dark:text-[#BFC0C7]">Assunto:</strong>{' '}
                  <span className="font-medium text-[#18191D] dark:text-[#F4F4F6]">{msg.subject}</span>
                </div>
              )}

              {/* Message Preview Box */}
              <div>
                <div className="flex items-center justify-between mb-1 text-xs">
                  <span className="font-medium text-[#686971] dark:text-[#BFC0C7]">Mensagem Pronta:</span>
                  <button
                    type="button"
                    onClick={() => handleCopyText(msg.body, 'bday-copy')}
                    className="text-[#18191D] dark:text-[#F4F4F6] font-medium hover:underline flex items-center gap-1"
                  >
                    {copiedId === 'bday-copy' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedId === 'bday-copy' ? 'Copiado!' : 'Copiar Texto'}
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F4F4F6]/70 dark:bg-[#18191D]/70 border border-[#E2E2E8] dark:border-[#292A30] text-xs text-[#18191D] dark:text-[#F4F4F6] whitespace-pre-line font-mono leading-relaxed max-h-60 overflow-y-auto">
                  {msg.body}
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t hairline-border">
                <button
                  type="button"
                  onClick={() => setIsBirthdayModalOpen(false)}
                  className="btn-secondary"
                >
                  Fechar
                </button>

                {birthdayChannel === 'WHATSAPP' ? (
                  <button
                    type="button"
                    disabled={!hasPhone}
                    onClick={() => handleOpenWhatsApp(selectedBirthday.phone!, msg.body)}
                    className="btn-primary disabled:opacity-50"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {hasPhone ? `Enviar no WhatsApp (${selectedBirthday.phone})` : 'Telefone não informado'}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!hasEmail}
                    onClick={() => handleOpenEmail(selectedBirthday.email!, msg.subject, msg.body)}
                    className="btn-primary disabled:opacity-50"
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
      {/* MODAL 3: DISPARO DE FERIADO / DATA FIXA */}
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
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#202126]/80 border border-[#E2E2E8] dark:border-[#292A30] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#686971] dark:text-[#BFC0C7]">
                  Data Comemorativa / Feriado
                </span>
                <h4 className="text-sm font-medium text-[#18191D] dark:text-[#F4F4F6] flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#E54833]" /> {selectedHoliday.name} (Dia {String(selectedHoliday.day).padStart(2, '0')}/{String(selectedHoliday.month).padStart(2, '0')})
                </h4>
              </div>

              {/* Channel Selector */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-[#EEEEF1] dark:bg-[#18191D] border border-[#D7D7DD] dark:border-[#292A30]">
                <button
                  type="button"
                  onClick={() => setHolidayChannel('WHATSAPP')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                    holidayChannel === 'WHATSAPP'
                      ? 'bg-white dark:bg-[#24252B] text-[#18191D] dark:text-[#F4F4F6] shadow-subtle'
                      : 'text-[#686971] hover:text-[#18191D] dark:text-[#BFC0C7]'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setHolidayChannel('EMAIL')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                    holidayChannel === 'EMAIL'
                      ? 'bg-white dark:bg-[#24252B] text-[#18191D] dark:text-[#F4F4F6] shadow-subtle'
                      : 'text-[#686971] hover:text-[#18191D] dark:text-[#BFC0C7]'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" /> E-mail
                </button>
              </div>
            </div>

            {/* Smart Audience Filter Banner */}
            {detectedHolidayAudience && (
              <div className="p-3.5 rounded-xl border border-[#E2E2E8] dark:border-[#292A30] bg-[#EEEEF1]/60 dark:bg-[#202126]/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl shrink-0">{detectedHolidayAudience.iconText}</span>
                  <div>
                    <div className="text-xs font-medium text-[#18191D] dark:text-[#F4F4F6] flex items-center gap-1.5">
                      <span>Filtro Automático de Público:</span>
                      <span className="underline underline-offset-2 text-[#E54833]">{detectedHolidayAudience.label}</span>
                      <span className="text-[11px] font-mono opacity-80">({audienceEligibleRecipients.length} elegíveis)</span>
                    </div>
                    <p className="text-[11px] text-[#686971] dark:text-[#BFC0C7] mt-0.5">
                      {detectedHolidayAudience.description}
                    </p>
                  </div>
                </div>

                {/* Audience Switcher Dropdown */}
                <div className="flex items-center gap-2 shrink-0">
                  <label className="text-[11px] font-medium text-[#686971] dark:text-[#BFC0C7] flex items-center gap-1">
                    <Filter className="w-3 h-3" /> Filtrar:
                  </label>
                  <select
                    value={holidayAudienceFilter}
                    onChange={(e) => handleAudienceFilterChange(e.target.value as any)}
                    className="bg-white dark:bg-[#18191D] border border-[#E2E2E8] dark:border-[#292A30] rounded-xl py-1 px-2.5 text-xs font-medium text-[#18191D] dark:text-[#F4F4F6] outline-none"
                  >
                    <option value="AUTO">Automático ({detectedHolidayAudience.label})</option>
                    <option value="MOTHERS_ONLY">Apenas Mães</option>
                    <option value="FATHERS_ONLY">Apenas Pais</option>
                    <option value="WOMEN_ONLY">Apenas Mulheres</option>
                    <option value="MEN_ONLY">Apenas Homens</option>
                    <option value="PARENTS_ONLY">Pais com Filhos</option>
                    <option value="CORPORATE_ONLY">Clientes Corporativos / PJ</option>
                    <option value="ALL">Toda a Base</option>
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
                  className="btn-secondary py-1 px-2.5 text-xs"
                >
                  {filteredBroadcastRecipients.length > 0 &&
                  filteredBroadcastRecipients.every((r) => selectedClientIds.includes(r.id))
                    ? 'Desmarcar Filtrados'
                    : 'Selecionar Filtrados'}
                </button>
                <span className="text-xs font-mono text-[#686971] dark:text-[#BFC0C7]">
                  {selectedClientIds.length} selecionado(s) de {filteredBroadcastRecipients.length}
                </span>
              </div>

              {/* Search recipients */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#686971]" />
                <input
                  type="text"
                  value={holidaySearch}
                  onChange={(e) => setHolidaySearch(e.target.value)}
                  placeholder="Buscar familiar ou cliente..."
                  className="w-full bg-white dark:bg-[#18191D] border border-[#E2E2E8] dark:border-[#292A30] rounded-xl py-1.5 pl-8 pr-3 text-xs text-[#18191D] dark:text-[#F4F4F6] outline-none"
                />
              </div>
            </div>

            {/* Recipients Table with Individual Sending Action */}
            <div className="bg-white dark:bg-[#18191D] border border-[#E2E2E8] dark:border-[#292A30] rounded-2xl overflow-hidden max-h-80 overflow-y-auto">
              {filteredBroadcastRecipients.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#686971] space-y-1">
                  <p className="font-medium text-[#18191D] dark:text-[#F4F4F6]">Nenhum homenageado atende aos critérios do filtro atual.</p>
                  <p className="text-[11px]">Você pode alterar a opção de público no seletor acima ou cadastrar novos contatos.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#E2E2E8] dark:divide-[#292A30]">
                  {filteredBroadcastRecipients.map((recipient) => {
                    const isSelected = selectedClientIds.includes(recipient.id);
                    const msg = getHolidayRenderedMessage(selectedHoliday, recipient, holidayChannel);
                    const hasPhone = Boolean(recipient.phone);
                    const hasEmail = Boolean(recipient.email);

                    return (
                      <div
                        key={recipient.id}
                        className={`p-3.5 flex items-center justify-between gap-3 transition-colors ${
                          isSelected ? 'bg-[#EEEEF1]/50 dark:bg-[#202126]/50' : 'opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleRecipient(recipient.id)}
                            className="w-4 h-4 rounded text-[#E54833] bg-white dark:bg-[#18191D] border-[#D7D7DD] dark:border-[#292A30] cursor-pointer shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-medium text-xs text-[#18191D] dark:text-[#F4F4F6] truncate flex items-center gap-1.5 flex-wrap">
                              <span>{recipient.targetName}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#EEEEF1] dark:bg-[#24252B] text-[#18191D] dark:text-[#F4F4F6] border border-[#D7D7DD] dark:border-[#292A30]">
                                {recipient.matchReason}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#686971] dark:text-[#BFC0C7] truncate mt-0.5">
                              {recipient.type === 'FAMILY_MEMBER' ? (
                                <span>
                                  Familiar de <strong className="font-medium text-[#18191D] dark:text-[#F4F4F6]">{recipient.clientName}</strong>
                                  {' • '}
                                  {recipient.isDirectContact ? (
                                    <span className="font-mono">WhatsApp Direto: {recipient.phone}</span>
                                  ) : (
                                    <span className="font-mono">Enviar via {recipient.clientName} ({recipient.phone || 'Sem Telefone'})</span>
                                  )}
                                </span>
                              ) : (
                                <span className="font-mono">
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
                            className="p-1.5 rounded-lg text-[#686971] hover:text-[#18191D] dark:hover:text-[#F4F4F6] hover:bg-[#EEEEF1] dark:hover:bg-[#24252B] transition-colors"
                          >
                            {copiedId === `h-${recipient.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {holidayChannel === 'WHATSAPP' ? (
                            <button
                              type="button"
                              disabled={!hasPhone}
                              onClick={() => handleOpenWhatsApp(recipient.phone!, msg.body)}
                              className="btn-primary py-1 px-2.5 text-[11px] disabled:opacity-40"
                            >
                              <MessageCircle className="w-3.5 h-3.5" /> Enviar WhatsApp
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={!hasEmail}
                              onClick={() => handleOpenEmail(recipient.email!, msg.subject, msg.body)}
                              className="btn-secondary py-1 px-2.5 text-[11px] disabled:opacity-40"
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t hairline-border">
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
                className="text-xs font-medium text-[#18191D] dark:text-[#F4F4F6] hover:underline flex items-center gap-1"
              >
                {copiedId === 'copy-all-broadcast' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
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
                className="btn-secondary"
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
