import React, { useState, useRef, useEffect } from 'react';
import { Bell, ArrowRight, Calendar } from 'lucide-react';
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
        className="relative p-2 rounded-lg border border-[#E7E7E4] dark:border-[#26262B] bg-[#FFFFFF] dark:bg-[#18181B] text-stone-600 dark:text-stone-300 hover:bg-[#F4F4F2] dark:hover:bg-[#202024] transition-colors"
      >
        <Bell className="w-3.5 h-3.5" />
        {totalCount > 0 && (
          <span
            className={`absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full text-[9px] font-semibold flex items-center justify-center text-white ${
              todayCount > 0 ? 'bg-[#ea580c]' : 'bg-[#18181B] dark:bg-stone-600'
            }`}
          >
            {totalCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white dark:bg-[#141416] border border-[#E7E7E4] dark:border-[#26262B] rounded-xl shadow-dropdown z-50 overflow-hidden animate-in fade-in duration-100">
          {/* Header */}
          <div className="p-3 bg-[#FBFBFA] dark:bg-[#18181B] border-b border-[#E7E7E4] dark:border-[#26262B] flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
              Lembretes & Felicitações
            </span>
            {todayCount > 0 && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#ea580c] text-white">
                {todayCount} hoje
              </span>
            )}
          </div>

          {/* List of items */}
          <div className="max-h-64 overflow-y-auto divide-y divide-[#E7E7E4]/60 dark:divide-[#26262B]/60">
            {todayEvents.length === 0 && upcomingEvents.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-400">
                Nenhum lembrete pendente.
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
                    className="p-3 hover:bg-[#F4F4F2] dark:hover:bg-[#1C1C20] cursor-pointer transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                        {evt.targetName || evt.title}
                      </p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                        {evt.subtitle}
                      </p>
                    </div>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 shrink-0">
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
                    className="p-3 hover:bg-[#F4F4F2] dark:hover:bg-[#1C1C20] cursor-pointer transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                        {evt.targetName || evt.title}
                      </p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                        {evt.subtitle}
                      </p>
                    </div>
                    <span className="text-[10px] text-stone-400 font-mono shrink-0">
                      Em {evt.daysRemaining}d
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-[#FBFBFA] dark:bg-[#18181B] border-t border-[#E7E7E4] dark:border-[#26262B]">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                openDailyModal();
              }}
              className="w-full py-1.5 rounded-lg bg-[#18181B] text-white dark:bg-[#EDEDEA] dark:text-[#18181B] text-xs font-medium flex items-center justify-center gap-1 transition-colors"
            >
              <span>Abrir Central de Disparo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
