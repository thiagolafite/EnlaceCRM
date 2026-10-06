import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Copy,
  MessageCircle,
  RefreshCw,
  Search,
  Check,
  Phone,
  Zap,
  Calendar,
} from 'lucide-react';
import { api } from '../services/api';
import { Alert } from '../types';
import { EventTypeBadge, ManualSentBadge, NotificationBadge } from '../components/Badge';
import { ErrorBanner } from '../components/ErrorBanner';

export function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'today' | 'history'>('today');

  // Estados de Erro Direcionais
  const [pageError, setPageError] = useState<{ message: string; solution?: string } | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterSent, setFilterSent] = useState<string>('');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  // Actions state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [runningScan, setRunningScan] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      setPageError(null);
      const todayStr = new Date().toISOString().split('T')[0];
      const targetDate = activeTab === 'today' ? todayStr : filterDate || undefined;

      let sentManualParam: boolean | undefined = undefined;
      if (filterSent === 'sent') sentManualParam = true;
      if (filterSent === 'pending') sentManualParam = false;

      const res = await api.getAlerts({
        date: targetDate,
        sentToClientManual: sentManualParam,
        search: search || undefined,
        limit: 100,
      });
      setAlerts(res.data);
    } catch (err: any) {
      console.error('Erro ao carregar alertas:', err);
      setPageError({
        message: err.message || 'Erro ao carregar alertas de felicitações.',
        solution: err.solution || 'Verifique a conexão de rede ou tente recarregar a lista.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [activeTab, filterDate, filterSent, search]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Texto copiado com sucesso.');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleToggleSent = async (id: string, currentStatus: boolean) => {
    try {
      setTogglingId(id);
      setPageError(null);
      const updated = await api.toggleAlertSent(id, !currentStatus);
      setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)));
      showToast(
        updated.sentToClientManual
          ? 'Marcado como enviado.'
          : 'Status revertido para pendente.'
      );
    } catch (err: any) {
      setPageError({
        message: err.message || 'Erro ao alterar status de envio do alerta.',
        solution: err.solution || 'Verifique se o alerta ainda existe no banco de dados.',
      });
    } finally {
      setTogglingId(null);
    }
  };

  const handleRunTodayScan = async () => {
    try {
      setRunningScan(true);
      setPageError(null);
      const res = await api.runTodayAutomation();
      const count = res.report?.alertsGenerated ?? 0;
      showToast(`Varredura concluída. ${count} alerta(s) gerados.`);
      await loadAlerts();
    } catch (err: any) {
      setPageError({
        message: err.message || 'Erro ao executar varredura de hoje.',
        solution: err.solution || 'Verifique se a configuração do CallMeBot está preenchida ou se os clientes possuem telefones válidos.',
      });
    } finally {
      setRunningScan(false);
    }
  };

  const pendingCount = alerts.filter((a) => !a.sentToClientManual).length;
  const sentCount = alerts.filter((a) => a.sentToClientManual).length;
  const totalToday = alerts.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <ErrorBanner
        error={pageError?.message || null}
        solution={pageError?.solution}
        onClose={() => setPageError(null)}
        onRetry={loadAlerts}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-3.5 rounded-xl bg-[#18181B] dark:bg-[#EDEDEA] text-white dark:text-[#18181B] text-xs font-medium shadow-dropdown flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-700" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E7E7E4] dark:border-[#26262B]">
        <div>
          <h2 className="text-lg font-semibold text-[#18181B] dark:text-[#EDEDEA]">
            Central de Alertas & Disparos
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Gerenciamento e envio de felicitações diárias
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunTodayScan}
            disabled={runningScan}
            className="btn-primary"
          >
            <Zap className={`w-3.5 h-3.5 ${runningScan ? 'animate-spin' : ''}`} />
            <span>{runningScan ? 'Processando...' : 'Executar Varredura'}</span>
          </button>
        </div>
      </div>

      {/* Top Filter & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#141416] p-2 rounded-xl border border-[#E7E7E4] dark:border-[#26262B] shadow-subtle">
        <div className="flex bg-[#F4F4F2] dark:bg-[#1C1C20] p-0.5 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('today')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'today'
                ? 'bg-white dark:bg-[#141416] text-[#18181B] dark:text-[#EDEDEA] shadow-subtle'
                : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            Hoje ({totalToday})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-white dark:bg-[#141416] text-[#18181B] dark:text-[#EDEDEA] shadow-subtle'
                : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Histórico por Data</span>
          </button>
        </div>

        {/* Counter Readout */}
        <div className="flex items-center gap-3 px-2 text-xs text-stone-500 dark:text-stone-400">
          <span>Total: <strong className="text-[#18181B] dark:text-[#EDEDEA] font-semibold">{totalToday}</strong></span>
          <span>Pendentes: <strong className="text-amber-700 dark:text-amber-400 font-semibold">{pendingCount}</strong></span>
          <span>Enviados: <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">{sentCount}</strong></span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3 rounded-xl bg-white dark:bg-[#141416] border border-[#E7E7E4] dark:border-[#26262B] shadow-subtle flex flex-col md:flex-row items-center gap-2.5">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, telefone ou mensagem..."
            className="w-full bg-[#FBFBFA] dark:bg-[#1A1A1E] border border-[#E7E7E4] dark:border-[#26262B] focus:border-stone-900 dark:focus:border-stone-100 rounded-lg py-2 pl-9 pr-3 text-xs text-[#18181B] dark:text-[#EDEDEA] outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {activeTab === 'history' && (
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-[#FBFBFA] dark:bg-[#1A1A1E] border border-[#E7E7E4] dark:border-[#26262B] rounded-lg py-2 px-2.5 text-xs text-stone-700 dark:text-stone-300 outline-none"
            />
          )}

          <select
            value={filterSent}
            onChange={(e) => setFilterSent(e.target.value)}
            className="bg-[#FBFBFA] dark:bg-[#1A1A1E] border border-[#E7E7E4] dark:border-[#26262B] rounded-lg py-2 px-2.5 text-xs text-stone-700 dark:text-stone-300 outline-none"
          >
            <option value="">Todos os status</option>
            <option value="pending">Apenas Pendentes</option>
            <option value="sent">Apenas Enviados</option>
          </select>

          <button
            onClick={loadAlerts}
            title="Atualizar lista"
            className="p-2 rounded-lg bg-[#FBFBFA] dark:bg-[#1A1A1E] border border-[#E7E7E4] dark:border-[#26262B] hover:bg-[#F4F4F2] text-stone-600 dark:text-stone-300 transition-colors shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Alerts Grid / Cards */}
      {loading ? (
        <div className="py-20 text-center text-stone-400 text-xs">Carregando alertas...</div>
      ) : alerts.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#141416] border border-[#E7E7E4] dark:border-[#26262B] rounded-xl space-y-2">
          <h3 className="text-sm font-semibold text-[#18181B] dark:text-[#EDEDEA]">Nenhum alerta para esta data</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Não há aniversários ou datas comemorativas previstas para o filtro selecionado.
          </p>
          <button
            onClick={handleRunTodayScan}
            className="mt-2 btn-secondary"
          >
            Executar Varredura Agora
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alertItem) => {
            let cleanPhone = (alertItem.clientPhone || '').replace(/\D/g, '');
            if (cleanPhone && !cleanPhone.startsWith('55') && cleanPhone.length <= 11) {
              cleanPhone = '55' + cleanPhone;
            }
            const whatsappUrl = cleanPhone
              ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(alertItem.renderedMessage)}`
              : null;

            return (
              <div
                key={alertItem.id}
                className={`p-5 rounded-xl border transition-all flex flex-col md:flex-row gap-4 justify-between ${
                  alertItem.sentToClientManual
                    ? 'bg-white/70 dark:bg-[#141416]/70 border-[#E7E7E4] dark:border-[#26262B] opacity-90'
                    : 'bg-white dark:bg-[#141416] border-[#E7E7E4] dark:border-[#26262B] shadow-subtle'
                }`}
              >
                {/* Left info & ready message */}
                <div className="flex-1 space-y-2.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <EventTypeBadge type={alertItem.eventType} />
                    <ManualSentBadge
                      sent={alertItem.sentToClientManual}
                      sentAt={alertItem.sentToClientManualAt}
                    />
                    <NotificationBadge status={alertItem.notificationStatus} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-[#18181B] dark:text-[#EDEDEA]">
                        {alertItem.clientName}
                      </h3>
                      {alertItem.clientPhone && (
                        <span className="text-xs font-mono text-stone-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {alertItem.clientPhone}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      {alertItem.contextDescription}
                    </p>
                  </div>

                  {/* Ready WhatsApp Message Box */}
                  <div className="p-3 rounded-lg bg-[#FBFBFA] dark:bg-[#111113] border border-[#E7E7E4] dark:border-[#26262B] text-xs text-stone-800 dark:text-stone-300 whitespace-pre-line font-mono leading-relaxed max-h-32 overflow-y-auto">
                    {alertItem.renderedMessage}
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex flex-col justify-between items-stretch sm:items-end gap-2 shrink-0 sm:w-52 border-t md:border-t-0 md:border-l border-[#E7E7E4] dark:border-[#26262B] pt-3 md:pt-0 md:pl-4">
                  <div className="w-full space-y-2">
                    {/* Copy Text Button */}
                    <button
                      onClick={() => handleCopyText(alertItem.id, alertItem.renderedMessage)}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-[#E7E7E4] dark:border-[#26262B] bg-[#FBFBFA] dark:bg-[#1A1A1E] hover:bg-[#F4F4F2] text-xs font-medium text-stone-700 dark:text-stone-300 transition-colors"
                    >
                      {copiedId === alertItem.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 dark:text-emerald-400">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar Mensagem</span>
                        </>
                      )}
                    </button>

                    {/* WhatsApp Action Button */}
                    {whatsappUrl ? (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Abrir no WhatsApp</span>
                      </a>
                    ) : (
                      <div className="p-2 rounded-lg bg-stone-100 dark:bg-stone-900 text-center text-[11px] text-stone-400">
                        Sem telefone cadastrado
                      </div>
                    )}
                  </div>

                  {/* Toggle Sent Status Button */}
                  <button
                    onClick={() => handleToggleSent(alertItem.id, alertItem.sentToClientManual)}
                    disabled={togglingId === alertItem.id}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                      alertItem.sentToClientManual
                        ? 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                        : 'border border-[#E7E7E4] dark:border-[#26262B] bg-white dark:bg-[#141416] text-[#18181B] dark:text-[#EDEDEA] hover:bg-[#F4F4F2]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{alertItem.sentToClientManual ? 'Desmarcar Envio' : 'Marcar como Enviado'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
