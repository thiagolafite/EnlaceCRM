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
  Sun,
  Moon,
  Bell,
  UserCog,
  Activity,
  Menu,
  X,
  Crown,
  HeartHandshake,
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
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const isMaster = user?.role === 'MASTER';

  const navigationGroups: NavCategory[] = [
    {
      category: 'Principal',
      items: [
        { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
        { id: 'clients', label: 'Clientes', icon: Users },
        { id: 'timeline', label: 'Agenda de datas', icon: CalendarDays },
        { id: 'alerts', label: 'Mensagens & Alertas', icon: Bell, badge: 'Hoje' },
      ],
    },
    {
      category: 'Configurações & Modelos',
      items: [
        { id: 'templates', label: 'Templates de Mensagem', icon: MessageSquareText },
        { id: 'dates', label: 'Datas Comemorativas', icon: Clock },
        { id: 'automation', label: 'Motor de Automação', icon: Zap, badge: 'Job' },
        { id: 'simulation', label: 'Simulador', icon: PlayCircle },
      ],
    },
    {
      category: 'Administração',
      items: [
        { id: 'users', label: 'Usuários da Empresa', icon: UserCog },
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
  let currentCategory = 'Principal';
  for (const group of navigationGroups) {
    const found = group.items.find((i) => i.id === currentTab);
    if (found) {
      currentLabel = found.label;
      currentCategory = group.category;
      break;
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FAF6F0] dark:bg-[#120F0D] text-[#1E1611] dark:text-[#F5EFE8] transition-colors duration-150 font-sans">
      {/* ==================================================================== */}
      {/* 1. DESKTOP SIDEBAR (FIXO EM TELAS >= 1024px — ESTILO VÍNCULO/ENLACE) */}
      {/* ==================================================================== */}
      <aside className="hidden lg:flex w-64 border-r border-[#2A201C] bg-[#1A1412] flex-col justify-between shrink-0 sticky top-0 h-screen z-30 transition-colors">
        <div className="flex flex-col h-full overflow-hidden">
          {/* Brand Header */}
          <div className="p-5 flex items-center gap-3 border-b border-[#2A201C] shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[#352119] border border-[#4D2D22] text-[#E07A5F] flex items-center justify-center shrink-0 shadow-sm">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-serif text-base font-semibold tracking-tight text-[#FAF6F0]">
                Vínculo
              </h1>
              <p className="text-[9px] font-bold tracking-[0.18em] uppercase text-[#B5A599] truncate">
                CRM DE RELACIONAMENTO
              </p>
            </div>
          </div>

          {/* Categorized Navigation Links */}
          <nav className="p-3 space-y-4 overflow-y-auto flex-1 overscroll-contain">
            {navigationGroups.map((group) => (
              <div key={group.category} className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#8C7A6B]">
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
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition-all ${
                          isActive
                            ? 'bg-[#2D1E18] text-[#F39C74] border border-[#523326] shadow-xs'
                            : 'text-[#A8988B] hover:text-[#EDE5DE] hover:bg-[#251D18] border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#F39C74]' : 'text-[#8C7A6B]'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              isActive
                                ? 'bg-[#523326] text-[#F39C74]'
                                : item.badge === 'Hoje'
                                ? 'bg-[#422B1E] text-[#E07A5F]'
                                : 'bg-[#2A201C] text-[#A8988B]'
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

          {/* Bottom Card "Relação que não esfria" (do Design de Referência) */}
          <div className="p-3 shrink-0">
            <div className="p-3.5 rounded-2xl bg-[#241C18] border border-[#3A2C24] space-y-1">
              <p className="text-xs font-serif font-semibold text-[#FAF6F0]">
                Relação que não esfria
              </p>
              <p className="text-[11px] text-[#A8988B] leading-relaxed">
                A agenda mostra quem merece uma mensagem nos próximos dias e já escreve o texto para você.
              </p>
            </div>
          </div>

          {/* User Profile in Sidebar Footer */}
          <div className="p-3 border-t border-[#2A201C] shrink-0 bg-[#16100E]">
            {user && (
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#201814] border border-[#33251F]">
                <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#352119] text-[#E07A5F] flex items-center justify-center font-bold text-xs shrink-0">
                    {(user.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate text-left">
                    <p className="text-xs font-semibold text-[#FAF6F0] truncate flex items-center gap-1">
                      <span>{user.name || 'Usuário'}</span>
                      {isMaster && <Crown className="w-3 h-3 text-[#E07A5F] shrink-0" />}
                    </p>
                    <p className="text-[10px] text-[#8C7A6B] truncate">{user.email || ''}</p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title="Sair da conta"
                  className="p-1.5 text-[#8C7A6B] hover:text-[#E07A5F] rounded-lg hover:bg-[#2A1D17] transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ==================================================================== */}
      {/* ==================================================================== */}
      {/* 2. MOBILE DRAWER */}
      {/* ==================================================================== */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="relative w-4/5 max-w-xs bg-[#1A1412] border-r border-[#2A201C] flex flex-col justify-between h-full shadow-2xl z-10 text-[#FAF6F0]">
            <div>
              <div className="p-4 flex items-center justify-between border-b border-[#2A201C]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#352119] border border-[#4D2D22] text-[#E07A5F] flex items-center justify-center font-bold text-xs">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-serif font-semibold text-sm text-[#FAF6F0]">
                      Vínculo
                    </span>
                    <p className="text-[8px] tracking-widest uppercase text-[#8C7A6B]">CRM DE RELACIONAMENTO</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-[#8C7A6B] hover:text-[#FAF6F0] rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-140px)]">
                {navigationGroups.map((group) => (
                  <div key={group.category} className="space-y-0.5">
                    <div className="px-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#8C7A6B]">
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
                            className={`w-full flex items-center justify-between px-2.5 py-2.5 rounded-xl font-medium text-xs ${
                              isActive
                                ? 'bg-[#2D1E18] text-[#F39C74] border border-[#523326]'
                                : 'text-[#A8988B] hover:bg-[#251D18] hover:text-[#FAF6F0]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <Icon className={`w-4 h-4 ${isActive ? 'text-[#F39C74]' : 'text-[#8C7A6B]'}`} />
                              <span>{item.label}</span>
                            </div>
                            {item.badge && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-[#352119] text-[#E07A5F]">
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
              <div className="p-3 border-t border-[#2A201C] flex items-center justify-between bg-[#16100E]">
                <div className="truncate">
                  <p className="text-xs font-semibold text-[#FAF6F0] truncate">{user.name || 'Usuário'}</p>
                  <p className="text-[10px] text-[#8C7A6B] truncate">{user.email || ''}</p>
                </div>
                <button onClick={onLogout} className="p-1.5 text-[#8C7A6B] hover:text-[#E07A5F] rounded-lg">
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
      <main className="flex-1 min-w-0 flex flex-col bg-[#FAF6F0] dark:bg-[#120F0D]">
        {/* Top Sticky Notification Banner */}
        <TopStickyAlertBar onNavigate={onNavigate} />

        {/* Warm Minimal Header */}
        <header className="h-16 border-b border-[#EDE5DC] dark:border-[#2A211D] bg-[#FAF6F0]/80 dark:bg-[#120F0D]/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 transition-colors">
          {/* Left: Mobile hamburger & breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#756557] dark:text-[#B5A599] hover:bg-[#F3ECE4] dark:hover:bg-[#221B17] border border-[#EDE5DC] dark:border-[#2A211D] shrink-0"
              title="Abrir Menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-xs truncate">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8C7A6B] dark:text-[#A8988B]">
                {currentCategory}
              </span>
              <span className="text-[#C2B5A8] dark:text-[#4A3D34]">/</span>
              <span className="font-serif text-sm font-semibold text-[#1E1611] dark:text-[#F5EFE8] truncate">
                {currentLabel}
              </span>
            </div>
          </div>

          {/* Right: Live Date, Notifications, Theme Switcher */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Live Date Pill */}
            {currentTime && (
              <span className="hidden md:inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium text-[#756557] dark:text-[#B5A599] border border-[#EDE5DC] dark:border-[#2A211D] bg-white/70 dark:bg-[#1A1513]/70 shadow-xs capitalize">
                {currentTime}
              </span>
            )}

            {/* Notification Bell Dropdown */}
            <NotificationBellDropdown onNavigate={onNavigate} />

            {/* Dark/Light Mode Switcher */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
              className="p-2 rounded-xl border border-[#EDE5DC] dark:border-[#2A211D] bg-white dark:bg-[#1A1513] text-[#756557] dark:text-[#B5A599] hover:text-[#1E1611] dark:hover:text-[#F5EFE8] hover:bg-[#F3ECE4] dark:hover:bg-[#2A211D] shadow-xs transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[#756557]" />
              )}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-8 lg:p-10 pb-24 lg:pb-12 flex-1 max-w-7xl w-full mx-auto overflow-x-hidden">
          {children}
        </div>

        {/* Modal de Lembretes Diários */}
        <DailyNotificationModal onNavigate={onNavigate} />
      </main>

      {/* ==================================================================== */}
      {/* 4. MOBILE BOTTOM DOCK */}
      {/* ==================================================================== */}
      <nav className="lg:hidden fixed bottom-2 left-2 right-2 z-40 bg-[#1A1412]/95 backdrop-blur-md border border-[#2A201C] px-2 py-1.5 rounded-2xl flex items-center justify-around shadow-2xl">
        <button
          onClick={() => handleSelectNav('dashboard')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
            currentTab === 'dashboard'
              ? 'text-[#F39C74] font-semibold bg-[#2D1E18]'
              : 'text-[#8C7A6B] hover:text-[#FAF6F0]'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[10px]">Painel</span>
        </button>

        <button
          onClick={() => handleSelectNav('clients')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
            currentTab === 'clients'
              ? 'text-[#F39C74] font-semibold bg-[#2D1E18]'
              : 'text-[#8C7A6B] hover:text-[#FAF6F0]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="text-[10px]">Clientes</span>
        </button>

        <button
          onClick={() => handleSelectNav('timeline')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
            currentTab === 'timeline' || currentTab === 'dates'
              ? 'text-[#F39C74] font-semibold bg-[#2D1E18]'
              : 'text-[#8C7A6B] hover:text-[#FAF6F0]'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span className="text-[10px]">Agenda</span>
        </button>

        <button
          onClick={() => handleSelectNav('alerts')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors relative ${
            currentTab === 'alerts'
              ? 'text-[#F39C74] font-semibold bg-[#2D1E18]'
              : 'text-[#8C7A6B] hover:text-[#FAF6F0]'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span className="text-[10px]">Mensagens</span>
        </button>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-[#8C7A6B] hover:text-[#FAF6F0]"
        >
          <Menu className="w-4 h-4" />
          <span className="text-[10px]">Mais</span>
        </button>
      </nav>
    </div>
  );
}
