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
} from 'lucide-react';
import { api } from '../services/api';
import { CommemorativeDate, UpcomingEvent } from '../types';
import { Modal } from '../components/Modal';
import { EventTypeBadge } from '../components/Badge';

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

export function Calendar({ defaultTab = 'year' }: CalendarProps) {
  const [dates, setDates] = useState<CommemorativeDate[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'year' | 'agenda' | 'fixed'>(defaultTab);
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    if (defaultTab) {
      setSelectedTab(defaultTab);
    }
  }, [defaultTab]);

  // Modal
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

  const loadData = async () => {
    try {
      setLoading(true);
      const [datesData, upcomingData] = await Promise.all([
        api.getDates(),
        api.getUpcomingEvents(60),
      ]);
      setDates(datesData);
      setUpcoming(upcomingData);
    } catch (err) {
      console.error('Erro ao carregar datas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'FIXED':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'CULTURAL':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'CORPORATE':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700';
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
            Acompanhe o calendário anual com feriados nacionais e comemorações corporativas para felicitações.
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
              <List className="w-3.5 h-3.5" /> Lista de Datas
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
      {/* 1. VISÃO: CALENDÁRIO ANUAL DOS 12 MESES COM COMEMORAÇÕES PREENCHIDAS */}
      {/* ==================================================================== */}
      {selectedTab === 'year' && (
        <div className="space-y-6">
          {/* Year Navigator & Legend */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
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
              <span className="text-xs text-slate-500 font-medium">
                ({dates.length} datas cadastradas no ano)
              </span>
            </div>

            {/* Legenda de Categorias */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
              <span className="flex items-center gap-1 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800">
                <span className="w-2 h-2 rounded-full bg-purple-600"></span> Feriados Nacionais
              </span>
              <span className="flex items-center gap-1 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span> Culturais / Familiares
              </span>
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span> Corporativos / Clientes
              </span>
            </div>
          </div>

          {/* Grade dos 12 Meses (3x4 ou 4x3) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {MONTHS_PT.map((monthName, monthIndex) => {
              const monthNum = monthIndex + 1;
              const monthEvents = dates
                .filter((d) => d.month === monthNum && (d.year === null || d.year === currentYear))
                .sort((a, b) => a.day - b.day);

              const matrix = getMonthMatrix(currentYear, monthIndex);

              return (
                <div
                  key={monthName}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm flex flex-col justify-between transition-all group"
                >
                  <div>
                    {/* Month Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>
                        {monthName}
                      </h3>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {monthEvents.length} evento(s)
                      </span>
                    </div>

                    {/* Mini Calendar Grid Matrix */}
                    <div className="mb-4 bg-slate-50 dark:bg-slate-950/70 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                      {/* Weekday headers */}
                      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1.5">
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

                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                if (hasEvent) handleOpenModal(hasEvent);
                                else handleOpenModal(undefined, monthNum, cell.day || undefined);
                              }}
                              title={hasEvent ? `${cell.day}/${monthNum} - ${hasEvent.name}` : `Criar data em ${cell.day}/${monthNum}`}
                              className={`h-6 w-full rounded-md text-[11px] font-bold flex items-center justify-center transition-all ${
                                hasEvent
                                  ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/40 hover:scale-110 font-extrabold'
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

                    {/* Preenchimento das Comemorações do Mês */}
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Comemorações de {monthName}:
                      </div>

                      {monthEvents.length === 0 ? (
                        <div className="text-xs text-slate-400 italic py-2">
                          Nenhuma comemoração fixa neste mês.
                        </div>
                      ) : (
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {monthEvents.map((evt) => (
                            <button
                              key={evt.id}
                              type="button"
                              onClick={() => handleOpenModal(evt)}
                              className={`w-full p-2 rounded-xl border text-left text-xs transition-all hover:scale-[1.01] flex items-start gap-2 ${getCategoryColor(
                                evt.category
                              )}`}
                            >
                              <span className="font-mono font-black text-[11px] shrink-0 bg-white/70 dark:bg-slate-900/70 px-1.5 py-0.5 rounded border border-current">
                                {String(evt.day).padStart(2, '0')}
                              </span>
                              <div className="min-w-0 flex-1">
                                <span className="font-bold block truncate">{evt.name}</span>
                                {evt.description && (
                                  <span className="text-[10px] opacity-80 line-clamp-1 block">
                                    {evt.description}
                                  </span>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Add event button inside month */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex justify-end">
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
              {upcoming.map((evt, idx) => (
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
                      {evt.type === 'CLIENT_BIRTHDAY' || evt.type === 'FAMILY_BIRTHDAY' ? 'Automático (Nascimento)' : 'Data Calendário'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. VISÃO: LISTA DE DATAS FIXAS CADASTRADAS (CARDS) */}
      {/* ==================================================================== */}
      {selectedTab === 'fixed' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dates.map((item) => (
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
                      onClick={() => handleOpenModal(item)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{item.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {item.description || 'Sem descrição informada.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
                <span>Público: {item.targetAudience === 'ALL_CLIENTS' ? 'Todos os Clientes' : item.targetAudience}</span>
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
          ))}
        </div>
      )}

      {/* Modal Criar / Editar Data Comemorativa */}
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
    </div>
  );
}
