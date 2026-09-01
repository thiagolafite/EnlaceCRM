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
    <aside aria-label="Alerta de Felicitações" className="w-full bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-700 text-white px-3 sm:px-6 py-2.5 shadow-xl border-b border-white/15 relative z-30 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        {/* Left: Icon & Notification message */}
        <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
          <div className="relative shrink-0 flex items-center justify-center w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md border border-white/25 shadow-xs">
            {totalToday > 0 ? (
              <>
                <Gift className="w-4 h-4 text-amber-200 animate-bounce" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-rose-700 animate-pulse"></span>
              </>
            ) : (
              <CalendarDays className="w-4 h-4 text-indigo-100" />
            )}
          </div>

          <div className="flex items-center gap-2 min-w-0">
            {totalToday > 0 && (
              <span className="hidden md:inline-flex px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-white text-rose-700 shadow-xs shrink-0">
                Hoje
              </span>
            )}
            <p className="text-xs sm:text-sm font-bold truncate text-white/95 tracking-tight">
              {mainText}
            </p>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={openDailyModal}
            className="px-4 py-1.5 rounded-xl bg-white text-slate-950 hover:bg-amber-300 hover:text-slate-950 text-xs font-black shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5 text-rose-600" />
            <span>Ver & Enviar Agora</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('dates')}
              className="hidden lg:flex px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors items-center gap-1 border border-white/10"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Agenda</span>
            </button>
          )}

          <button
            type="button"
            onClick={dismissTopBar}
            title="Minimizar barra (lembrete continuará acessível no sino do topo)"
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/15 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
