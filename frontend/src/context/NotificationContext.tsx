import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { UpcomingEvent, MessageTemplate, Client } from '../types';

interface NotificationContextData {
  todayEvents: UpcomingEvent[];
  upcomingEvents: UpcomingEvent[];
  templates: MessageTemplate[];
  clients: Client[];
  loading: boolean;
  isDailyModalOpen: boolean;
  isTopBarVisible: boolean;
  selectedEventForDirectSend: UpcomingEvent | null;
  openDailyModal: () => void;
  closeDailyModal: () => void;
  dismissTopBar: () => void;
  showTopBar: () => void;
  openDirectSendModal: (event: UpcomingEvent) => void;
  closeDirectSendModal: () => void;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextData>({} as NotificationContextData);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [todayEvents, setTodayEvents] = useState<UpcomingEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDailyModalOpen, setIsDailyModalOpen] = useState(false);
  const [isTopBarVisible, setIsTopBarVisible] = useState(true);
  const [selectedEventForDirectSend, setSelectedEventForDirectSend] = useState<UpcomingEvent | null>(null);

  const loadNotifications = useCallback(async () => {
    const token = localStorage.getItem('enlace_token');
    if (!token) {
      setLoading(false);
      setTodayEvents([]);
      setUpcomingEvents([]);
      return;
    }

    try {
      setLoading(true);
      const [eventsData, tplsData, rawClients] = await Promise.all([
        api.getUpcomingEvents(5).catch(() => [] as UpcomingEvent[]),
        api.getTemplates().catch(() => [] as MessageTemplate[]),
        api.getClients().catch(() => [] as any),
      ]);

      const eventsList = Array.isArray(eventsData) ? eventsData : [];
      const tplsList = Array.isArray(tplsData) ? tplsData : [];
      const normalizedClients: Client[] = Array.isArray(rawClients)
        ? rawClients
        : (rawClients as any)?.data || [];

      const today = eventsList.filter((e) => e && (e.isToday || e.daysRemaining === 0));
      const upcoming = eventsList.filter((e) => e && (!e.isToday && e.daysRemaining > 0));

      setTodayEvents(today);
      setUpcomingEvents(upcoming);
      setTemplates(tplsList);
      setClients(normalizedClients);

      // Se houver eventos hoje e ainda não foi visualizado nesta sessão de navegador, abre o modal de boas-vindas
      const sessionSeen = sessionStorage.getItem('enlace_daily_modal_seen');
      if (today.length > 0 && !sessionSeen) {
        setIsDailyModalOpen(true);
        sessionStorage.setItem('enlace_daily_modal_seen', 'true');
      }
    } catch (err) {
      console.error('Erro ao carregar notificações diárias:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();

    // Auto-refresh a cada 5 minutos
    const interval = setInterval(() => {
      loadNotifications();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadNotifications]);

  const openDailyModal = () => setIsDailyModalOpen(true);
  const closeDailyModal = () => setIsDailyModalOpen(false);

  const dismissTopBar = () => setIsTopBarVisible(false);
  const showTopBar = () => setIsTopBarVisible(true);

  const openDirectSendModal = (event: UpcomingEvent) => {
    setSelectedEventForDirectSend(event);
  };

  const closeDirectSendModal = () => {
    setSelectedEventForDirectSend(null);
  };

  return (
    <NotificationContext.Provider
      value={{
        todayEvents,
        upcomingEvents,
        templates,
        clients,
        loading,
        isDailyModalOpen,
        isTopBarVisible,
        selectedEventForDirectSend,
        openDailyModal,
        closeDailyModal,
        dismissTopBar,
        showTopBar,
        openDirectSendModal,
        closeDirectSendModal,
        refreshNotifications: loadNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications deve ser usado dentro de um NotificationProvider');
  }
  return context;
}
