import {
  MessageCircle,
  Mail,
  XCircle,
  Clock,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Bell,
  Check,
  Crown,
  Calendar,
  User,
} from 'lucide-react';

export function ChannelBadge({ channel }: { channel: string }) {
  if (channel === 'WHATSAPP') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/40">
        <MessageCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> WhatsApp
      </span>
    );
  }
  if (channel === 'EMAIL') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-stone-100 text-stone-800 border border-stone-200 dark:bg-stone-800/50 dark:text-stone-300 dark:border-stone-700/60">
        <Mail className="w-3 h-3 text-stone-600 dark:text-stone-400" /> E-mail
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-stone-100 text-stone-800 border border-stone-200 dark:bg-stone-800/50 dark:text-stone-300 dark:border-stone-700/60">
      WhatsApp & E-mail
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  if (status === 'ACTIVE' || status === 'SENT' || status === 'COMPLETED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/40">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
        <span>{status === 'SENT' ? 'Enviado' : status === 'COMPLETED' ? 'Concluído' : 'Ativo'}</span>
      </span>
    );
  }
  if (status === 'FAILED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-50 text-rose-800 border border-rose-200/80 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800/40">
        <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" /> Falha
      </span>
    );
  }
  if (status === 'QUEUED' || status === 'PROCESSING') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-sky-50 text-sky-800 border border-sky-200/80 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-800/40">
        <Clock className="w-3 h-3 text-sky-600 animate-spin" /> Na Fila
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200/80 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/40">
      <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" /> {status === 'PENDING' ? 'Pendente' : 'Inativo'}
    </span>
  );
}

export function NotificationBadge({ status }: { status: string }) {
  if (status === 'SENT') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/40">
        <Bell className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Notificado
      </span>
    );
  }
  if (status === 'SIMULATED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-stone-100 text-stone-700 border border-stone-200 dark:bg-stone-800/50 dark:text-stone-300 dark:border-stone-700/60">
        Simulado
      </span>
    );
  }
  if (status === 'FAILED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-50 text-rose-800 border border-rose-200/80 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800/40">
        <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" /> Falha
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-stone-100 text-stone-600 border border-stone-200 dark:bg-stone-800/40 dark:text-stone-400 dark:border-stone-700/50">
      <Clock className="w-3 h-3 text-stone-400" /> Não Notificado
    </span>
  );
}

export function ManualSentBadge({ sent, sentAt }: { sent: boolean; sentAt?: string | null }) {
  if (sent) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/40">
        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>Enviado ao Cliente</span>
        {sentAt && <span className="text-[10px] opacity-70 font-mono">({new Date(sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/40">
      <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
      <span>Pendente de Envio</span>
    </span>
  );
}

export function LgpdBadge({
  consent,
  optOutAt,
  source,
  date,
  onToggle,
}: {
  consent: boolean;
  optOutAt?: string | null;
  source?: string | null;
  date?: string | null;
  onToggle?: () => void;
}) {
  if (optOutAt) {
    return (
      <button
        type="button"
        onClick={onToggle}
        title={`Opt-out registrado em ${new Date(optOutAt).toLocaleDateString('pt-BR')}. Clique para gerenciar consentimento.`}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800/40 transition-colors ${
          onToggle ? 'hover:bg-rose-100 dark:hover:bg-rose-900/40 cursor-pointer' : ''
        }`}
      >
        <ShieldAlert className="w-3 h-3 text-rose-600 dark:text-rose-400" />
        <span>Opt-out (Revogado)</span>
      </button>
    );
  }

  if (consent) {
    const sourceLabel = source === 'CONTRATO' ? 'Contrato' : source === 'WHATSAPP' ? 'WhatsApp' : source === 'FORMULARIO' ? 'Formulário' : source === 'VERBAL' ? 'Verbal' : 'Ativo';
    return (
      <button
        type="button"
        onClick={onToggle}
        title={date ? `Consentimento LGPD (${source || 'Manual'}) concedido em ${new Date(date).toLocaleDateString('pt-BR')}` : 'Consentimento LGPD Ativo'}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-teal-50 text-teal-800 border border-teal-200 dark:bg-teal-950/30 dark:text-teal-300 dark:border-teal-800/40 transition-colors ${
          onToggle ? 'hover:bg-teal-100 dark:hover:bg-teal-900/40 cursor-pointer' : ''
        }`}
      >
        <ShieldCheck className="w-3 h-3 text-teal-600 dark:text-teal-400" />
        <span>LGPD ({sourceLabel})</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      title="Cliente sem registro formal de consentimento. Ficará de fora das automações."
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-stone-100 text-stone-600 border border-stone-200 dark:bg-stone-800/50 dark:text-stone-400 dark:border-stone-700/60 transition-colors ${
        onToggle ? 'hover:bg-stone-200 dark:hover:bg-stone-700/60 cursor-pointer' : ''
      }`}
    >
      <AlertCircle className="w-3 h-3 text-stone-500" />
      <span>Sem Consentimento</span>
    </button>
  );
}

export function EventTypeBadge({ type }: { type: string }) {
  if (type === 'CLIENT_BIRTHDAY') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/40">
        <Calendar className="w-3 h-3 text-amber-600 dark:text-amber-400" /> Aniversário Cliente
      </span>
    );
  }
  if (type === 'FAMILY_BIRTHDAY') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-50 text-rose-900 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800/40">
        <User className="w-3 h-3 text-rose-600 dark:text-rose-400" /> Aniversário Familiar
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-stone-100 text-stone-800 border border-stone-200 dark:bg-stone-800/50 dark:text-stone-300 dark:border-stone-700/60">
      <Calendar className="w-3 h-3 text-stone-600 dark:text-stone-400" /> Data Comemorativa
    </span>
  );
}

export function UserRoleBadge({ role }: { role: string }) {
  if (role === 'MASTER') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900">
        <Crown className="w-3 h-3 text-amber-400" /> Master
      </span>
    );
  }
  if (role === 'ADMIN') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-stone-100 text-stone-800 border border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700">
        Admin
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wider bg-stone-100 text-stone-600 border border-stone-200 dark:bg-stone-800/40 dark:text-stone-400 dark:border-stone-700/50">
      Operador
    </span>
  );
}
