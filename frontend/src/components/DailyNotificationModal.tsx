import React, { useState } from 'react';
import {
  X,
  MessageCircle,
  Mail,
  Copy,
  Check,
  CalendarDays,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { generateEventMessage } from '../utils/messageGenerator';

interface DailyNotificationModalProps {
  onNavigate?: (tab: string) => void;
}

export function DailyNotificationModal({ onNavigate }: DailyNotificationModalProps) {
  const { isDailyModalOpen, closeDailyModal, todayEvents, upcomingEvents, templates } = useNotifications();
  const [selectedChannel, setSelectedChannel] = useState<'WHATSAPP' | 'EMAIL'>('WHATSAPP');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'TODAY' | 'UPCOMING'>('TODAY');

  if (!isDailyModalOpen) return null;

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenWhatsApp = (phone: string, text: string) => {
    let clean = phone.replace(/\D/g, '');
    if (!clean.startsWith('55') && clean.length <= 11) {
      clean = '55' + clean;
    }
    const url = `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleOpenEmail = (email: string, subject: string, body: string) => {
    const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, '_blank');
  };

  const displayedEvents = activeTab === 'TODAY' ? todayEvents : upcomingEvents;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#141416] border border-[#E7E7E4] dark:border-[#26262B] rounded-2xl shadow-modal overflow-hidden flex flex-col max-h-[85vh] my-auto">
        {/* Header */}
        <div className="p-5 border-b border-[#E7E7E4] dark:border-[#26262B] flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-[#18181B] dark:text-[#EDEDEA]">
              Felicitações do Dia
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Lembretes prontos para disparo direto
            </p>
          </div>

          <button
            type="button"
            onClick={closeDailyModal}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-[#F4F4F2] dark:hover:bg-[#202024] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Subheader Controls: Tabs & Channel Switcher */}
        <div className="px-5 py-2.5 bg-[#FBFBFA] dark:bg-[#18181B] border-b border-[#E7E7E4] dark:border-[#26262B] flex items-center justify-between flex-wrap gap-2">
          {/* Tabs */}
          <div className="flex bg-[#EFEFEc] dark:bg-[#202024] p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('TODAY')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                activeTab === 'TODAY'
                  ? 'bg-white dark:bg-[#141416] text-stone-900 dark:text-stone-100 shadow-subtle'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              Hoje ({todayEvents.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('UPCOMING')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                activeTab === 'UPCOMING'
                  ? 'bg-white dark:bg-[#141416] text-stone-900 dark:text-stone-100 shadow-subtle'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              Próximos ({upcomingEvents.length})
            </button>
          </div>

          {/* Channel Selector */}
          <div className="flex bg-[#EFEFEc] dark:bg-[#202024] p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setSelectedChannel('WHATSAPP')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                selectedChannel === 'WHATSAPP'
                  ? 'bg-white dark:bg-[#141416] text-emerald-700 dark:text-emerald-400 shadow-subtle'
                  : 'text-stone-500'
              }`}
            >
              <MessageCircle className="w-3 h-3" /> WhatsApp
            </button>
            <button
              type="button"
              onClick={() => setSelectedChannel('EMAIL')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                selectedChannel === 'EMAIL'
                  ? 'bg-white dark:bg-[#141416] text-stone-900 dark:text-stone-100 shadow-subtle'
                  : 'text-stone-500'
              }`}
            >
              <Mail className="w-3 h-3" /> E-mail
            </button>
          </div>
        </div>

        {/* List of Events */}
        <div className="p-5 overflow-y-auto space-y-3.5 flex-1 overscroll-contain">
          {displayedEvents.length === 0 ? (
            <div className="py-10 text-center text-xs text-stone-400">
              Nenhuma felicitação registrada para esta aba.
            </div>
          ) : (
            displayedEvents.map((event, idx) => {
              const msg = generateEventMessage(event, templates, selectedChannel, 'Enlace CRM');
              const hasPhone = Boolean(event.phone);
              const hasEmail = Boolean(event.email);
              const eventUniqueKey = `evt-${event.type}-${event.clientId || ''}-${event.familyMemberId || ''}-${idx}`;

              return (
                <div
                  key={eventUniqueKey}
                  className="p-4 rounded-xl border border-[#E7E7E4] dark:border-[#26262B] bg-white dark:bg-[#18181B] space-y-3 shadow-subtle"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#18181B] dark:text-[#EDEDEA]">
                          {event.targetName || event.title}
                        </span>
                        {event.isToday ? (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                            Hoje
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[10px] text-stone-500 bg-stone-100 dark:bg-stone-800">
                            Em {event.daysRemaining}d
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                        {event.type === 'FAMILY_BIRTHDAY'
                          ? `Familiar de ${event.clientName || 'Cliente'} • ${event.subtitle}`
                          : event.subtitle}
                      </p>
                    </div>

                    <span className="text-xs font-mono text-stone-500 dark:text-stone-400">
                      {event.phone || event.email || 'Sem contato'}
                    </span>
                  </div>

                  {/* Message Preview */}
                  <div className="p-3 rounded-lg bg-[#FBFBFA] dark:bg-[#111113] border border-[#E7E7E4] dark:border-[#26262B] text-xs font-mono text-stone-800 dark:text-stone-300 whitespace-pre-line leading-relaxed max-h-28 overflow-y-auto">
                    {msg.body}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCopyText(msg.body, eventUniqueKey)}
                      className="px-2.5 py-1.5 rounded-lg border border-[#E7E7E4] dark:border-[#26262B] hover:bg-[#F4F4F2] dark:hover:bg-[#202024] text-xs font-medium text-stone-700 dark:text-stone-300 transition-colors flex items-center gap-1"
                    >
                      {copiedId === eventUniqueKey ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>

                    {selectedChannel === 'WHATSAPP' && hasPhone && (
                      <button
                        type="button"
                        onClick={() => handleOpenWhatsApp(event.phone!, msg.body)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Abrir WhatsApp</span>
                      </button>
                    )}

                    {selectedChannel === 'EMAIL' && hasEmail && (
                      <button
                        type="button"
                        onClick={() => handleOpenEmail(event.email!, msg.subject, msg.body)}
                        className="btn-primary"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Enviar E-mail</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E7E7E4] dark:border-[#26262B] bg-[#FBFBFA] dark:bg-[#18181B] flex items-center justify-between">
          {onNavigate ? (
            <button
              type="button"
              onClick={() => {
                closeDailyModal();
                onNavigate('alerts');
              }}
              className="text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white flex items-center gap-1"
            >
              <span>Ver todos os alertas</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          ) : <div />}

          <button
            type="button"
            onClick={closeDailyModal}
            className="btn-secondary"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
