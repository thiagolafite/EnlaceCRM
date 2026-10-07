import React, { useState } from 'react';
import { Lock, Mail, User as UserIcon, ShieldCheck, Sun, Moon, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { User as UserType } from '../types';
import { useTheme } from '../context/ThemeContext';
import { ErrorBanner } from '../components/ErrorBanner';

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
  const [regTermsAccepted, setRegTermsAccepted] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorState, setErrorState] = useState<{ message: string; solution?: string } | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorState(null);

    try {
      const data = await api.login({ email, password });
      localStorage.setItem('enlace_token', data.token);
      localStorage.setItem('enlace_user', JSON.stringify(data.user));
      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setErrorState({
        message: err.message || 'Erro ao realizar login',
        solution: err.solution || 'Verifique se seu e-mail e senha estão corretos e tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorState(null);

    if (!regTermsAccepted) {
      setErrorState({
        message: 'Você precisa aceitar os Termos de Uso e a Política de Privacidade.',
        solution: 'Marque a caixa de seleção confirmando a concordância com os termos de serviço e proteção de dados.',
      });
      setLoading(false);
      return;
    }

    if (regPassword.length < 10) {
      setErrorState({
        message: 'A senha deve ter no mínimo 10 caracteres para conformidade de segurança.',
        solution: 'Crie uma senha mais longa combinando letras, números e símbolos.',
      });
      setLoading(false);
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorState({
        message: 'As senhas digitadas não coincidem.',
        solution: 'Verifique a digitação da confirmação de senha.',
      });
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
      setErrorState({
        message: err.message || 'Erro ao criar conta',
        solution: err.solution || 'Verifique se o e-mail informado já não está em uso por outra conta.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F4F4F6] dark:bg-[#18191D] text-[#18191D] dark:text-[#F4F4F6] relative transition-colors duration-150 font-sans">
      {/* Theme Toggle Button top right */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
          className="p-2.5 rounded-xl border border-[#D7D7DD] dark:border-[#33343A] bg-[#EEEEF1] dark:bg-[#24252B] text-[#686971] dark:text-[#9DA0AA] hover:text-[#18191D] dark:hover:text-[#F4F4F6] transition-colors shadow-subtle"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#18191D]" />}
        </button>
      </div>

      <div className="w-full max-w-sm">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#18191D] text-white dark:bg-[#F4F4F6] dark:text-[#18191D] font-bold text-2xl mb-3 shadow-panel border border-[#292A30] dark:border-[#E2E2E8]">
            E
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#18191D] dark:text-[#F4F4F6]">
            Enlace
          </h1>
          <p className="text-[10px] font-mono tracking-widest text-[#686971] dark:text-[#9DA0AA] uppercase mt-1">
            CRM DE RELACIONAMENTO & DATAS
          </p>
        </div>

        {/* Card */}
        <div className="card-warm p-6 sm:p-8 space-y-5 shadow-panel">
          {/* Tabs Mode */}
          <div className="flex p-1 bg-[#EEEEF1] dark:bg-[#24252B] border border-[#D7D7DD] dark:border-[#33343A] rounded-xl text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorState(null);
                setSuccessMessage('');
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-[#18191D] text-[#18191D] dark:text-[#F4F4F6] shadow-xs font-semibold'
                  : 'text-[#686971] hover:text-[#18191D] dark:text-[#9DA0AA] dark:hover:text-[#F4F4F6]'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorState(null);
                setSuccessMessage('');
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mode === 'register'
                  ? 'bg-white dark:bg-[#18191D] text-[#18191D] dark:text-[#F4F4F6] shadow-xs font-semibold'
                  : 'text-[#686971] hover:text-[#18191D] dark:text-[#9DA0AA] dark:hover:text-[#F4F4F6]'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {/* Success / Pending Alert */}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs leading-relaxed space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Conta em Análise</span>
              </div>
              <p>{successMessage}</p>
            </div>
          )}

          {/* Error Banner Direcional */}
          {errorState && (
            <ErrorBanner
              error={errorState.message}
              solution={errorState.solution}
              onClose={() => setErrorState(null)}
            />
          )}

          {/* Form */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#686971] dark:text-[#9DA0AA]">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#686971] dark:text-[#9DA0AA] pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#EEEEF1] dark:bg-[#24252B] border border-[#D7D7DD] dark:border-[#33343A] focus:border-[#18191D] dark:focus:border-[#F4F4F6] rounded-xl text-xs text-[#18191D] dark:text-[#F4F4F6] outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#686971] dark:text-[#9DA0AA]">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#686971] dark:text-[#9DA0AA] pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#EEEEF1] dark:bg-[#24252B] border border-[#D7D7DD] dark:border-[#33343A] focus:border-[#18191D] dark:focus:border-[#F4F4F6] rounded-xl text-xs text-[#18191D] dark:text-[#F4F4F6] outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-2.5 mt-2"
              >
                <span>{loading ? 'Acessando...' : 'Acessar Sistema'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#686971] dark:text-[#9DA0AA]">
                  Nome Completo
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#686971] dark:text-[#9DA0AA] pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#EEEEF1] dark:bg-[#24252B] border border-[#D7D7DD] dark:border-[#33343A] focus:border-[#18191D] dark:focus:border-[#F4F4F6] rounded-xl text-xs text-[#18191D] dark:text-[#F4F4F6] outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#686971] dark:text-[#9DA0AA]">
                  E-mail Corporativo
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#686971] dark:text-[#9DA0AA] pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="seu@empresa.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#EEEEF1] dark:bg-[#24252B] border border-[#D7D7DD] dark:border-[#33343A] focus:border-[#18191D] dark:focus:border-[#F4F4F6] rounded-xl text-xs text-[#18191D] dark:text-[#F4F4F6] outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#686971] dark:text-[#9DA0AA]">
                  Senha (mínimo 10 caracteres)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#686971] dark:text-[#9DA0AA] pointer-events-none" />
                  <input
                    type="password"
                    required
                    minLength={10}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#EEEEF1] dark:bg-[#24252B] border border-[#D7D7DD] dark:border-[#33343A] focus:border-[#18191D] dark:focus:border-[#F4F4F6] rounded-xl text-xs text-[#18191D] dark:text-[#F4F4F6] outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#686971] dark:text-[#9DA0AA]">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#686971] dark:text-[#9DA0AA] pointer-events-none" />
                  <input
                    type="password"
                    required
                    minLength={10}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#EEEEF1] dark:bg-[#24252B] border border-[#D7D7DD] dark:border-[#33343A] focus:border-[#18191D] dark:focus:border-[#F4F4F6] rounded-xl text-xs text-[#18191D] dark:text-[#F4F4F6] outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Termos de Uso e LGPD */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="regTerms"
                  checked={regTermsAccepted}
                  onChange={(e) => setRegTermsAccepted(e.target.checked)}
                  className="mt-0.5 rounded border-[#D7D7DD] dark:border-[#33343A] text-[#18191D] focus:ring-[#18191D] cursor-pointer"
                />
                <label htmlFor="regTerms" className="text-[11px] text-[#686971] dark:text-[#9DA0AA] leading-tight select-none">
                  Li e concordo com os{' '}
                  <a href="/terms-of-use" target="_blank" rel="noopener noreferrer" className="text-[#18191D] dark:text-[#F4F4F6] font-medium underline">
                    Termos de Uso
                  </a>{' '}
                  e a{' '}
                  <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#18191D] dark:text-[#F4F4F6] font-medium underline">
                    Política de Privacidade (LGPD)
                  </a>.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-2.5 mt-3"
              >
                <span>{loading ? 'Cadastrando...' : 'Criar Conta de Acesso'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

        {/* Footer Legal Links */}
        <div className="mt-6 text-center text-[11px] text-[#686971] dark:text-[#9DA0AA] space-x-3 font-mono">
          <a href="/privacy-policy" className="hover:text-[#18191D] dark:hover:text-[#F4F4F6] underline">
            Privacidade & LGPD
          </a>
          <span>•</span>
          <a href="/terms-of-use" className="hover:text-[#18191D] dark:hover:text-[#F4F4F6] underline">
            Termos de Uso
          </a>
        </div>
      </div>
    </div>
  );
}
