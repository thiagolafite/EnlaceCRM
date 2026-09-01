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
  Crown,
  Heart,
  Calendar,
} from 'lucide-react';

export function ChannelBadge({ channel }: { channel: string }) {
  if (channel === 'WHATSAPP') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 dark:border-emerald-500/20 shadow-xs">
        <MessageCircle className="w-3 h-3 text-emerald-500" /> WhatsApp
      </span>
    );
  }
  if (channel === 'EMAIL') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 dark:border-indigo-500/20 shadow-xs">
        <Mail className="w-3 h-3 text-indigo-500" /> E-mail
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 dark:border-purple-500/20 shadow-xs">
      <Sparkles className="w-3 h-3 text-purple-500" /> Ambos
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  if (status === 'ACTIVE' || status === 'SENT' || status === 'COMPLETED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 dark:border-emerald-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>{status === 'SENT' ? 'Enviado' : status === 'COMPLETED' ? 'Concluído' : 'Ativo'}</span>
      </span>
    );
  }
  if (status === 'FAILED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 dark:border-rose-500/20">
        <XCircle className="w-3 h-3" /> Falha
      </span>
    );
  }
  if (status === 'QUEUED' || status === 'PROCESSING') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30 dark:border-sky-500/20">
        <Clock className="w-3 h-3 animate-spin text-sky-500" /> Na Fila
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 dark:border-amber-500/20">
      <AlertTriangle className="w-3 h-3 text-amber-500" /> {status === 'PENDING' ? 'Pendente' : 'Inativo'}
    </span>
  );
}

export function NotificationBadge({ status }: { status: string }) {
  if (status === 'SENT') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        <Bell className="w-3 h-3 text-emerald-500" /> Notificado
      </span>
    );
  }
  if (status === 'SIMULATED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
        <Sparkles className="w-3 h-3 text-indigo-500" /> Simulado
      </span>
    );
  }
  if (status === 'FAILED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
        <XCircle className="w-3 h-3 text-rose-500" /> Falha
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
      <Clock className="w-3 h-3" /> Não Notificado
    </span>
  );
}

export function ManualSentBadge({ sent, sentAt }: { sent: boolean; sentAt?: string | null }) {
  if (sent) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-xs shadow-emerald-500/10">
        <Check className="w-3.5 h-3.5 text-emerald-500" />
        <span>Enviado ao Cliente</span>
        {sentAt && <span className="opacity-70 text-[10px]">({new Date(sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 animate-pulse-subtle">
      <Clock className="w-3.5 h-3.5 text-amber-500" />
      <span>Pendente de Envio</span>
    </span>
  );
}

export function LgpdBadge({ consent, date, onToggle }: { consent: boolean; date?: string | null; onToggle?: () => void }) {
  if (consent) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30 transition-all ${onToggle ? 'hover:bg-teal-500/25 cursor-pointer' : ''}`}
      >
        <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
        <span>LGPD Autorizado</span>
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30 transition-all ${onToggle ? 'hover:bg-rose-500/25 cursor-pointer' : ''}`}
    >
      <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
      <span>Sem Consentimento</span>
    </button>
  );
}

export function EventTypeBadge({ type }: { type: string }) {
  if (type === 'CLIENT_BIRTHDAY') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
        <span>🎂</span> Aniversário Cliente
      </span>
    );
  }
  if (type === 'FAMILY_BIRTHDAY') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30">
        <span>🌸</span> Aniversário Familiar
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
      <Calendar className="w-3 h-3 text-indigo-500" /> Data Comemorativa
    </span>
  );
}

export function UserRoleBadge({ role }: { role: string }) {
  if (role === 'MASTER') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 shadow-xs shadow-amber-500/10">
        <Crown className="w-3 h-3 text-amber-500" /> Master Global
      </span>
    );
  }
  if (role === 'ADMIN') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
        Admin
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30">
      Operador
    </span>
  );
}
