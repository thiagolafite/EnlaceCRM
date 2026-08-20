import React from 'react';
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
} from 'lucide-react';
import { User } from '../types';
import { useTheme } from '../context/ThemeContext';

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
        { id: 'settings', label: 'Configurações (WhatsApp)', icon: Settings },
      ],
    },
  ];

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
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 backdrop-blur-xl flex flex-col justify-between shrink-0 sticky top-0 h-screen transition-colors">
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
          <nav className="p-3.5 space-y-4 overflow-y-auto flex-1">
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
                        onClick={() => onNavigate(item.id)}
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

        {/* User Info & LGPD Seal & Theme Switcher */}
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

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl px-8 flex items-center justify-between sticky top-0 z-20 transition-colors">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="text-slate-400 dark:text-slate-500 font-medium">{currentCategory}</span>
            <span>/</span>
            <span className="text-slate-800 dark:text-slate-200 font-semibold">
              {currentLabel}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Dark/Light Mode Switcher */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-xs font-semibold shadow-sm"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-200" />
                  <span>Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600 animate-in spin-in-90 duration-200" />
                  <span>Modo Escuro</span>
                </>
              )}
            </button>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Scheduler CallMeBot (06:00)
            </div>
          </div>
        </header>

        {/* Page Body */}
        <div className="p-8 flex-1">{children}</div>
      </main>
    </div>
  );
}
