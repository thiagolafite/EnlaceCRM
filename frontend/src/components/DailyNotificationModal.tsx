import { useState } from 'react';
import {
  X,
  MessageCircle,
  Mail,
  Copy,
  Check,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-[#F4F4F6] dark:bg-[#18191D] border border-[#E2E2E8] dark:border-[#292A30] rounded-2xl shadow-modal overflow-hidden flex flex-col max-h-[85vh] my-auto">
        {/* Header */}
        <div className="p-5 border-b hairline-border bg-white/70 dark:bg-[#202126]/90 backdrop-blur-md flex items-center justify-between">
          <div>
            <h3 className="text-base font-medium tracking-tight text-[#18191D] dark:text-[#F4F4F6]">
              Felicitações do Dia
            </h3>
            <p className="text-xs text-[#686971] dark:text-[#BFC0C7] mt-0.5">
              Lembretes prontos para disparo direto
            </p>
          </div>

          <button
            type="button"
            onClick={closeDailyModal}
            className="p-1.5 rounded-lg text-[#686971] hover:text-[#18191D] dark:hover:text-[#F4F4F6] hover:bg-[#EEEEF1] dark:hover:bg-[#292A30] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Subheader Controls: Tabs & Channel Switcher */}
        <div className="px-5 py-2.5 bg-[#EEEEF1]/60 dark:bg-[#202126]/60 border-b hairline-border flex items-center justify-between flex-wrap gap-2">
          {/* Tabs */}
          <div className="flex bg-[#E9E9ED] dark:bg-[#18191D] p-1 rounded-xl text-xs font-medium border border-[#D7D7DD] dark:border-[#292A30]">
            <button
              type="button"
              onClick={() => setActiveTab('TODAY')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeTab === 'TODAY'
                  ? 'bg-white dark:bg-[#24252B] text-[#18191D] dark:text-[#F4F4F6] shadow-subtle font-semibold'
                  : 'text-[#686971] dark:text-[#BFC0C7] hover:text-[#18191D]'
              }`}
            >
              Hoje ({todayEvents.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('UPCOMING')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeTab === 'UPCOMING'
                  ? 'bg-white dark:bg-[#24252B] text-[#18191D] dark:text-[#F4F4F6] shadow-subtle font-semibold'
                  : 'text-[#686971] dark:text-[#BFC0C7] hover:text-[#18191D]'
              }`}
            >
              Próximos ({upcomingEvents.length})
            </button>
          </div>

          {/* Channel Selector */}
          <div className="flex bg-[#E9E9ED] dark:bg-[#18191D] p-1 rounded-xl text-xs font-medium border border-[#D7D7DD] dark:border-[#292A30]">
            <button
              type="button"
              onClick={() => setSelectedChannel('WHATSAPP')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                selectedChannel === 'WHATSAPP'
                  ? 'bg-[#18191D] text-[#F4F4F6] dark:bg-[#F4F4F6] dark:text-[#18191D] font-medium shadow-subtle'
                  : 'text-[#686971] dark:text-[#BFC0C7]'
              }`}
            >
              <MessageCircle className="w-3 h-3" /> WhatsApp
            </button>
            <button
              type="button"
              onClick={() => setSelectedChannel('EMAIL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                selectedChannel === 'EMAIL'
                  ? 'bg-[#18191D] text-[#F4F4F6] dark:bg-[#F4F4F6] dark:text-[#18191D] font-medium shadow-subtle'
                  : 'text-[#686971] dark:text-[#BFC0C7]'
              }`}
            >
              <Mail className="w-3 h-3" /> E-mail
            </button>
          </div>
        </div>

        {/* List of Events */}
        <div className="p-5 overflow-y-auto space-y-3.5 flex-1 overscroll-contain">
          {displayedEvents.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#686971]">
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
                  className="p-4 rounded-2xl border border-[#E2E2E8] dark:border-[#292A30] bg-white/70 dark:bg-[#202126]/80 space-y-3 shadow-subtle"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-[#18191D] dark:text-[#F4F4F6]">
                          {event.targetName || event.title}
                        </span>
                        {event.isToday ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#E54833] text-white">
                            Hoje
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-[#686971] dark:text-[#BFC0C7] bg-[#EEEEF1] dark:bg-[#24252B] border border-[#D7D7DD] dark:border-[#292A30]">
                            Em {event.daysRemaining}d
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#686971] dark:text-[#BFC0C7] mt-0.5">
                        {event.type === 'FAMILY_BIRTHDAY'
                          ? `Familiar de ${event.clientName || 'Cliente'} • ${event.subtitle}`
                          : event.subtitle}
                      </p>
                    </div>

                    <span className="text-xs font-mono text-[#686971] dark:text-[#BFC0C7]">
                      {event.phone || event.email || 'Sem contato'}
                    </span>
                  </div>

                  {/* Message Preview */}
                  <div className="p-3 rounded-xl bg-[#EEEEF1]/70 dark:bg-[#18191D]/80 border border-[#E2E2E8] dark:border-[#292A30] text-xs font-mono text-[#18191D] dark:text-[#F4F4F6] whitespace-pre-line leading-relaxed max-h-28 overflow-y-auto">
                    {msg.body}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCopyText(msg.body, eventUniqueKey)}
                      className="btn-secondary"
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
                        className="btn-primary"
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
        <div className="p-4 border-t hairline-border bg-white/70 dark:bg-[#202126]/90 backdrop-blur-md flex items-center justify-between">
          {onNavigate ? (
            <button
              type="button"
              onClick={() => {
                closeDailyModal();
                onNavigate('alerts');
              }}
              className="text-xs font-medium text-[#18191D] dark:text-[#F4F4F6] hover:underline flex items-center gap-1"
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
