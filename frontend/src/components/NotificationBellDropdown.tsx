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
        className="relative p-2 rounded-xl border border-[#C85A32]/35 bg-[#FFFFFF] dark:bg-[#14181D] text-[#495057] dark:text-[#ADB5BD] hover:text-[#1A1E24] dark:hover:text-[#F1F3F5] hover:border-[#C85A32] transition-colors shadow-subtle"
      >
        <Bell className="w-3.5 h-3.5" />
        {totalCount > 0 && (
          <span
            className={`absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full text-[9px] font-semibold flex items-center justify-center text-white ${
              todayCount > 0 ? 'bg-[#C85A32]' : 'bg-[#1A1E24] dark:bg-[#2A313A]'
            }`}
          >
            {totalCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-[#F8F9FA] dark:bg-[#181C21] border-2 border-[#C85A32]/40 rounded-2xl shadow-dropdown z-50 overflow-hidden animate-in fade-in duration-100">
          {/* Header */}
          <div className="p-3 bg-[#FFFFFF] dark:bg-[#14181D] border-b hairline-border flex items-center justify-between">
            <span className="text-xs font-serif font-semibold text-[#1A1E24] dark:text-[#F1F3F5]">
              Lembretes & Felicitações
            </span>
            {todayCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#C85A32] text-white">
                {todayCount} hoje
              </span>
            )}
          </div>

          {/* List of items */}
          <div className="max-h-64 overflow-y-auto divide-y divide-[#C85A32]/15 dark:divide-[#C85A32]/20">
            {todayEvents.length === 0 && upcomingEvents.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#6C757D]">
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
                    className="p-3 hover:bg-[#E9ECEF]/60 dark:hover:bg-[#1E252E]/60 cursor-pointer transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#1A1E24] dark:text-[#F1F3F5] truncate">
                        {evt.targetName || evt.title}
                      </p>
                      <p className="text-[11px] text-[#6C757D] dark:text-[#ADB5BD] truncate">
                        {evt.subtitle}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFFFFF] text-[#C85A32] dark:bg-[#181C21] dark:text-[#F39C74] border border-[#C85A32] shrink-0">
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
                    className="p-3 hover:bg-[#E9ECEF]/60 dark:hover:bg-[#1E252E]/60 cursor-pointer transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#1A1E24] dark:text-[#F1F3F5] truncate">
                        {evt.targetName || evt.title}
                      </p>
                      <p className="text-[11px] text-[#6C757D] dark:text-[#ADB5BD] truncate">
                        {evt.subtitle}
                      </p>
                    </div>
                    <span className="text-[10px] text-[#6C757D] font-mono shrink-0">
                      Em {evt.daysRemaining}d
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-[#FFFFFF] dark:bg-[#14181D] border-t hairline-border">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                openDailyModal();
              }}
              className="w-full py-2 rounded-xl bg-[#C85A32] hover:bg-[#B34A24] border border-[#D97757] text-white text-xs font-semibold flex items-center justify-center gap-1 transition-colors shadow-xs"
            >
              <span>Abrir Central de Disparo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
