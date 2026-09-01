import React, { useEffect, useState, Component, ErrorInfo, ReactNode } from 'react';
import { User } from './types';
import { api } from './services/api';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Alerts } from './pages/Alerts';
import { Clients } from './pages/Clients';
import { Calendar } from './pages/Calendar';
import { Templates } from './pages/Templates';
import { Automation } from './pages/Automation';
import { Settings } from './pages/Settings';
import { Users } from './pages/Users';
import { Monitoring } from './pages/Monitoring';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { HeartHandshake, RefreshCw, LogOut } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React render tree:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#080c15] text-white font-sans">
          <div className="max-w-lg w-full p-8 rounded-3xl bg-slate-900/95 border border-white/10 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black font-outfit text-white">Recuperação do Sistema</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ocorreu um erro ao renderizar os componentes da tela. Clique abaixo para reiniciar sua sessão com segurança.
            </p>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-black/60 border border-rose-500/30 text-left text-[11px] font-mono text-rose-300 max-h-36 overflow-auto whitespace-pre-wrap">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-black text-xs flex items-center justify-center gap-2 shadow-glow-indigo transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Limpar Cache & Reiniciar Sessão</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('dashboard');

  useEffect(() => {
    const savedUser = localStorage.getItem('enlace_user');
    const token = localStorage.getItem('enlace_token');

    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
        // Verify with /auth/me in background
        api.getMe().catch(() => {
          handleLogout();
        });
      } catch (err) {
        handleLogout();
      }
    }
    setLoading(false);

    const handleAuthExpired = () => {
      handleLogout();
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, []);

  const handleLoginSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('enlace_token');
    localStorage.removeItem('enlace_user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-[#080c15] text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center animate-pulse">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold">Carregando Enlace CRM...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <NotificationProvider>
      <Layout
        currentTab={currentTab}
        onNavigate={(tab) => setCurrentTab(tab)}
        user={user}
        onLogout={handleLogout}
      >
        {currentTab === 'dashboard' && <Dashboard onNavigate={setCurrentTab} />}
        {currentTab === 'alerts' && <Alerts />}
        {currentTab === 'clients' && <Clients />}
        {currentTab === 'dates' && <Calendar defaultTab="year" />}
        {(currentTab === 'timeline' || currentTab === 'calendar') && <Calendar defaultTab="agenda" />}
        {currentTab === 'templates' && <Templates />}
        {currentTab === 'automation' && <Automation defaultTab="run" />}
        {currentTab === 'simulation' && <Automation defaultTab="simulate" />}
        {currentTab === 'users' && <Users currentUser={user} />}
        {currentTab === 'monitoring' && <Monitoring currentUser={user} />}
        {currentTab === 'settings' && <Settings />}
      </Layout>
    </NotificationProvider>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
