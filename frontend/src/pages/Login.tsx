import React, { useState } from 'react';
import { HeartHandshake, Lock, Mail, User, ArrowRight, ShieldCheck, Sun, Moon, Sparkles, UserPlus, LogIn, Crown } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f8fafc] dark:bg-[#080c15] text-slate-900 dark:text-slate-100 relative overflow-hidden transition-colors duration-300 font-sans aurora-bg">
      {/* Aurora glowing background spheres */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/6 w-[300px] h-[300px] bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Theme Toggle Button top right */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
          className="p-3 rounded-2xl bg-white/80 dark:bg-obsidian-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-obsidian-800 transition-all shadow-md hover:scale-105"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-600" />
          )}
        </button>
      </div>

      {/* Central Luxury Container */}
      <div className="w-full max-w-md relative z-10 my-8">
        {/* Brand Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 shadow-glow-indigo text-white mb-2 transform hover:scale-105 transition-transform">
            <HeartHandshake className="w-9 h-9" />
          </div>
          <h1 className="text-3xl font-black font-outfit tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-600 dark:from-white dark:via-indigo-100 dark:to-purple-200 bg-clip-text text-transparent">
            Enlace CRM
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Fortalecendo relacionamentos através de mensagens comemorativas humanizadas.
          </p>
        </div>

        {/* Frosted Glass Login Card */}
        <div className="p-7 sm:p-8 rounded-3xl bg-white/85 dark:bg-obsidian-900/85 backdrop-blur-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-2xl space-y-6">
          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-100/80 dark:bg-obsidian-950/80 p-1.5 rounded-2xl border border-slate-200/50 dark:border-white/[0.04]">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                mode === 'login'
                  ? 'bg-white dark:bg-obsidian-850 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Entrar</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
                setSuccessMessage('');
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                mode === 'register'
                  ? 'bg-white dark:bg-obsidian-850 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Criar Nova Conta</span>
            </button>
          </div>

          {/* Success / Pending Alert */}
          {successMessage && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs leading-relaxed space-y-1 animate-in fade-in duration-200">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Conta em Análise de Segurança</span>
              </div>
              <p>{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-medium animate-in fade-in duration-200">
              {error}
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  E-mail de Acesso
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@empresa.com.br"
                    className="w-full bg-slate-50/80 dark:bg-obsidian-950/80 border border-slate-200/80 dark:border-white/[0.08] rounded-2xl py-3 pl-10 pr-4 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50/80 dark:bg-obsidian-950/80 border border-slate-200/80 dark:border-white/[0.08] rounded-2xl py-3 pl-10 pr-4 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:via-purple-500 hover:to-indigo-600 active:scale-98 text-white text-xs font-black shadow-glow-indigo transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Autenticando...' : 'Entrar no Painel'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Seu Nome Completo *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Ex: Carlos Albuquerque"
                    className="w-full bg-slate-50/80 dark:bg-obsidian-950/80 border border-slate-200/80 dark:border-white/[0.08] rounded-2xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Seu E-mail *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="seu.email@empresa.com.br"
                    className="w-full bg-slate-50/80 dark:bg-obsidian-950/80 border border-slate-200/80 dark:border-white/[0.08] rounded-2xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Senha (Mínimo 6 Dígitos) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50/80 dark:bg-obsidian-950/80 border border-slate-200/80 dark:border-white/[0.08] rounded-2xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Confirmar Senha *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50/80 dark:bg-obsidian-950/80 border border-slate-200/80 dark:border-white/[0.08] rounded-2xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:via-purple-500 hover:to-indigo-600 active:scale-98 text-white text-xs font-black shadow-glow-indigo transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Cadastrando...' : 'Criar Conta & Acessar'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Security & LGPD footer */}
          <div className="pt-2 text-center">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
              <span>Proteção de dados e conformidade com a LGPD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
