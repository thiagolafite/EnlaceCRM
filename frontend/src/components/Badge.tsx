import React from 'react';
import {
  MessageCircle,
  Mail,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Send,
  Bell,
  Check,
} from 'lucide-react';

export function ChannelBadge({ channel }: { channel: string }) {
  if (channel === 'WHATSAPP') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/50">
        <MessageCircle className="w-3 h-3" /> WhatsApp
      </span>
    );
  }
  if (channel === 'EMAIL') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-800/50">
        <Mail className="w-3 h-3" /> Email
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-800 dark:bg-violet-950/80 dark:text-violet-400 border border-violet-300 dark:border-violet-800/50">
      <Sparkles className="w-3 h-3" /> Ambos
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  if (status === 'ACTIVE' || status === 'SENT' || status === 'COMPLETED') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/40">
        <CheckCircle2 className="w-3 h-3" /> {status === 'SENT' ? 'Enviado' : status === 'COMPLETED' ? 'Concluído' : 'Ativo'}
      </span>
    );
  }
  if (status === 'FAILED') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-400 border border-rose-300 dark:border-rose-800/40">
        <XCircle className="w-3 h-3" /> Falha
      </span>
    );
  }
  if (status === 'QUEUED' || status === 'PROCESSING') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-400 border border-sky-300 dark:border-sky-800/40">
        <Clock className="w-3 h-3 animate-spin" /> Na Fila
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-400 border border-amber-300 dark:border-amber-800/40">
      <AlertTriangle className="w-3 h-3" /> {status === 'PENDING' ? 'Pendente' : 'Inativo'}
    </span>
  );
}

export function NotificationBadge({ status }: { status: string }) {
  if (status === 'SENT') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/40">
        <Bell className="w-3 h-3" /> Notificado no WhatsApp
      </span>
    );
  }
  if (status === 'SIMULATED') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-800/40">
        <Sparkles className="w-3 h-3" /> Notificação Simulada
      </span>
    );
  }
  if (status === 'FAILED') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-400 border border-rose-300 dark:border-rose-800/40">
        <XCircle className="w-3 h-3" /> Falha CallMeBot
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
      <Clock className="w-3 h-3" /> Não Notificado
    </span>
  );
}

export function ManualSentBadge({ sent, sentAt }: { sent: boolean; sentAt?: string | null }) {
  if (sent) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60 shadow-sm">
        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>Enviado ao Cliente</span>
        {sentAt && (
          <span className="text-[10px] font-normal opacity-80">
            ({new Date(sentAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })})
          </span>
        )}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60 shadow-sm">
      <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
      <span>Pendente de Envio Manual</span>
    </span>
  );
}

export function LgpdBadge({ consent, onToggle }: { consent: boolean; onToggle?: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      title={consent ? 'Consentimento ativo (Opt-in). Clique para revogar.' : 'Consentimento revogado (Opt-out). Clique para conceder.'}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
        consent
          ? 'bg-teal-100 text-teal-800 dark:bg-teal-950/70 dark:text-teal-300 border border-teal-300 dark:border-teal-800/40 hover:bg-teal-200 dark:hover:bg-teal-900/60'
          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800/40 hover:bg-rose-200 dark:hover:bg-rose-900/60'
      }`}
    >
      {consent ? <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> : <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />}
      {consent ? 'LGPD Opt-in' : 'LGPD Opt-out'}
    </button>
  );
}

export function EventTypeBadge({ type }: { type: string }) {
  if (type === 'CLIENT_BIRTHDAY') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-300 dark:border-purple-800/40">
        🎂 Aniv. Cliente
      </span>
    );
  }
  if (type === 'FAMILY_BIRTHDAY') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-800/40">
        👨‍👩‍👧‍👦 Aniv. Familiar
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-300 dark:border-blue-800/40">
      📅 Data Calendário
    </span>
  );
}
