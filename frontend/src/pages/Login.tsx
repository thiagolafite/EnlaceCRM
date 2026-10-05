import React, { useState } from 'react';
import { Lock, Mail, User as UserIcon, ShieldCheck, Sun, Moon, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { User as UserType } from '../types';
import { useTheme } from '../context/ThemeContext';

interface LoginProps {
  onLoginSuccess: (user: UserType, token: string) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const { theme, toggleTheme } = useTheme();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await api.login({ email, password });
      localStorage.setItem('enlace_token', data.token);
      localStorage.setItem('enlace_user', JSON.stringify(data.user));
      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (regPassword.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      setLoading(false);
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('As senhas digitadas não coincidem');
      setLoading(false);
      return;
    }

    try {
      const data: any = await api.register({
        name: regName,
        email: regEmail,
        password: regPassword,
      });

      if (data.pendingApproval) {
        setSuccessMessage(
          data.message ||
            'Cadastro recebido com sucesso! Sua conta foi enviada para análise e só será ativada após a aprovação do usuário Master.'
        );
        setMode('login');
        setRegName('');
        setRegEmail('');
        setRegPassword('');
        setRegConfirmPassword('');
      } else if (data.token && data.user) {
        localStorage.setItem('enlace_token', data.token);
        localStorage.setItem('enlace_user', JSON.stringify(data.user));
        onLoginSuccess(data.user, data.token);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FBFBFA] dark:bg-[#0D0D0E] text-[#18181B] dark:text-[#EDEDEA] relative transition-colors duration-150 font-sans">
      {/* Theme Toggle Button top right */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
          className="p-2 rounded-lg border border-[#E7E7E4] dark:border-[#26262B] bg-white dark:bg-[#141416] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-[#F4F4F2] dark:hover:bg-[#1C1C20] transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Central Studio Container */}
      <div className="w-full max-w-sm relative z-10 my-8">
        {/* Brand Header */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#18181B] dark:bg-[#EDEDEA] text-white dark:text-[#18181B] font-bold text-sm mb-1 tracking-widest shadow-subtle">
            E
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-[#18181B] dark:text-[#EDEDEA]">
            Enlace CRM
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Relacionamento & Felicitações
          </p>
        </div>

        {/* Minimalist Card */}
        <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#141416] border border-[#E7E7E4] dark:border-[#26262B] shadow-panel space-y-5">
          {/* Mode Switcher Tabs */}
          <div className="flex bg-[#F4F4F2] dark:bg-[#1C1C20] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                mode === 'login'
                  ? 'bg-white dark:bg-[#141416] text-[#18181B] dark:text-[#EDEDEA] shadow-subtle'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                mode === 'register'
                  ? 'bg-white dark:bg-[#141416] text-[#18181B] dark:text-[#EDEDEA] shadow-subtle'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {/* Success / Pending Alert */}
          {successMessage && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-200 text-xs leading-relaxed space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Conta em Análise</span>
              </div>
              <p>{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#1A1A1E] border border-[#E7E7E4] dark:border-[#26262B] focus:border-stone-900 dark:focus:border-stone-100 rounded-xl text-xs text-[#18181B] dark:text-[#EDEDEA] outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#1A1A1E] border border-[#E7E7E4] dark:border-[#26262B] focus:border-stone-900 dark:focus:border-stone-100 rounded-xl text-xs text-[#18181B] dark:text-[#EDEDEA] outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-[#18181B] text-white dark:bg-[#EDEDEA] dark:text-[#18181B] hover:bg-[#27272A] dark:hover:bg-[#FFFFFF] font-medium text-xs flex items-center justify-center gap-1.5 shadow-subtle transition-all active:scale-[0.99] disabled:opacity-50 mt-2"
              >
                <span>{loading ? 'Entrando...' : 'Acessar Sistema'}</span>
                {!loading && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
                  Nome Completo
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Seu Nome"
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#1A1A1E] border border-[#E7E7E4] dark:border-[#26262B] focus:border-stone-900 dark:focus:border-stone-100 rounded-xl text-xs text-[#18181B] dark:text-[#EDEDEA] outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#1A1A1E] border border-[#E7E7E4] dark:border-[#26262B] focus:border-stone-900 dark:focus:border-stone-100 rounded-xl text-xs text-[#18181B] dark:text-[#EDEDEA] outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#1A1A1E] border border-[#E7E7E4] dark:border-[#26262B] focus:border-stone-900 dark:focus:border-stone-100 rounded-xl text-xs text-[#18181B] dark:text-[#EDEDEA] outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#1A1A1E] border border-[#E7E7E4] dark:border-[#26262B] focus:border-stone-900 dark:focus:border-stone-100 rounded-xl text-xs text-[#18181B] dark:text-[#EDEDEA] outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-[#18181B] text-white dark:bg-[#EDEDEA] dark:text-[#18181B] hover:bg-[#27272A] dark:hover:bg-[#FFFFFF] font-medium text-xs flex items-center justify-center gap-1.5 shadow-subtle transition-all active:scale-[0.99] disabled:opacity-50 mt-2"
              >
                <span>{loading ? 'Cadastrando...' : 'Solicitar Acesso'}</span>
                {!loading && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-[11px] text-stone-400 dark:text-stone-500 mt-6">
          Privacidade & Segurança com LGPD Ativa
        </p>
      </div>
    </div>
  );
}
