import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  MessageSquareText,
  Zap,
  PlayCircle,
  Clock,
  Settings,
  LogOut,
  ShieldCheck,
  Sun,
  Moon,
  Bell,
  UserCog,
  Activity,
  Menu,
  X,
  Crown,
} from 'lucide-react';
import { User } from '../types';
import { useTheme } from '../context/ThemeContext';
import { TopStickyAlertBar } from './TopStickyAlertBar';
import { DailyNotificationModal } from './DailyNotificationModal';
import { NotificationBellDropdown } from './NotificationBellDropdown';

interface LayoutProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  user: User | null;
  onLogout: () => void;
  children: React.ReactNode;
}

export interface NavCategory {
  category: string;
  items: {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

export function Layout({
  currentTab,
  onNavigate,
  user,
  onLogout,
  children,
}: LayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('pt-BR', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const isMaster = user?.role === 'MASTER' || user?.email === 'tigolafite@gmail.com';

  const navigationGroups: NavCategory[] = [
    {
      category: 'Visão Geral',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      category: 'Alertas & Acompanhamento',
      items: [
        { id: 'alerts', label: 'Alertas do Dia', icon: Bell, badge: 'Hoje' },
      ],
    },
    {
      category: 'Cadastros',
      items: [
        { id: 'clients', label: 'Clientes & Famílias', icon: Users },
        { id: 'dates', label: 'Datas Comemorativas', icon: CalendarDays },
        { id: 'templates', label: 'Templates de Mensagem', icon: MessageSquareText },
      ],
    },
    {
      category: 'Automações',
      items: [
        { id: 'automation', label: 'Motor de Felicitações', icon: Zap, badge: 'Job' },
        { id: 'simulation', label: 'Simulador de Datas', icon: PlayCircle },
      ],
    },
    {
      category: 'Agendamentos',
      items: [
        { id: 'timeline', label: 'Agenda & Linha do Tempo', icon: Clock },
      ],
    },
    {
      category: 'Sistema',
      items: [
        { id: 'users', label: 'Usuários do Sistema', icon: UserCog },
        { id: 'settings', label: 'Configurações', icon: Settings },
      ],
    },
    ...(isMaster
      ? [
          {
            category: 'Master Global',
            items: [
              {
                id: 'monitoring',
                label: 'Auditoria & Logs',
                icon: Activity,
                badge: 'Master',
              },
            ],
          },
        ]
      : []),
  ];

  const handleSelectNav = (tabId: string) => {
    onNavigate(tabId);
    setIsMobileMenuOpen(false);
  };

  let currentLabel = 'Painel';
  let currentCategory = 'Enlace';
  for (const group of navigationGroups) {
    const found = group.items.find((i) => i.id === currentTab);
    if (found) {
      currentLabel = found.label;
      currentCategory = group.category;
      break;
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FBFBFA] dark:bg-[#0D0D0E] text-[#18181B] dark:text-[#EDEDEA] transition-colors duration-150 font-sans">
      {/* ==================================================================== */}
      {/* 1. DESKTOP SIDEBAR (FIXO EM TELAS >= 1024px) */}
      {/* ==================================================================== */}
      <aside className="hidden lg:flex w-64 border-r border-[#E7E7E4] dark:border-[#26262B] bg-[#FFFFFF] dark:bg-[#141416] flex-col justify-between shrink-0 sticky top-0 h-screen z-30 transition-colors">
        <div className="flex flex-col h-[calc(100vh-120px)]">
          {/* Brand Header */}
          <div className="p-5 flex items-center gap-3 border-b border-[#E7E7E4] dark:border-[#26262B] shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[#18181B] dark:bg-[#EDEDEA] text-white dark:text-[#18181B] flex items-center justify-center font-bold text-xs shrink-0 tracking-widest">
              E
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-semibold tracking-tight text-[#18181B] dark:text-[#EDEDEA]">
                  Enlace CRM
                </h1>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                Relacionamento
              </p>
            </div>
          </div>

          {/* Categorized Navigation Links */}
          <nav className="p-3 space-y-4 overflow-y-auto flex-1 overscroll-contain">
            {navigationGroups.map((group) => (
              <div key={group.category} className="space-y-0.5">
                <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                  {group.category}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectNav(item.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg font-medium text-xs transition-colors ${
                          isActive
                            ? 'bg-[#18181B] text-white dark:bg-[#EDEDEA] dark:text-[#18181B]'
                            : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-[#F4F4F2] dark:hover:bg-[#1C1C20]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white dark:text-[#18181B]' : 'text-stone-400 dark:text-stone-500'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase tracking-wider ${
                              isActive
                                ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
                                : item.badge === 'Hoje'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* User Profile in Sidebar Footer */}
        <div className="p-3 border-t border-[#E7E7E4] dark:border-[#26262B] space-y-2 shrink-0 bg-[#FAFAFA] dark:bg-[#111113]">
          {user && (
            <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-[#18181B] border border-[#E7E7E4] dark:border-[#26262B]">
              <div className="flex items-center gap-2 overflow-hidden min-w-0">
                <div className="w-7 h-7 rounded-md bg-stone-200 dark:bg-stone-700 flex items-center justify-center font-semibold text-xs text-stone-800 dark:text-stone-200 shrink-0">
                  {(user.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="truncate text-left">
                  <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate flex items-center gap-1">
                    <span>{user.name || 'Usuário'}</span>
                    {isMaster && <Crown className="w-3 h-3 text-amber-500 shrink-0" />}
                  </p>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">{user.email || ''}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                title="Sair da conta"
                className="p-1.5 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ==================================================================== */}
      {/* 2. MOBILE DRAWER */}
      {/* ==================================================================== */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="relative w-4/5 max-w-xs bg-white dark:bg-[#141416] border-r border-[#E7E7E4] dark:border-[#26262B] flex flex-col justify-between h-full shadow-xl z-10">
            <div>
              <div className="p-4 flex items-center justify-between border-b border-[#E7E7E4] dark:border-[#26262B]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-[#18181B] dark:bg-[#EDEDEA] text-white dark:text-[#18181B] flex items-center justify-center font-bold text-xs">
                    E
                  </div>
                  <span className="font-semibold text-sm text-stone-900 dark:text-stone-100">
                    Enlace CRM
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-stone-500 hover:text-stone-900 dark:text-stone-400 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-140px)]">
                {navigationGroups.map((group) => (
                  <div key={group.category} className="space-y-0.5">
                    <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                      {group.category}
                    </div>
                    <div className="space-y-0.5">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleSelectNav(item.id)}
                            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg font-medium text-xs ${
                              isActive
                                ? 'bg-[#18181B] text-white dark:bg-[#EDEDEA] dark:text-[#18181B]'
                                : 'text-stone-600 dark:text-stone-400 hover:bg-[#F4F4F2] dark:hover:bg-[#1C1C20]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <Icon className="w-4 h-4" />
                              <span>{item.label}</span>
                            </div>
                            {item.badge && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-stone-200 dark:bg-stone-700">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            </div>

            {user && (
              <div className="p-3 border-t border-[#E7E7E4] dark:border-[#26262B] flex items-center justify-between bg-[#FAFAFA] dark:bg-[#111113]">
                <div className="truncate">
                  <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">{user.name || 'Usuário'}</p>
                  <p className="text-[10px] text-stone-500 truncate">{user.email || ''}</p>
                </div>
                <button onClick={onLogout} className="p-1.5 text-stone-400 hover:text-rose-500 rounded-lg">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. MAIN CONTENT AREA & HEADER */}
      {/* ==================================================================== */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top Sticky Notification Banner */}
        <TopStickyAlertBar onNavigate={onNavigate} />

        {/* Minimal Header */}
        <header className="h-14 border-b border-[#E7E7E4] dark:border-[#26262B] bg-[#FFFFFF] dark:bg-[#141416] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
          {/* Left: Mobile hamburger & breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-[#F4F4F2] dark:hover:bg-[#1C1C20] border border-[#E7E7E4] dark:border-[#26262B] shrink-0"
              title="Abrir Menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 text-xs truncate">
              <span className="hidden sm:inline text-stone-400 font-medium">{currentCategory}</span>
              <span className="hidden sm:inline text-stone-300 dark:text-stone-600">/</span>
              <span className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                {currentLabel}
              </span>
            </div>
          </div>

          {/* Right: Date, Notifications, Theme */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Live Date */}
            {currentTime && (
              <span className="hidden md:inline-flex items-center px-2 py-1 rounded-md text-[11px] font-mono text-stone-500 dark:text-stone-400 border border-[#E7E7E4] dark:border-[#26262B] bg-[#FBFBFA] dark:bg-[#18181B] capitalize">
                {currentTime}
              </span>
            )}

            {/* Notification Bell Dropdown */}
            <NotificationBellDropdown onNavigate={onNavigate} />

            {/* Dark/Light Mode Switcher */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
              className="p-2 rounded-lg border border-[#E7E7E4] dark:border-[#26262B] bg-[#FFFFFF] dark:bg-[#18181B] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-[#F4F4F2] dark:hover:bg-[#202024] transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5" />
              ) : (
                <Moon className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 flex-1 max-w-full overflow-x-hidden">
          {children}
        </div>

        {/* Modal de Lembretes Diários */}
        <DailyNotificationModal onNavigate={onNavigate} />
      </main>

      {/* ==================================================================== */}
      {/* 4. MOBILE BOTTOM DOCK */}
      {/* ==================================================================== */}
      <nav className="lg:hidden fixed bottom-2 left-2 right-2 z-40 bg-[#FFFFFF]/95 dark:bg-[#141416]/95 backdrop-blur-md border border-[#E7E7E4] dark:border-[#26262B] px-2 py-1.5 rounded-xl flex items-center justify-around shadow-panel">
        <button
          onClick={() => handleSelectNav('dashboard')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors ${
            currentTab === 'dashboard'
              ? 'text-[#18181B] dark:text-[#EDEDEA] font-semibold'
              : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[10px]">Início</span>
        </button>

        <button
          onClick={() => handleSelectNav('alerts')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors relative ${
            currentTab === 'alerts'
              ? 'text-[#18181B] dark:text-[#EDEDEA] font-semibold'
              : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span className="text-[10px]">Alertas</span>
        </button>

        <button
          onClick={() => handleSelectNav('clients')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors ${
            currentTab === 'clients'
              ? 'text-[#18181B] dark:text-[#EDEDEA] font-semibold'
              : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="text-[10px]">Clientes</span>
        </button>

        <button
          onClick={() => handleSelectNav('dates')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors ${
            currentTab === 'dates' || currentTab === 'timeline'
              ? 'text-[#18181B] dark:text-[#EDEDEA] font-semibold'
              : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span className="text-[10px]">Agenda</span>
        </button>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
        >
          <Menu className="w-4 h-4" />
          <span className="text-[10px]">Menu</span>
        </button>
      </nav>
    </div>
  );
}
