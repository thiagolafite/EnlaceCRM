import React, { useEffect, useState } from 'react';
import {
  MessageSquareText,
  Plus,
  Edit2,
  Trash2,
  Eye,
  MessageCircle,
  Mail,
  Sparkles,
  Check,
  Copy,
  Layers,
  Send,
  HelpCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { MessageTemplate, CommemorativeDate } from '../types';
import { Modal } from '../components/Modal';
import { EventTypeBadge } from '../components/Badge';

export function Templates() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [dates, setDates] = useState<CommemorativeDate[]>([]);
  const [variables, setVariables] = useState<Array<{ tag: string; description: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState<'ALL' | 'WHATSAPP' | 'EMAIL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal Create/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [form, setForm] = useState<{
    name: string;
    eventType: MessageTemplate['eventType'];
    channel: 'WHATSAPP' | 'EMAIL';
    subject: string;
    commemorativeDateId: string;
    content: string;
    active: boolean;
  }>({
    name: '',
    eventType: 'CLIENT_BIRTHDAY',
    channel: 'WHATSAPP',
    subject: '',
    commemorativeDateId: '',
    content: '',
    active: true,
  });

  // Live Preview Modal
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<MessageTemplate | null>(null);
  const [previewData, setPreviewData] = useState<{
    sampleContext: any;
    renderedSubject?: string;
    renderedBody: string;
  } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tpls, datesData, varsData] = await Promise.all([
        api.getTemplates({
          eventType: eventTypeFilter || undefined,
        }),
        api.getDates(),
        api.getTemplateVariables(),
      ]);
      setTemplates(Array.isArray(tpls) ? tpls : []);
      setDates(Array.isArray(datesData) ? datesData : []);
      setVariables(Array.isArray(varsData) ? varsData : []);
    } catch (err) {
      console.error('Erro ao carregar templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [eventTypeFilter]);

  const handleOpenModal = (item?: MessageTemplate) => {
    if (item) {
      setEditingTemplate(item);
      setForm({
        name: item.name,
        eventType: item.eventType,
        channel: (item.channel as 'WHATSAPP' | 'EMAIL') || 'WHATSAPP',
        subject: item.subject || '',
        commemorativeDateId: item.commemorativeDateId || '',
        content: item.content,
        active: item.active,
      });
    } else {
      setEditingTemplate(null);
      setForm({
        name: '',
        eventType: 'CLIENT_BIRTHDAY',
        channel: 'WHATSAPP',
        subject: '',
        commemorativeDateId: '',
        content: '',
        active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleInsertTag = (tag: string, targetField: 'content' | 'subject' = 'content') => {
    if (targetField === 'subject') {
      setForm((prev) => ({
        ...prev,
        subject: prev.subject + ' ' + tag,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        content: prev.content + tag,
      }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        name: form.name,
        eventType: form.eventType,
        channel: form.channel,
        subject: form.channel === 'EMAIL' ? form.subject : null,
        commemorativeDateId: form.commemorativeDateId || null,
        content: form.content,
        active: form.active,
      };

      if (editingTemplate) {
        await api.updateTemplate(editingTemplate.id, payload);
      } else {
        await api.createTemplate(payload);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar template');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deseja realmente excluir o template "${name}"?`)) return;
    try {
      await api.deleteTemplate(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir template');
    }
  };

  const handlePreview = async (template: MessageTemplate) => {
    try {
      setPreviewTemplate(template);
      const res = await api.previewTemplate(template.id);
      setPreviewData(res);
      setIsPreviewModalOpen(true);
    } catch (err: any) {
      alert(err.message || 'Erro ao gerar preview');
    }
  };

  const filteredTemplates = templates.filter((tpl) => {
    if (channelFilter !== 'ALL' && tpl.channel !== channelFilter) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return (
        tpl.name.toLowerCase().includes(s) ||
        tpl.content.toLowerCase().includes(s) ||
        (tpl.subject && tpl.subject.toLowerCase().includes(s))
      );
    }
    return true;
  });

  const whatsappCount = templates.filter((t) => t.channel === 'WHATSAPP').length;
  const emailCount = templates.filter((t) => t.channel === 'EMAIL').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black font-outfit text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <MessageSquareText className="w-5 h-5" />
            </span>
            <span>Templates & Modelos de Mensagem</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Modelos humanizados para WhatsApp e E-mail com variáveis dinâmicas de clientes e familiares.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-95 text-white font-black text-xs shadow-lg shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" /> Novo Template
        </button>
      </div>

      {/* Channel Tabs & Filters */}
      <div className="p-4 rounded-3xl bg-white/80 dark:bg-obsidian-900/75 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-luxury flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Channel Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/80 dark:bg-obsidian-950/80 border border-slate-200/60 dark:border-white/[0.04] w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setChannelFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              channelFilter === 'ALL'
                ? 'bg-white dark:bg-obsidian-850 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Todos ({templates.length})
          </button>
          <button
            type="button"
            onClick={() => setChannelFilter('WHATSAPP')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              channelFilter === 'WHATSAPP'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp ({whatsappCount})
          </button>
          <button
            type="button"
            onClick={() => setChannelFilter('EMAIL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              channelFilter === 'EMAIL'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" /> E-mail ({emailCount})
          </button>
        </div>

        {/* Event Type Filter & Search */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-700 dark:text-slate-300 outline-none"
          >
            <option value="">Todos os tipos de evento</option>
            <option value="CLIENT_BIRTHDAY">🎂 Aniversário do Cliente</option>
            <option value="FAMILY_BIRTHDAY">💐 Aniversário de Familiar</option>
            <option value="FIXED_DATE">📅 Data Fixa do Calendário</option>
          </select>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar template..."
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-700 dark:text-slate-300 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">Carregando templates de mensagens...</div>
      ) : filteredTemplates.length === 0 ? (
        <div className="py-16 text-center text-slate-400 space-y-2 bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl">
          <MessageSquareText className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
          <p className="font-semibold text-slate-700 dark:text-slate-300">Nenhum template encontrado</p>
          <p className="text-xs">Tente ajustar os filtros ou cadastrar um novo modelo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((tpl) => (
            <div
              key={tpl.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 shadow-sm transition-all group"
            >
              <div>
                {/* Header with badges and actions */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {tpl.channel === 'EMAIL' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          <Mail className="w-3 h-3" /> E-mail
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <MessageCircle className="w-3 h-3" /> WhatsApp
                        </span>
                      )}
                      <EventTypeBadge type={tpl.eventType} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate mt-1">
                      {tpl.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handlePreview(tpl)}
                      title="Visualizar demonstração"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 dark:hover:text-teal-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenModal(tpl)}
                      title="Editar template"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(tpl.id, tpl.name)}
                      title="Excluir template"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Email Subject if present */}
                {tpl.channel === 'EMAIL' && tpl.subject && (
                  <div className="mb-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-300 truncate">
                    <strong className="text-slate-900 dark:text-slate-100">Assunto:</strong> {tpl.subject}
                  </div>
                )}

                {/* Content Box */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-300 whitespace-pre-line font-mono line-clamp-4 leading-relaxed">
                  {tpl.content}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <span className="truncate max-w-[60%]">
                  {tpl.commemorativeDate ? `Vínculo: ${tpl.commemorativeDate.name}` : 'Template Geral'}
                </span>
                <button
                  onClick={() => handlePreview(tpl)}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 shrink-0"
                >
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Criar / Editar Template */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTemplate ? 'Editar Template de Mensagem' : 'Novo Template de Mensagem'}
        subtitle="Escreva a mensagem e use as tags dinâmicas para personalização automática"
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nome do Template *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Natal & Boas Festas (WhatsApp)"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Canal de Envio *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, channel: 'WHATSAPP' })}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    form.channel === 'WHATSAPP'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" /> WhatsApp
                </button>

                <button
                  type="button"
                  onClick={() => setForm({ ...form, channel: 'EMAIL' })}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    form.channel === 'EMAIL'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Mail className="w-4 h-4 text-indigo-600" /> E-mail
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tipo de Evento *
              </label>
              <select
                value={form.eventType}
                onChange={(e) =>
                  setForm({ ...form, eventType: e.target.value as MessageTemplate['eventType'] })
                }
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none"
              >
                <option value="CLIENT_BIRTHDAY">Aniversário do Cliente</option>
                <option value="FAMILY_BIRTHDAY">Aniversário de Familiar</option>
                <option value="FIXED_DATE">Data Fixa do Calendário</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Vincular a Data Específica
              </label>
              <select
                value={form.commemorativeDateId}
                onChange={(e) => setForm({ ...form, commemorativeDateId: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none"
              >
                <option value="">Todas as datas (genérico)</option>
                {dates.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({String(d.day).padStart(2, '0')}/{String(d.month).padStart(2, '0')})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Email Subject (if email channel) */}
          {form.channel === 'EMAIL' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assunto do E-mail (Subject) *
              </label>
              <input
                type="text"
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Ex: 🎉 Feliz Aniversário, {{primeiro_nome}}! — {{nome_empresa}}"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>
          )}

          {/* Dynamic Variable Chips */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Clique para inserir tags dinâmicas no texto:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {variables.map((v) => (
                <button
                  key={v.tag}
                  type="button"
                  onClick={() => handleInsertTag(v.tag)}
                  title={v.description}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 text-xs font-mono transition-all font-semibold"
                >
                  {v.tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Conteúdo da Mensagem *
            </label>
            <textarea
              rows={6}
              required
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Digite o texto da mensagem..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none font-sans"
            />
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
              {editingTemplate ? 'Atualizar Template' : 'Salvar Template'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Preview Interativo (WhatsApp vs E-mail) */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title={`Visualização Prévia — ${previewTemplate?.channel === 'EMAIL' ? 'E-mail' : 'WhatsApp'}`}
        subtitle="Simulação em tempo real com os dados reais de cliente e empresa"
        maxWidth="lg"
      >
        {previewData && (
          <div className="space-y-4">
            {previewTemplate?.channel === 'EMAIL' ? (
              /* Preview Envelope E-mail */
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-md">
                <div className="bg-slate-100 dark:bg-slate-950 p-4 border-b border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500">De:</span>
                    <span className="text-slate-900 dark:text-slate-100 font-semibold">
                      Enlace CRM &lt;contato@enlacecrm.com.br&gt;
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500">Para:</span>
                    <span className="text-slate-900 dark:text-slate-100 font-semibold">
                      {previewData.sampleContext?.clientName || 'Thiago Silva Lafite Lima'} &lt;cliente@exemplo.com.br&gt;
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">Assunto:</span>
                    <span className="text-slate-900 dark:text-white font-bold">
                      {previewData.renderedSubject || previewTemplate?.subject || 'Sem assunto'}
                    </span>
                  </div>
                </div>

                <div className="p-6 text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line bg-slate-50/50 dark:bg-slate-900/50 font-sans">
                  {previewData.renderedBody}
                </div>
              </div>
            ) : (
              /* Preview Chat WhatsApp */
              <div className="bg-[#0b141a] p-6 rounded-3xl border border-slate-800 text-white">
                <div className="flex items-center gap-3 pb-3 border-b border-[#202c33] text-xs text-slate-300">
                  <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-white text-xs">
                    E
                  </div>
                  <div>
                    <div className="font-semibold text-white">Enlace CRM — WhatsApp</div>
                    <div className="text-[11px] text-emerald-400">Mensagem formatada para envio</div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <div className="max-w-[85%] bg-[#005c4b] text-[#e9edef] rounded-2xl rounded-tr-sm p-4 text-sm shadow-md space-y-2 whitespace-pre-line font-sans">
                    <p>{previewData.renderedBody}</p>
                    <div className="text-[10px] text-[#8696a0] text-right flex items-center justify-end gap-1">
                      <span>Agora</span>
                      <span className="text-sky-400 font-bold">✓✓</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
