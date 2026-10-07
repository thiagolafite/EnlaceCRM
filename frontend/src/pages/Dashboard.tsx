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
      <div className="py-24 text-center text-sm font-serif text-[#756557] dark:text-[#B5A599] animate-pulse">
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
    <div className="space-y-8 animate-in fade-in duration-300">
      <ErrorBanner
        error={error?.message || null}
        solution={error?.solution}
        onClose={() => setError(null)}
        onRetry={loadDashboardData}
      />

      {feedbackMessage && (
        <div className="p-4 rounded-2xl bg-[#FBF0E6] dark:bg-[#2A1C16] border border-[#F5D2BF] dark:border-[#4C2D20] text-xs font-medium text-[#C85A32] dark:text-[#E07A5F] flex items-center justify-between shadow-xs">
          <span>{feedbackMessage}</span>
          <button onClick={() => setFeedbackMessage(null)} className="text-xs font-bold underline">
            Fechar
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 1. HERO HEADER (EXATAMENTE COMO NO DESIGN DE REFERÊNCIA) */}
      {/* ==================================================================== */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8C7A6B] dark:text-[#A8988B]">
          PAINEL
        </p>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[40px] font-normal tracking-tight text-[#1E1611] dark:text-[#F5EFE8] leading-tight">
              Sua carteira, viva e por perto
            </h2>
            <p className="text-sm text-[#756557] dark:text-[#B5A599] mt-1.5 max-w-2xl leading-relaxed">
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
      {/* 2. TOP METRIC CARDS (3 CARDS COM DESTAQUE WARM PEACH NO CENTRO) */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Clientes na Carteira */}
        <div
          onClick={() => onNavigate('clients')}
          className="p-6 rounded-3xl bg-white dark:bg-[#1A1513] border border-[#EDE5DC] dark:border-[#2A211D] hover:border-[#DFCFC0] dark:hover:border-[#3D3028] shadow-subtle hover:shadow-panel transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-[#8C7A6B] dark:text-[#A8988B]">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em]">
              CLIENTES NA CARTEIRA
            </span>
            <div className="w-8 h-8 rounded-full bg-[#FAF6F0] dark:bg-[#241D18] flex items-center justify-center">
              <Users className="w-4 h-4 text-[#756557] dark:text-[#B5A599]" />
            </div>
          </div>
          <div className="mt-6">
            <span className="font-serif text-4xl sm:text-5xl font-normal text-[#1E1611] dark:text-[#F5EFE8]">
              {totalClientsCount}
            </span>
            <p className="text-xs text-[#756557] dark:text-[#B5A599] mt-1">
              {totalFamilyCount > 0 ? `${totalFamilyCount} familiares vinculados` : 'Prontos para relacionamento'}
            </p>
          </div>
        </div>

        {/* Card 2: Aniversariantes do Mês (DESTAQUE PEACH / TERRACOTTA) */}
        <div
          onClick={() => onNavigate('timeline')}
          className="p-6 rounded-3xl bg-[#FBF0E6] dark:bg-[#2A1C16] border border-[#F5D2BF] dark:border-[#4C2D20] hover:border-[#E8B89F] shadow-subtle hover:shadow-panel transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-[#C85A32] dark:text-[#E07A5F]">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em]">
              ANIVERSARIANTES DO MÊS
            </span>
            <div className="w-8 h-8 rounded-full bg-[#F6D5C2] dark:bg-[#3D251C] flex items-center justify-center">
              <Cake className="w-4 h-4 text-[#C85A32] dark:text-[#E07A5F]" />
            </div>
          </div>
          <div className="mt-6">
            <span className="font-serif text-4xl sm:text-5xl font-normal text-[#C85A32] dark:text-[#E07A5F]">
              {monthBirthdaysCount}
            </span>
            <p className="text-xs text-[#8C7A6B] dark:text-[#C5B5A7] mt-1">
              Mensagem pronta para cada um
            </p>
          </div>
        </div>

        {/* Card 3: Clientes VIP / Alertas do Dia */}
        <div
          onClick={() => onNavigate('alerts')}
          className="p-6 rounded-3xl bg-white dark:bg-[#1A1513] border border-[#EDE5DC] dark:border-[#2A211D] hover:border-[#DFCFC0] dark:hover:border-[#3D3028] shadow-subtle hover:shadow-panel transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-[#8C7A6B] dark:text-[#A8988B]">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em]">
              LEMBRETES DE HOJE
            </span>
            <div className="w-8 h-8 rounded-full bg-[#FAF6F0] dark:bg-[#241D18] flex items-center justify-center">
              <Star className="w-4 h-4 text-[#756557] dark:text-[#B5A599]" />
            </div>
          </div>
          <div className="mt-6">
            <span className="font-serif text-4xl sm:text-5xl font-normal text-[#1E1611] dark:text-[#F5EFE8]">
              {todayAlertsCount}
            </span>
            <p className="text-xs text-[#756557] dark:text-[#B5A599] mt-1">
              {todayAlertsCount > 0 ? 'Felicitações para envio hoje' : 'Nenhuma pendência para hoje'}
            </p>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. MIDDLE DUAL SECTIONS (PRÓXIMAS DATAS + ANIVERSARIANTES DO MÊS) */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Próximas Datas */}
        <div className="lg:col-span-7 p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#1A1513] border border-[#EDE5DC] dark:border-[#2A211D] shadow-subtle space-y-5">
          <div className="flex items-center justify-between pb-1 border-b border-[#EDE5DC]/60 dark:border-[#2A211D]/60">
            <h3 className="font-serif text-xl font-normal text-[#1E1611] dark:text-[#F5EFE8]">
              Próximas datas
            </h3>
            <button
              onClick={() => onNavigate('timeline')}
              className="text-xs font-semibold text-[#8C7A6B] dark:text-[#B5A599] hover:text-[#C85A32] flex items-center gap-1 transition-colors"
            >
              <span>Ver agenda</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {upcoming.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#8C7A6B]">
              Nenhum evento agendado para os próximos dias.
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.slice(0, 4).map((evt, idx) => {
                const titleText = evt.title || `Aniversário de ${evt.targetName || 'Cliente'}`;
                const dateText = evt.subtitle || (evt.date ? new Date(evt.date + 'T00:00:00').toLocaleDateString('pt-BR') : 'Em breve');
                const daysText = evt.isToday ? 'Hoje' : `Em ${evt.daysRemaining} dias`;

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#FAF6F0]/60 dark:bg-[#201915]/60 border border-[#EDE5DC] dark:border-[#2A211D] flex items-center justify-between gap-3 hover:border-[#DFCFC0] dark:hover:border-[#3D3028] transition-all"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-[#FBF0E6] dark:bg-[#2D1E18] text-[#C85A32] flex items-center justify-center shrink-0">
                        <Cake className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#1E1611] dark:text-[#F5EFE8] truncate">
                          {titleText}
                        </p>
                        <p className="text-xs text-[#8C7A6B] dark:text-[#A8988B] truncate mt-0.5">
                          {dateText}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#F3ECE4] dark:bg-[#2A201C] text-[#756557] dark:text-[#B5A599]">
                        {daysText}
                      </span>
                      {evt.phone ? (
                        <button
                          onClick={() => handleOpenWhatsApp(evt.phone, `Olá ${evt.targetName || evt.title}! Parabéns antecipado por este momento especial!`)}
                          title="Enviar mensagem WhatsApp"
                          className="p-2 rounded-xl text-[#8C7A6B] hover:text-[#C85A32] hover:bg-[#F3ECE4] dark:hover:bg-[#2A201C] transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onNavigate('alerts')}
                          title="Ver alerta"
                          className="p-2 rounded-xl text-[#8C7A6B] hover:text-[#C85A32] hover:bg-[#F3ECE4] dark:hover:bg-[#2A201C] transition-colors"
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
        <div className="lg:col-span-5 p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#1A1513] border border-[#EDE5DC] dark:border-[#2A211D] shadow-subtle space-y-5">
          <div className="flex items-center justify-between pb-1 border-b border-[#EDE5DC]/60 dark:border-[#2A211D]/60">
            <h3 className="font-serif text-xl font-normal text-[#1E1611] dark:text-[#F5EFE8]">
              Aniversariantes do mês
            </h3>
            <span className="text-xs text-[#8C7A6B]">
              {monthEvents.length} no mês
            </span>
          </div>

          {monthEvents.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#8C7A6B]">
              Nenhum aniversariante registrado neste mês.
            </div>
          ) : (
            <div className="space-y-3">
              {monthEvents.slice(0, 5).map((evt, idx) => {
                const dayStr = evt.date ? evt.date.split('-')[2] : String(idx + 1).padStart(2, '0');

                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[#FAF6F0]/40 dark:bg-[#201915]/40 border border-[#EDE5DC] dark:border-[#2A211D] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[#FBF0E6] dark:bg-[#2E201A] text-[#C85A32] dark:text-[#E07A5F] font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {dayStr}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#1E1611] dark:text-[#F5EFE8] truncate">
                          {evt.targetName || evt.title || 'Cliente'}
                        </p>
                        <p className="text-[11px] text-[#8C7A6B] dark:text-[#A8988B] truncate">
                          {evt.subtitle || 'Neste mês'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenWhatsApp(evt.phone, `Olá ${evt.targetName || evt.title}! Parabéns pelo seu aniversário neste mês especial!`)}
                      title="Enviar WhatsApp"
                      className="p-2 rounded-xl text-[#8C7A6B] hover:text-[#C85A32] hover:bg-[#F3ECE4] dark:hover:bg-[#2A201C] transition-colors shrink-0"
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
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1A1513] border border-[#EDE5DC] dark:border-[#2A211D] shadow-subtle space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-[#EDE5DC]/60 dark:border-[#2A211D]/60">
          <div>
            <h3 className="font-serif text-xl font-normal text-[#1E1611] dark:text-[#F5EFE8]">
              Últimos contatos & Felicitações
            </h3>
            <p className="text-xs text-[#8C7A6B] mt-0.5">
              Histórico recente de mensagens e interações de relacionamento
            </p>
          </div>
          <button
            onClick={() => onNavigate('alerts')}
            className="text-xs font-semibold text-[#8C7A6B] hover:text-[#C85A32] flex items-center gap-1"
          >
            <span>Ver histórico completo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {stats?.todayAlertsList && stats.todayAlertsList.length > 0 ? (
          <div className="space-y-3 divide-y divide-[#EDE5DC]/60 dark:divide-[#2A211D]/60">
            {stats.todayAlertsList.map((alertItem) => (
              <div key={alertItem.id} className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="font-semibold text-[#1E1611] dark:text-[#F5EFE8]">
                      {alertItem.targetName || alertItem.clientName || 'Cliente'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FBF0E6] text-[#C85A32] dark:bg-[#2D1E18] dark:text-[#E07A5F]">
                      {alertItem.eventType === 'CLIENT_BIRTHDAY' || alertItem.eventType === 'FAMILY_BIRTHDAY'
                        ? 'Aniversário'
                        : 'Data Comemorativa'}
                    </span>
                    <span className="text-[11px] font-mono text-[#8C7A6B]">
                      {new Date(alertItem.alertDate).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-xs text-[#756557] dark:text-[#B5A599] leading-relaxed line-clamp-2">
                    {alertItem.renderedMessage || 'Mensagem automática gerada.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopyText(alertItem.id, alertItem.renderedMessage)}
                    className="p-2 rounded-xl text-[#8C7A6B] hover:text-[#1E1611] hover:bg-[#F3ECE4] dark:hover:bg-[#221B17] transition-colors"
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
                      className="px-3.5 py-1.5 rounded-xl bg-[#C85A32] hover:bg-[#B34A24] text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
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
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#FAF6F0]/60 dark:bg-[#201915]/60 border border-[#EDE5DC] dark:border-[#2A211D] space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-[#1E1611] dark:text-[#F5EFE8]">Cliente</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F3ECE4] dark:bg-[#2A201C] text-[#756557]">Novidades</span>
                <span className="text-[11px] font-mono text-[#8C7A6B]">02/10/2026</span>
              </div>
              <p className="text-xs text-[#756557] dark:text-[#B5A599]">
                Enviei o lançamento novo antes de todo mundo, ela adorou.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF6F0]/60 dark:bg-[#201915]/60 border border-[#EDE5DC] dark:border-[#2A211D] space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-[#1E1611] dark:text-[#F5EFE8]">Cliente</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F3ECE4] dark:bg-[#2A201C] text-[#756557]">Renovação</span>
                <span className="text-[11px] font-mono text-[#8C7A6B]">30/09/2026</span>
              </div>
              <p className="text-xs text-[#756557] dark:text-[#B5A599]">
                Conversamos sobre a renovação de janeiro, ficou de confirmar em dezembro.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF6F0]/60 dark:bg-[#201915]/60 border border-[#EDE5DC] dark:border-[#2A211D] space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-[#1E1611] dark:text-[#F5EFE8]">Cliente</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F3ECE4] dark:bg-[#2A201C] text-[#756557]">Pós-venda</span>
                <span className="text-[11px] font-mono text-[#8C7A6B]">22/09/2026</span>
              </div>
              <p className="text-xs text-[#756557] dark:text-[#B5A599]">
                Agradeceu o retorno e pediu orçamento para o novo projeto.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
