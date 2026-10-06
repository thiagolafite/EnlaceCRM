import React, { useState } from 'react';
import {
  Zap,
  Play,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Send,
  Eye,
  Activity,
  Terminal,
} from 'lucide-react';
import { api } from '../services/api';
import { ChannelBadge, EventTypeBadge } from '../components/Badge';
import { ErrorBanner } from '../components/ErrorBanner';

interface AutomationProps {
  defaultTab?: 'run' | 'simulate';
}

export function Automation({ defaultTab = 'simulate' }: AutomationProps) {
  const [runningReal, setRunningReal] = useState(false);
  const [runningSim, setRunningSim] = useState(false);
  const [simDate, setSimDate] = useState(new Date().toISOString().split('T')[0]);

  const [realReport, setRealReport] = useState<any | null>(null);
  const [simReport, setSimReport] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'run' | 'simulate'>(defaultTab);

  // Estados de Erro Direcionais
  const [error, setError] = useState<{ message: string; solution?: string } | null>(null);

  React.useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const handleRunToday = async () => {
    try {
      setRunningReal(true);
      setError(null);
      setRealReport(null);
      const res = await api.runTodayAutomation();
      setRealReport(res.report);
    } catch (err: any) {
      setError({
        message: err.message || 'Erro ao executar o motor de automação diário.',
        solution: err.solution || 'Verifique se há templates ativos e se os dados de configuração da empresa estão preenchidos.',
      });
    } finally {
      setRunningReal(false);
    }
  };

  const handleSimulate = async () => {
    try {
      setRunningSim(true);
      setError(null);
      setSimReport(null);
      const res = await api.simulateAutomation(simDate);
      setSimReport(res.report);
    } catch (err: any) {
      setError({
        message: err.message || 'Erro ao rodar simulação de automação para a data selecionada.',
        solution: err.solution || 'Verifique o formato da data selecionada e tente novamente.',
      });
    } finally {
      setRunningSim(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <ErrorBanner
        error={error?.message || null}
        solution={error?.solution}
        onClose={() => setError(null)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-[#E7E7E4] dark:border-[#26262B]">
        <div>
          <h2 className="text-lg font-semibold text-[#18181B] dark:text-[#EDEDEA]">
            Motor de Automação & Simulação
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Execução do job diário de felicitações e simulador de datas (dry-run)
          </p>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex bg-[#F4F4F2] dark:bg-[#1C1C20] p-0.5 rounded-lg w-fit text-xs font-medium">
        <button
          onClick={() => setActiveTab('simulate')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md transition-colors ${
            activeTab === 'simulate'
              ? 'bg-white dark:bg-[#141416] text-[#18181B] dark:text-[#EDEDEA] shadow-subtle'
              : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Simulador de Datas (Dry-Run)</span>
        </button>

        <button
          onClick={() => setActiveTab('run')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md transition-colors ${
            activeTab === 'run'
              ? 'bg-white dark:bg-[#141416] text-[#18181B] dark:text-[#EDEDEA] shadow-subtle'
              : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Disparo Imediato de Hoje</span>
        </button>
      </div>

      {/* TAB 1: SIMULADOR (DRY-RUN) */}
      {activeTab === 'simulate' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white dark:bg-[#141416] border border-[#E7E7E4] dark:border-[#26262B] shadow-subtle flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
                Selecione a Data para Simulação:
              </label>
              <div className="flex flex-wrap items-center gap-2.5">
                <input
                  type="date"
                  value={simDate}
                  onChange={(e) => setSimDate(e.target.value)}
                  className="bg-[#FBFBFA] dark:bg-[#1A1A1E] border border-[#E7E7E4] dark:border-[#26262B] focus:border-stone-900 dark:focus:border-stone-100 rounded-lg py-2 px-3 text-xs text-stone-900 dark:text-stone-100 outline-none"
                />
                <span className="text-xs text-stone-400">
                  (Simula aniversários e feriados sem disparar mensagens)
                </span>
              </div>
            </div>

            <button
              onClick={handleSimulate}
              disabled={runningSim}
              className="btn-primary"
            >
              <Eye className={`w-3.5 h-3.5 ${runningSim ? 'animate-spin' : ''}`} />
              <span>{runningSim ? 'Simulando...' : 'Rodar Simulação'}</span>
            </button>
          </div>

          {simReport && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-white/80 dark:bg-obsidian-900/75 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-luxury">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">Clientes Analisados</span>
                  <span className="text-2xl font-black font-outfit text-slate-900 dark:text-white mt-1 block">{simReport.clientsScanned}</span>
                </div>
                <div className="p-5 rounded-3xl bg-white/80 dark:bg-obsidian-900/75 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-luxury">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">Aniversários Encontrados</span>
                  <span className="text-2xl font-black font-outfit text-indigo-600 dark:text-indigo-400 mt-1 block">
                    {simReport.clientBirthdaysFound + simReport.familyBirthdaysFound}
                  </span>
                </div>
                <div className="p-5 rounded-3xl bg-white/80 dark:bg-obsidian-900/75 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-luxury">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">Mensagens Geradas</span>
                  <span className="text-2xl font-black font-outfit text-emerald-600 dark:text-emerald-400 mt-1 block">{simReport.alertsGenerated}</span>
                </div>
                <div className="p-5 rounded-3xl bg-white/80 dark:bg-obsidian-900/75 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-luxury">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">Ignorados por LGPD</span>
                  <span className="text-2xl font-black font-outfit text-amber-600 dark:text-amber-400 mt-1 block">{simReport.lgpdSkipped}</span>
                </div>
              </div>

              {/* Simulation Result List */}
              <div className="bg-white/80 dark:bg-obsidian-900/75 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-6 shadow-luxury">
                <h3 className="text-base font-black font-outfit text-slate-900 dark:text-white mb-4">
                  Resultado Detalhado da Simulação ({simReport.details.length} ações mapeadas)
                </h3>

                {simReport.details.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    Nenhum cliente, familiar ou feriado fixo identificado para a data informada.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {simReport.details.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-50/80 dark:bg-obsidian-950/80 border border-slate-200/60 dark:border-white/[0.04] space-y-2"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">{item.clientName}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">({item.targetName})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <EventTypeBadge type={item.eventType} />
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-white dark:bg-obsidian-900 text-xs text-slate-800 dark:text-slate-200 font-mono whitespace-pre-line border border-slate-200/60 dark:border-white/[0.04]">
                          {item.renderedMessage}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DISPARO IMEDIATO DE HOJE */}
      {activeTab === 'run' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-obsidian-900/75 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-luxury flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1 max-w-xl">
              <h3 className="text-lg font-black font-outfit text-slate-900 dark:text-white">
                Executar Motor de Felicitações para a Data Atual
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Esta ação varre todos os clientes ativos, calcula aniversários do dia e datas comemorativas, gera os alertas e notifica seu WhatsApp via CallMeBot.
              </p>
            </div>

            <button
              onClick={handleRunToday}
              disabled={runningReal}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-black text-xs shadow-glow-emerald transition-all disabled:opacity-50 shrink-0"
            >
              <Zap className={`w-4 h-4 ${runningReal ? 'animate-spin' : ''}`} />
              <span>{runningReal ? 'Processando...' : 'Iniciar Motor de Hoje'}</span>
            </button>
          </div>

          {realReport && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-white/80 dark:bg-obsidian-900/75 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-luxury">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">Clientes Analisados</span>
                  <span className="text-2xl font-black font-outfit text-slate-900 dark:text-white mt-1 block">{realReport.clientsScanned}</span>
                </div>
                <div className="p-5 rounded-3xl bg-white/80 dark:bg-obsidian-900/75 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-luxury">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">Alertas Gerados</span>
                  <span className="text-2xl font-black font-outfit text-emerald-600 dark:text-emerald-400 mt-1 block">{realReport.alertsGenerated}</span>
                </div>
                <div className="p-5 rounded-3xl bg-white/80 dark:bg-obsidian-900/75 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-luxury">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">Já Existentes (Ignorados)</span>
                  <span className="text-2xl font-black font-outfit text-slate-600 dark:text-slate-400 mt-1 block">{realReport.alreadyGeneratedSkipped}</span>
                </div>
                <div className="p-5 rounded-3xl bg-white/80 dark:bg-obsidian-900/75 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-luxury">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block">Status WhatsApp</span>
                  <span className="text-2xl font-black font-outfit text-indigo-600 dark:text-indigo-400 mt-1 block">{realReport.ownerNotificationStatus}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
