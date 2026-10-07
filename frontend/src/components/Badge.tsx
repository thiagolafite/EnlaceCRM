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
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F8F9FA] text-[#1E6B37] border border-[#2EA043]/50 dark:bg-[#181C21] dark:text-[#56D364] dark:border-[#2EA043]/60">
        <MessageCircle className="w-3 h-3 text-[#1E6B37] dark:text-[#56D364]" /> WhatsApp
      </span>
    );
  }
  if (channel === 'EMAIL') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F8F9FA] text-[#495057] border border-[#C85A32]/40 dark:bg-[#181C21] dark:text-[#ADB5BD] dark:border-[#C85A32]/40">
        <Mail className="w-3 h-3" /> E-mail
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F8F9FA] text-[#495057] border border-[#C85A32]/35 dark:bg-[#181C21] dark:text-[#ADB5BD]">
      WhatsApp & E-mail
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  if (status === 'ACTIVE' || status === 'SENT' || status === 'COMPLETED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F8F9FA] text-[#1E6B37] border border-[#2EA043]/50 dark:bg-[#181C21] dark:text-[#56D364] dark:border-[#2EA043]/60">
        <span className="w-1.5 h-1.5 rounded-full bg-[#1E6B37] dark:bg-[#56D364]"></span>
        <span>{status === 'SENT' ? 'Enviado' : status === 'COMPLETED' ? 'Concluído' : 'Ativo'}</span>
      </span>
    );
  }
  if (status === 'FAILED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F8F9FA] text-[#D0352B] border border-[#D0352B]/50 dark:bg-[#181C21] dark:text-[#F85149] dark:border-[#F85149]/50">
        <XCircle className="w-3 h-3 text-[#D0352B] dark:text-[#F85149]" /> Falha
      </span>
    );
  }
  if (status === 'QUEUED' || status === 'PROCESSING') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F8F9FA] text-[#1F6FEB] border border-[#1F6FEB]/50 dark:bg-[#181C21] dark:text-[#58A6FF] dark:border-[#1F6FEB]/60">
        <Clock className="w-3 h-3 animate-spin" /> Na Fila
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F8F9FA] text-[#D97706] border border-[#D97706]/50 dark:bg-[#181C21] dark:text-[#FBBF24] dark:border-[#D97706]/60">
      <AlertCircle className="w-3 h-3 text-[#D97706] dark:text-[#FBBF24]" /> {status === 'PENDING' ? 'Pendente' : 'Inativo'}
    </span>
  );
}

export function NotificationBadge({ status }: { status: string }) {
  if (status === 'SENT') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F8F9FA] text-[#1E6B37] border border-[#2EA043]/50 dark:bg-[#181C21] dark:text-[#56D364]">
        <Bell className="w-3 h-3 text-[#1E6B37] dark:text-[#56D364]" /> Notificado
      </span>
    );
  }
  if (status === 'SIMULATED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F8F9FA] text-[#495057] border border-[#C85A32]/40 dark:bg-[#181C21] dark:text-[#ADB5BD]">
        Simulado
      </span>
    );
  }
  if (status === 'FAILED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F8F9FA] text-[#D0352B] border border-[#D0352B]/50 dark:bg-[#181C21] dark:text-[#F85149]">
        <XCircle className="w-3 h-3" /> Falha
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F8F9FA] text-[#6C757D] border border-[#C85A32]/30 dark:bg-[#181C21] dark:text-[#8E99A4]">
      <Clock className="w-3 h-3" /> Não Notificado
    </span>
  );
}

export function ManualSentBadge({ sent, sentAt }: { sent: boolean; sentAt?: string | null }) {
  if (sent) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#F8F9FA] text-[#1E6B37] border border-[#2EA043]/50 dark:bg-[#181C21] dark:text-[#56D364] dark:border-[#2EA043]/60">
        <Check className="w-3.5 h-3.5 text-[#1E6B37] dark:text-[#56D364]" />
        <span>Enviado ao Cliente</span>
        {sentAt && <span className="text-[10px] opacity-75 font-mono">({new Date(sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#F8F9FA] text-[#D97706] border border-[#D97706]/50 dark:bg-[#181C21] dark:text-[#FBBF24] dark:border-[#D97706]/60">
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
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F8F9FA] text-[#D0352B] border border-[#D0352B]/50 dark:bg-[#181C21] dark:text-[#F85149] dark:border-[#F85149]/50 transition-colors ${
          onToggle ? 'hover:bg-[#E9ECEF] dark:hover:bg-[#22272E] cursor-pointer' : ''
        }`}
      >
        <ShieldAlert className="w-3 h-3 text-[#D0352B] dark:text-[#F85149]" />
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
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F8F9FA] text-[#1E6B37] border border-[#2EA043]/50 dark:bg-[#181C21] dark:text-[#56D364] dark:border-[#2EA043]/60 transition-colors ${
          onToggle ? 'hover:bg-[#E9ECEF] dark:hover:bg-[#22272E] cursor-pointer' : ''
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
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F8F9FA] text-[#6C757D] border border-[#C85A32]/40 dark:bg-[#181C21] dark:text-[#ADB5BD] dark:border-[#C85A32]/40 transition-colors ${
        onToggle ? 'hover:bg-[#E9ECEF] dark:hover:bg-[#22272E] cursor-pointer' : ''
      }`}
    >
      <AlertCircle className="w-3 h-3 text-[#C85A32]" />
      <span>Sem Consentimento</span>
    </button>
  );
}

export function EventTypeBadge({ type }: { type: string }) {
  if (type === 'CLIENT_BIRTHDAY') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F8F9FA] text-[#C85A32] border-2 border-[#C85A32] dark:bg-[#181C21] dark:text-[#E07A5F] dark:border-[#E07A5F]">
        <Calendar className="w-3 h-3 text-[#C85A32] dark:text-[#E07A5F]" /> Aniversário Cliente
      </span>
    );
  }
  if (type === 'FAMILY_BIRTHDAY') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F8F9FA] text-[#B85D3B] border border-[#B85D3B] dark:bg-[#181C21] dark:text-[#F39C74] dark:border-[#F39C74]">
        <User className="w-3 h-3 text-[#B85D3B] dark:text-[#F39C74]" /> Aniversário Familiar
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F8F9FA] text-[#495057] border border-[#C85A32]/40 dark:bg-[#181C21] dark:text-[#ADB5BD] dark:border-[#C85A32]/40">
      <Calendar className="w-3 h-3 text-[#C85A32]" /> Data Comemorativa
    </span>
  );
}

export function UserRoleBadge({ role }: { role: string }) {
  if (role === 'MASTER') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#13171C] text-[#F1F3F5] border-2 border-[#C85A32]">
        <Crown className="w-3 h-3 text-[#C85A32]" /> Master
      </span>
    );
  }
  if (role === 'ADMIN') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F8F9FA] text-[#C85A32] border-2 border-[#C85A32] dark:bg-[#181C21] dark:text-[#E07A5F]">
        Admin
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-[#F8F9FA] text-[#495057] border border-[#C85A32]/40 dark:bg-[#181C21] dark:text-[#ADB5BD]">
      Operador
    </span>
  );
}
