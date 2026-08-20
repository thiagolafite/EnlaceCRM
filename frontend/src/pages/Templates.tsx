import React, { useEffect, useState } from 'react';
import {
  MessageSquareText,
  Plus,
  Edit2,
  Trash2,
  Eye,
  MessageCircle,
  Sparkles,
  Check,
  Copy,
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

  // Modal Create/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [form, setForm] = useState<{
    name: string;
    eventType: MessageTemplate['eventType'];
    commemorativeDateId: string;
    content: string;
    active: boolean;
  }>({
    name: '',
    eventType: 'CLIENT_BIRTHDAY',
    commemorativeDateId: '',
    content: '',
    active: true,
  });

  // Live Preview Modal
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
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
      setTemplates(tpls);
      setDates(datesData);
      setVariables(varsData);
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
        commemorativeDateId: item.commemorativeDateId || '',
        content: item.content,
        active: item.active,
      });
    } else {
      setEditingTemplate(null);
      setForm({
        name: '',
        eventType: 'CLIENT_BIRTHDAY',
        commemorativeDateId: '',
        content: '',
        active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleInsertTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      content: prev.content + tag,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        name: form.name,
        eventType: form.eventType,
        channel: 'WHATSAPP',
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
      const res = await api.previewTemplate(template.id);
      setPreviewData(res);
      setIsPreviewModalOpen(true);
    } catch (err: any) {
      alert(err.message || 'Erro ao gerar preview');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Templates de Mensagem</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure modelos de mensagens com variáveis dinâmicas que serão preparadas automaticamente nos seus alertas diários.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" /> Novo Template
        </button>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3 transition-colors">
        <select
          value={eventTypeFilter}
          onChange={(e) => setEventTypeFilter(e.target.value)}
          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-sm text-slate-700 dark:text-slate-300 outline-none"
        >
          <option value="">Todos os tipos de evento</option>
          <option value="CLIENT_BIRTHDAY">Aniversário do Cliente</option>
          <option value="FAMILY_BIRTHDAY">Aniversário de Familiar</option>
          <option value="FIXED_DATE">Data Fixa do Calendário</option>
        </select>
      </div>

      {/* Templates List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 shadow-sm transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="space-y-1.5">
                  <EventTypeBadge type={tpl.eventType} />
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{tpl.name}</h3>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePreview(tpl)}
                    title="Visualizar preview"
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

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-300 whitespace-pre-line font-mono line-clamp-4">
                {tpl.content}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
              <span>
                {tpl.commemorativeDate ? `Vínculo: ${tpl.commemorativeDate.name}` : 'Template Geral'}
              </span>
              <button
                onClick={() => handlePreview(tpl)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" /> Ver demonstração
              </button>
            </div>
          </div>
        ))}
      </div>

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
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome do Template *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Aniversário do Cliente"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipo de Evento *</label>
              <select
                value={form.eventType}
                onChange={(e) => setForm({ ...form, eventType: e.target.value as MessageTemplate['eventType'] })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none"
              >
                <option value="CLIENT_BIRTHDAY">Aniversário do Cliente</option>
                <option value="FAMILY_BIRTHDAY">Aniversário de Familiar</option>
                <option value="FIXED_DATE">Data Fixa do Calendário</option>
              </select>
            </div>

            {form.eventType === 'FIXED_DATE' && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Vincular a Data Específica (Opcional)
                </label>
                <select
                  value={form.commemorativeDateId}
                  onChange={(e) => setForm({ ...form, commemorativeDateId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none"
                >
                  <option value="">Todas as datas fixas (genérico)</option>
                  {dates.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({String(d.day).padStart(2, '0')}/{String(d.month).padStart(2, '0')})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

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
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Conteúdo da Mensagem *</label>
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

      {/* Modal Preview Interativo */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title="Visualização Prévia da Mensagem"
        subtitle="Simulação com dados reais de cliente e empresa"
        maxWidth="lg"
      >
        {previewData && (
          <div className="space-y-4">
            <div className="bg-[#0b141a] p-6 rounded-3xl border border-slate-800 text-white">
              <div className="flex items-center gap-3 pb-3 border-b border-[#202c33] text-xs text-slate-300">
                <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-white text-xs">
                  E
                </div>
                <div>
                  <div className="font-semibold text-white">Enlace CRM — Mensagem Pronta</div>
                  <div className="text-[11px] text-emerald-400">Preview para envio manual no WhatsApp</div>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <div className="max-w-[85%] bg-[#005c4b] text-[#e9edef] rounded-2xl rounded-tr-sm p-4 text-sm shadow-md space-y-2 whitespace-pre-line">
                  <p>{previewData.renderedBody}</p>
                  <div className="text-[10px] text-[#8696a0] text-right flex items-center justify-end gap-1">
                    <span>Agora</span>
                    <span className="text-sky-400 font-bold">✓✓</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 font-semibold"
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
