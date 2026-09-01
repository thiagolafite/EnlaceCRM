import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  MessageSquareText,
  History,
  Zap,
  PlayCircle,
  Clock,
  Settings,
  LogOut,
  HeartHandshake,
  ShieldCheck,
  Sun,
  Moon,
  Sparkles,
  Bell,
  Send,
  UserCog,
  Activity,
  Menu,
  X,
  ChevronRight,
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
        { id: 'alerts', label: 'Alertas do Dia & Envio', icon: Bell, badge: 'Hoje' },
      ],
    },
    {
      category: 'Cadastros',
      items: [
        { id: 'clients', label: 'Clientes & Familiares', icon: Users },
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
        { id: 'settings', label: 'Configurações (WhatsApp)', icon: Settings },
      ],
    },
    ...(isMaster
      ? [
          {
            category: 'Painel Master Global',
            items: [
              {
                id: 'monitoring',
                label: 'Auditoria & Logs de Segurança',
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

  // Helper to find active item label and category
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
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* ==================================================================== */}
      {/* 1. DESKTOP SIDEBAR (FIXO EM TELAS >= 1024px) */}
      {/* ==================================================================== */}
      <aside className="hidden lg:flex w-64 border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 backdrop-blur-xl flex-col justify-between shrink-0 sticky top-0 h-screen transition-colors z-30">
        <div className="flex flex-col h-[calc(100vh-140px)]">
          {/* Logo & System Brand */}
          <div className="p-5 flex items-center gap-3 border-b border-slate-200/80 dark:border-slate-800/60 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white shrink-0">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-600 dark:from-white dark:via-slate-100 dark:to-indigo-200 bg-clip-text text-transparent">
                Enlace
              </h1>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">CRM de Relacionamento</p>
            </div>
          </div>

          {/* Categorized Navigation Links */}
          <nav className="p-3.5 space-y-4 overflow-y-auto flex-1 overscroll-contain">
            {navigationGroups.map((group) => (
              <div key={group.category} className="space-y-1">
                <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
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
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium text-xs transition-all duration-150 ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isActive
                                ? 'bg-indigo-500 text-white'
                                : item.badge === 'Master'
                                ? 'bg-amber-500 text-white'
                                : item.badge === 'Hoje'
                                ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
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

        {/* User Info & LGPD Seal */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/60 space-y-3 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/40 text-teal-800 dark:text-teal-300 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>Conformidade LGPD Ativa</span>
          </div>

          {user && (
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-indigo-600 dark:text-indigo-400 shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="truncate text-left">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                title="Sair da conta"
                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ==================================================================== */}
      {/* 2. MOBILE DRAWER (GAVETA DESLIZANTE COM BACKDROP EM TELAS PEQUENAS) */}
      {/* ==================================================================== */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Menu */}
          <div className="relative w-4/5 max-w-xs bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between h-full shadow-2xl z-10 animate-in slide-in-from-left duration-300">
            <div>
              {/* Drawer Header */}
              <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-base text-slate-900 dark:text-white">Enlace CRM</h2>
                    <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">Menu Principal</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="p-3 space-y-4 max-h-[calc(100vh-170px)] overflow-y-auto">
                {navigationGroups.map((group) => (
                  <div key={group.category} className="space-y-1">
                    <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                              isActive
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                              <span>{item.label}</span>
                            </div>
                            {item.badge && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500 text-white">
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

            {/* Mobile Drawer Footer User */}
            {user && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title="Sair"
                  className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. MAIN CONTENT AREA + TOP APP BAR */}
      {/* ==================================================================== */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top Sticky Notification Banner */}
        <TopStickyAlertBar onNavigate={onNavigate} />

        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 transition-colors">
          {/* Left: Mobile hamburger & breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shrink-0"
              title="Abrir Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-500 truncate">
              <span className="hidden sm:inline text-slate-400 dark:text-slate-500 font-medium">{currentCategory}</span>
              <span className="hidden sm:inline">/</span>
              <span className="text-slate-900 dark:text-slate-100 font-bold truncate">
                {currentLabel}
              </span>
            </div>
          </div>

          {/* Right: Theme Switcher, Notification Bell & Status */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Lembretes & Sino de Notificações com Dropdown */}
            <NotificationBellDropdown onNavigate={onNavigate} />

            {/* Dark/Light Mode Switcher */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-xs font-semibold shadow-sm"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-200" />
                  <span className="hidden md:inline">Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600 animate-in spin-in-90 duration-200" />
                  <span className="hidden md:inline">Escuro</span>
                </>
              )}
            </button>

            <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Scheduler Ativo (06:00)
            </div>
          </div>
        </header>

        {/* Page Content Body (com padding inferior seguro para o bottom bar mobile) */}
        <div className="p-4 sm:p-6 lg:p-8 pb-28 lg:pb-8 flex-1 max-w-full overflow-x-hidden">
          {children}
        </div>

        {/* Modal de Lembretes e Felicitações do Dia */}
        <DailyNotificationModal onNavigate={onNavigate} />
      </main>

      {/* ==================================================================== */}
      {/* 4. MOBILE BOTTOM DOCK NAVIGATION BAR (TELAS PEQUENAS < 1024px) */}
      {/* ==================================================================== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-2 py-2 flex items-center justify-around shadow-2xl safe-area-pb">
        <button
          onClick={() => handleSelectNav('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            currentTab === 'dashboard'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px]">Início</span>
        </button>

        <button
          onClick={() => handleSelectNav('alerts')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all relative ${
            currentTab === 'alerts'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <Bell className="w-5 h-5" />
          <span className="text-[10px]">Alertas</span>
          <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-indigo-600"></span>
        </button>

        <button
          onClick={() => handleSelectNav('clients')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            currentTab === 'clients'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px]">Clientes</span>
        </button>

        <button
          onClick={() => handleSelectNav('dates')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            currentTab === 'dates' || currentTab === 'timeline'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <CalendarDays className="w-5 h-5" />
          <span className="text-[10px]">Agenda</span>
        </button>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px]">Mais</span>
        </button>
      </nav>
    </div>
  );
}
