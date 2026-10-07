import { X, ArrowRight, CalendarDays } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

interface TopStickyAlertBarProps {
  onNavigate?: (tab: string) => void;
}

export function TopStickyAlertBar({ onNavigate }: TopStickyAlertBarProps) {
  const { todayEvents, upcomingEvents, isTopBarVisible, dismissTopBar, openDailyModal } = useNotifications();

  if (!isTopBarVisible) return null;

  const totalToday = todayEvents.length;
  const totalUpcoming = upcomingEvents.length;

  if (totalToday === 0 && totalUpcoming === 0) return null;

  let mainText = '';
  if (totalToday > 0) {
    const firstEvent = todayEvents[0];
    const targetName = firstEvent.targetName || firstEvent.title;
    if (totalToday === 1) {
      mainText = `Lembrete de Hoje: ${firstEvent.title} (${targetName})`;
    } else {
      mainText = `${totalToday} felicitações hoje: ${targetName} e outros ${totalToday - 1}`;
    }
  } else {
    const firstUpcoming = upcomingEvents[0];
    mainText = `Próximo evento em ${firstUpcoming.daysRemaining} dia(s): ${firstUpcoming.title}`;
  }

  return (
    <aside aria-label="Alerta de Felicitações" className="w-full bg-[#13171C] text-[#F1F3F5] px-3 sm:px-6 py-2 border-b-2 border-[#C85A32]/35 relative z-30 transition-all shadow-panel">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Left: Indicator and message */}
        <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
          {totalToday > 0 ? (
            <span className="w-2 h-2 rounded-full bg-[#C85A32] shrink-0 animate-ping"></span>
          ) : (
            <CalendarDays className="w-3.5 h-3.5 text-[#C85A32] shrink-0" />
          )}

          <div className="flex items-center gap-2 min-w-0">
            {totalToday > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#C85A32] text-white shrink-0 shadow-xs">
                Hoje
              </span>
            )}
            <p className="text-xs font-medium truncate text-[#F1F3F5]">
              {mainText}
            </p>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={openDailyModal}
            className="px-3 py-1 rounded-xl bg-[#C85A32] hover:bg-[#B34A24] text-white text-xs font-semibold transition-all active:scale-[0.99] flex items-center gap-1.5 shadow-xs"
          >
            <span>Ver & Enviar</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('dates')}
              className="hidden lg:flex px-2.5 py-1 rounded-xl hover:bg-white/10 text-[#ADB5BD] hover:text-[#F1F3F5] text-xs font-medium transition-colors items-center gap-1 border border-[#C85A32]/25"
            >
              <span>Agenda</span>
            </button>
          )}

          <button
            type="button"
            onClick={dismissTopBar}
            title="Minimizar barra"
            className="p-1 rounded-lg text-[#ADB5BD] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
