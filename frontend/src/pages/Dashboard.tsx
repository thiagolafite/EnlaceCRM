import { useEffect, useState } from 'react';
import {
  Users,
  Cake,
  Star,
  MessageCircle,
  Copy,
  Check,
  Zap,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardStats, UpcomingEvent } from '../types';
import { ErrorBanner } from '../components/ErrorBanner';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcoming, setUpcoming] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningJob, setRunningJob] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [error, setError] = useState<{ message: string; solution?: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [todayText, setTodayText] = useState('');

  useEffect(() => {
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('pt-BR', { weekday: 'long' });
    const day = now.getDate();
    const month = now.toLocaleDateString('pt-BR', { month: 'long' });
    setTodayText(`Hoje é ${dayOfWeek}, ${day} de ${month}. Aqui está quem merece uma mensagem nos próximos dias.`);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsData, eventsData] = await Promise.all([
        api.getDashboardStats().catch(() => null),
        api.getUpcomingEvents(30).catch(() => [] as UpcomingEvent[]),
      ]);
      setStats(statsData);
      setUpcoming(Array.isArray(eventsData) ? eventsData : []);
    } catch (err: any) {
      console.error('Erro ao carregar dados do dashboard:', err);
      setError({
        message: err.message || 'Erro ao carregar métricas do painel.',
        solution: err.solution || 'Verifique a conexão com o servidor e recarregue a página.',
      });
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
      setError(null);
      const res = await api.runTodayAutomation();
      const count = res.report?.alertsGenerated ?? 0;
      setFeedbackMessage(`Varredura concluída. ${count} felicitação(ões) preparada(s).`);
      await loadDashboardData();
    } catch (err: any) {
      setError({
        message: err.message || 'Erro ao executar varredura.',
        solution: err.solution || 'Verifique as configurações e tente novamente.',
      });
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

  const handleOpenWhatsApp = (phone?: string | null, text?: string) => {
    if (!phone) return;
    let clean = phone.replace(/\D/g, '');
    if (!clean.startsWith('55') && clean.length <= 11) {
      clean = '55' + clean;
    }
    const msg = text || 'Olá! Passando para desejar um excelente dia e comemorar esta data especial!';
    const url = `https://wa.me/${clean}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  if (loading && !stats) {
    return (
      <div className="py-24 text-center text-sm font-sans text-[#686971] dark:text-[#BFC0C7] animate-pulse">
        Carregando sua carteira de relacionamento...
      </div>
    );
  }

  // Filtragem de aniversariantes do mês atual e próximos
  const currentMonthNum = new Date().getMonth() + 1;
  const monthEvents = upcoming.filter((evt) => {
    if (!evt.date) return false;
    const m = parseInt(evt.date.split('-')[1], 10);
    return m === currentMonthNum;
  });

  const totalClientsCount = stats?.totalClients ?? 0;
  const totalFamilyCount = stats?.totalFamilyMembers ?? 0;
  const monthBirthdaysCount = monthEvents.length || stats?.todayAlerts || 0;
  const todayAlertsCount = stats?.todayAlerts ?? (stats as any)?.totalToday ?? 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <ErrorBanner
        error={error?.message || null}
        solution={error?.solution}
        onClose={() => setError(null)}
        onRetry={loadDashboardData}
      />

      {feedbackMessage && (
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#202126]/85 border border-[#E54833] text-xs font-medium text-[#18191D] dark:text-[#F4F4F6] flex items-center justify-between shadow-subtle">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E54833]"></span>
            <span>{feedbackMessage}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-xs font-semibold hover:underline text-[#686971]">
            Fechar
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 1. HERO HEADER */}
      {/* ==================================================================== */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E54833]"></span>
          <p className="text-[10px] font-mono font-medium uppercase tracking-wider text-[#686971] dark:text-[#BFC0C7]">
            PAINEL GERAL
          </p>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="font-sans text-2xl sm:text-3xl font-medium tracking-tight text-[#18191D] dark:text-[#F4F4F6]">
              Sua carteira, viva e por perto
            </h2>
            <p className="text-xs sm:text-sm text-[#686971] dark:text-[#BFC0C7] mt-1 max-w-2xl leading-relaxed">
              {todayText}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleRunToday}
              disabled={runningJob}
              className="btn-primary"
            >
              <Zap className={`w-3.5 h-3.5 ${runningJob ? 'animate-spin' : ''}`} />
              <span>{runningJob ? 'Verificando...' : 'Verificar Motor'}</span>
            </button>
            <button
              onClick={() => onNavigate('timeline')}
              className="btn-secondary"
            >
              <span>Ver Agenda</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. TOP METRIC CARDS (Neo-Swiss Panéis Translúcidos) */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Clientes na Carteira */}
        <div
          onClick={() => onNavigate('clients')}
          className="p-5 sm:p-6 rounded-2xl bg-white/70 backdrop-blur-md dark:bg-[#202126]/85 border border-[#E2E2E8] dark:border-[#292A30] hover:border-[#C6C7CD] dark:hover:border-[#44454B] shadow-subtle hover:shadow-panel transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-[#686971] dark:text-[#BFC0C7]">
            <span className="text-[10px] font-mono font-medium uppercase tracking-wider">
              CLIENTES NA CARTEIRA
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#EEEEF1] dark:bg-[#24252B] border border-[#D7D7DD] dark:border-[#292A30] flex items-center justify-center">
              <Users className="w-4 h-4 text-[#18191D] dark:text-[#F4F4F6]" />
            </div>
          </div>
          <div className="mt-5">
            <span className="font-sans text-3xl sm:text-4xl font-medium tracking-tight text-[#18191D] dark:text-[#F4F4F6]">
              {totalClientsCount}
            </span>
            <p className="text-xs text-[#686971] dark:text-[#BFC0C7] mt-1 font-sans">
              {totalFamilyCount > 0 ? `${totalFamilyCount} familiares vinculados` : 'Prontos para relacionamento'}
            </p>
          </div>
        </div>

        {/* Card 2: Aniversariantes do Mês */}
        <div
          onClick={() => onNavigate('timeline')}
          className="p-5 sm:p-6 rounded-2xl bg-white/70 backdrop-blur-md dark:bg-[#202126]/85 border border-[#E2E2E8] dark:border-[#292A30] hover:border-[#C6C7CD] dark:hover:border-[#44454B] shadow-subtle hover:shadow-panel transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-[#686971] dark:text-[#BFC0C7]">
            <span className="text-[10px] font-mono font-medium uppercase tracking-wider">
              ANIVERSARIANTES DO MÊS
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#EEEEF1] dark:bg-[#24252B] border border-[#D7D7DD] dark:border-[#292A30] flex items-center justify-center">
              <Cake className="w-4 h-4 text-[#E54833]" />
            </div>
          </div>
          <div className="mt-5">
            <span className="font-sans text-3xl sm:text-4xl font-medium tracking-tight text-[#18191D] dark:text-[#F4F4F6]">
              {monthBirthdaysCount}
            </span>
            <p className="text-xs text-[#686971] dark:text-[#BFC0C7] mt-1 font-sans">
              Mensagem pronta para cada um
            </p>
          </div>
        </div>

        {/* Card 3: Lembretes de Hoje */}
        <div
          onClick={() => onNavigate('alerts')}
          className="p-5 sm:p-6 rounded-2xl bg-white/70 backdrop-blur-md dark:bg-[#202126]/85 border border-[#E2E2E8] dark:border-[#292A30] hover:border-[#C6C7CD] dark:hover:border-[#44454B] shadow-subtle hover:shadow-panel transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-[#686971] dark:text-[#BFC0C7]">
            <span className="text-[10px] font-mono font-medium uppercase tracking-wider">
              LEMBRETES DE HOJE
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#EEEEF1] dark:bg-[#24252B] border border-[#D7D7DD] dark:border-[#292A30] flex items-center justify-center">
              <Star className="w-4 h-4 text-[#18191D] dark:text-[#F4F4F6]" />
            </div>
          </div>
          <div className="mt-5">
            <span className="font-sans text-3xl sm:text-4xl font-medium tracking-tight text-[#18191D] dark:text-[#F4F4F6]">
              {todayAlertsCount}
            </span>
            <p className="text-xs text-[#686971] dark:text-[#BFC0C7] mt-1 font-sans">
              {todayAlertsCount > 0 ? 'Felicitações para envio hoje' : 'Nenhuma pendência para hoje'}
            </p>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. MIDDLE DUAL SECTIONS */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (7 cols): Próximas Datas */}
        <div className="lg:col-span-7 p-5 sm:p-6 rounded-2xl bg-white/70 backdrop-blur-md dark:bg-[#202126]/85 border border-[#E2E2E8] dark:border-[#292A30] shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E2E8] dark:border-[#292A30]">
            <h3 className="font-sans text-base font-medium tracking-tight text-[#18191D] dark:text-[#F4F4F6]">
              Próximas datas
            </h3>
            <button
              onClick={() => onNavigate('timeline')}
              className="text-xs font-medium text-[#686971] dark:text-[#BFC0C7] hover:text-[#18191D] dark:hover:text-[#F4F4F6] flex items-center gap-1 transition-colors"
            >
              <span>Ver agenda</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {upcoming.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#686971]">
              Nenhum evento agendado para os próximos dias.
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcoming.slice(0, 4).map((evt, idx) => {
                const titleText = evt.title || `Aniversário de ${evt.targetName || 'Cliente'}`;
                const dateText = evt.subtitle || (evt.date ? new Date(evt.date + 'T00:00:00').toLocaleDateString('pt-BR') : 'Em breve');
                const daysText = evt.isToday ? 'Hoje' : `Em ${evt.daysRemaining} dias`;

                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#F4F4F6]/70 dark:bg-[#18191D]/70 border border-[#E2E2E8] dark:border-[#292A30] flex items-center justify-between gap-3 hover:border-[#C6C7CD] dark:hover:border-[#44454B] transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#24252B] border border-[#D7D7DD] dark:border-[#292A30] text-[#E54833] flex items-center justify-center shrink-0">
                        <Cake className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-[#18191D] dark:text-[#F4F4F6] truncate">
                          {titleText}
                        </p>
                        <p className="text-xs font-mono text-[#686971] dark:text-[#BFC0C7] truncate mt-0.5">
                          {dateText}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium ${
                        evt.isToday
                          ? 'bg-[#E54833] text-white'
                          : 'bg-[#EEEEF1] dark:bg-[#24252B] border border-[#D7D7DD] dark:border-[#292A30] text-[#18191D] dark:text-[#F4F4F6]'
                      }`}>
                        {daysText}
                      </span>
                      {evt.phone ? (
                        <button
                          onClick={() => handleOpenWhatsApp(evt.phone, `Olá ${evt.targetName || evt.title}! Parabéns antecipado por este momento especial!`)}
                          title="Enviar mensagem WhatsApp"
                          className="p-1.5 rounded-lg text-[#686971] hover:text-[#18191D] dark:hover:text-[#F4F4F6] hover:bg-[#EEEEF1] dark:hover:bg-[#292A30] transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onNavigate('alerts')}
                          title="Ver alerta"
                          className="p-1.5 rounded-lg text-[#686971] hover:text-[#18191D] dark:hover:text-[#F4F4F6] hover:bg-[#EEEEF1] dark:hover:bg-[#292A30] transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Aniversariantes do Mês */}
        <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-white/70 backdrop-blur-md dark:bg-[#202126]/85 border border-[#E2E2E8] dark:border-[#292A30] shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E2E8] dark:border-[#292A30]">
            <h3 className="font-sans text-base font-medium tracking-tight text-[#18191D] dark:text-[#F4F4F6]">
              Aniversariantes do mês
            </h3>
            <span className="text-xs font-mono text-[#686971] dark:text-[#BFC0C7]">
              {monthEvents.length} no mês
            </span>
          </div>

          {monthEvents.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#686971]">
              Nenhum aniversariante registrado neste mês.
            </div>
          ) : (
            <div className="space-y-2.5">
              {monthEvents.slice(0, 5).map((evt, idx) => {
                const dayStr = evt.date ? evt.date.split('-')[2] : String(idx + 1).padStart(2, '0');

                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#F4F4F6]/70 dark:bg-[#18191D]/70 border border-[#E2E2E8] dark:border-[#292A30] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#24252B] border border-[#D7D7DD] dark:border-[#292A30] text-[#E54833] font-mono font-medium text-xs flex items-center justify-center shrink-0">
                        {dayStr}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-[#18191D] dark:text-[#F4F4F6] truncate">
                          {evt.targetName || evt.title || 'Cliente'}
                        </p>
                        <p className="text-[11px] font-mono text-[#686971] dark:text-[#BFC0C7] truncate">
                          {evt.subtitle || 'Neste mês'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenWhatsApp(evt.phone, `Olá ${evt.targetName || evt.title}! Parabéns pelo seu aniversário neste mês especial!`)}
                      title="Enviar WhatsApp"
                      className="p-1.5 rounded-lg text-[#686971] hover:text-[#18191D] dark:hover:text-[#F4F4F6] hover:bg-[#EEEEF1] dark:hover:bg-[#292A30] transition-colors shrink-0"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. BOTTOM SECTION: ÚLTIMOS CONTATOS / LINHA DO TEMPO */}
      {/* ==================================================================== */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white/70 backdrop-blur-md dark:bg-[#202126]/85 border border-[#E2E2E8] dark:border-[#292A30] shadow-subtle space-y-5">
        <div className="flex items-center justify-between pb-2 border-b border-[#E2E2E8] dark:border-[#292A30]">
          <div>
            <h3 className="font-sans text-base font-medium tracking-tight text-[#18191D] dark:text-[#F4F4F6]">
              Últimos contatos & Felicitações
            </h3>
            <p className="text-xs text-[#686971] dark:text-[#BFC0C7] mt-0.5">
              Histórico recente de mensagens e interações de relacionamento
            </p>
          </div>
          <button
            onClick={() => onNavigate('alerts')}
            className="text-xs font-medium text-[#686971] dark:text-[#BFC0C7] hover:text-[#18191D] dark:hover:text-[#F4F4F6] flex items-center gap-1"
          >
            <span>Ver histórico completo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {stats?.todayAlertsList && stats.todayAlertsList.length > 0 ? (
          <div className="space-y-3 divide-y divide-[#E2E2E8] dark:divide-[#292A30]">
            {stats.todayAlertsList.map((alertItem) => (
              <div key={alertItem.id} className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="font-medium text-[#18191D] dark:text-[#F4F4F6]">
                      {alertItem.targetName || alertItem.clientName || 'Cliente'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#EEEEF1] dark:bg-[#24252B] text-[#18191D] dark:text-[#F4F4F6] border border-[#D7D7DD] dark:border-[#292A30]">
                      {alertItem.eventType === 'CLIENT_BIRTHDAY' || alertItem.eventType === 'FAMILY_BIRTHDAY'
                        ? 'Aniversário'
                        : 'Data Comemorativa'}
                    </span>
                    <span className="text-[11px] font-mono text-[#686971] dark:text-[#BFC0C7]">
                      {new Date(alertItem.alertDate).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-xs text-[#686971] dark:text-[#BFC0C7] leading-relaxed line-clamp-2">
                    {alertItem.renderedMessage || 'Mensagem automática gerada.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopyText(alertItem.id, alertItem.renderedMessage)}
                    className="p-1.5 rounded-lg text-[#686971] hover:text-[#18191D] dark:hover:text-[#F4F4F6] hover:bg-[#EEEEF1] dark:hover:bg-[#292A30] transition-colors"
                    title="Copiar mensagem"
                  >
                    {copiedId === alertItem.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  {alertItem.clientPhone && (
                    <button
                      type="button"
                      onClick={() => handleOpenWhatsApp(alertItem.clientPhone!, alertItem.renderedMessage)}
                      className="btn-primary"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-[#F4F4F6]/70 dark:bg-[#18191D]/70 border border-[#E2E2E8] dark:border-[#292A30] space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium text-[#18191D] dark:text-[#F4F4F6]">Cliente</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#EEEEF1] dark:bg-[#24252B] border border-[#D7D7DD] dark:border-[#292A30] text-[#686971] dark:text-[#BFC0C7]">Novidades</span>
                <span className="text-[11px] font-mono text-[#686971] dark:text-[#BFC0C7]">02/10/2026</span>
              </div>
              <p className="text-xs text-[#686971] dark:text-[#BFC0C7]">
                Enviei o lançamento novo antes de todo mundo, ela adorou.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
