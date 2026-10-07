import { useEffect, useState, Component, ErrorInfo, ReactNode } from 'react';
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
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfUse } from './pages/TermsOfUse';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { RefreshCw } from 'lucide-react';

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
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#F4F4F6] dark:bg-[#18191D] text-[#18191D] dark:text-[#F4F4F6] font-sans">
          <div className="max-w-lg w-full p-8 rounded-2xl card-warm shadow-panel text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#18191D] text-[#F4F4F6] dark:bg-[#F4F4F6] dark:text-[#18191D] flex items-center justify-center mx-auto font-bold text-xl shadow-subtle">
              E
            </div>
            <h2 className="text-xl font-bold text-[#18191D] dark:text-[#F4F4F6]">Recuperação do Sistema</h2>
            <p className="text-xs text-[#686971] dark:text-[#9DA0AA] leading-relaxed">
              Ocorreu uma instabilidade momentânea na interface. Clique abaixo para reiniciar sua sessão com segurança.
            </p>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-[#EEEEF1] dark:bg-[#24252B] border border-[#E2E2E8] dark:border-[#292A30] text-left text-[11px] font-mono text-[#E54833] max-h-36 overflow-auto whitespace-pre-wrap">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full btn-primary py-3"
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
      <div className="min-h-screen flex items-center justify-center bg-[#F4F4F6] dark:bg-[#18191D] text-[#686971]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#18191D] text-white dark:bg-white dark:text-[#18191D] flex items-center justify-center font-bold text-xl shadow-subtle animate-pulse">
            E
          </div>
          <span className="text-[11px] font-mono tracking-widest text-[#71727A] dark:text-[#9DA0AA] uppercase">Carregando Enlace...</span>
        </div>
      </div>
    );
  }

  const currentPath = window.location.pathname;
  if (currentPath === '/privacy-policy' || currentPath === '/politica-de-privacidade') {
    return <PrivacyPolicy />;
  }
  if (currentPath === '/terms-of-use' || currentPath === '/termos-de-uso') {
    return <TermsOfUse />;
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
