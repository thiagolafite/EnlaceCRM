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
  Zap,
  Calendar,
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
    showToast('Texto da mensagem copiado com sucesso!');
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
          : 'Status revertido para pendente.'
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
      showToast(res.message || 'Notificação enviada ao WhatsApp!');
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
      const count = res.report?.alertsGenerated ?? 0;
      showToast(`Varredura concluída! ${count} alertas gerados.`);
      await loadAlerts();
    } catch (err: any) {
      alert(err.message || 'Erro ao executar varredura');
    } finally {
      setRunningScan(false);
    }
  };

  const pendingCount = alerts.filter((a) => !a.sentToClientManual).length;
  const sentCount = alerts.filter((a) => a.sentToClientManual).length;
  const totalToday = alerts.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-slate-900/95 dark:bg-obsidian-850/95 text-white border border-indigo-500/30 shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black font-outfit text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </span>
            <span>Central de Felicitações & Alertas</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Revise, personalize e envie mensagens para homenagear clientes e seus familiares.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleRunTodayScan}
            disabled={runningScan}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black shadow-glow-indigo active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 ${runningScan ? 'animate-spin' : ''}`} />
            <span>{runningScan ? 'Varrendo...' : 'Executar Varredura'}</span>
          </button>

          <button
            onClick={handleResendOwnerNotification}
            disabled={resendingNotif}
            className="px-4 py-2.5 rounded-2xl bg-white dark:bg-obsidian-850 hover:bg-slate-100 dark:hover:bg-obsidian-800 border border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 text-xs font-bold shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RotateCcw className={`w-4 h-4 text-indigo-500 ${resendingNotif ? 'animate-spin' : ''}`} />
            <span>Reenviar no WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Tabs & Stats Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-2xl bg-slate-100/80 dark:bg-obsidian-950/80 border border-slate-200/60 dark:border-white/[0.04]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === 'today'
                ? 'bg-white dark:bg-obsidian-850 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Alertas de Hoje</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black">
              {totalToday}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-white dark:bg-obsidian-850 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Histórico por Data</span>
          </button>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center gap-3 px-3 text-xs">
          <span className="text-slate-600 dark:text-slate-400 font-medium">
            Total: <strong className="text-slate-900 dark:text-white font-bold">{totalToday}</strong>
          </span>
          <span className="text-amber-600 dark:text-amber-400 font-medium">
            Pendentes: <strong className="font-bold">{pendingCount}</strong>
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            Enviados: <strong className="font-bold">{sentCount}</strong>
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-3xl bg-white/80 dark:bg-obsidian-900/75 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-luxury flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente, aniversariante, telefone ou trecho da mensagem..."
            className="w-full bg-slate-50/80 dark:bg-obsidian-950/80 border border-slate-200/80 dark:border-white/[0.08] focus:border-indigo-500 rounded-2xl py-2.5 pl-10 pr-4 text-xs text-slate-900 dark:text-slate-100 outline-none font-semibold"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {activeTab === 'history' && (
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-slate-50/80 dark:bg-obsidian-950/80 border border-slate-200/80 dark:border-white/[0.08] rounded-2xl py-2 px-3 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none"
            />
          )}

          <select
            value={filterSent}
            onChange={(e) => setFilterSent(e.target.value)}
            className="bg-slate-50/80 dark:bg-obsidian-950/80 border border-slate-200/80 dark:border-white/[0.08] rounded-2xl py-2 px-3 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none"
          >
            <option value="">Todos os status</option>
            <option value="pending">Apenas Pendentes</option>
            <option value="sent">Apenas Enviados</option>
          </select>

          <button
            onClick={loadAlerts}
            title="Atualizar lista"
            className="p-2.5 rounded-2xl bg-slate-50/80 dark:bg-obsidian-950/80 border border-slate-200/80 dark:border-white/[0.08] hover:bg-slate-100 text-slate-600 dark:text-slate-300 transition-colors shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alerts Grid / Cards */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 font-semibold text-xs">Carregando alertas...</div>
      ) : alerts.length === 0 ? (
        <div className="p-12 text-center bg-white/60 dark:bg-obsidian-900/60 border border-slate-200/80 dark:border-white/[0.06] rounded-3xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black font-outfit text-slate-900 dark:text-white">Nenhum alerta para esta data</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Não há aniversariantes ou datas fixas de calendário previstas para o período filtrado.
          </p>
          <button
            onClick={handleRunTodayScan}
            className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md"
          >
            Executar Varredura Agora
          </button>
        </div>
      ) : (
        <div className="space-y-4">
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
                className={`p-6 rounded-3xl border transition-all flex flex-col md:flex-row gap-6 justify-between ${
                  alertItem.sentToClientManual
                    ? 'bg-white/60 dark:bg-obsidian-900/40 border-slate-200/60 dark:border-white/[0.04] opacity-85'
                    : 'bg-white/90 dark:bg-obsidian-900/90 border-slate-200/90 dark:border-white/[0.09] shadow-luxury hover:border-indigo-400/50'
                }`}
              >
                {/* Left info & ready message */}
                <div className="flex-1 space-y-3 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <EventTypeBadge type={alertItem.eventType} />
                    <ManualSentBadge
                      sent={alertItem.sentToClientManual}
                      sentAt={alertItem.sentToClientManualAt}
                    />
                    <NotificationBadge status={alertItem.notificationStatus} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-black font-outfit text-slate-900 dark:text-white">
                        {alertItem.clientName}
                      </h3>
                      {alertItem.clientPhone && (
                        <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                          <Phone className="w-3 h-3" /> {alertItem.clientPhone}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                      🎉 {alertItem.contextDescription}
                    </p>
                  </div>

                  {/* Ready WhatsApp Message Box */}
                  <div className="p-4 rounded-2xl bg-slate-50/90 dark:bg-obsidian-950/90 border border-slate-200/60 dark:border-white/[0.04] text-xs text-slate-800 dark:text-slate-200 whitespace-pre-line font-mono leading-relaxed max-h-36 overflow-y-auto">
                    {alertItem.renderedMessage}
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex flex-col justify-between items-stretch sm:items-end gap-3 shrink-0 sm:w-60 border-t md:border-t-0 md:border-l border-slate-200/80 dark:border-white/[0.06] pt-4 md:pt-0 md:pl-6">
                  <div className="w-full space-y-2">
                    {/* Copy Text Button */}
                    <button
                      onClick={() => handleCopyText(alertItem.id, alertItem.renderedMessage)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-obsidian-850 hover:bg-slate-200 dark:hover:bg-obsidian-800 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all border border-slate-200/60 dark:border-white/[0.06]"
                    >
                      {copiedId === alertItem.id ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
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
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition-all"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Abrir no WhatsApp</span>
                      </a>
                    ) : (
                      <div className="p-2 rounded-xl bg-slate-100 dark:bg-obsidian-950 text-center text-[11px] text-slate-400 font-medium">
                        Sem telefone cadastrado
                      </div>
                    )}
                  </div>

                  {/* Toggle Sent Status Button */}
                  <button
                    onClick={() => handleToggleSent(alertItem.id, alertItem.sentToClientManual)}
                    disabled={togglingId === alertItem.id}
                    className={`w-full py-2.5 px-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                      alertItem.sentToClientManual
                        ? 'bg-slate-100 dark:bg-obsidian-850 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-800/40 hover:bg-indigo-100'
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
