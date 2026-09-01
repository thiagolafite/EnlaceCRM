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
        className={`relative p-2 rounded-xl border transition-all ${
          todayCount > 0
            ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/60'
            : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
        }`}
      >
        <Bell className={`w-4 h-4 ${todayCount > 0 ? 'animate-swing' : ''}`} />
        {totalCount > 0 && (
          <span
            className={`absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full text-[10px] font-black flex items-center justify-center text-white ${
              todayCount > 0 ? 'bg-rose-500 animate-pulse' : 'bg-indigo-600'
            }`}
          >
            {totalCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Lembretes & Felicitações
              </h4>
            </div>
            {todayCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                {todayCount} hoje
              </span>
            )}
          </div>

          {/* List of items */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {todayEvents.length === 0 && upcomingEvents.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
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
                    className="p-3 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 cursor-pointer transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center text-sm shrink-0">
                        {evt.type === 'FIXED_DATE' ? '📅' : '🎂'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {evt.targetName || evt.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {evt.subtitle}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
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
                    className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 flex items-center justify-center text-sm shrink-0">
                        {evt.type === 'FIXED_DATE' ? '📅' : '🎂'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {evt.targetName || evt.title}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          Em {evt.daysRemaining} dias ({evt.day}/{evt.month})
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Footer Action */}
          <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                openDailyModal();
              }}
              className="w-full py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Abrir Central de Envios</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
