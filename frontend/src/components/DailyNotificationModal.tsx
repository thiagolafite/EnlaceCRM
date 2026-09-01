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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-obsidian-900 border border-slate-200/80 dark:border-white/[0.09] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto">
        {/* Header comemorativo */}
        <div className="p-6 sm:p-7 bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-700 text-white relative shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-glow-indigo/50 shrink-0">
                <Gift className="w-6 h-6 text-amber-300 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black font-outfit tracking-tight text-white">
                    Central de Felicitações do Dia
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs">
                    Ao Vivo
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-indigo-100/90 font-medium mt-0.5">
                  Lembretes automáticos prontos para envio com 1 clique.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeDailyModal}
              title="Fechar (aviso continuará no topo)"
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/15 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subheader Tabs: Hoje vs Próximos Dias */}
          <div className="flex items-center gap-2 mt-5">
            <button
              type="button"
              onClick={() => setActiveTab('TODAY')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'TODAY'
                  ? 'bg-white text-slate-950 shadow-lg scale-102'
                  : 'bg-white/15 text-white hover:bg-white/25'
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
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  activeTab === 'UPCOMING'
                    ? 'bg-white text-slate-950 shadow-lg scale-102'
                    : 'bg-white/15 text-white hover:bg-white/25'
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
        <div className="px-6 py-3 border-b border-slate-200/80 dark:border-white/[0.06] bg-slate-50/80 dark:bg-obsidian-950/80 flex items-center justify-between shrink-0">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
            Canal de Envio Rápido:
          </span>
          <div className="flex items-center bg-slate-200/80 dark:bg-obsidian-850 p-1 rounded-2xl border border-slate-200/50 dark:border-white/[0.04]">
            <button
              type="button"
              onClick={() => setSelectedChannel('WHATSAPP')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedChannel === 'WHATSAPP'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </button>
            <button
              type="button"
              onClick={() => setSelectedChannel('EMAIL')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedChannel === 'EMAIL'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-obsidian-800 flex items-center justify-center mx-auto text-slate-400">
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
                  className="p-5 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-white/90 dark:bg-obsidian-850/90 shadow-sm hover:border-indigo-400/50 transition-all space-y-3.5"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 shadow-xs ${
                          event.type === 'CLIENT_BIRTHDAY'
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                            : event.type === 'FAMILY_BIRTHDAY'
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                            : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
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
                          <h4 className="font-black text-sm text-slate-900 dark:text-white truncate font-outfit">
                            {event.targetName || event.title}
                          </h4>
                          {event.isToday ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                              🎉 Hoje
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-obsidian-800 text-slate-600 dark:text-slate-400">
                              Em {event.daysRemaining} dias ({event.day}/{event.month})
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">
                          {event.type === 'FAMILY_BIRTHDAY'
                            ? `Familiar de ${event.clientName || 'Cliente'} • ${event.subtitle}`
                            : event.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-mono text-slate-500 font-bold block">
                        {event.phone || event.email || 'Sem contato direto'}
                      </span>
                    </div>
                  </div>

                  {/* Message Preview Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-obsidian-950/80 border border-slate-200/60 dark:border-white/[0.04] text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed max-h-32 overflow-y-auto">
                    {msg.body}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCopyText(msg.body, eventUniqueKey)}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-obsidian-800 hover:bg-slate-100 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
                    >
                      {copiedId === eventUniqueKey ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copiado!</span>
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
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs shadow-xs flex items-center gap-1.5 transition-all"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Enviar no WhatsApp</span>
                      </button>
                    )}

                    {selectedChannel === 'EMAIL' && hasEmail && (
                      <button
                        type="button"
                        onClick={() => handleOpenEmail(event.email!, msg.subject, msg.body)}
                        className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-black text-xs shadow-xs flex items-center gap-1.5 transition-all"
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
        <div className="p-4 sm:p-5 border-t border-slate-200/80 dark:border-white/[0.06] bg-slate-50/80 dark:bg-obsidian-950/80 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {todayEvents.length} lembrete(s) ativo(s) hoje
          </span>

          <div className="flex items-center gap-2">
            {onNavigate && (
              <button
                type="button"
                onClick={() => {
                  closeDailyModal();
                  onNavigate('alerts');
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors flex items-center gap-1"
              >
                <span>Central de Alertas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={closeDailyModal}
              className="px-5 py-2 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 font-black text-xs shadow-md transition-all active:scale-95"
            >
              Concluir & Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
