import React, { useEffect, useState } from 'react';
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
import { ThemeProvider } from './context/ThemeContext';

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400">
        Carregando Enlace CRM...
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Layout
      currentTab={currentTab}
      onNavigate={(tab) => setCurrentTab(tab)}
      user={user}
      onLogout={handleLogout}
    >
      {currentTab === 'dashboard' && <Dashboard onNavigate={setCurrentTab} />}
      {currentTab === 'alerts' && <Alerts />}
      {currentTab === 'clients' && <Clients />}
      {currentTab === 'dates' && <Calendar defaultTab="fixed" />}
      {(currentTab === 'timeline' || currentTab === 'calendar') && <Calendar defaultTab="agenda" />}
      {currentTab === 'templates' && <Templates />}
      {currentTab === 'automation' && <Automation defaultTab="run" />}
      {currentTab === 'simulation' && <Automation defaultTab="simulate" />}
      {currentTab === 'users' && <Users currentUser={user} />}
      {currentTab === 'settings' && <Settings />}
    </Layout>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
