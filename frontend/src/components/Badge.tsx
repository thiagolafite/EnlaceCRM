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
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EBF7EE] text-[#1E6B37] border border-[#CDECD4] dark:bg-[#163820]/40 dark:text-[#68D389] dark:border-[#20522E]">
        <MessageCircle className="w-3 h-3 text-[#1E6B37] dark:text-[#68D389]" /> WhatsApp
      </span>
    );
  }
  if (channel === 'EMAIL') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F3ECE4] text-[#756557] border border-[#EDE5DC] dark:bg-[#2A201C] dark:text-[#B5A599] dark:border-[#3D2E28]">
        <Mail className="w-3 h-3" /> E-mail
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F3ECE4] text-[#756557] border border-[#EDE5DC] dark:bg-[#2A201C] dark:text-[#B5A599]">
      WhatsApp & E-mail
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  if (status === 'ACTIVE' || status === 'SENT' || status === 'COMPLETED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EBF7EE] text-[#1E6B37] border border-[#CDECD4] dark:bg-[#163820]/40 dark:text-[#68D389] dark:border-[#20522E]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#1E6B37] dark:bg-[#68D389]"></span>
        <span>{status === 'SENT' ? 'Enviado' : status === 'COMPLETED' ? 'Concluído' : 'Ativo'}</span>
      </span>
    );
  }
  if (status === 'FAILED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FDF0EE] text-[#B83226] border border-[#F9D4CF] dark:bg-[#3D1A17]/40 dark:text-[#F37B70] dark:border-[#5C2320]">
        <XCircle className="w-3 h-3 text-[#B83226] dark:text-[#F37B70]" /> Falha
      </span>
    );
  }
  if (status === 'QUEUED' || status === 'PROCESSING') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F5FD] text-[#2255A4] border border-[#D3E3FB] dark:bg-[#1A2A44]/40 dark:text-[#78A9F5] dark:border-[#253D66]">
        <Clock className="w-3 h-3 animate-spin" /> Na Fila
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FDF6EC] text-[#B36B15] border border-[#FAE5C8] dark:bg-[#382613]/40 dark:text-[#F2B363] dark:border-[#54391C]">
      <AlertCircle className="w-3 h-3 text-[#B36B15] dark:text-[#F2B363]" /> {status === 'PENDING' ? 'Pendente' : 'Inativo'}
    </span>
  );
}

export function NotificationBadge({ status }: { status: string }) {
  if (status === 'SENT') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EBF7EE] text-[#1E6B37] border border-[#CDECD4] dark:bg-[#163820]/40 dark:text-[#68D389]">
        <Bell className="w-3 h-3 text-[#1E6B37] dark:text-[#68D389]" /> Notificado
      </span>
    );
  }
  if (status === 'SIMULATED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F3ECE4] text-[#756557] border border-[#EDE5DC] dark:bg-[#2A201C] dark:text-[#B5A599]">
        Simulado
      </span>
    );
  }
  if (status === 'FAILED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FDF0EE] text-[#B83226] border border-[#F9D4CF] dark:bg-[#3D1A17]/40 dark:text-[#F37B70]">
        <XCircle className="w-3 h-3" /> Falha
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F3ECE4] text-[#8C7A6B] border border-[#EDE5DC] dark:bg-[#2A201C] dark:text-[#8C7A6B]">
      <Clock className="w-3 h-3" /> Não Notificado
    </span>
  );
}

export function ManualSentBadge({ sent, sentAt }: { sent: boolean; sentAt?: string | null }) {
  if (sent) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#EBF7EE] text-[#1E6B37] border border-[#CDECD4] dark:bg-[#163820]/40 dark:text-[#68D389] dark:border-[#20522E]">
        <Check className="w-3.5 h-3.5 text-[#1E6B37] dark:text-[#68D389]" />
        <span>Enviado ao Cliente</span>
        {sentAt && <span className="text-[10px] opacity-75 font-mono">({new Date(sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FDF6EC] text-[#B36B15] border border-[#FAE5C8] dark:bg-[#382613]/40 dark:text-[#F2B363] dark:border-[#54391C]">
      <Clock className="w-3.5 h-3.5 text-[#B36B15] dark:text-[#F2B363]" />
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
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FDF0EE] text-[#B83226] border border-[#F9D4CF] dark:bg-[#3D1A17]/40 dark:text-[#F37B70] dark:border-[#5C2320] transition-colors ${
          onToggle ? 'hover:bg-[#F9D4CF] dark:hover:bg-[#5C2320] cursor-pointer' : ''
        }`}
      >
        <ShieldAlert className="w-3 h-3 text-[#B83226] dark:text-[#F37B70]" />
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
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F4F9F6] text-[#23684B] border border-[#D5EADF] dark:bg-[#173426]/40 dark:text-[#74C9A3] dark:border-[#22523C] transition-colors ${
          onToggle ? 'hover:bg-[#D5EADF] dark:hover:bg-[#22523C] cursor-pointer' : ''
        }`}
      >
        <ShieldCheck className="w-3 h-3 text-[#23684B] dark:text-[#74C9A3]" />
        <span>LGPD ({sourceLabel})</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      title="Cliente sem registro formal de consentimento. Ficará de fora das automações."
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F3ECE4] text-[#8C7A6B] border border-[#EDE5DC] dark:bg-[#2A201C] dark:text-[#A8988B] dark:border-[#3D2E28] transition-colors ${
        onToggle ? 'hover:bg-[#E8DDD0] dark:hover:bg-[#3D2E28] cursor-pointer' : ''
      }`}
    >
      <AlertCircle className="w-3 h-3 text-[#8C7A6B]" />
      <span>Sem Consentimento</span>
    </button>
  );
}

export function EventTypeBadge({ type }: { type: string }) {
  if (type === 'CLIENT_BIRTHDAY') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FBF0E6] text-[#C85A32] border border-[#F5D2BF] dark:bg-[#2E1E17] dark:text-[#E07A5F] dark:border-[#4C2D20]">
        <Calendar className="w-3 h-3 text-[#C85A32] dark:text-[#E07A5F]" /> Aniversário Cliente
      </span>
    );
  }
  if (type === 'FAMILY_BIRTHDAY') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FDF0F2] text-[#B82B57] border border-[#F9D2DD] dark:bg-[#381622]/40 dark:text-[#F3769D] dark:border-[#592236]">
        <User className="w-3 h-3 text-[#B82B57] dark:text-[#F3769D]" /> Aniversário Familiar
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F3ECE4] text-[#756557] border border-[#EDE5DC] dark:bg-[#2A201C] dark:text-[#B5A599] dark:border-[#3D2E28]">
      <Calendar className="w-3 h-3 text-[#756557]" /> Data Comemorativa
    </span>
  );
}

export function UserRoleBadge({ role }: { role: string }) {
  if (role === 'MASTER') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#1A1412] text-[#FAF6F0] border border-[#3A2C24]">
        <Crown className="w-3 h-3 text-[#E07A5F]" /> Master
      </span>
    );
  }
  if (role === 'ADMIN') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FBF0E6] text-[#C85A32] border border-[#F5D2BF] dark:bg-[#2E1E17] dark:text-[#E07A5F] dark:border-[#4C2D20]">
        Admin
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-[#F3ECE4] text-[#756557] border border-[#EDE5DC] dark:bg-[#2A201C] dark:text-[#B5A599] dark:border-[#3D2E28]">
      Operador
    </span>
  );
}
