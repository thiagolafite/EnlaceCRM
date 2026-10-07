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
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F1F3F5] dark:bg-[#111418] text-[#1A1E24] dark:text-[#F1F3F5] transition-colors duration-150 font-sans">
      {/* ==================================================================== */}
      {/* 1. DESKTOP SIDEBAR (TITÂNIO PRATEADO ESCURO COM CONTORNO TERRACOTA) */}
      {/* ==================================================================== */}
      <aside className="hidden lg:flex w-64 border-r-2 border-[#C85A32]/35 bg-[#13171C] flex-col justify-between shrink-0 sticky top-0 h-screen z-30 transition-colors">
        <div className="flex flex-col h-full overflow-hidden">
          {/* Brand Header */}
          <div className="p-5 flex items-center gap-3 border-b border-[#C85A32]/25 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[#1C222A] border-2 border-[#C85A32] text-[#C85A32] flex items-center justify-center shrink-0 shadow-sm">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-serif text-base font-semibold tracking-tight text-[#F1F3F5]">
                Vínculo
              </h1>
              <p className="text-[9px] font-bold tracking-[0.18em] uppercase text-[#8E99A4] truncate">
                CRM DE RELACIONAMENTO
              </p>
            </div>
          </div>

          {/* Categorized Navigation Links */}
          <nav className="p-3 space-y-4 overflow-y-auto flex-1 overscroll-contain">
            {navigationGroups.map((group) => (
              <div key={group.category} className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#8E99A4]">
                  {group.category}
                </div>
                <div className="space-y-1">
                  {navigationGroups.find((g) => g.category === group.category)?.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectNav(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition-all ${
                          isActive
                            ? 'bg-[#1E252E] text-[#F39C74] border-2 border-[#C85A32] shadow-[0_0_8px_rgba(200,90,50,0.18)]'
                            : 'text-[#8E99A4] hover:text-[#F1F3F5] hover:bg-[#1A2027] border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#F39C74]' : 'text-[#8E99A4]'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              isActive
                                ? 'bg-[#C85A32] text-white'
                                : item.badge === 'Hoje'
                                ? 'bg-[#2A1E1A] text-[#E07A5F] border border-[#C85A32]/40'
                                : 'bg-[#1C222A] text-[#8E99A4] border border-[#303844]'
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

          {/* Bottom Card "Relação que não esfria" */}
          <div className="p-3 shrink-0">
            <div className="p-3.5 rounded-2xl bg-[#181E25] border border-[#C85A32]/40 space-y-1">
              <p className="text-xs font-serif font-semibold text-[#F1F3F5]">
                Relação que não esfria
              </p>
              <p className="text-[11px] text-[#8E99A4] leading-relaxed">
                A agenda mostra quem merece uma mensagem nos próximos dias e já escreve o texto para você.
              </p>
            </div>
          </div>

          {/* User Profile in Sidebar Footer */}
          <div className="p-3 border-t border-[#C85A32]/25 shrink-0 bg-[#0F1216]">
            {user && (
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#181E25] border border-[#C85A32]/35">
                <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#1C222A] border border-[#C85A32] text-[#C85A32] flex items-center justify-center font-bold text-xs shrink-0">
                    {(user.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate text-left">
                    <p className="text-xs font-semibold text-[#F1F3F5] truncate flex items-center gap-1">
                      <span>{user.name || 'Usuário'}</span>
                      {isMaster && <Crown className="w-3 h-3 text-[#E07A5F] shrink-0" />}
                    </p>
                    <p className="text-[10px] text-[#8E99A4] truncate">{user.email || ''}</p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title="Sair da conta"
                  className="p-1.5 text-[#8E99A4] hover:text-[#C85A32] rounded-lg hover:bg-[#1F2630] transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ==================================================================== */}
      {/* 2. MOBILE DRAWER */}
      {/* ==================================================================== */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="relative w-4/5 max-w-xs bg-[#13171C] border-r-2 border-[#C85A32]/40 flex flex-col justify-between h-full shadow-2xl z-10 text-[#F1F3F5]">
            <div>
              <div className="p-4 flex items-center justify-between border-b border-[#C85A32]/25">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#1C222A] border-2 border-[#C85A32] text-[#C85A32] flex items-center justify-center font-bold text-xs">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-serif font-semibold text-sm text-[#F1F3F5]">
                      Vínculo
                    </span>
                    <p className="text-[8px] tracking-widest uppercase text-[#8E99A4]">CRM DE RELACIONAMENTO</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-[#8E99A4] hover:text-[#F1F3F5] rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-140px)]">
                {navigationGroups.map((group) => (
                  <div key={group.category} className="space-y-0.5">
                    <div className="px-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#8E99A4]">
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
                                ? 'bg-[#1E252E] text-[#F39C74] border-2 border-[#C85A32]'
                                : 'text-[#8E99A4] hover:bg-[#1A2027] hover:text-[#F1F3F5]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <Icon className={`w-4 h-4 ${isActive ? 'text-[#F39C74]' : 'text-[#8E99A4]'}`} />
                              <span>{item.label}</span>
                            </div>
                            {item.badge && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-[#2A1E1A] text-[#E07A5F] border border-[#C85A32]/40">
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
              <div className="p-3 border-t border-[#C85A32]/25 flex items-center justify-between bg-[#0F1216]">
                <div className="truncate">
                  <p className="text-xs font-semibold text-[#F1F3F5] truncate">{user.name || 'Usuário'}</p>
                  <p className="text-[10px] text-[#8E99A4] truncate">{user.email || ''}</p>
                </div>
                <button onClick={onLogout} className="p-1.5 text-[#8E99A4] hover:text-[#C85A32] rounded-lg">
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
      <main className="flex-1 min-w-0 flex flex-col bg-[#F1F3F5] dark:bg-[#111418]">
        {/* Top Sticky Notification Banner */}
        <TopStickyAlertBar onNavigate={onNavigate} />

        {/* Silver & Terracotta Header */}
        <header className="h-16 border-b border-[#C85A32]/25 bg-[#F8F9FA]/85 dark:bg-[#13171C]/85 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 transition-colors">
          {/* Left: Mobile hamburger & breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#495057] dark:text-[#ADB5BD] hover:bg-[#E9ECEF] dark:hover:bg-[#1E232A] border border-[#C85A32]/30 shrink-0"
              title="Abrir Menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-xs truncate">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#6C757D] dark:text-[#8E99A4]">
                {currentCategory}
              </span>
              <span className="text-[#ADB5BD] dark:text-[#495057]">/</span>
              <span className="font-serif text-sm font-semibold text-[#1A1E24] dark:text-[#F1F3F5] truncate">
                {currentLabel}
              </span>
            </div>
          </div>

          {/* Right: Live Date, Notifications, Theme Switcher */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Live Date Pill */}
            {currentTime && (
              <span className="hidden md:inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium text-[#495057] dark:text-[#ADB5BD] border border-[#C85A32]/30 bg-[#F8F9FA] dark:bg-[#181C21] shadow-xs capitalize">
                {currentTime}
              </span>
            )}

            {/* Notification Bell Dropdown */}
            <NotificationBellDropdown onNavigate={onNavigate} />

            {/* Dark/Light Mode Switcher */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
              className="p-2 rounded-xl border border-[#C85A32]/30 bg-[#F8F9FA] dark:bg-[#181C21] text-[#495057] dark:text-[#ADB5BD] hover:text-[#1A1E24] dark:hover:text-[#F1F3F5] hover:border-[#C85A32] shadow-xs transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[#495057]" />
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
      <nav className="lg:hidden fixed bottom-2 left-2 right-2 z-40 bg-[#13171C]/95 backdrop-blur-md border border-[#C85A32]/40 px-2 py-1.5 rounded-2xl flex items-center justify-around shadow-2xl">
        <button
          onClick={() => handleSelectNav('dashboard')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
            currentTab === 'dashboard'
              ? 'text-[#F39C74] font-semibold bg-[#1E252E] border border-[#C85A32]'
              : 'text-[#8E99A4] hover:text-[#F1F3F5]'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[10px]">Painel</span>
        </button>

        <button
          onClick={() => handleSelectNav('clients')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
            currentTab === 'clients'
              ? 'text-[#F39C74] font-semibold bg-[#1E252E] border border-[#C85A32]'
              : 'text-[#8E99A4] hover:text-[#F1F3F5]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="text-[10px]">Clientes</span>
        </button>

        <button
          onClick={() => handleSelectNav('timeline')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
            currentTab === 'timeline' || currentTab === 'dates'
              ? 'text-[#F39C74] font-semibold bg-[#1E252E] border border-[#C85A32]'
              : 'text-[#8E99A4] hover:text-[#F1F3F5]'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span className="text-[10px]">Agenda</span>
        </button>

        <button
          onClick={() => handleSelectNav('alerts')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors relative ${
            currentTab === 'alerts'
              ? 'text-[#F39C74] font-semibold bg-[#1E252E] border border-[#C85A32]'
              : 'text-[#8E99A4] hover:text-[#F1F3F5]'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span className="text-[10px]">Mensagens</span>
        </button>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-[#8E99A4] hover:text-[#F1F3F5]"
        >
          <Menu className="w-4 h-4" />
          <span className="text-[10px]">Mais</span>
        </button>
      </nav>
    </div>
  );
}
