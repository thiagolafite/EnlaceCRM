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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F1F3F5] dark:bg-[#111418] text-[#1A1E24] dark:text-[#F1F3F5] relative transition-colors duration-150 font-sans">
      {/* Theme Toggle Button top right */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
          className="p-2.5 rounded-full border border-[#C85A32]/30 bg-[#F8F9FA] dark:bg-[#181C21] text-[#495057] dark:text-[#ADB5BD] hover:text-[#1A1E24] dark:hover:text-[#F1F3F5] hover:border-[#C85A32] transition-colors shadow-subtle"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#495057]" />}
        </button>
      </div>

      <div className="w-full max-w-sm">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#1C222A] border-2 border-[#C85A32] text-[#C85A32] font-serif font-bold text-2xl mb-3 shadow-panel">
            V
          </div>
          <h1 className="text-2xl font-serif font-normal tracking-tight text-[#1A1E24] dark:text-[#F1F3F5]">
            Vínculo
          </h1>
          <p className="text-[10px] font-mono tracking-widest text-[#8E99A4] uppercase mt-1">
            CRM DE RELACIONAMENTO
          </p>
        </div>

        {/* Card */}
        <div className="card-warm p-6 sm:p-8 space-y-5 shadow-2xl border-2 border-[#C85A32]/40">
          {/* Tabs Mode */}
          <div className="flex p-1 bg-[#E9ECEF] dark:bg-[#14181D] border border-[#C85A32]/25 rounded-full text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorState(null);
                setSuccessMessage('');
              }}
              className={`flex-1 py-1.5 rounded-full text-xs font-medium transition-all ${
                mode === 'login'
                  ? 'bg-[#FFFFFF] dark:bg-[#181C21] text-[#C85A32] dark:text-[#F39C74] border border-[#C85A32]/40 shadow-xs font-semibold'
                  : 'text-[#6C757D] hover:text-[#1A1E24] dark:text-[#ADB5BD]'
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
              className={`flex-1 py-1.5 rounded-full text-xs font-medium transition-all ${
                mode === 'register'
                  ? 'bg-[#FFFFFF] dark:bg-[#181C21] text-[#C85A32] dark:text-[#F39C74] border border-[#C85A32]/40 shadow-xs font-semibold'
                  : 'text-[#6C757D] hover:text-[#1A1E24] dark:text-[#ADB5BD]'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {/* Success / Pending Alert */}
          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-[#F8F9FA] dark:bg-[#181C21] border-2 border-[#C85A32] text-[#C85A32] dark:text-[#E07A5F] text-xs leading-relaxed space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#C85A32] shrink-0" />
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
                <label className="block text-xs font-medium text-[#495057] dark:text-[#ADB5BD]">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C85A32] pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#FFFFFF] dark:bg-[#14181D] border border-[#C85A32]/35 dark:border-[#C85A32]/40 focus:border-[#C85A32] dark:focus:border-[#E07A5F] rounded-xl text-xs text-[#1A1E24] dark:text-[#F1F3F5] outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#495057] dark:text-[#ADB5BD]">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C85A32] pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#FFFFFF] dark:bg-[#14181D] border border-[#C85A32]/35 dark:border-[#C85A32]/40 focus:border-[#C85A32] dark:focus:border-[#E07A5F] rounded-xl text-xs text-[#1A1E24] dark:text-[#F1F3F5] outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#C85A32] hover:bg-[#B34A24] border border-[#D97757] text-white font-semibold text-xs shadow-subtle transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                <span>{loading ? 'Acessando...' : 'Acessar Sistema'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#495057] dark:text-[#ADB5BD]">
                  Nome Completo
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C85A32] pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#FFFFFF] dark:bg-[#14181D] border border-[#C85A32]/35 dark:border-[#C85A32]/40 focus:border-[#C85A32] dark:focus:border-[#E07A5F] rounded-xl text-xs text-[#1A1E24] dark:text-[#F1F3F5] outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#495057] dark:text-[#ADB5BD]">
                  E-mail Corporativo
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C85A32] pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="seu@empresa.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#FFFFFF] dark:bg-[#14181D] border border-[#C85A32]/35 dark:border-[#C85A32]/40 focus:border-[#C85A32] dark:focus:border-[#E07A5F] rounded-xl text-xs text-[#1A1E24] dark:text-[#F1F3F5] outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#495057] dark:text-[#ADB5BD]">
                  Senha (mínimo 10 caracteres)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C85A32] pointer-events-none" />
                  <input
                    type="password"
                    required
                    minLength={10}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#FFFFFF] dark:bg-[#14181D] border border-[#C85A32]/35 dark:border-[#C85A32]/40 focus:border-[#C85A32] dark:focus:border-[#E07A5F] rounded-xl text-xs text-[#1A1E24] dark:text-[#F1F3F5] outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#495057] dark:text-[#ADB5BD]">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C85A32] pointer-events-none" />
                  <input
                    type="password"
                    required
                    minLength={10}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#FFFFFF] dark:bg-[#14181D] border border-[#C85A32]/35 dark:border-[#C85A32]/40 focus:border-[#C85A32] dark:focus:border-[#E07A5F] rounded-xl text-xs text-[#1A1E24] dark:text-[#F1F3F5] outline-none transition-colors"
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
                  className="mt-0.5 rounded border-[#C85A32]/35 text-[#C85A32] focus:ring-[#C85A32] cursor-pointer"
                />
                <label htmlFor="regTerms" className="text-[11px] text-[#495057] dark:text-[#ADB5BD] leading-tight select-none">
                  Li e concordo com os{' '}
                  <a href="/terms-of-use" target="_blank" rel="noopener noreferrer" className="text-[#C85A32] dark:text-[#F39C74] font-medium underline hover:text-[#B34A24]">
                    Termos de Uso
                  </a>{' '}
                  e a{' '}
                  <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#C85A32] dark:text-[#F39C74] font-medium underline hover:text-[#B34A24]">
                    Política de Privacidade (LGPD)
                  </a>.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#C85A32] hover:bg-[#B34A24] border border-[#D97757] text-white font-semibold text-xs shadow-subtle transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 mt-3"
              >
                <span>{loading ? 'Cadastrando...' : 'Criar Conta de Acesso'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

        {/* Footer Legal Links */}
        <div className="mt-6 text-center text-[11px] text-[#6C757D] dark:text-[#ADB5BD] space-x-3">
          <a href="/privacy-policy" className="hover:text-[#C85A32] dark:hover:text-[#F39C74] underline">
            Privacidade & LGPD
          </a>
          <span>•</span>
          <a href="/terms-of-use" className="hover:text-[#C85A32] dark:hover:text-[#F39C74] underline">
            Termos de Uso
          </a>
        </div>
      </div>
    </div>
  );
}
