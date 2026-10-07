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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAF6F0] dark:bg-[#120F0D] text-[#1E1611] dark:text-[#F5EFE8] relative transition-colors duration-150 font-sans">
      {/* Theme Toggle Button top right */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
          className="p-2.5 rounded-full border border-[#EDE5DC] dark:border-[#2A211D] bg-white dark:bg-[#1A1513] text-[#756557] dark:text-[#B5A599] hover:text-[#1E1611] dark:hover:text-[#F5EFE8] hover:bg-[#FAF6F0] dark:hover:bg-[#201814] transition-colors shadow-subtle"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#756557]" />}
        </button>
      </div>

      <div className="w-full max-w-sm">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#C85A32] text-white font-serif font-bold text-2xl mb-3 shadow-panel">
            V
          </div>
          <h1 className="text-2xl font-serif font-normal tracking-tight text-[#1E1611] dark:text-[#F5EFE8]">
            Vínculo
          </h1>
          <p className="text-[10px] font-mono tracking-widest text-[#A09388] uppercase mt-1">
            CRM DE RELACIONAMENTO
          </p>
        </div>

        {/* Card */}
        <div className="card-warm p-6 sm:p-8 space-y-5 shadow-panel">
          {/* Tabs Mode */}
          <div className="flex p-1 bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] rounded-full text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorState(null);
                setSuccessMessage('');
              }}
              className={`flex-1 py-1.5 rounded-full text-xs font-medium transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-[#1E1512] text-[#1E1611] dark:text-[#F5EFE8] shadow-subtle font-semibold'
                  : 'text-[#756557] hover:text-[#1E1611] dark:text-[#B5A599]'
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
                  ? 'bg-white dark:bg-[#1E1512] text-[#1E1611] dark:text-[#F5EFE8] shadow-subtle font-semibold'
                  : 'text-[#756557] hover:text-[#1E1611] dark:text-[#B5A599]'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {/* Success / Pending Alert */}
          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-[#FDF0E6] dark:bg-[#2A1C16] border border-[#F5D2BF] dark:border-[#4C2D20] text-[#B84E29] dark:text-[#F39C74] text-xs leading-relaxed space-y-1">
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
                <label className="block text-xs font-medium text-[#756557] dark:text-[#B5A599]">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A09388] pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] dark:focus:border-[#F39C74] rounded-xl text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#756557] dark:text-[#B5A599]">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A09388] pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] dark:focus:border-[#F39C74] rounded-xl text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-full bg-[#C85A32] hover:bg-[#B34A24] text-white font-semibold text-xs shadow-subtle transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                <span>{loading ? 'Acessando...' : 'Acessar Sistema'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#756557] dark:text-[#B5A599]">
                  Nome Completo
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A09388] pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full pl-10 pr-3.5 py-2 bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] dark:focus:border-[#F39C74] rounded-xl text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#756557] dark:text-[#B5A599]">
                  E-mail Corporativo
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A09388] pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="seu@empresa.com"
                    className="w-full pl-10 pr-3.5 py-2 bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] dark:focus:border-[#F39C74] rounded-xl text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#756557] dark:text-[#B5A599]">
                  Senha (mínimo 10 caracteres)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A09388] pointer-events-none" />
                  <input
                    type="password"
                    required
                    minLength={10}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="w-full pl-10 pr-3.5 py-2 bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] dark:focus:border-[#F39C74] rounded-xl text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#756557] dark:text-[#B5A599]">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A09388] pointer-events-none" />
                  <input
                    type="password"
                    required
                    minLength={10}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="w-full pl-10 pr-3.5 py-2 bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] dark:focus:border-[#F39C74] rounded-xl text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none transition-colors"
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
                  className="mt-0.5 rounded border-[#EDE5DC] dark:border-[#2A211D] text-[#C85A32] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="regTerms" className="text-[11px] text-[#756557] dark:text-[#B5A599] leading-tight select-none">
                  Li e concordo com os{' '}
                  <a href="/terms-of-use" target="_blank" rel="noopener noreferrer" className="text-[#1E1611] dark:text-[#F5EFE8] font-medium underline hover:text-[#C85A32]">
                    Termos de Uso
                  </a>{' '}
                  e a{' '}
                  <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#1E1611] dark:text-[#F5EFE8] font-medium underline hover:text-[#C85A32]">
                    Política de Privacidade (LGPD)
                  </a>.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-full bg-[#C85A32] hover:bg-[#B34A24] text-white font-semibold text-xs shadow-subtle transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 mt-3"
              >
                <span>{loading ? 'Cadastrando...' : 'Criar Conta de Acesso'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

        {/* Footer Legal Links */}
        <div className="mt-6 text-center text-[11px] text-[#A09388] space-x-3">
          <a href="/privacy-policy" className="hover:text-[#1E1611] dark:hover:text-[#F5EFE8] underline">
            Privacidade & LGPD
          </a>
          <span>•</span>
          <a href="/terms-of-use" className="hover:text-[#1E1611] dark:hover:text-[#F5EFE8] underline">
            Termos de Uso
          </a>
        </div>
      </div>
    </div>
  );
}
