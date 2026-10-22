import React, { useState, useEffect } from 'react';
import { Lock, CheckCircle2, ArrowRight, Eye, EyeOff, KeyRound, AlertTriangle, Sun, Moon } from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { ErrorBanner } from '../components/ErrorBanner';

interface ResetPasswordProps {
  onComplete?: () => void;
}

export function ResetPassword({ onComplete }: ResetPasswordProps) {
  const { theme, toggleTheme } = useTheme();

  // Extrai token da URL (?token=... ou ?resetToken=...)
  const [token, setToken] = useState<string>('');
  const [verifyingToken, setVerifyingToken] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');

  // Formulário de nova senha
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estados de feedback
  const [loading, setLoading] = useState(false);
  const [errorState, setErrorState] = useState<{ message: string; solution?: string } | null>(null);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token') || params.get('resetToken');

    if (!urlToken) {
      setVerifyingToken(false);
      setTokenError('Nenhum código ou link de recuperação de senha foi informado na URL.');
      return;
    }

    setToken(urlToken);

    // Valida o token com o backend
    api.verifyResetToken(urlToken)
      .then((res) => {
        setUserEmail(res.email);
        setUserName(res.name);
      })
      .catch((err) => {
        setTokenError(err.message || 'O link de recuperação expirou ou é inválido. Por favor, solicite um novo link.');
      })
      .finally(() => {
        setVerifyingToken(false);
      });
  }, []);

  // Redirecionamento automático após sucesso
  useEffect(() => {
    if (!success) return;
    if (countdown <= 0) {
      handleGoToLogin();
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [success, countdown]);

  const handleGoToLogin = () => {
    if (onComplete) {
      onComplete();
    } else {
      window.location.href = '/';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorState(null);

    if (newPassword.length < 10) {
      setErrorState({
        message: 'A nova senha deve ter no mínimo 10 caracteres.',
        solution: 'Crie uma senha mais longa contendo uma combinação de letras, números e símbolos.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorState({
        message: 'As senhas digitadas não coincidem.',
        solution: 'Verifique a digitação da confirmação de senha.',
      });
      return;
    }

    try {
      setLoading(true);
      await api.resetPassword({ token, password: newPassword });
      setSuccess(true);
    } catch (err: any) {
      setErrorState({
        message: err.message || 'Erro ao redefinir a senha',
        solution: err.solution || 'Verifique se o link não expirou ou tente solicitar um novo.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Requisitos de validação em tempo real
  const hasMinLength = newPassword.length >= 10;
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F4F4F6] dark:bg-[#18191D] text-[#18191D] dark:text-[#F4F4F6] relative transition-colors duration-150 font-sans">
      {/* Botão de Tema no canto superior direito */}
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
            REDEFINIÇÃO DE SENHA
          </p>
        </div>

        {/* Card Principal */}
        <div className="card-warm p-6 sm:p-8 space-y-5 shadow-panel">
          {verifyingToken ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#18191D] dark:border-[#F4F4F6] border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-[#686971] dark:text-[#9DA0AA] font-mono">
                Validando link de recuperação...
              </p>
            </div>
          ) : tokenError ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#E54833]/10 text-[#E54833] flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-[#18191D] dark:text-[#F4F4F6]">
                  Link Expirado ou Inválido
                </h2>
                <p className="text-xs text-[#686971] dark:text-[#9DA0AA] leading-relaxed">
                  {tokenError}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleGoToLogin}
                  className="btn-primary w-full py-2.5"
                >
                  <span>Voltar para o Login</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : success ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-[#18191D] dark:text-[#F4F4F6]">
                  Senha Redefinida!
                </h2>
                <p className="text-xs text-[#686971] dark:text-[#9DA0AA] leading-relaxed">
                  Sua senha foi atualizada com sucesso. Você já pode acessar sua conta com a nova credencial.
                </p>
                <p className="text-[11px] font-mono text-[#686971] dark:text-[#9DA0AA] pt-1">
                  Redirecionando em {countdown} segundos...
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoToLogin}
                className="btn-primary w-full py-2.5 mt-2"
              >
                <span>Acessar o Sistema</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#18191D] dark:text-[#F4F4F6]">
                  <KeyRound className="w-4 h-4 text-[#E54833]" />
                  <span>Criar Nova Senha</span>
                </div>
                {userEmail && (
                  <p className="text-[11px] text-[#686971] dark:text-[#9DA0AA]">
                    Olá{userName ? `, ${userName}` : ''}! Redefinindo senha para <strong className="font-mono text-[#18191D] dark:text-[#F4F4F6]">{userEmail}</strong>
                  </p>
                )}
              </div>

              {/* Banner de Erro Direcional */}
              {errorState && (
                <ErrorBanner
                  error={errorState.message}
                  solution={errorState.solution}
                  onClose={() => setErrorState(null)}
                />
              )}

              {/* Campo Nova Senha */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#686971] dark:text-[#9DA0AA]">
                  Nova Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#686971] dark:text-[#9DA0AA] pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={10}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#EEEEF1] dark:bg-[#24252B] border border-[#D7D7DD] dark:border-[#33343A] focus:border-[#18191D] dark:focus:border-[#F4F4F6] rounded-xl text-xs text-[#18191D] dark:text-[#F4F4F6] outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#686971] hover:text-[#18191D] dark:hover:text-[#F4F4F6]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Campo Confirmar Senha */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#686971] dark:text-[#9DA0AA]">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#686971] dark:text-[#9DA0AA] pointer-events-none" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={10}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#EEEEF1] dark:bg-[#24252B] border border-[#D7D7DD] dark:border-[#33343A] focus:border-[#18191D] dark:focus:border-[#F4F4F6] rounded-xl text-xs text-[#18191D] dark:text-[#F4F4F6] outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#686971] hover:text-[#18191D] dark:hover:text-[#F4F4F6]"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Checklist de Validação Visual */}
              <div className="p-3 bg-[#EEEEF1] dark:bg-[#24252B] rounded-xl border border-[#D7D7DD] dark:border-[#33343A] space-y-1.5 text-[11px] font-mono">
                <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-[#686971] dark:text-[#9DA0AA]'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${hasMinLength ? 'bg-emerald-500' : 'bg-[#D7D7DD] dark:bg-[#55565C]'}`} />
                  <span>Mínimo de 10 caracteres</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-[#686971] dark:text-[#9DA0AA]'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${passwordsMatch ? 'bg-emerald-500' : 'bg-[#D7D7DD] dark:bg-[#55565C]'}`} />
                  <span>Senhas coincidem</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !hasMinLength || !passwordsMatch}
                className="btn-primary w-full py-2.5 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{loading ? 'Redefinindo senha...' : 'Salvar Nova Senha'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleGoToLogin}
                  className="text-xs text-[#686971] dark:text-[#9DA0AA] hover:text-[#18191D] dark:hover:text-[#F4F4F6] underline"
                >
                  Voltar para o Login
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-[11px] text-[#686971] dark:text-[#9DA0AA] font-mono">
          Enlace CRM • Segurança & Conformidade LGPD
        </div>
      </div>
    </div>
  );
}
