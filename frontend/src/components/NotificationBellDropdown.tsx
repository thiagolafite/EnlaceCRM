import React, { useState, useRef, useEffect } from 'react';
import { Bell, Sparkles, Gift, CalendarDays, ExternalLink, Send, ArrowRight, X } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

interface NotificationBellDropdownProps {
  onNavigate?: (tab: string) => void;
}

export function NotificationBellDropdown({ onNavigate }: NotificationBellDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { todayEvents, upcomingEvents, openDailyModal } = useNotifications();

  const totalCount = todayEvents.length + upcomingEvents.length;
  const todayCount = todayEvents.length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Lembretes e Felicitações"
        className={`relative p-2.5 rounded-2xl border transition-all duration-200 shadow-xs hover:scale-105 active:scale-95 ${
          todayCount > 0
            ? 'border-amber-400/50 bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 shadow-glow-amber/30'
            : 'border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-obsidian-850 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-obsidian-800'
        }`}
      >
        <Bell className="w-4 h-4" />
        {totalCount > 0 && (
          <span
            className={`absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full text-[9px] font-black flex items-center justify-center text-white shadow-xs ${
              todayCount > 0 ? 'bg-gradient-to-r from-rose-500 to-amber-500 animate-pulse' : 'bg-indigo-600'
            }`}
          >
            {totalCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white/95 dark:bg-obsidian-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-white/[0.1] rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="p-4 bg-slate-50/90 dark:bg-obsidian-950/90 border-b border-slate-200/60 dark:border-white/[0.05] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-indigo-500" />
              <h4 className="text-xs font-black font-outfit text-slate-900 dark:text-white uppercase tracking-wider">
                Lembretes & Felicitações
              </h4>
            </div>
            {todayCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs">
                {todayCount} hoje
              </span>
            )}
          </div>

          {/* List of items */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-white/[0.04]">
            {todayEvents.length === 0 && upcomingEvents.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 font-medium">
                Nenhuma notificação ou lembrete pendente.
              </div>
            ) : (
              <>
                {todayEvents.map((evt, i) => (
                  <div
                    key={`drop-today-${i}`}
                    onClick={() => {
                      setIsOpen(false);
                      openDailyModal();
                    }}
                    className="p-3.5 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 cursor-pointer transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm shrink-0">
                        {evt.type === 'FIXED_DATE' ? '📅' : '🎂'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {evt.targetName || evt.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {evt.subtitle}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 shrink-0">
                      Hoje
                    </span>
                  </div>
                ))}

                {upcomingEvents.map((evt, i) => (
                  <div
                    key={`drop-up-${i}`}
                    onClick={() => {
                      setIsOpen(false);
                      openDailyModal();
                    }}
                    className="p-3.5 hover:bg-slate-50 dark:hover:bg-obsidian-800/60 cursor-pointer transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-obsidian-800 text-slate-500 dark:text-slate-400 flex items-center justify-center text-sm shrink-0">
                        {evt.type === 'FIXED_DATE' ? '📅' : '🎂'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {evt.targetName || evt.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {evt.subtitle}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 shrink-0">
                      Em {evt.daysRemaining}d
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-50/90 dark:bg-obsidian-950/90 border-t border-slate-200/60 dark:border-white/[0.05] flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                openDailyModal();
              }}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black shadow-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Abrir Central de Disparo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
