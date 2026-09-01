import React from 'react';
import { BellRing, Sparkles, Send, X, ArrowRight, CalendarDays, Gift } from 'lucide-react';
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

  // Gerar texto do banner
  let mainText = '';
  if (totalToday > 0) {
    const firstEvent = todayEvents[0];
    const targetName = firstEvent.targetName || firstEvent.title;
    if (totalToday === 1) {
      mainText = `🎉 Lembrete de Hoje: ${firstEvent.title} (${targetName}) aguardando envio!`;
    } else {
      mainText = `🎉 ${totalToday} Felicitações Hoje: ${targetName} e +${totalToday - 1} homenageado(s)!`;
    }
  } else {
    const firstUpcoming = upcomingEvents[0];
    mainText = `📅 Próximo Lembrete em ${firstUpcoming.daysRemaining} dia(s): ${firstUpcoming.title}`;
  }

  return (
    <aside aria-label="Alerta de Felicitações" className="w-full bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 text-white px-3 sm:px-6 py-2.5 shadow-lg border-b border-indigo-500/40 relative z-30 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        {/* Left: Icon & Notification message */}
        <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
          <div className="relative shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-white/20 backdrop-blur-md">
            {totalToday > 0 ? (
              <>
                <Gift className="w-4 h-4 text-amber-300 animate-bounce" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-indigo-700 animate-pulse"></span>
              </>
            ) : (
              <CalendarDays className="w-4 h-4 text-indigo-200" />
            )}
          </div>

          <div className="flex items-center gap-2 min-w-0">
            {totalToday > 0 && (
              <span className="hidden md:inline-flex px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-900 shrink-0">
                Hoje
              </span>
            )}
            <p className="text-xs sm:text-sm font-semibold truncate text-white/95">
              {mainText}
            </p>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={openDailyModal}
            className="px-3.5 py-1.5 rounded-xl bg-white text-indigo-900 hover:bg-amber-300 hover:text-slate-950 text-xs font-black shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ver & Enviar Agora</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('dates')}
              className="hidden lg:flex px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors items-center gap-1"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Agenda</span>
            </button>
          )}

          <button
            type="button"
            onClick={dismissTopBar}
            title="Minimizar barra (lembrete continuará acessível no sino do topo)"
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
