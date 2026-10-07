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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0F1216]/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-[#F8F9FA] dark:bg-[#181C21] border-2 border-[#C85A32]/40 rounded-3xl shadow-modal overflow-hidden flex flex-col max-h-[85vh] my-auto">
        {/* Header */}
        <div className="p-5 border-b hairline-border flex items-center justify-between">
          <div>
            <h3 className="text-base font-serif font-semibold text-[#1A1E24] dark:text-[#F1F3F5]">
              Felicitações do Dia
            </h3>
            <p className="text-xs text-[#6C757D] dark:text-[#ADB5BD] mt-0.5">
              Lembretes prontos para disparo direto
            </p>
          </div>

          <button
            type="button"
            onClick={closeDailyModal}
            className="p-1.5 rounded-lg text-[#6C757D] hover:text-[#1A1E24] dark:hover:text-[#F1F3F5] hover:bg-[#E9ECEF] dark:hover:bg-[#1E252E] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Subheader Controls: Tabs & Channel Switcher */}
        <div className="px-5 py-2.5 bg-[#FFFFFF] dark:bg-[#14181D] border-b hairline-border flex items-center justify-between flex-wrap gap-2">
          {/* Tabs */}
          <div className="flex bg-[#E9ECEF] dark:bg-[#1C222A] p-1 rounded-full text-xs font-medium border border-[#C85A32]/25">
            <button
              type="button"
              onClick={() => setActiveTab('TODAY')}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                activeTab === 'TODAY'
                  ? 'bg-white dark:bg-[#181C21] text-[#C85A32] dark:text-[#F39C74] border border-[#C85A32]/40 shadow-xs font-semibold'
                  : 'text-[#6C757D] dark:text-[#ADB5BD] hover:text-[#1A1E24]'
              }`}
            >
              Hoje ({todayEvents.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('UPCOMING')}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                activeTab === 'UPCOMING'
                  ? 'bg-white dark:bg-[#181C21] text-[#C85A32] dark:text-[#F39C74] border border-[#C85A32]/40 shadow-xs font-semibold'
                  : 'text-[#6C757D] dark:text-[#ADB5BD] hover:text-[#1A1E24]'
              }`}
            >
              Próximos ({upcomingEvents.length})
            </button>
          </div>

          {/* Channel Selector */}
          <div className="flex bg-[#E9ECEF] dark:bg-[#1C222A] p-1 rounded-full text-xs font-medium border border-[#C85A32]/25">
            <button
              type="button"
              onClick={() => setSelectedChannel('WHATSAPP')}
              className={`px-2.5 py-1 rounded-full font-medium transition-all flex items-center gap-1 ${
                selectedChannel === 'WHATSAPP'
                  ? 'bg-[#C85A32] text-white font-semibold shadow-xs'
                  : 'text-[#6C757D] dark:text-[#ADB5BD]'
              }`}
            >
              <MessageCircle className="w-3 h-3" /> WhatsApp
            </button>
            <button
              type="button"
              onClick={() => setSelectedChannel('EMAIL')}
              className={`px-2.5 py-1 rounded-full font-medium transition-all flex items-center gap-1 ${
                selectedChannel === 'EMAIL'
                  ? 'bg-[#1A1E24] text-[#F1F3F5] dark:bg-[#2A313A] dark:text-[#F1F3F5] border border-[#C85A32]/40 font-semibold shadow-xs'
                  : 'text-[#6C757D] dark:text-[#ADB5BD]'
              }`}
            >
              <Mail className="w-3 h-3" /> E-mail
            </button>
          </div>
        </div>

        {/* List of Events */}
        <div className="p-5 overflow-y-auto space-y-3.5 flex-1 overscroll-contain">
          {displayedEvents.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#6C757D]">
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
                  className="p-4 rounded-2xl border border-[#C85A32]/35 bg-[#FFFFFF] dark:bg-[#14181D] space-y-3 shadow-subtle"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#1A1E24] dark:text-[#F1F3F5]">
                          {event.targetName || event.title}
                        </span>
                        {event.isToday ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFFFFF] text-[#C85A32] dark:bg-[#181C21] dark:text-[#F39C74] border border-[#C85A32]">
                            Hoje
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] text-[#6C757D] bg-[#F1F3F5] dark:bg-[#181C21] border border-[#C85A32]/25">
                            Em {event.daysRemaining}d
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#6C757D] dark:text-[#ADB5BD] mt-0.5">
                        {event.type === 'FAMILY_BIRTHDAY'
                          ? `Familiar de ${event.clientName || 'Cliente'} • ${event.subtitle}`
                          : event.subtitle}
                      </p>
                    </div>

                    <span className="text-xs font-mono text-[#6C757D] dark:text-[#ADB5BD]">
                      {event.phone || event.email || 'Sem contato'}
                    </span>
                  </div>

                  {/* Message Preview */}
                  <div className="p-3 rounded-xl bg-[#F8F9FA] dark:bg-[#181C21] border border-[#C85A32]/25 text-xs font-mono text-[#1A1E24] dark:text-[#F1F3F5] whitespace-pre-line leading-relaxed max-h-28 overflow-y-auto">
                    {msg.body}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCopyText(msg.body, eventUniqueKey)}
                      className="px-2.5 py-1.5 rounded-xl border border-[#C85A32]/35 hover:bg-[#E9ECEF] dark:hover:bg-[#1E252E] text-xs font-medium text-[#1A1E24] dark:text-[#F1F3F5] transition-colors flex items-center gap-1"
                    >
                      {copiedId === eventUniqueKey ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#C85A32]" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>

                    {selectedChannel === 'WHATSAPP' && hasPhone && (
                      <button
                        type="button"
                        onClick={() => handleOpenWhatsApp(event.phone!, msg.body)}
                        className="btn-terracotta"
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
        <div className="p-4 border-t hairline-border bg-[#FFFFFF] dark:bg-[#14181D] flex items-center justify-between">
          {onNavigate ? (
            <button
              type="button"
              onClick={() => {
                closeDailyModal();
                onNavigate('alerts');
              }}
              className="text-xs font-medium text-[#C85A32] dark:text-[#F39C74] hover:underline flex items-center gap-1"
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
