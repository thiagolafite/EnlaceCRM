import React, { useState, useEffect } from 'react';
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
  Heart,
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
        { id: 'alerts', label: 'Alertas do Dia & Envio', icon: Bell, badge: 'Hoje' },
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
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f8fafc] dark:bg-[#080c15] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans aurora-bg">
      {/* ==================================================================== */}
      {/* 1. DESKTOP SIDEBAR (FIXO EM TELAS >= 1024px) */}
      {/* ==================================================================== */}
      <aside className="hidden lg:flex w-72 border-r border-slate-200/80 dark:border-white/[0.07] bg-white/80 dark:bg-obsidian-900/80 backdrop-blur-2xl flex-col justify-between shrink-0 sticky top-0 h-screen z-30 transition-all duration-300">
        <div className="flex flex-col h-[calc(100vh-140px)]">
          {/* Brand Header */}
          <div className="p-6 flex items-center gap-3.5 border-b border-slate-200/60 dark:border-white/[0.06] shrink-0">
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center text-white shadow-glow-indigo/50 shrink-0 transform hover:rotate-3 transition-transform">
              <HeartHandshake className="w-6 h-6" />
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 ring-2 ring-white dark:ring-obsidian-900"></div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-black font-outfit tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-600 dark:from-white dark:via-indigo-100 dark:to-purple-200 bg-clip-text text-transparent">
                  Enlace
                </h1>
                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  CRM
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-tight">
                Relacionamento Humanizado
              </p>
            </div>
          </div>

          {/* Categorized Navigation Links */}
          <nav className="p-4 space-y-4 overflow-y-auto flex-1 overscroll-contain">
            {navigationGroups.map((group) => (
              <div key={group.category} className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                  <span>{group.category}</span>
                  <div className="h-px bg-slate-200/60 dark:bg-white/[0.04] flex-1"></div>
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectNav(item.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-semibold text-xs transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-glow-indigo font-bold scale-[1.02]'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'text-white scale-110' : 'text-slate-400 dark:text-slate-500'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : item.badge === 'Master'
                                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                : item.badge === 'Hoje'
                                ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 animate-pulse'
                                : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
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

        {/* User Profile & LGPD Card in Sidebar Footer */}
        <div className="p-4 border-t border-slate-200/60 dark:border-white/[0.06] space-y-3 shrink-0 bg-slate-50/50 dark:bg-obsidian-950/40">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-700 dark:text-teal-300 text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-500 shrink-0" />
            <span>LGPD e Segurança Ativa</span>
          </div>

          {user && (
            <div className="flex items-center justify-between p-2 rounded-2xl bg-white dark:bg-obsidian-850 border border-slate-200/80 dark:border-white/[0.06] shadow-xs">
              <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-xs text-white shadow-xs shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="truncate text-left">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1">
                    <span>{user.name}</span>
                    {isMaster && <Crown className="w-3 h-3 text-amber-500 shrink-0" />}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                title="Sair da conta"
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
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
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="relative w-4/5 max-w-xs bg-white dark:bg-obsidian-900 border-r border-slate-200 dark:border-white/[0.08] flex flex-col justify-between h-full shadow-2xl z-10 animate-in slide-in-from-left duration-300">
            <div>
              <div className="p-5 flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <span className="font-outfit font-black text-lg text-slate-900 dark:text-white">
                    Enlace CRM
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-180px)]">
                {navigationGroups.map((group) => (
                  <div key={group.category} className="space-y-1">
                    <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {group.category}
                    </div>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleSelectNav(item.id)}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs ${
                              isActive
                                ? 'bg-indigo-600 text-white shadow-glow-indigo'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <Icon className="w-4 h-4" />
                              <span>{item.label}</span>
                            </div>
                            {item.badge && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-white/20">
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
              <div className="p-4 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-between bg-slate-50 dark:bg-obsidian-950">
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                </div>
                <button onClick={onLogout} className="p-2 text-rose-500 rounded-xl">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. MAIN CONTENT AREA + LUXURY TOP APP BAR */}
      {/* ==================================================================== */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top Sticky Notification Banner */}
        <TopStickyAlertBar onNavigate={onNavigate} />

        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-200/80 dark:border-white/[0.06] bg-white/75 dark:bg-obsidian-900/70 backdrop-blur-2xl px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 transition-all duration-300">
          {/* Left: Mobile hamburger & breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-obsidian-800 border border-slate-200/80 dark:border-white/[0.08] shrink-0"
              title="Abrir Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs sm:text-sm truncate">
              <span className="hidden sm:inline text-slate-400 dark:text-slate-500 font-medium">{currentCategory}</span>
              <span className="hidden sm:inline text-slate-300 dark:text-slate-700">/</span>
              <span className="font-outfit text-slate-900 dark:text-white font-extrabold truncate text-base">
                {currentLabel}
              </span>
            </div>
          </div>

          {/* Right: Notification Bell, Theme Switcher & Status */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Live Calendar Date Badge */}
            {currentTime && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100/80 dark:bg-obsidian-800/60 border border-slate-200/60 dark:border-white/[0.05] text-xs font-bold text-slate-600 dark:text-slate-400">
                <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
                <span className="capitalize">{currentTime}</span>
              </div>
            )}

            {/* Notification Bell Dropdown */}
            <NotificationBellDropdown onNavigate={onNavigate} />

            {/* Dark/Light Mode Switcher */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-obsidian-850 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-obsidian-800 transition-all text-xs font-bold shadow-xs hover:scale-102 active:scale-98"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400 animate-in spin-in-90 duration-200" />
                  <span className="hidden md:inline">Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-600 animate-in spin-in-90 duration-200" />
                  <span className="hidden md:inline">Escuro</span>
                </>
              )}
            </button>

            {/* Scheduler Pulse Indicator */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Motor Ativo (06:00)</span>
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
      <nav className="lg:hidden fixed bottom-3 left-3 right-3 z-40 bg-white/90 dark:bg-obsidian-900/90 backdrop-blur-2xl border border-slate-200/80 dark:border-white/[0.1] px-3 py-2 rounded-2xl flex items-center justify-around shadow-2xl safe-area-pb">
        <button
          onClick={() => handleSelectNav('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            currentTab === 'dashboard'
              ? 'text-indigo-600 dark:text-indigo-400 font-black scale-105'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px]">Início</span>
        </button>

        <button
          onClick={() => handleSelectNav('alerts')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all relative ${
            currentTab === 'alerts'
              ? 'text-indigo-600 dark:text-indigo-400 font-black scale-105'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <Bell className="w-5 h-5" />
          <span className="text-[10px]">Alertas</span>
          <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-obsidian-900 animate-pulse"></span>
        </button>

        <button
          onClick={() => handleSelectNav('clients')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            currentTab === 'clients'
              ? 'text-indigo-600 dark:text-indigo-400 font-black scale-105'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px]">Clientes</span>
        </button>

        <button
          onClick={() => handleSelectNav('dates')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            currentTab === 'dates' || currentTab === 'timeline'
              ? 'text-indigo-600 dark:text-indigo-400 font-black scale-105'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <CalendarDays className="w-5 h-5" />
          <span className="text-[10px]">Agenda</span>
        </button>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px]">Menu</span>
        </button>
      </nav>
    </div>
  );
}
