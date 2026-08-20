import React, { useEffect, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Filter,
  MessageCircle,
  Play,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Check,
  Phone,
  RotateCcw,
} from 'lucide-react';
import { api } from '../services/api';
import { Alert } from '../types';
import { EventTypeBadge, ManualSentBadge, NotificationBadge } from '../components/Badge';

export function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'today' | 'history'>('today');

  // Filters
  const [search, setSearch] = useState('');
  const [filterSent, setFilterSent] = useState<string>('');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  // Actions state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [resendingNotif, setResendingNotif] = useState(false);
  const [runningScan, setRunningScan] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadAlerts = async () => {
    try {
      setLoading(true);
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
    } catch (err) {
      console.error('Erro ao carregar alertas:', err);
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
    showToast('Texto da mensagem copiado para a área de transferência!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleToggleSent = async (id: string, currentStatus: boolean) => {
    try {
      setTogglingId(id);
      const updated = await api.toggleAlertSent(id, !currentStatus);
      setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)));
      showToast(
        updated.sentToClientManual
          ? 'Marcado como enviado ao cliente!'
          : 'Status revertido para pendente de envio.'
      );
    } catch (err: any) {
      alert(err.message || 'Erro ao alterar status de envio');
    } finally {
      setTogglingId(null);
    }
  };

  const handleResendOwnerNotification = async () => {
    try {
      setResendingNotif(true);
      const dateParam = activeTab === 'today' ? undefined : filterDate;
      const res = await api.resendAlertNotification(dateParam);
      if (res.success) {
        showToast(
          res.simulated
            ? 'Resumo de alertas simulado com sucesso (verifique o console do backend)!'
            : 'Resumo consolidado enviado com sucesso para o seu WhatsApp!'
        );
        await loadAlerts();
      } else {
        alert(res.error || res.message || 'Erro ao enviar notificação para seu WhatsApp');
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao reenviar notificação');
    } finally {
      setResendingNotif(false);
    }
  };

  const handleRunTodayScan = async () => {
    try {
      setRunningScan(true);
      const res = await api.runTodayAutomation();
      showToast(
        `Varredura concluída! ${res.report.alertsGenerated} novo(s) alerta(s) gerado(s).`
      );
      await loadAlerts();
    } catch (err: any) {
      alert(err.message || 'Erro ao executar varredura');
    } finally {
      setRunningScan(false);
    }
  };

  const totalToday = alerts.length;
  const pendingCount = alerts.filter((a) => !a.sentToClientManual).length;
  const sentCount = alerts.filter((a) => a.sentToClientManual).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-indigo-600 text-white shadow-2xl flex items-center gap-2 text-sm font-semibold animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Alertas de Felicitações & Envio Manual
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Acompanhe as felicitações do dia, copie os textos prontos, abra conversas no WhatsApp e marque o envio realizado.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleRunTodayScan}
            disabled={runningScan}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            <Play className={`w-4 h-4 ${runningScan ? 'animate-spin' : 'fill-current'}`} />
            {runningScan ? 'Verificando...' : 'Rodar Varredura Hoje'}
          </button>

          <button
            onClick={handleResendOwnerNotification}
            disabled={resendingNotif || alerts.length === 0}
            title="Envia a lista de alertas para o seu próprio WhatsApp via CallMeBot"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
          >
            <Send className={`w-4 h-4 ${resendingNotif ? 'animate-spin' : ''}`} />
            {resendingNotif ? 'Enviando...' : 'Notificar meu WhatsApp'}
          </button>
        </div>
      </div>

      {/* Mode Tabs & Summary KPI Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'today'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Alertas de Hoje ({new Date().toLocaleDateString('pt-BR')})
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Histórico por Data
          </button>
        </div>

        {/* Counters */}
        <div className="flex items-center gap-3 px-3 text-xs">
          <span className="text-slate-600 dark:text-slate-400">
            Total: <strong className="text-slate-900 dark:text-white">{totalToday}</strong>
          </span>
          <span className="text-amber-700 dark:text-amber-400">
            Pendentes: <strong>{pendingCount}</strong>
          </span>
          <span className="text-emerald-700 dark:text-emerald-400">
            Enviados: <strong>{sentCount}</strong>
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-3 transition-colors">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente, aniversariante, telefone ou trecho da mensagem..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {activeTab === 'history' && (
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-sm text-slate-700 dark:text-slate-300 outline-none"
            />
          )}

          <select
            value={filterSent}
            onChange={(e) => setFilterSent(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-sm text-slate-700 dark:text-slate-300 outline-none"
          >
            <option value="">Todos os status de envio</option>
            <option value="pending">Apenas Pendentes</option>
            <option value="sent">Apenas Enviados</option>
          </select>

          <button
            onClick={loadAlerts}
            title="Atualizar lista"
            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alerts Grid / Cards */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Carregando alertas do dia...</div>
      ) : alerts.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Nenhum alerta para a data selecionada</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Não há aniversariantes ou datas fixas de calendário previstas para esta data.
          </p>
          <button
            onClick={handleRunTodayScan}
            className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md"
          >
            Executar Varredura Agora
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alertItem) => {
            const cleanPhone = (alertItem.clientPhone || '').replace(/\D/g, '');
            const whatsappUrl = cleanPhone
              ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(alertItem.renderedMessage)}`
              : null;

            return (
              <div
                key={alertItem.id}
                className={`p-6 rounded-3xl border transition-all shadow-sm flex flex-col md:flex-row gap-6 justify-between ${
                  alertItem.sentToClientManual
                    ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-90'
                    : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-md ring-1 ring-indigo-500/10'
                }`}
              >
                {/* Left info & ready message */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <EventTypeBadge type={alertItem.eventType} />
                    <ManualSentBadge
                      sent={alertItem.sentToClientManual}
                      sentAt={alertItem.sentToClientManualAt}
                    />
                    <NotificationBadge status={alertItem.notificationStatus} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                        {alertItem.clientName}
                      </h3>
                      {alertItem.clientPhone && (
                        <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                          <Phone className="w-3 h-3" /> {alertItem.clientPhone}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                      🎉 {alertItem.contextDescription}
                    </p>
                  </div>

                  {/* Ready WhatsApp Message Box */}
                  <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-line font-mono relative group">
                    {alertItem.renderedMessage}
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex flex-col justify-between items-end gap-3 shrink-0 sm:w-64 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
                  <div className="w-full space-y-2">
                    {/* Button 1: Copy Text */}
                    <button
                      onClick={() => handleCopyText(alertItem.id, alertItem.renderedMessage)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-sm transition-all"
                    >
                      {copiedId === alertItem.id ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">Texto Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copiar Mensagem</span>
                        </>
                      )}
                    </button>

                    {/* Button 2: Direct WhatsApp Click-to-Chat */}
                    {whatsappUrl ? (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all group"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Abrir no WhatsApp</span>
                        <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                    ) : (
                      <div className="text-[11px] text-center text-slate-400 py-1">
                        Telefone do cliente não cadastrado
                      </div>
                    )}
                  </div>

                  {/* Button 3: Toggle Manual Sent */}
                  <button
                    onClick={() => handleToggleSent(alertItem.id, alertItem.sentToClientManual)}
                    disabled={togglingId === alertItem.id}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      alertItem.sentToClientManual
                        ? 'bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 hover:bg-rose-50 dark:hover:bg-rose-950/60 hover:text-rose-700 hover:border-rose-300'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                    }`}
                  >
                    {alertItem.sentToClientManual ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Enviado (Clique p/ Reverter)</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Marcar como Enviado</span>
                      </>
                    )}
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
