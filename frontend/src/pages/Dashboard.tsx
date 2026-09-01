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
  Gift,
  CalendarDays,
  ShieldCheck,
  ChevronRight,
  Zap,
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

  const handleOpenWhatsApp = (phone: string, text: string) => {
    let clean = phone.replace(/\D/g, '');
    if (!clean.startsWith('55') && clean.length <= 11) {
      clean = '55' + clean;
    }
    const url = `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center mx-auto animate-pulse">
          <HeartHandshake className="w-6 h-6" />
        </div>
        <p className="text-xs font-bold text-slate-400">Carregando painel Enlace Celestial...</p>
      </div>
    );
  }

  const kpis = [
    {
      label: 'Alertas de Hoje',
      value: stats?.todayAlerts ?? 0,
      icon: Bell,
      color: 'text-indigo-600 dark:text-indigo-400',
      glow: 'shadow-glow-indigo/30',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
      action: () => onNavigate('alerts'),
    },
    {
      label: 'Pendentes de Envio',
      value: stats?.todayPendingManual ?? 0,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      glow: 'shadow-glow-amber/30',
      bg: 'bg-amber-500/10 border-amber-500/20',
      action: () => onNavigate('alerts'),
    },
    {
      label: 'Enviados Hoje',
      value: stats?.todaySentManual ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      glow: 'shadow-glow-emerald/30',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      action: () => onNavigate('alerts'),
    },
    {
      label: 'Clientes & Famílias',
      value: (stats?.totalClients ?? 0) + (stats?.totalFamilyMembers ?? 0),
      icon: Users,
      color: 'text-purple-600 dark:text-purple-400',
      glow: 'shadow-glow-purple/30',
      bg: 'bg-purple-500/10 border-purple-500/20',
      action: () => onNavigate('clients'),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-obsidian-900 border border-indigo-500/30 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/10 backdrop-blur-md text-amber-300 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Painel Executivo de Felicitações</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-outfit tracking-tight text-white">
              Cultive laços genuínos com cada cliente
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed font-medium">
              O Enlace CRM monitora aniversários de titulares, familiares e datas comemorativas personalizadas, preparando mensagens humanas e prontas para disparo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleRunToday}
              disabled={runningJob}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 active:scale-95 text-white font-black text-xs shadow-glow-indigo flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Zap className={`w-4 h-4 ${runningJob ? 'animate-spin' : ''}`} />
              <span>{runningJob ? 'Verificando...' : 'Verificar Motor de Hoje'}</span>
            </button>

            <button
              onClick={() => onNavigate('alerts')}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold text-xs border border-white/10 transition-colors flex items-center gap-1.5"
            >
              <span>Ver Alertas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <button
              key={index}
              onClick={kpi.action}
              className="group p-5 sm:p-6 rounded-3xl bg-white/80 dark:bg-obsidian-900/75 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] hover:border-indigo-400/50 dark:hover:border-indigo-500/40 shadow-luxury dark:shadow-luxury-dark hover:shadow-glow-indigo/20 transition-all duration-300 text-left hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {kpi.label}
                </span>
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all group-hover:scale-110 ${kpi.bg} ${kpi.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black font-outfit text-slate-900 dark:text-white tracking-tight">
                  {kpi.value}
                </span>
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                  Ver detalhes <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Split: Today's Feed & Upcoming Celebrations Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column: Today's Generated Alerts (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-black font-outfit text-slate-900 dark:text-white">
                  Felicitações do Dia ({stats?.todayAlertsList.length ?? 0})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Mensagens preparadas para você disparar com 1 toque.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('alerts')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {stats?.todayAlertsList && stats.todayAlertsList.length > 0 ? (
            <div className="space-y-3.5">
              {stats.todayAlertsList.map((alertItem) => (
                <div
                  key={alertItem.id}
                  className="p-5 rounded-3xl bg-white/80 dark:bg-obsidian-900/75 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-sm hover:border-indigo-400/40 transition-all space-y-3.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-sm shrink-0">
                        {alertItem.targetName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                            {alertItem.targetName}
                          </h4>
                          <EventTypeBadge type={alertItem.eventType} />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {alertItem.contextDescription}
                        </p>
                      </div>
                    </div>

                    <ManualSentBadge sent={alertItem.sentToClientManual} sentAt={alertItem.sentToClientManualAt} />
                  </div>

                  {/* Rendered Text Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-obsidian-950/80 border border-slate-200/60 dark:border-white/[0.04] text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed max-h-28 overflow-y-auto">
                    {alertItem.renderedMessage}
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                    <div className="text-[11px] text-slate-500">
                      📱 WhatsApp: <strong className="text-slate-700 dark:text-slate-300">{alertItem.clientPhone || 'Não cadastrado'}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyText(alertItem.id, alertItem.renderedMessage)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-obsidian-800 hover:bg-slate-100 dark:hover:bg-obsidian-750 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
                      >
                        {copiedId === alertItem.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === alertItem.id ? 'Copiado!' : 'Copiar'}</span>
                      </button>

                      {alertItem.clientPhone && (
                        <button
                          type="button"
                          onClick={() => handleOpenWhatsApp(alertItem.clientPhone!, alertItem.renderedMessage)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-black shadow-xs shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleToggleSent(alertItem.id, alertItem.sentToClientManual)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          alertItem.sentToClientManual
                            ? 'bg-slate-100 dark:bg-obsidian-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                            : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-800/40 hover:bg-indigo-100'
                        }`}
                      >
                        {alertItem.sentToClientManual ? 'Desmarcar' : 'Marcar como Enviado'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-white/50 dark:bg-obsidian-900/50 border border-slate-200/60 dark:border-white/[0.05] text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-obsidian-800 text-slate-400 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Nenhuma pendência de envio para hoje
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Execute o motor de verificação ou confira os próximos aniversários no radar ao lado.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Radar de Próximas Comemorações (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-500" />
              <h3 className="text-lg font-black font-outfit text-slate-900 dark:text-white">
                Radar de Celebrações
              </h3>
            </div>
            <button
              onClick={() => onNavigate('dates')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Agenda Completa
            </button>
          </div>

          <div className="p-4 rounded-3xl bg-white/80 dark:bg-obsidian-900/75 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-luxury space-y-3">
            {upcoming.slice(0, 6).map((evt, i) => (
              <div
                key={i}
                className="p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-obsidian-800/60 border border-transparent hover:border-slate-200/60 dark:hover:border-white/[0.05] transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${
                      evt.type === 'CLIENT_BIRTHDAY'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        : evt.type === 'FAMILY_BIRTHDAY'
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                        : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                    }`}
                  >
                    {evt.type === 'CLIENT_BIRTHDAY' ? '🎂' : evt.type === 'FAMILY_BIRTHDAY' ? '🌸' : '📅'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {evt.targetName || evt.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {evt.subtitle}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      evt.isToday
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 animate-pulse'
                        : 'bg-slate-100 dark:bg-obsidian-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {evt.isToday ? 'Hoje' : `${evt.daysRemaining}d (${evt.day}/${evt.month})`}
                  </span>
                </div>
              </div>
            ))}

            {upcoming.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                Nenhum evento agendado para os próximos 15 dias.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
