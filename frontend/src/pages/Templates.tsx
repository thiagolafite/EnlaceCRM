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
  Layers,
} from 'lucide-react';
import { api } from '../services/api';
import { MessageTemplate, CommemorativeDate } from '../types';
import { Modal } from '../components/Modal';
import { EventTypeBadge } from '../components/Badge';
import { ErrorBanner } from '../components/ErrorBanner';

export function Templates() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [dates, setDates] = useState<CommemorativeDate[]>([]);
  const [variables, setVariables] = useState<Array<{ tag: string; description: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Estados de Erro Direcionais
  const [pageError, setPageError] = useState<{ message: string; solution?: string } | null>(null);
  const [modalError, setModalError] = useState<{ message: string; solution?: string } | null>(null);
  const [previewError, setPreviewError] = useState<{ message: string; solution?: string } | null>(null);

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
      setPageError(null);
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
    } catch (err: any) {
      console.error('Erro ao carregar templates:', err);
      setPageError({
        message: err.message || 'Erro ao carregar modelos de mensagem.',
        solution: err.solution || 'Verifique sua conexão ou recarregue a página.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [eventTypeFilter]);

  const handleOpenModal = (item?: MessageTemplate) => {
    setModalError(null);
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
    setModalError(null);
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
      setModalError({
        message: err.message || 'Erro ao salvar modelo de mensagem.',
        solution: err.solution || 'Verifique se todos os campos obrigatórios foram preenchidos corretamente.',
      });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deseja realmente excluir o template "${name}"?`)) return;
    try {
      setPageError(null);
      await api.deleteTemplate(id);
      await loadData();
    } catch (err: any) {
      setPageError({
        message: err.message || 'Erro ao excluir modelo de mensagem.',
        solution: err.solution || 'Verifique se você possui permissões de administrador.',
      });
    }
  };

  const handlePreview = async (template: MessageTemplate) => {
    try {
      setPreviewError(null);
      setPreviewTemplate(template);
      const res = await api.previewTemplate(template.id);
      setPreviewData(res);
      setIsPreviewModalOpen(true);
    } catch (err: any) {
      setPreviewError({
        message: err.message || 'Erro ao gerar prévia da mensagem.',
        solution: err.solution || 'Verifique se as tags dinâmicas do template estão formatadas corretamente.',
      });
      setIsPreviewModalOpen(true);
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
      <ErrorBanner
        error={pageError?.message || null}
        solution={pageError?.solution}
        onClose={() => setPageError(null)}
        onRetry={loadData}
      />

      {/* Header Editorial */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b hairline-border">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#A09388] mb-0.5">MENSAGENS & MODELOS</p>
          <h1 className="text-2xl lg:text-3xl font-serif text-[#1E1611] dark:text-[#F5EFE8] font-normal tracking-tight">
            Templates & Modelos de Mensagem
          </h1>
          <p className="text-xs text-[#756557] dark:text-[#B5A599] mt-1">
            Modelos de felicitações com variáveis dinâmicas de titulares e familiares
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="btn-terracotta"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Novo Template</span>
        </button>
      </div>

      {/* Channel Tabs & Filters */}
      <div className="card-warm p-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Channel Selector */}
        <div className="flex items-center gap-1 p-1 rounded-full bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] w-full sm:w-auto text-xs font-medium">
          <button
            type="button"
            onClick={() => setChannelFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              channelFilter === 'ALL'
                ? 'bg-white dark:bg-[#1E1512] text-[#1E1611] dark:text-[#F5EFE8] shadow-subtle font-semibold'
                : 'text-[#756557] hover:text-[#1E1611] dark:text-[#B5A599]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Todos ({templates.length})
          </button>
          <button
            type="button"
            onClick={() => setChannelFilter('WHATSAPP')}
            className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              channelFilter === 'WHATSAPP'
                ? 'bg-[#C85A32] text-white font-semibold shadow-subtle'
                : 'text-[#756557] hover:text-[#1E1611] dark:text-[#B5A599]'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp ({whatsappCount})
          </button>
          <button
            type="button"
            onClick={() => setChannelFilter('EMAIL')}
            className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              channelFilter === 'EMAIL'
                ? 'bg-[#1E1611] text-[#FAF6F0] dark:bg-[#FAF6F0] dark:text-[#1E1611] font-semibold shadow-subtle'
                : 'text-[#756557] hover:text-[#1E1611] dark:text-[#B5A599]'
            }`}
          >
            <Mail className="w-3.5 h-3.5" /> E-mail ({emailCount})
          </button>
        </div>

        {/* Event Type Filter & Search */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] dark:focus:border-[#F39C74] rounded-xl py-2 px-3 text-xs font-medium text-[#1E1611] dark:text-[#F5EFE8] outline-none"
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
            className="bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] dark:focus:border-[#F39C74] rounded-xl py-2 px-3 text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none placeholder:text-[#A09388]"
          />
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="py-16 text-center text-[#A09388] text-xs">Carregando templates de mensagens...</div>
      ) : filteredTemplates.length === 0 ? (
        <div className="card-warm py-16 text-center space-y-2">
          <MessageSquareText className="w-8 h-8 mx-auto text-[#A09388]/60" />
          <p className="font-serif text-[#1E1611] dark:text-[#F5EFE8] text-base">Nenhum template encontrado</p>
          <p className="text-xs text-[#756557] dark:text-[#B5A599]">Tente ajustar os filtros ou cadastrar um novo modelo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((tpl) => (
            <div
              key={tpl.id}
              className="card-warm p-5 flex flex-col justify-between hover:border-[#DFCFC0] transition-all group"
            >
              <div>
                {/* Header with badges and actions */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {tpl.channel === 'EMAIL' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FAF6F0] text-[#1E1611] dark:bg-[#1A1513] dark:text-[#F5EFE8] border border-[#EDE5DC] dark:border-[#2A211D]">
                          <Mail className="w-3 h-3" /> E-mail
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FDF6F0] text-[#C85A32] dark:bg-[#2A1C16] dark:text-[#F39C74] border border-[#F5D2BF] dark:border-[#4C2D20]">
                          <MessageCircle className="w-3 h-3" /> WhatsApp
                        </span>
                      )}
                      <EventTypeBadge type={tpl.eventType} />
                    </div>
                    <h3 className="text-base font-serif text-[#1E1611] dark:text-[#F5EFE8] truncate mt-1">
                      {tpl.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handlePreview(tpl)}
                      title="Visualizar demonstração"
                      className="p-1.5 rounded-lg text-[#A09388] hover:text-[#C85A32] hover:bg-[#FAF6F0] dark:hover:bg-[#201814] transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenModal(tpl)}
                      title="Editar template"
                      className="p-1.5 rounded-lg text-[#A09388] hover:text-[#1E1611] dark:hover:text-[#F5EFE8] hover:bg-[#FAF6F0] dark:hover:bg-[#201814] transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(tpl.id, tpl.name)}
                      title="Excluir template"
                      className="p-1.5 rounded-lg text-[#A09388] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Email Subject if present */}
                {tpl.channel === 'EMAIL' && tpl.subject && (
                  <div className="mb-2.5 p-2 rounded-2xl bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] text-[11px] text-[#756557] dark:text-[#B5A599] truncate">
                    <strong className="text-[#1E1611] dark:text-[#F5EFE8]">Assunto:</strong> {tpl.subject}
                  </div>
                )}

                {/* Content Box */}
                <div className="p-3.5 rounded-2xl bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] text-xs text-[#1E1611] dark:text-[#F5EFE8] whitespace-pre-line font-mono line-clamp-4 leading-relaxed">
                  {tpl.content}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t hairline-border flex items-center justify-between text-xs text-[#756557] dark:text-[#B5A599]">
                <span className="truncate max-w-[60%] font-medium">
                  {tpl.commemorativeDate ? `Vínculo: ${tpl.commemorativeDate.name}` : 'Template Geral'}
                </span>
                <button
                  onClick={() => handlePreview(tpl)}
                  className="text-xs font-medium text-[#C85A32] dark:text-[#F39C74] hover:underline flex items-center gap-1 shrink-0"
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
          <ErrorBanner
            error={modalError?.message || null}
            solution={modalError?.solution}
            onClose={() => setModalError(null)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#756557] dark:text-[#B5A599] mb-1">
                Nome do Template *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Natal & Boas Festas (WhatsApp)"
                className="w-full bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] dark:focus:border-[#F39C74] rounded-xl py-2 px-3 text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#756557] dark:text-[#B5A599] mb-1">
                Canal de Envio *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, channel: 'WHATSAPP' })}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    form.channel === 'WHATSAPP'
                      ? 'border-[#F5D2BF] bg-[#FDF6F0] text-[#C85A32] dark:border-[#4C2D20] dark:bg-[#2A1C16] dark:text-[#F39C74]'
                      : 'border-[#EDE5DC] dark:border-[#2A211D] text-[#756557] dark:text-[#B5A599]'
                  }`}
                >
                  <MessageCircle className="w-4 h-4 text-[#C85A32] dark:text-[#F39C74]" /> WhatsApp
                </button>

                <button
                  type="button"
                  onClick={() => setForm({ ...form, channel: 'EMAIL' })}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    form.channel === 'EMAIL'
                      ? 'border-[#EDE5DC] bg-[#1E1611] text-[#FAF6F0] dark:bg-[#FAF6F0] dark:text-[#1E1611]'
                      : 'border-[#EDE5DC] dark:border-[#2A211D] text-[#756557] dark:text-[#B5A599]'
                  }`}
                >
                  <Mail className="w-4 h-4" /> E-mail
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#756557] dark:text-[#B5A599] mb-1">
                Tipo de Evento *
              </label>
              <select
                value={form.eventType}
                onChange={(e) =>
                  setForm({ ...form, eventType: e.target.value as MessageTemplate['eventType'] })
                }
                className="w-full bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] dark:focus:border-[#F39C74] rounded-xl py-2 px-3 text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none transition-colors"
              >
                <option value="CLIENT_BIRTHDAY">Aniversário do Cliente</option>
                <option value="FAMILY_BIRTHDAY">Aniversário de Familiar</option>
                <option value="FIXED_DATE">Data Fixa do Calendário</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#756557] dark:text-[#B5A599] mb-1">
                Vincular a Data Específica
              </label>
              <select
                value={form.commemorativeDateId}
                onChange={(e) => setForm({ ...form, commemorativeDateId: e.target.value })}
                className="w-full bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] dark:focus:border-[#F39C74] rounded-xl py-2 px-3 text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none transition-colors"
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
              <label className="block text-xs font-medium text-[#756557] dark:text-[#B5A599] mb-1">
                Assunto do E-mail (Subject) *
              </label>
              <input
                type="text"
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Ex: 🎉 Feliz Aniversário, {{primeiro_nome}}! — {{nome_empresa}}"
                className="w-full bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] dark:focus:border-[#F39C74] rounded-xl py-2 px-3 text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none transition-colors"
              />
            </div>
          )}

          {/* Dynamic Variable Chips */}
          <div className="p-3.5 rounded-2xl bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#C85A32] dark:text-[#F39C74] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Clique para inserir tags dinâmicas no texto:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {variables.map((v) => (
                <button
                  key={v.tag}
                  type="button"
                  onClick={() => handleInsertTag(v.tag)}
                  title={v.description}
                  className="px-2.5 py-1 rounded-full bg-white dark:bg-[#1A1513] hover:bg-[#FDF6F0] dark:hover:bg-[#2A1C16] border border-[#EDE5DC] dark:border-[#2A211D] text-[#C85A32] dark:text-[#F39C74] text-xs font-mono transition-all font-medium"
                >
                  {v.tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#756557] dark:text-[#B5A599] mb-1">
              Conteúdo da Mensagem *
            </label>
            <textarea
              rows={6}
              required
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Digite o texto da mensagem..."
              className="w-full bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] dark:focus:border-[#F39C74] rounded-xl py-2.5 px-3 text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none font-sans transition-colors"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t hairline-border">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-terracotta"
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
        <div className="space-y-4">
          <ErrorBanner
            error={previewError?.message || null}
            solution={previewError?.solution}
            onClose={() => setPreviewError(null)}
          />

          {previewData && (
            <div className="space-y-4">
            {previewTemplate?.channel === 'EMAIL' ? (
              /* Preview Envelope E-mail */
              <div className="card-warm overflow-hidden">
                <div className="bg-[#FAF6F0] dark:bg-[#15100E] p-4 border-b hairline-border space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#756557] dark:text-[#B5A599]">De:</span>
                    <span className="text-[#1E1611] dark:text-[#F5EFE8] font-semibold">
                      Enlace CRM &lt;contato@enlacecrm.com.br&gt;
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#756557] dark:text-[#B5A599]">Para:</span>
                    <span className="text-[#1E1611] dark:text-[#F5EFE8] font-semibold">
                      {previewData.sampleContext?.clientName || 'Thiago Silva Lafite Lima'} &lt;cliente@exemplo.com.br&gt;
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t hairline-border">
                    <span className="font-semibold text-[#C85A32] dark:text-[#F39C74]">Assunto:</span>
                    <span className="text-[#1E1611] dark:text-[#F5EFE8] font-semibold">
                      {previewData.renderedSubject || previewTemplate?.subject || 'Sem assunto'}
                    </span>
                  </div>
                </div>

                <div className="p-6 text-xs text-[#1E1611] dark:text-[#F5EFE8] leading-relaxed whitespace-pre-line font-sans">
                  {previewData.renderedBody}
                </div>
              </div>
            ) : (
              /* Preview Chat WhatsApp */
              <div className="bg-[#1A1412] p-6 rounded-3xl border border-[#2A201C] text-[#FAF6F0]">
                <div className="flex items-center gap-3 pb-3 border-b border-[#2A201C] text-xs text-[#FAF6F0]/80">
                  <div className="w-8 h-8 rounded-full bg-[#C85A32] flex items-center justify-center font-bold text-white text-xs">
                    V
                  </div>
                  <div>
                    <div className="font-semibold text-[#FAF6F0]">Enlace CRM — WhatsApp</div>
                    <div className="text-[11px] text-[#F39C74]">Mensagem formatada para envio</div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <div className="max-w-[85%] bg-[#2D1E18] border border-[#523326] text-[#FAF6F0] rounded-2xl rounded-tr-sm p-4 text-xs shadow-subtle space-y-2 whitespace-pre-line font-sans">
                    <p>{previewData.renderedBody}</p>
                    <div className="text-[10px] text-[#A6988B] text-right flex items-center justify-end gap-1 font-mono">
                      <span>Agora</span>
                      <span className="text-[#F39C74] font-bold">✓✓</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="btn-secondary"
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        )}

        {!previewData && (
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setIsPreviewModalOpen(false)}
              className="btn-secondary"
            >
              Fechar
            </button>
          </div>
        )}
        </div>
      </Modal>
    </div>
  );
}
