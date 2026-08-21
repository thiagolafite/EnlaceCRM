import {
  User,
  Client,
  FamilyMember,
  CommemorativeDate,
  MessageTemplate,
  Alert,
  DashboardStats,
  UpcomingEvent,
  CompanySettings,
} from '../types';

const BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('enlace_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('enlace_token');
    localStorage.removeItem('enlace_user');
    if (!window.location.pathname.includes('login')) {
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error || `Erro na requisição (${response.status})`);
  }

  return data as T;
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  register: (data: { name: string; email: string; password: string }) =>
    request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMe: () => request<User>('/auth/me'),

  // Dashboard & Stats
  getDashboardStats: () => request<DashboardStats>('/alerts/stats'),
  getUpcomingEvents: (days: number = 30) =>
    request<UpcomingEvent[]>(`/commemorative-dates/upcoming?days=${days}`),

  // Alertas (v2)
  getAlerts: (params?: { date?: string; sentToClientManual?: boolean; eventType?: string; search?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.date) searchParams.append('date', params.date);
    if (params?.sentToClientManual !== undefined) searchParams.append('sentToClientManual', String(params.sentToClientManual));
    if (params?.eventType) searchParams.append('eventType', params.eventType);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.page) searchParams.append('page', String(params.page));
    if (params?.limit) searchParams.append('limit', String(params.limit));
    const query = searchParams.toString();
    return request<{ data: Alert[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(
      `/alerts${query ? `?${query}` : ''}`
    );
  },
  toggleAlertSent: (id: string, sentManual?: boolean) =>
    request<Alert>(`/alerts/${id}/toggle-sent`, {
      method: 'PATCH',
      body: JSON.stringify({ sentManual }),
    }),
  resendAlertNotification: (date?: string) =>
    request<{ success: boolean; simulated?: boolean; message?: string; error?: string; alertsCount?: number }>(
      '/alerts/resend-notification',
      {
        method: 'POST',
        body: JSON.stringify({ date }),
      }
    ),

  // Clients
  getClients: (params?: { search?: string; status?: string; lgpdConsent?: boolean; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.lgpdConsent !== undefined) searchParams.append('lgpdConsent', String(params.lgpdConsent));
    if (params?.page) searchParams.append('page', String(params.page));
    if (params?.limit) searchParams.append('limit', String(params.limit));
    const query = searchParams.toString();
    return request<{ data: Client[]; meta: { total: number; page: number; totalPages: number } }>(
      `/clients${query ? `?${query}` : ''}`
    );
  },
  getClientById: (id: string) => request<Client>(`/clients/${id}`),
  createClient: (clientData: Partial<Client>) =>
    request<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    }),
  updateClient: (id: string, clientData: Partial<Client>) =>
    request<Client>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    }),
  deleteClient: (id: string) =>
    request<{ success: boolean }>(`/clients/${id}`, {
      method: 'DELETE',
    }),
  toggleLgpd: (id: string, consent: boolean) =>
    request<Client>(`/clients/${id}/lgpd`, {
      method: 'PATCH',
      body: JSON.stringify({ consent }),
    }),

  // Family Members
  createFamilyMember: (data: Partial<FamilyMember> & { clientId: string }) =>
    request<FamilyMember>('/family-members', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateFamilyMember: (id: string, data: Partial<FamilyMember>) =>
    request<FamilyMember>(`/family-members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteFamilyMember: (id: string) =>
    request<{ success: boolean }>(`/family-members/${id}`, {
      method: 'DELETE',
    }),

  // Commemorative Dates
  getDates: () => request<CommemorativeDate[]>('/commemorative-dates'),
  createDate: (data: Partial<CommemorativeDate>) =>
    request<CommemorativeDate>('/commemorative-dates', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateDate: (id: string, data: Partial<CommemorativeDate>) =>
    request<CommemorativeDate>(`/commemorative-dates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteDate: (id: string) =>
    request<{ success: boolean }>(`/commemorative-dates/${id}`, {
      method: 'DELETE',
    }),

  // Templates
  getTemplates: (params?: { eventType?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.eventType) searchParams.append('eventType', params.eventType);
    const query = searchParams.toString();
    return request<MessageTemplate[]>(`/templates${query ? `?${query}` : ''}`);
  },
  getTemplateVariables: () =>
    request<Array<{ tag: string; description: string }>>('/templates/variables'),
  createTemplate: (data: Partial<MessageTemplate>) =>
    request<MessageTemplate>('/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateTemplate: (id: string, data: Partial<MessageTemplate>) =>
    request<MessageTemplate>(`/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteTemplate: (id: string) =>
    request<{ success: boolean }>(`/templates/${id}`, {
      method: 'DELETE',
    }),
  previewTemplate: (id: string) =>
    request<{ sampleContext: any; renderedSubject?: string; renderedBody: string }>(
      `/templates/${id}/preview`,
      { method: 'POST' }
    ),
  previewCustomContent: (content: string) =>
    request<{ sampleContext: any; renderedSubject?: string; renderedBody: string }>(
      '/templates/preview-custom',
      {
        method: 'POST',
        body: JSON.stringify({ content }),
      }
    ),

  // Automation
  runTodayAutomation: () =>
    request<{ success: boolean; message: string; report: any }>('/automation/run-today', {
      method: 'POST',
    }),
  simulateAutomation: (targetDate: string) =>
    request<{ success: boolean; message: string; report: any }>('/automation/simulate', {
      method: 'POST',
      body: JSON.stringify({ targetDate }),
    }),

  // Settings & CallMeBot Test
  getSettings: () => request<CompanySettings>('/settings'),
  updateSettings: (data: Partial<CompanySettings>) =>
    request<CompanySettings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  testCallMeBot: (phone: string, apiKey: string) =>
    request<{ success: boolean; simulated?: boolean; error?: string }>('/settings/test-callmebot', {
      method: 'POST',
      body: JSON.stringify({ phone, apiKey }),
    }),

  // Users Management
  getUsers: () => request<User[]>('/users'),
  getUserById: (id: string) => request<User>(`/users/${id}`),
  createUser: (data: { name: string; email: string; password?: string; role?: 'ADMIN' | 'OPERATOR' }) =>
    request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateUser: (
    id: string,
    data: { name?: string; email?: string; password?: string; role?: 'ADMIN' | 'OPERATOR' }
  ) =>
    request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteUser: (id: string) =>
    request<{ success: boolean }>(`/users/${id}`, {
      method: 'DELETE',
    }),

  // Master Monitoring & Security Logs
  getLogs: (params?: {
    level?: string;
    category?: string;
    action?: string;
    search?: string;
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.level) searchParams.append('level', params.level);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.action) searchParams.append('action', params.action);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.page) searchParams.append('page', String(params.page));
    if (params?.limit) searchParams.append('limit', String(params.limit));
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    const query = searchParams.toString();
    return request<{
      data: import('../types').SystemLog[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>(`/logs${query ? `?${query}` : ''}`);
  },
  getLogMetrics: () => request<import('../types').SystemMetrics>('/logs/metrics'),
  testLog: (data?: { type?: string; message?: string }) =>
    request<{ success: boolean; log: any }>('/logs/test', {
      method: 'POST',
      body: JSON.stringify(data || {}),
    }),
  clearLogs: (olderThanDays?: number) =>
    request<{ deletedCount: number }>('/logs', {
      method: 'DELETE',
      body: JSON.stringify({ olderThanDays }),
    }),
};
