import React, { useEffect, useState } from 'react';
import {
  Users,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Bell,
  Send,
  MessageCircle,
  Copy,
  Check,
  Play,
  HeartHandshake,
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardStats, UpcomingEvent, Alert } from '../types';
import { EventTypeBadge, ManualSentBadge } from '../components/Badge';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcoming, setUpcoming] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningJob, setRunningJob] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, upcomingData] = await Promise.all([
        api.getDashboardStats(),
        api.getUpcomingEvents(15),
      ]);
      setStats(statsData);
      setUpcoming(upcomingData);
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunToday = async () => {
    try {
      setRunningJob(true);
      await api.runTodayAutomation();
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao executar verificação diária');
    } finally {
      setRunningJob(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleToggleSent = async (id: string, currentStatus: boolean) => {
    try {
      await api.toggleAlertSent(id, !currentStatus);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar status');
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-slate-400">Carregando painel Enlace...</div>;
  }

  const kpis = [
    {
      label: 'Alertas de Hoje',
      value: stats?.todayAlerts ?? 0,
      icon: Bell,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800/60',
      action: () => onNavigate('alerts'),
    },
    {
      label: 'Pendentes de Envio Manual',
      value: stats?.todayPendingManual ?? 0,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/60',
      action: () => onNavigate('alerts'),
    },
    {
      label: 'Enviados ao Cliente Hoje',
      value: stats?.todaySentManual ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60',
      action: () => onNavigate('alerts'),
    },
    {
      label: 'Clientes Ativos',
      value: stats?.totalClients ?? 0,
      icon: Users,
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-950/60 border-violet-200 dark:border-violet-800/60',
      action: () => onNavigate('clients'),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner / Call to Action */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 border border-indigo-800/40 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
            <HeartHandshake className="w-4 h-4" /> Enlace CRM v2 — Alertas Manuais no seu WhatsApp
          </div>
          <h2 className="text-xl font-bold">Acompanhe as comemorações de hoje</h2>
          <p className="text-xs text-indigo-200 max-w-xl">
            O sistema identifica aniversários e datas especiais, gera mensagens prontas e avisa você no WhatsApp via CallMeBot para você enviar no melhor momento.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunToday}
            disabled={runningJob}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Play className={`w-4 h-4 ${runningJob ? 'animate-spin' : 'fill-current'}`} />
            {runningJob ? 'Verificando...' : 'Verificar & Notificar Hoje'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <button
              key={index}
              onClick={kpi.action}
              className={`p-5 rounded-3xl border ${kpi.bg} shadow-sm text-left transition-all hover:scale-[1.02] flex items-center justify-between group`}
            >
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{kpi.label}</p>
                <p className={`text-2xl font-extrabold mt-1 text-slate-900 dark:text-white`}>
                  {kpi.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm ${kpi.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Grid: Alertas de Hoje & Próximas Datas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Alertas de Hoje */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Alertas de Hoje ({stats?.todayAlertsList?.length || 0})
            </h3>
            <button
              onClick={() => onNavigate('alerts')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Ver todos os alertas <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {!stats?.todayAlertsList || stats.todayAlertsList.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-indigo-400" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Nenhum alerta gerado para hoje.
              </p>
              <p className="text-xs text-slate-500">
                Execute a varredura para atualizar ou confira as próximas datas na agenda ao lado.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {stats.todayAlertsList.map((alertItem) => {
                const cleanPhone = (alertItem.clientPhone || '').replace(/\D/g, '');
                const whatsappUrl = cleanPhone
                  ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(alertItem.renderedMessage)}`
                  : null;

                return (
                  <div
                    key={alertItem.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2.5 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <EventTypeBadge type={alertItem.eventType} />
                          <ManualSentBadge
                            sent={alertItem.sentToClientManual}
                            sentAt={alertItem.sentToClientManualAt}
                          />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {alertItem.clientName}
                        </h4>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                          {alertItem.contextDescription}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Copy Button */}
                        <button
                          onClick={() => handleCopyText(alertItem.id, alertItem.renderedMessage)}
                          title="Copiar texto da mensagem"
                          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          {copiedId === alertItem.id ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        {/* Direct WhatsApp button */}
                        {whatsappUrl && (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Abrir no WhatsApp"
                            className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        )}

                        {/* Toggle Sent button */}
                        <button
                          onClick={() => handleToggleSent(alertItem.id, alertItem.sentToClientManual)}
                          title={alertItem.sentToClientManual ? 'Reverter para pendente' : 'Marcar como enviado'}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                            alertItem.sentToClientManual
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                          }`}
                        >
                          {alertItem.sentToClientManual ? '✓ Enviado' : 'Marcar'}
                        </button>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/60 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line font-mono line-clamp-3">
                      {alertItem.renderedMessage}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Próximas Comemorações (15 dias) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Próximos 15 Dias
            </h3>
            <button
              onClick={() => onNavigate('timeline')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Agenda 60d
            </button>
          </div>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {upcoming.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Nenhum evento nos próximos 15 dias.
              </div>
            ) : (
              upcoming.map((evt, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                    evt.isToday
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800/80 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate block">
                      {evt.title}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                      {evt.subtitle}
                    </span>
                  </div>

                  <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
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
