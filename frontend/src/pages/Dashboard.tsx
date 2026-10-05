import React, { useEffect, useState } from 'react';
import {
  Users,
  Bell,
  CheckCircle2,
  Clock,
  Zap,
  ArrowRight,
  MessageCircle,
  Copy,
  Check,
  Calendar,
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardStats, UpcomingEvent } from '../types';
import { EventTypeBadge, ManualSentBadge } from '../components/Badge';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcoming, setUpcoming] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningJob, setRunningJob] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, eventsData] = await Promise.all([
        api.getDashboardStats().catch(() => null),
        api.getUpcomingEvents(15).catch(() => [] as UpcomingEvent[]),
      ]);
      setStats(statsData);
      setUpcoming(Array.isArray(eventsData) ? eventsData : []);
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRunToday = async () => {
    try {
      setRunningJob(true);
      const res = await api.runTodayAutomation();
      const count = res.report?.alertsGenerated ?? 0;
      setFeedbackMessage(`Varredura concluída. ${count} alerta(s) gerados.`);
      await loadDashboardData();
    } catch (err: any) {
      setFeedbackMessage(err.message || 'Erro ao executar varredura.');
    } finally {
      setRunningJob(false);
      setTimeout(() => setFeedbackMessage(null), 5000);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenWhatsApp = (phone: string, text: string) => {
    let clean = phone.replace(/\D/g, '');
    if (!clean.startsWith('55') && clean.length <= 11) {
      clean = '55' + clean;
    }
    const url = `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (loading && !stats) {
    return (
      <div className="py-20 text-center text-xs text-stone-400">
        Carregando painel de relacionamento...
      </div>
    );
  }

  const kpis = [
    {
      label: 'Alertas de Hoje',
      value: stats?.todayAlerts ?? (stats as any)?.totalToday ?? 0,
      description: 'Lembretes gerados para hoje',
      action: () => onNavigate('alerts'),
    },
    {
      label: 'Pendentes de Envio',
      value: stats?.todayPendingManual ?? (stats as any)?.pendingToday ?? 0,
      description: 'Aguardando disparo',
      action: () => onNavigate('alerts'),
    },
    {
      label: 'Enviados com Sucesso',
      value: stats?.todaySentManual ?? (stats as any)?.sentToday ?? 0,
      description: 'Felicitações entregues',
      action: () => onNavigate('alerts'),
    },
    {
      label: 'Total de Contatos',
      value: ((stats?.totalClients ?? 0) + (stats?.totalFamilyMembers ?? 0)),
      description: `${stats?.totalClients ?? 0} titulares + ${stats?.totalFamilyMembers ?? 0} familiares`,
      action: () => onNavigate('clients'),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E7E7E4] dark:border-[#26262B]">
        <div>
          <h2 className="text-lg font-semibold text-[#18181B] dark:text-[#EDEDEA]">
            Painel de Felicitações
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Monitoramento de datas especiais e disparos ativos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunToday}
            disabled={runningJob}
            className="btn-primary"
          >
            <Zap className={`w-3.5 h-3.5 ${runningJob ? 'animate-spin' : ''}`} />
            <span>{runningJob ? 'Executando...' : 'Verificar Motor'}</span>
          </button>
          <button
            onClick={() => onNavigate('alerts')}
            className="btn-secondary"
          >
            <span>Ver Alertas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-3 rounded-xl bg-stone-100 dark:bg-[#1A1A1E] border border-[#E7E7E4] dark:border-[#26262B] text-xs text-stone-800 dark:text-stone-200">
          {feedbackMessage}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {kpis.map((kpi, index) => (
          <div
            key={index}
            onClick={kpi.action}
            className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#141416] border border-[#E7E7E4] dark:border-[#26262B] hover:border-stone-400 dark:hover:border-stone-600 transition-colors cursor-pointer shadow-subtle flex flex-col justify-between"
          >
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
              {kpi.label}
            </span>
            <div className="mt-3">
              <span className="text-2xl font-semibold text-[#18181B] dark:text-[#EDEDEA] tracking-tight">
                {kpi.value}
              </span>
              <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
                {kpi.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Split: Today's Feed & Upcoming Celebrations Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Generated Alerts (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#18181B] dark:text-[#EDEDEA]">
              Felicitações do Dia ({stats?.todayAlertsList?.length ?? 0})
            </h3>
            <button
              onClick={() => onNavigate('alerts')}
              className="text-xs font-medium text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {stats?.todayAlertsList && Array.isArray(stats.todayAlertsList) && stats.todayAlertsList.length > 0 ? (
            <div className="space-y-3">
              {stats.todayAlertsList.map((alertItem) => (
                <div
                  key={alertItem.id}
                  className="p-4 rounded-xl bg-white dark:bg-[#141416] border border-[#E7E7E4] dark:border-[#26262B] shadow-subtle space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#18181B] dark:text-[#EDEDEA]">
                          {alertItem.targetName || alertItem.clientName || 'Homenageado'}
                        </span>
                        <EventTypeBadge type={alertItem.eventType} />
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                        {alertItem.contextDescription || ''}
                      </p>
                    </div>

                    <ManualSentBadge sent={alertItem.sentToClientManual} sentAt={alertItem.sentToClientManualAt} />
                  </div>

                  {/* Rendered Text Box */}
                  <div className="p-3 rounded-lg bg-[#FBFBFA] dark:bg-[#111113] border border-[#E7E7E4] dark:border-[#26262B] text-xs font-mono text-stone-800 dark:text-stone-300 whitespace-pre-line leading-relaxed max-h-24 overflow-y-auto">
                    {alertItem.renderedMessage || ''}
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                    <span className="text-[11px] font-mono text-stone-500">
                      Tel: {alertItem.clientPhone || 'Não informado'}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyText(alertItem.id, alertItem.renderedMessage)}
                        className="px-2.5 py-1.5 rounded-lg border border-[#E7E7E4] dark:border-[#26262B] hover:bg-[#F4F4F2] dark:hover:bg-[#1C1C20] text-xs font-medium text-stone-700 dark:text-stone-300 transition-colors flex items-center gap-1"
                      >
                        {copiedId === alertItem.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>

                      {alertItem.clientPhone && (
                        <button
                          type="button"
                          onClick={() => handleOpenWhatsApp(alertItem.clientPhone!, alertItem.renderedMessage)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-xl border border-[#E7E7E4] dark:border-[#26262B] bg-white dark:bg-[#141416] space-y-2">
              <span className="text-xs text-stone-500 dark:text-stone-400 block">
                Nenhum alerta gerado para o dia de hoje.
              </span>
              <button
                onClick={handleRunToday}
                className="btn-secondary"
              >
                Executar Verificação
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Radar de Próximas Comemorações (1 col) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#18181B] dark:text-[#EDEDEA]">
              Próximos 15 Dias
            </h3>
            <button
              onClick={() => onNavigate('dates')}
              className="text-xs font-medium text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
            >
              Agenda
            </button>
          </div>

          <div className="p-2 rounded-xl bg-white dark:bg-[#141416] border border-[#E7E7E4] dark:border-[#26262B] shadow-subtle divide-y divide-[#E7E7E4]/60 dark:divide-[#26262B]/60">
            {(Array.isArray(upcoming) ? upcoming : []).length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-400">
                Sem eventos cadastrados para os próximos dias.
              </div>
            ) : (
              (Array.isArray(upcoming) ? upcoming : []).slice(0, 6).map((evt, i) => (
                <div
                  key={i}
                  className="p-3 flex items-center justify-between gap-3 hover:bg-[#F4F4F2] dark:hover:bg-[#1C1C20] rounded-lg transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#18181B] dark:text-[#EDEDEA] truncate">
                      {evt.targetName || evt.title || 'Evento'}
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                      {evt.subtitle || ''}
                    </p>
                  </div>

                  <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 shrink-0">
                    {evt.isToday ? 'Hoje' : `Em ${evt.daysRemaining}d`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
