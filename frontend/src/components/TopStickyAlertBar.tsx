import React from 'react';
import { Send, X, ArrowRight, CalendarDays, Bell } from 'lucide-react';
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
    <aside aria-label="Alerta de Felicitações" className="w-full bg-[#18181B] dark:bg-[#1E1E22] text-[#EDEDEA] px-3 sm:px-6 py-2 border-b border-[#2D2D32] relative z-30 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Left: Indicator and message */}
        <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
          {totalToday > 0 ? (
            <span className="w-2 h-2 rounded-full bg-[#ea580c] shrink-0"></span>
          ) : (
            <CalendarDays className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          )}

          <div className="flex items-center gap-2 min-w-0">
            {totalToday > 0 && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#ea580c] text-white shrink-0">
                Hoje
              </span>
            )}
            <p className="text-xs font-medium truncate text-stone-200">
              {mainText}
            </p>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={openDailyModal}
            className="px-3 py-1 rounded-lg bg-white text-stone-900 hover:bg-stone-200 text-xs font-semibold transition-all active:scale-[0.99] flex items-center gap-1.5"
          >
            <span>Ver & Enviar</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('dates')}
              className="hidden lg:flex px-2 py-1 rounded-lg hover:bg-white/10 text-stone-300 text-xs font-medium transition-colors items-center gap-1"
            >
              <span>Agenda</span>
            </button>
          )}

          <button
            type="button"
            onClick={dismissTopBar}
            title="Minimizar barra"
            className="p-1 rounded-md text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
