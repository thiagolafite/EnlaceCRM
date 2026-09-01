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

  React.useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const handleRunToday = async () => {
    try {
      setRunningReal(true);
      setRealReport(null);
      const res = await api.runTodayAutomation();
      setRealReport(res.report);
    } catch (err: any) {
      alert(err.message || 'Erro ao executar automação');
    } finally {
      setRunningReal(false);
    }
  };

  const handleSimulate = async () => {
    try {
      setRunningSim(true);
      setSimReport(null);
      const res = await api.simulateAutomation(simDate);
      setSimReport(res.report);
    } catch (err: any) {
      alert(err.message || 'Erro ao simular data');
    } finally {
      setRunningSim(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black font-outfit text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </span>
            <span>Motor de Automação & Simulação</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Controle a execução do job diário de felicitações e teste o comportamento do sistema para qualquer data com o simulador (dry-run).
          </p>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex bg-slate-100/80 dark:bg-obsidian-950/80 p-1.5 rounded-2xl border border-slate-200/60 dark:border-white/[0.04] w-fit">
        <button
          onClick={() => setActiveTab('simulate')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs transition-all ${
            activeTab === 'simulate'
              ? 'bg-white dark:bg-obsidian-850 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Simulador de Datas (Dry-Run)</span>
        </button>

        <button
          onClick={() => setActiveTab('run')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs transition-all ${
            activeTab === 'run'
              ? 'bg-white dark:bg-obsidian-850 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Disparo Imediato de Hoje</span>
        </button>
      </div>

      {/* TAB 1: SIMULADOR (DRY-RUN) */}
      {activeTab === 'simulate' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-obsidian-900/75 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-luxury flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Selecione a Data para Simulação:
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="date"
                  value={simDate}
                  onChange={(e) => setSimDate(e.target.value)}
                  className="bg-slate-50/80 dark:bg-obsidian-950/80 border border-slate-200/80 dark:border-white/[0.08] focus:border-indigo-500 rounded-2xl py-2.5 px-4 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none"
                />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  (Simula aniversários e feriados dessa data sem enviar nem salvar no histórico)
                </span>
              </div>
            </div>

            <button
              onClick={handleSimulate}
              disabled={runningSim}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs shadow-glow-indigo transition-all disabled:opacity-50 active:scale-95"
            >
              <Eye className={`w-4 h-4 ${runningSim ? 'animate-spin' : ''}`} />
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
