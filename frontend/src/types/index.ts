export interface User {
  id: string;
  name: string;
  email: string;
  role: 'MASTER' | 'ADMIN' | 'OPERATOR';
  companyId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Client {
  id: string;
  name: string;
  document?: string | null;
  email?: string | null;
  phone?: string | null;
  companyName?: string | null;
  birthDate?: string | null;
  
  // Endereço
  zipCode?: string | null;
  address?: string | null;
  addressNumber?: string | null;
  addressComplement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;

  status: 'ACTIVE' | 'INACTIVE';
  lgpdConsent: boolean;
  lgpdConsentDate?: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  familyMembers?: FamilyMember[];
}

export interface FamilyMember {
  id: string;
  clientId: string;
  name: string;
  relationship: 'MOTHER' | 'FATHER' | 'SON' | 'DAUGHTER' | 'SPOUSE' | 'BROTHER' | 'SISTER' | 'GRANDFATHER' | 'GRANDMOTHER' | 'OTHER';
  birthDate: string;
  phone?: string | null;
  email?: string | null;
  
  // Endereço
  sameAddressAsClient?: boolean;
  zipCode?: string | null;
  address?: string | null;
  addressNumber?: string | null;
  addressComplement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;

  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommemorativeDate {
  id: string;
  name: string;
  day: number;
  month: number;
  year?: number | null;
  description?: string | null;
  category: 'FIXED' | 'CULTURAL' | 'CORPORATE';
  targetAudience: 'ALL_CLIENTS' | 'MOTHERS_ONLY' | 'FATHERS_ONLY' | 'CUSTOM';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  eventType: 'CLIENT_BIRTHDAY' | 'FAMILY_BIRTHDAY' | 'FIXED_DATE';
  channel: 'WHATSAPP' | 'EMAIL';
  commemorativeDateId?: string | null;
  commemorativeDate?: CommemorativeDate | null;
  subject?: string | null;
  content: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  id: string;
  clientId: string;
  client: Client;
  familyMemberId?: string | null;
  familyMember?: FamilyMember | null;
  commemorativeDateId?: string | null;
  commemorativeDate?: CommemorativeDate | null;
  templateId?: string | null;
  template?: MessageTemplate | null;
  
  eventType: 'CLIENT_BIRTHDAY' | 'FAMILY_BIRTHDAY' | 'FIXED_DATE';
  clientName: string;
  clientPhone?: string | null;
  targetName: string;
  contextDescription: string;
  renderedMessage: string;
  
  notificationStatus: 'PENDING' | 'SENT' | 'FAILED' | 'SIMULATED';
  notificationError?: string | null;
  
  sentToClientManual: boolean;
  sentToClientManualAt?: string | null;
  
  alertDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanySettings {
  id: string;
  companyName: string;
  tradeName: string;
  document?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  
  ownerWhatsappPhone?: string | null;
  callmebotApiKey?: string | null;
  callmebotEnabled: boolean;
  callmebotSimulateMode: boolean;

  schedulerHour: number;
  schedulerMinute: number;
  schedulerEnabled: boolean;
}

export interface DashboardStats {
  totalClients: number;
  totalFamilyMembers: number;
  todayAlerts: number;
  todaySentManual: number;
  todayPendingManual: number;
  todayAlertsList: Alert[];
}

export interface UpcomingEvent {
  date: string;
  day: number;
  month: number;
  type: 'CLIENT_BIRTHDAY' | 'FAMILY_BIRTHDAY' | 'FIXED_DATE';
  title: string;
  subtitle: string;
  clientId?: string;
  clientName?: string;
  familyMemberId?: string;
  daysRemaining: number;
  isToday: boolean;
}

export interface SystemLog {
  id: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SECURITY' | 'CRITICAL';
  category: 'AUTH' | 'DATABASE' | 'API' | 'AUTOMATION' | 'SECURITY' | 'SYSTEM';
  action: string;
  message: string;
  details?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  userId?: string | null;
  userEmail?: string | null;
  companyId?: string | null;
  createdAt: string;
}

export interface SystemMetrics {
  systemHealth: {
    status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    uptimeSeconds: number;
    nodeVersion: string;
    platform: string;
    serverTime: string;
  };
  database: {
    status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
    provider: string;
    latencyMs: number;
  };
  memory: {
    rssMB: number;
    heapUsedMB: number;
    totalServerMemoryMB: number;
    freeServerMemoryMB: number;
  };
  counts: {
    totalLogs: number;
    errors24h: number;
    securityIncidents24h: number;
    totalUsers: number;
    totalClients: number;
    activeTenantsCount: number;
  };
}

