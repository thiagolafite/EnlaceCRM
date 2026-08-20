import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Plus, Edit2, Trash2, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { CommemorativeDate, UpcomingEvent } from '../types';
import { Modal } from '../components/Modal';
import { EventTypeBadge } from '../components/Badge';

interface CalendarProps {
  defaultTab?: 'fixed' | 'agenda';
}

export function Calendar({ defaultTab = 'agenda' }: CalendarProps) {
  const [dates, setDates] = useState<CommemorativeDate[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'fixed' | 'agenda'>(defaultTab);

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

  const handleOpenModal = (item?: CommemorativeDate) => {
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
        day: new Date().getDate(),
        month: new Date().getMonth() + 1,
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

  const MONTHS_PT = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Datas & Calendário</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Gerencie as datas fixas do calendário nacional/corporativo e acompanhe a agenda de aniversários.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl flex items-center">
            <button
              onClick={() => setSelectedTab('agenda')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedTab === 'agenda'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Agenda Próximos 60 Dias
            </button>
            <button
              onClick={() => setSelectedTab('fixed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedTab === 'fixed'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Datas Fixas Cadastradas
            </button>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" /> Nova Data Fixa
          </button>
        </div>
      </div>

      {/* View: Agenda Próximos 60 Dias */}
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

      {/* View: Datas Fixas Cadastradas */}
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
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.active ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome da Data *</label>
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
