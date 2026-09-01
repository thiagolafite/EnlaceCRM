import React, { useState } from 'react';
import {
  X,
  MessageCircle,
  Mail,
  Copy,
  Check,
  CalendarDays,
  Sparkles,
  Gift,
  Heart,
  ChevronRight,
  ExternalLink,
  ArrowRight,
  Clock,
  Send,
  Users,
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { generateEventMessage } from '../utils/messageGenerator';
import { UpcomingEvent } from '../types';

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
    setTimeout(() => setCopiedId(null), 2500);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto">
        {/* Header comemorativo */}
        <div className="p-5 sm:p-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 text-white relative shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner shrink-0">
                <Gift className="w-6 h-6 text-amber-300 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
                    Central de Felicitações do Dia
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400 text-slate-950">
                    Ao Vivo
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-white/90 mt-0.5">
                  Lembretes automáticos prontos para envio com 1 clique.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeDailyModal}
              title="Fechar (aviso continuará no topo)"
              className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subheader Tabs: Hoje vs Próximos Dias */}
          <div className="flex items-center gap-2 mt-5">
            <button
              type="button"
              onClick={() => setActiveTab('TODAY')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'TODAY'
                  ? 'bg-white text-indigo-900 shadow-md scale-102'
                  : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Acontecendo Hoje</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black">
                {todayEvents.length}
              </span>
            </button>

            {upcomingEvents.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('UPCOMING')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'UPCOMING'
                    ? 'bg-white text-indigo-900 shadow-md scale-102'
                    : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Próximos Dias</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/30 text-white font-black">
                  {upcomingEvents.length}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Global Channel Selector */}
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between shrink-0">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
            Canal de Envio Rápido:
          </span>
          <div className="flex items-center bg-slate-200 dark:bg-slate-800 p-0.5 rounded-xl">
            <button
              type="button"
              onClick={() => setSelectedChannel('WHATSAPP')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedChannel === 'WHATSAPP'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </button>
            <button
              type="button"
              onClick={() => setSelectedChannel('EMAIL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedChannel === 'EMAIL'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Mail className="w-3.5 h-3.5" /> E-mail
            </button>
          </div>
        </div>

        {/* Scrollable Events List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 overscroll-contain">
          {displayedEvents.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Check className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="font-bold text-slate-700 dark:text-slate-300">
                Tudo em dia por aqui!
              </p>
              <p className="text-xs">Nenhum evento registrado para esta data.</p>
            </div>
          ) : (
            displayedEvents.map((event, idx) => {
              const msg = generateEventMessage(event, templates, selectedChannel, 'Enlace CRM');
              const hasPhone = Boolean(event.phone);
              const hasEmail = Boolean(event.email);
              const eventUniqueKey = `evt-${event.type}-${event.clientId || ''}-${event.familyMemberId || ''}-${event.commemorativeDateId || ''}-${idx}`;

              return (
                <div
                  key={eventUniqueKey}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition-all space-y-3"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-sm ${
                          event.type === 'CLIENT_BIRTHDAY'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600'
                            : event.type === 'FAMILY_BIRTHDAY'
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600'
                            : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600'
                        }`}
                      >
                        {event.type === 'CLIENT_BIRTHDAY'
                          ? '🎂'
                          : event.type === 'FAMILY_BIRTHDAY'
                          ? '🌸'
                          : '📅'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-black text-sm text-slate-900 dark:text-slate-100 truncate">
                            {event.targetName || event.title}
                          </h4>
                          {event.isToday ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                              🎉 Hoje
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              Em {event.daysRemaining} dias ({event.day}/{event.month})
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {event.type === 'FAMILY_BIRTHDAY'
                            ? `Familiar de ${event.clientName || 'Cliente'} • ${event.subtitle}`
                            : event.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Copy Button */}
                    <button
                      type="button"
                      onClick={() => handleCopyText(msg.body, eventUniqueKey)}
                      title="Copiar texto da mensagem"
                      className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                    >
                      {copiedId === eventUniqueKey ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Rendered Message Preview Box */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed max-h-32 overflow-y-auto">
                    {msg.body}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
                    <div className="text-[11px] text-slate-500 truncate">
                      {selectedChannel === 'WHATSAPP' ? (
                        <span>📱 WhatsApp: <strong className="font-semibold text-slate-700 dark:text-slate-300">{event.phone || 'Não informado'}</strong></span>
                      ) : (
                        <span>✉️ E-mail: <strong className="font-semibold text-slate-700 dark:text-slate-300">{event.email || 'Não informado'}</strong></span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {selectedChannel === 'WHATSAPP' ? (
                        <button
                          type="button"
                          disabled={!hasPhone}
                          onClick={() => handleOpenWhatsApp(event.phone!, msg.body)}
                          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-xs font-black text-white shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Enviar no WhatsApp</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={!hasEmail}
                          onClick={() => handleOpenEmail(event.email!, msg.subject, msg.body)}
                          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-xs font-black text-white shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
                        >
                          <Mail className="w-4 h-4" />
                          <span>Enviar E-mail</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-[11px] text-slate-500 text-center sm:text-left">
            💡 Você pode acessar estes lembretes a qualquer momento no sino do topo.
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onNavigate && (
              <button
                type="button"
                onClick={() => {
                  closeDailyModal();
                  onNavigate('alerts');
                }}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
              >
                Ver Central de Alertas
              </button>
            )}

            <button
              type="button"
              onClick={closeDailyModal}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-xs font-black text-white shadow-md shadow-indigo-600/20 transition-all"
            >
              Concluído
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
