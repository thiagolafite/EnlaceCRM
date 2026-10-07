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
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EEEEF1] dark:bg-[#222328] text-[#1E6B37] dark:text-[#56D364] border border-[#D7D7DD] dark:border-[#292A30]">
        <MessageCircle className="w-3 h-3 text-[#1E6B37] dark:text-[#56D364]" /> WhatsApp
      </span>
    );
  }
  if (channel === 'EMAIL') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EEEEF1] dark:bg-[#222328] text-[#686971] dark:text-[#BFC0C7] border border-[#D7D7DD] dark:border-[#292A30]">
        <Mail className="w-3 h-3" /> E-mail
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EEEEF1] dark:bg-[#222328] text-[#686971] dark:text-[#BFC0C7] border border-[#D7D7DD] dark:border-[#292A30]">
      WhatsApp & E-mail
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  if (status === 'ACTIVE' || status === 'SENT' || status === 'COMPLETED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EEEEF1] dark:bg-[#222328] text-[#1E6B37] dark:text-[#56D364] border border-[#D7D7DD] dark:border-[#292A30]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#1E6B37] dark:bg-[#56D364]"></span>
        <span>{status === 'SENT' ? 'Enviado' : status === 'COMPLETED' ? 'Concluído' : 'Ativo'}</span>
      </span>
    );
  }
  if (status === 'FAILED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EEEEF1] dark:bg-[#222328] text-[#E54833] border border-[#E54833]/30 dark:border-[#E54833]/40">
        <XCircle className="w-3 h-3 text-[#E54833]" /> Falha
      </span>
    );
  }
  if (status === 'QUEUED' || status === 'PROCESSING') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EEEEF1] dark:bg-[#222328] text-[#1F6FEB] dark:text-[#58A6FF] border border-[#D7D7DD] dark:border-[#292A30]">
        <Clock className="w-3 h-3 animate-spin" /> Na Fila
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EEEEF1] dark:bg-[#222328] text-[#D97706] dark:text-[#FBBF24] border border-[#D7D7DD] dark:border-[#292A30]">
      <AlertCircle className="w-3 h-3 text-[#D97706] dark:text-[#FBBF24]" /> {status === 'PENDING' ? 'Pendente' : 'Inativo'}
    </span>
  );
}

export function NotificationBadge({ status }: { status: string }) {
  if (status === 'SENT') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EEEEF1] dark:bg-[#222328] text-[#1E6B37] dark:text-[#56D364] border border-[#D7D7DD] dark:border-[#292A30]">
        <Bell className="w-3 h-3 text-[#1E6B37] dark:text-[#56D364]" /> Notificado
      </span>
    );
  }
  if (status === 'SIMULATED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EEEEF1] dark:bg-[#222328] text-[#686971] dark:text-[#BFC0C7] border border-[#D7D7DD] dark:border-[#292A30]">
        Simulado
      </span>
    );
  }
  if (status === 'FAILED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EEEEF1] dark:bg-[#222328] text-[#E54833] border border-[#E54833]/30">
        <XCircle className="w-3 h-3 text-[#E54833]" /> Falha
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EEEEF1] dark:bg-[#222328] text-[#71727A] dark:text-[#9DA0AA] border border-[#D7D7DD] dark:border-[#292A30]">
      <Clock className="w-3 h-3" /> Não Notificado
    </span>
  );
}

export function ManualSentBadge({ sent, sentAt }: { sent: boolean; sentAt?: string | null }) {
  if (sent) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#EEEEF1] dark:bg-[#222328] text-[#1E6B37] dark:text-[#56D364] border border-[#D7D7DD] dark:border-[#292A30]">
        <Check className="w-3.5 h-3.5 text-[#1E6B37] dark:text-[#56D364]" />
        <span>Enviado ao Cliente</span>
        {sentAt && <span className="text-[10px] opacity-75 font-mono">({new Date(sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#EEEEF1] dark:bg-[#222328] text-[#D97706] dark:text-[#FBBF24] border border-[#D7D7DD] dark:border-[#292A30]">
      <Clock className="w-3.5 h-3.5 text-[#D97706] dark:text-[#FBBF24]" />
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
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EEEEF1] dark:bg-[#222328] text-[#E54833] border border-[#E54833]/30 transition-colors ${
          onToggle ? 'hover:bg-[#E2E2E8] dark:hover:bg-[#292A30] cursor-pointer' : ''
        }`}
      >
        <ShieldAlert className="w-3 h-3 text-[#E54833]" />
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
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EEEEF1] dark:bg-[#222328] text-[#1E6B37] dark:text-[#56D364] border border-[#D7D7DD] dark:border-[#292A30] transition-colors ${
          onToggle ? 'hover:bg-[#E2E2E8] dark:hover:bg-[#292A30] cursor-pointer' : ''
        }`}
      >
        <ShieldCheck className="w-3 h-3 text-[#1E6B37] dark:text-[#56D364]" />
        <span>LGPD ({sourceLabel})</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      title="Cliente sem registro formal de consentimento. Ficará de fora das automações."
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EEEEF1] dark:bg-[#222328] text-[#686971] dark:text-[#BFC0C7] border border-[#D7D7DD] dark:border-[#292A30] transition-colors ${
        onToggle ? 'hover:bg-[#E2E2E8] dark:hover:bg-[#292A30] cursor-pointer' : ''
      }`}
    >
      <AlertCircle className="w-3 h-3 text-[#E54833]" />
      <span>Sem Consentimento</span>
    </button>
  );
}

export function EventTypeBadge({ type }: { type: string }) {
  if (type === 'CLIENT_BIRTHDAY') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EEEEF1] dark:bg-[#222328] text-[#E54833] border border-[#E54833]/40">
        <Calendar className="w-3 h-3 text-[#E54833]" /> Aniversário Cliente
      </span>
    );
  }
  if (type === 'FAMILY_BIRTHDAY') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EEEEF1] dark:bg-[#222328] text-[#18191D] dark:text-[#F4F4F6] border border-[#D7D7DD] dark:border-[#292A30]">
        <User className="w-3 h-3 text-[#686971] dark:text-[#BFC0C7]" /> Aniversário Familiar
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EEEEF1] dark:bg-[#222328] text-[#686971] dark:text-[#BFC0C7] border border-[#D7D7DD] dark:border-[#292A30]">
      <Calendar className="w-3 h-3 text-[#686971]" /> Data Comemorativa
    </span>
  );
}

export function UserRoleBadge({ role }: { role: string }) {
  if (role === 'MASTER') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#18191D] text-[#F4F4F6] dark:bg-[#F4F4F6] dark:text-[#18191D] border border-[#292A30] dark:border-[#E2E2E8]">
        <Crown className="w-3 h-3 text-[#E54833]" /> Master
      </span>
    );
  }
  if (role === 'ADMIN') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#EEEEF1] dark:bg-[#222328] text-[#18191D] dark:text-[#F4F4F6] border border-[#D7D7DD] dark:border-[#292A30]">
        Admin
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-[#EEEEF1] dark:bg-[#222328] text-[#686971] dark:text-[#BFC0C7] border border-[#D7D7DD] dark:border-[#292A30]">
      Operador
    </span>
  );
}
