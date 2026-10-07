import { useEffect, useState } from 'react';
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
      const alertList = Array.isArray(res)
        ? res
        : Array.isArray((res as any)?.data)
        ? (res as any).data
        : [];
      setAlerts(alertList);
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
    <div className="space-y-6 animate-in fade-in duration-300">
      <ErrorBanner
        error={pageError?.message || null}
        solution={pageError?.solution}
        onClose={() => setPageError(null)}
        onRetry={loadAlerts}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-3.5 rounded-2xl bg-[#1E1611] dark:bg-[#FAF6F0] text-[#FAF6F0] dark:text-[#1E1611] text-xs font-medium shadow-dropdown flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-[#F39C74] dark:text-[#C85A32]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Editorial */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b hairline-border">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#A09388] mb-0.5">AUTOMAÇÃO & DISPAROS</p>
          <h1 className="text-2xl lg:text-3xl font-serif text-[#1E1611] dark:text-[#F5EFE8] font-normal tracking-tight">
            Central de Alertas & Disparos
          </h1>
          <p className="text-xs text-[#756557] dark:text-[#B5A599] mt-1">
            Gerenciamento e envio de felicitações diárias
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunTodayScan}
            disabled={runningScan}
            className="btn-terracotta"
          >
            <Zap className={`w-3.5 h-3.5 ${runningScan ? 'animate-spin' : ''}`} />
            <span>{runningScan ? 'Processando...' : 'Executar Varredura'}</span>
          </button>
        </div>
      </div>

      {/* Top Filter & Tab Navigation */}
      <div className="card-warm p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex bg-[#E9ECEF] dark:bg-[#14181D] border border-[#C85A32]/25 p-1 rounded-full text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('today')}
            className={`px-3.5 py-1.5 rounded-full transition-all ${
              activeTab === 'today'
                ? 'bg-[#FFFFFF] dark:bg-[#181C21] text-[#C85A32] dark:text-[#F39C74] border border-[#C85A32]/40 shadow-xs font-semibold'
                : 'text-[#6C757D] hover:text-[#1A1E24] dark:text-[#ADB5BD]'
            }`}
          >
            Hoje ({totalToday})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-[#FFFFFF] dark:bg-[#181C21] text-[#C85A32] dark:text-[#F39C74] border border-[#C85A32]/40 shadow-xs font-semibold'
                : 'text-[#6C757D] hover:text-[#1A1E24] dark:text-[#ADB5BD]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Histórico por Data</span>
          </button>
        </div>

        {/* Counter Readout */}
        <div className="flex items-center gap-3 px-3 text-xs text-[#6C757D] dark:text-[#ADB5BD]">
          <span>Total: <strong className="text-[#1A1E24] dark:text-[#F1F3F5] font-mono font-bold">{totalToday}</strong></span>
          <span>Pendentes: <strong className="text-[#C85A32] dark:text-[#E07A5F] font-mono font-bold">{pendingCount}</strong></span>
          <span>Enviados: <strong className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">{sentCount}</strong></span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card-warm p-3.5 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#C85A32]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, telefone ou mensagem..."
            className="w-full bg-[#FFFFFF] dark:bg-[#14181D] border border-[#C85A32]/35 dark:border-[#C85A32]/40 focus:border-[#C85A32] dark:focus:border-[#E07A5F] rounded-xl py-2 pl-9 pr-3 text-xs text-[#1A1E24] dark:text-[#F1F3F5] placeholder:text-[#8E99A4] outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {activeTab === 'history' && (
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-[#FFFFFF] dark:bg-[#14181D] border border-[#C85A32]/35 dark:border-[#C85A32]/40 rounded-xl py-2 px-3 text-xs text-[#1A1E24] dark:text-[#F1F3F5] outline-none"
            />
          )}

          <select
            value={filterSent}
            onChange={(e) => setFilterSent(e.target.value)}
            className="bg-[#FFFFFF] dark:bg-[#14181D] border border-[#C85A32]/35 dark:border-[#C85A32]/40 rounded-xl py-2 px-3 text-xs font-medium text-[#1A1E24] dark:text-[#F1F3F5] outline-none"
          >
            <option value="">Todos os status</option>
            <option value="pending">Apenas Pendentes</option>
            <option value="sent">Apenas Enviados</option>
          </select>

          <button
            onClick={loadAlerts}
            title="Atualizar lista"
            className="p-2 rounded-xl bg-[#FFFFFF] dark:bg-[#14181D] border border-[#C85A32]/30 hover:bg-[#E9ECEF] text-[#495057] dark:text-[#ADB5BD] transition-colors shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Alerts Grid / Cards */}
      {loading ? (
        <div className="py-20 text-center text-[#8E99A4] text-xs">Carregando alertas...</div>
      ) : alerts.length === 0 ? (
        <div className="card-warm p-12 text-center space-y-2">
          <h3 className="text-base font-serif text-[#1A1E24] dark:text-[#F1F3F5]">Nenhum alerta para esta data</h3>
          <p className="text-xs text-[#6C757D] dark:text-[#ADB5BD] max-w-sm mx-auto">
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
        <div className="space-y-3.5">
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
                className={`card-warm p-5 transition-all flex flex-col md:flex-row gap-4 justify-between hover:border-[#C85A32] ${
                  alertItem.sentToClientManual
                    ? 'opacity-85'
                    : ''
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
                      <h3 className="text-base font-serif text-[#1A1E24] dark:text-[#F1F3F5]">
                        {alertItem.clientName}
                      </h3>
                      {alertItem.clientPhone && (
                        <span className="text-xs font-mono text-[#6C757D] dark:text-[#ADB5BD] flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#C85A32]" /> {alertItem.clientPhone}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6C757D] dark:text-[#ADB5BD] mt-0.5">
                      {alertItem.contextDescription}
                    </p>
                  </div>

                  {/* Ready WhatsApp Message Box */}
                  <div className="p-3.5 rounded-2xl bg-[#FFFFFF] dark:bg-[#14181D] border border-[#C85A32]/25 dark:border-[#C85A32]/35 text-xs text-[#1A1E24] dark:text-[#F1F3F5] whitespace-pre-line font-mono leading-relaxed max-h-36 overflow-y-auto">
                    {alertItem.renderedMessage}
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex flex-col justify-between items-stretch sm:items-end gap-2.5 shrink-0 sm:w-52 border-t md:border-t-0 md:border-l hairline-border pt-3 md:pt-0 md:pl-4">
                  <div className="w-full space-y-2">
                    {/* Copy Text Button */}
                    <button
                      onClick={() => handleCopyText(alertItem.id, alertItem.renderedMessage)}
                      className="w-full btn-secondary"
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
                        className="w-full btn-terracotta"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Abrir no WhatsApp</span>
                      </a>
                    ) : (
                      <div className="p-2 rounded-xl bg-[#FFFFFF] dark:bg-[#14181D] border border-[#C85A32]/30 text-center text-[11px] text-[#8E99A4]">
                        Sem telefone cadastrado
                      </div>
                    )}
                  </div>

                  {/* Toggle Sent Status Button */}
                  <button
                    onClick={() => handleToggleSent(alertItem.id, alertItem.sentToClientManual)}
                    disabled={togglingId === alertItem.id}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${
                      alertItem.sentToClientManual
                        ? 'bg-[#FFFFFF] dark:bg-[#14181D] text-[#6C757D] dark:text-[#ADB5BD] hover:bg-[#E9ECEF]'
                        : 'btn-secondary'
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
