import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

interface NotificationBellDropdownProps {
  onNavigate?: (tab: string) => void;
}

export function NotificationBellDropdown({ onNavigate: _onNavigate }: NotificationBellDropdownProps) {
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
        className="relative p-2 rounded-xl border border-[#E2E2E8] dark:border-[#292A30] bg-white/70 dark:bg-[#202126] text-[#686971] dark:text-[#BFC0C7] hover:text-[#18191D] dark:hover:text-[#F4F4F6] hover:border-[#C6C7CD] transition-colors shadow-subtle"
      >
        <Bell className="w-4 h-4" />
        {totalCount > 0 && (
          <span
            className={`absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full text-[9px] font-mono font-medium flex items-center justify-center text-white ${
              todayCount > 0 ? 'bg-[#E54833]' : 'bg-[#18191D] dark:bg-[#33343A]'
            }`}
          >
            {totalCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white/95 dark:bg-[#18191D]/95 backdrop-blur-md border border-[#E2E2E8] dark:border-[#292A30] rounded-2xl shadow-dropdown z-50 overflow-hidden animate-in fade-in duration-100">
          {/* Header */}
          <div className="p-3 bg-[#EEEEF1]/60 dark:bg-[#202126]/60 border-b hairline-border flex items-center justify-between">
            <span className="text-xs font-medium text-[#18191D] dark:text-[#F4F4F6]">
              Lembretes & Felicitações
            </span>
            {todayCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#E54833] text-white">
                {todayCount} hoje
              </span>
            )}
          </div>

          {/* List of items */}
          <div className="max-h-64 overflow-y-auto divide-y divide-[#E2E2E8] dark:divide-[#292A30]">
            {todayEvents.length === 0 && upcomingEvents.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#686971]">
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
                    className="p-3 hover:bg-[#EEEEF1]/70 dark:hover:bg-[#202126] cursor-pointer transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[#18191D] dark:text-[#F4F4F6] truncate">
                        {evt.targetName || evt.title}
                      </p>
                      <p className="text-[11px] text-[#686971] dark:text-[#BFC0C7] truncate">
                        {evt.subtitle}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#E54833] text-white shrink-0">
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
                    className="p-3 hover:bg-[#EEEEF1]/70 dark:hover:bg-[#202126] cursor-pointer transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[#18191D] dark:text-[#F4F4F6] truncate">
                        {evt.targetName || evt.title}
                      </p>
                      <p className="text-[11px] text-[#686971] dark:text-[#BFC0C7] truncate">
                        {evt.subtitle}
                      </p>
                    </div>
                    <span className="text-[10px] text-[#686971] dark:text-[#BFC0C7] font-mono shrink-0 bg-[#EEEEF1] dark:bg-[#24252B] px-1.5 py-0.5 rounded-md border border-[#D7D7DD] dark:border-[#292A30]">
                      Em {evt.daysRemaining}d
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-[#EEEEF1]/40 dark:bg-[#202126]/40 border-t hairline-border">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                openDailyModal();
              }}
              className="btn-primary w-full"
            >
              <span>Abrir Central de Disparo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
