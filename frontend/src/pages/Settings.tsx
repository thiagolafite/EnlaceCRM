import React, { useEffect, useState } from 'react';
import {
  Building2,
  Clock,
  Save,
  CheckCircle2,
  MessageCircle,
  Sparkles,
  Send,
  HelpCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { CompanySettings } from '../types';
import { ErrorBanner } from '../components/ErrorBanner';

export function Settings() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorState, setErrorState] = useState<{ message: string; solution?: string } | null>(null);

  // Testing CallMeBot
  const [testingBot, setTestingBot] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [form, setForm] = useState({
    companyName: '',
    tradeName: '',
    document: '',
    contactEmail: '',
    contactPhone: '',

    ownerWhatsappPhone: '',
    callmebotApiKey: '',
    callmebotEnabled: true,
    callmebotSimulateMode: false,

    schedulerHour: 6,
    schedulerMinute: 0,
    schedulerEnabled: true,
  });

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getSettings();
      setSettings(data);
      setForm({
        companyName: data.companyName || '',
        tradeName: data.tradeName || '',
        document: data.document || '',
        contactEmail: data.contactEmail || '',
        contactPhone: data.contactPhone || '',

        ownerWhatsappPhone: data.ownerWhatsappPhone || '',
        callmebotApiKey: data.callmebotApiKey || '',
        callmebotEnabled: data.callmebotEnabled !== false,
        callmebotSimulateMode: data.callmebotSimulateMode === true,

        schedulerHour: data.schedulerHour || 6,
        schedulerMinute: data.schedulerMinute || 0,
        schedulerEnabled: data.schedulerEnabled !== false,
      });
    } catch (err) {
      console.error('Erro ao carregar configurações:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSavedSuccess(false);
      setErrorState(null);
      setTestResult(null);
      await api.updateSettings({
        ...form,
        schedulerHour: Number(form.schedulerHour),
        schedulerMinute: Number(form.schedulerMinute),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      setErrorState({
        message: err.message || 'Erro ao salvar configurações',
        solution: err.solution || 'Verifique se os dados informados estão corretos e tente novamente.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestCallMeBot = async () => {
    if (!form.ownerWhatsappPhone) {
      setTestResult({
        success: false,
        message: 'Informe seu número de WhatsApp com DDD e DDI (ex: +5511999999999).',
      });
      return;
    }
    if (!form.callmebotApiKey && !settings?.hasCallmebotApiKey) {
      setTestResult({
        success: false,
        message: 'Informe sua API Key do CallMeBot para realizar o teste de envio.',
      });
      return;
    }

    try {
      setTestingBot(true);
      setTestResult(null);
      const res = await api.testCallMeBot(form.ownerWhatsappPhone, form.callmebotApiKey);
      if (res.success) {
        setTestResult({
          success: true,
          message: 'Mensagem de teste enviada com sucesso! Verifique seu aplicativo do WhatsApp.',
        });
      } else {
        setTestResult({
          success: false,
          message: res.error || 'Não foi possível enviar a mensagem de teste. Verifique sua chave do CallMeBot.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Erro ao conectar à API do CallMeBot.',
      });
    } finally {
      setTestingBot(false);
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-[#A09388] text-xs">Carregando configurações...</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-5xl animate-in fade-in duration-300">
      {/* Header Editorial & Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b hairline-border">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#6C757D] dark:text-[#ADB5BD] mb-0.5">PREFERÊNCIAS & CONEXÕES</p>
          <h1 className="text-2xl lg:text-3xl font-serif text-[#1A1E24] dark:text-[#F1F3F5] font-normal tracking-tight">
            Configurações do Sistema
          </h1>
          <p className="text-xs text-[#6C757D] dark:text-[#ADB5BD] mt-1">
            Configuração de notificações via WhatsApp, dados da empresa e agendador diário
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-terracotta"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
        </button>
      </div>

      {/* Alerta de Erro Direcional */}
      {errorState && (
        <ErrorBanner
          error={errorState.message}
          solution={errorState.solution}
          onClose={() => setErrorState(null)}
        />
      )}

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Configurações salvas com sucesso.</span>
        </div>
      )}

      {/* 1. SEÇÃO PRINCIPAL: NOTIFICAÇÃO VIA WHATSAPP (CALLMEBOT) */}
      <div className="card-warm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b hairline-border pb-3 gap-2">
          <div className="flex items-center gap-2.5">
            <MessageCircle className="w-5 h-5 text-[#C85A32]" />
            <div>
              <h3 className="text-base font-serif text-[#1A1E24] dark:text-[#F1F3F5]">
                Notificações no WhatsApp (CallMeBot)
              </h3>
              <p className="text-xs text-[#6C757D] dark:text-[#ADB5BD]">
                Receba todos os dias no seu WhatsApp pessoal o resumo dos aniversariantes com mensagens prontas para enviar.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={form.callmebotSimulateMode}
              onChange={(e) => setForm({ ...form, callmebotSimulateMode: e.target.checked })}
              className="w-4 h-4 rounded text-[#C85A32] bg-[#FFFFFF] dark:bg-[#14181D] border-[#C85A32]/35"
            />
            <span className={form.callmebotSimulateMode ? 'text-[#C85A32] font-semibold' : 'text-[#6C757D] dark:text-[#ADB5BD]'}>
              {form.callmebotSimulateMode ? 'Modo Simulação (Console)' : 'Modo Disparo Real WhatsApp'}
            </span>
          </label>
        </div>

        {/* Inputs do Dono */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#495057] dark:text-[#ADB5BD] mb-1">
              Seu Número de WhatsApp (com DDD e DDI 55) *
            </label>
            <input
              type="text"
              required
              value={form.ownerWhatsappPhone}
              onChange={(e) => setForm({ ...form, ownerWhatsappPhone: e.target.value })}
              placeholder="Ex: +5511999999999"
              className="w-full bg-[#FFFFFF] dark:bg-[#14181D] border border-[#C85A32]/35 dark:border-[#C85A32]/40 focus:border-[#C85A32] dark:focus:border-[#E07A5F] rounded-xl py-2 px-3 text-xs text-[#1A1E24] dark:text-[#F1F3F5] outline-none font-mono"
            />
            <p className="text-[11px] text-[#6C757D] dark:text-[#ADB5BD] mt-1">
              Número onde você deseja receber o resumo matinal de aniversários.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#495057] dark:text-[#ADB5BD] mb-1">
              Sua API Key do CallMeBot *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.callmebotApiKey}
                onChange={(e) => setForm({ ...form, callmebotApiKey: e.target.value })}
                placeholder="Ex: 123456"
                className="flex-1 bg-[#FFFFFF] dark:bg-[#14181D] border border-[#C85A32]/35 dark:border-[#C85A32]/40 focus:border-[#C85A32] dark:focus:border-[#E07A5F] rounded-xl py-2 px-3 text-xs text-[#1A1E24] dark:text-[#F1F3F5] outline-none font-mono"
              />
              <button
                type="button"
                onClick={handleTestCallMeBot}
                disabled={testingBot}
                className="btn-terracotta shrink-0"
              >
                <Send className={`w-3.5 h-3.5 ${testingBot ? 'animate-spin' : ''}`} />
                {testingBot ? 'Enviando...' : 'Testar Envio'}
              </button>
            </div>
            <p className="text-[11px] text-[#6C757D] dark:text-[#ADB5BD] mt-1">
              Chave gratuita gerada no WhatsApp pelo bot do CallMeBot.
            </p>
          </div>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2 animate-in fade-in ${
              testResult.success
                ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <HelpCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Tutorial Passo a Passo CallMeBot */}
        <div className="p-5 rounded-3xl bg-[#FFFFFF] dark:bg-[#14181D] border-2 border-[#C85A32]/40 space-y-3">
          <div className="flex items-center gap-2 text-[#C85A32] dark:text-[#F39C74] font-semibold text-xs uppercase tracking-wider font-mono">
            <Sparkles className="w-4 h-4" /> Como obter sua API Key gratuita do CallMeBot em 30 segundos:
          </div>

          <ol className="text-xs text-[#495057] dark:text-[#ADB5BD] space-y-2 list-decimal list-inside leading-relaxed">
            <li>
              Adicione o contato do CallMeBot no seu WhatsApp:{' '}
              <strong className="text-[#1A1E24] dark:text-[#F1F3F5] font-mono">+34 644 44 49 64</strong> (ou{' '}
              <strong className="text-[#1A1E24] dark:text-[#F1F3F5] font-mono">+34 644 59 71 62</strong>).
            </li>
            <li>
              Envie a seguinte mensagem exata para ele:{' '}
              <span className="font-mono bg-[#F8F9FA] dark:bg-[#181C21] px-2 py-0.5 rounded-md border border-[#C85A32]/40 font-semibold text-[#C85A32] dark:text-[#F39C74] select-all">
                I allow callmebot to send me messages
              </span>
            </li>
            <li>
              O bot responderá imediatamente com sua chave pessoal (ex:{' '}
              <code className="font-mono text-[#C85A32] dark:text-[#F39C74] font-bold">apikey: 123456</code>).
            </li>
            <li>
              Cole a chave numérica no campo acima e clique em <strong>"Testar Envio"</strong> para validar a conexão!
            </li>
          </ol>
        </div>
      </div>

      {/* 2. Horário do Scheduler Diário */}
      <div className="card-warm p-6 space-y-4">
        <div className="flex items-center gap-2.5 text-[#1A1E24] dark:text-[#F1F3F5] font-serif text-base border-b hairline-border pb-3">
          <Clock className="w-5 h-5 text-[#C85A32]" /> Agendador Automático Diário
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div>
            <label className="block text-xs font-medium text-[#495057] dark:text-[#ADB5BD] mb-1">Hora de Execução (0-23h)</label>
            <input
              type="number"
              min="0"
              max="23"
              value={form.schedulerHour}
              onChange={(e) => setForm({ ...form, schedulerHour: Number(e.target.value) })}
              className="w-full bg-[#FFFFFF] dark:bg-[#14181D] border border-[#C85A32]/35 dark:border-[#C85A32]/40 focus:border-[#C85A32] dark:focus:border-[#E07A5F] rounded-xl py-2 px-3 text-xs text-[#1A1E24] dark:text-[#F1F3F5] outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#495057] dark:text-[#ADB5BD] mb-1">Minuto (0-59m)</label>
            <input
              type="number"
              min="0"
              max="59"
              value={form.schedulerMinute}
              onChange={(e) => setForm({ ...form, schedulerMinute: Number(e.target.value) })}
              className="w-full bg-[#FFFFFF] dark:bg-[#14181D] border border-[#C85A32]/35 dark:border-[#C85A32]/40 focus:border-[#C85A32] dark:focus:border-[#E07A5F] rounded-xl py-2 px-3 text-xs text-[#1A1E24] dark:text-[#F1F3F5] outline-none font-mono"
            />
          </div>

          <div className="pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.schedulerEnabled}
                onChange={(e) => setForm({ ...form, schedulerEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-[#C85A32] bg-[#FFFFFF] dark:bg-[#14181D] border-[#C85A32]/35"
              />
              <span className="text-xs font-semibold text-[#1A1E24] dark:text-[#F1F3F5]">Ativar Agendamento Diário</span>
            </label>
          </div>
        </div>
      </div>

      {/* 3. Dados da Empresa Remetente */}
      <div className="card-warm p-6 space-y-4">
        <div className="flex items-center gap-2.5 text-[#1A1E24] dark:text-[#F1F3F5] font-serif text-base border-b hairline-border pb-3">
          <Building2 className="w-5 h-5 text-[#C85A32]" /> Dados da Empresa (para Variáveis de Template)
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#495057] dark:text-[#ADB5BD] mb-1">Nome Fantasia (Marca) - usado em {'{{nome_empresa}}'}</label>
            <input
              type="text"
              value={form.tradeName}
              onChange={(e) => setForm({ ...form, tradeName: e.target.value })}
              placeholder="Ex: Enlace CRM"
              className="w-full bg-[#FFFFFF] dark:bg-[#14181D] border border-[#C85A32]/35 dark:border-[#C85A32]/40 focus:border-[#C85A32] dark:focus:border-[#E07A5F] rounded-xl py-2 px-3 text-xs text-[#1A1E24] dark:text-[#F1F3F5] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#495057] dark:text-[#ADB5BD] mb-1">Razão Social</label>
            <input
              type="text"
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              placeholder="Ex: Enlace Tecnologia Ltda"
              className="w-full bg-[#FFFFFF] dark:bg-[#14181D] border border-[#C85A32]/35 dark:border-[#C85A32]/40 focus:border-[#C85A32] dark:focus:border-[#E07A5F] rounded-xl py-2 px-3 text-xs text-[#1A1E24] dark:text-[#F1F3F5] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#495057] dark:text-[#ADB5BD] mb-1">CNPJ</label>
            <input
              type="text"
              value={form.document}
              onChange={(e) => setForm({ ...form, document: e.target.value })}
              placeholder="00.000.000/0001-00"
              className="w-full bg-[#FFFFFF] dark:bg-[#14181D] border border-[#C85A32]/35 dark:border-[#C85A32]/40 focus:border-[#C85A32] dark:focus:border-[#E07A5F] rounded-xl py-2 px-3 text-xs text-[#1A1E24] dark:text-[#F1F3F5] outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#495057] dark:text-[#ADB5BD] mb-1">Telefone de Contato</label>
            <input
              type="text"
              value={form.contactPhone}
              onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
              placeholder="+5511988887777"
              className="w-full bg-[#FFFFFF] dark:bg-[#14181D] border border-[#C85A32]/35 dark:border-[#C85A32]/40 focus:border-[#C85A32] dark:focus:border-[#E07A5F] rounded-xl py-2 px-3 text-xs text-[#1A1E24] dark:text-[#F1F3F5] outline-none font-mono"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
