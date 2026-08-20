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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Motor de Automação & Simulação</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Controle a execução do job diário de felicitações e teste o comportamento do sistema para qualquer data com o simulador (dry-run).
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <button
          onClick={() => setActiveTab('simulate')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'simulate'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Simulador de Datas (Dry-Run)
        </button>

        <button
          onClick={() => setActiveTab('run')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'run'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" /> Disparo Imediato de Hoje
        </button>
      </div>

      {/* TAB 1: SIMULADOR (DRY-RUN) */}
      {activeTab === 'simulate' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-end justify-between gap-4 transition-colors">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Selecione a Data para Simulação:
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={simDate}
                  onChange={(e) => setSimDate(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 px-4 text-sm text-slate-900 dark:text-slate-100 outline-none"
                />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  (Simula aniversários e feriados dessa data sem enviar nem salvar no histórico)
                </span>
              </div>
            </div>

            <button
              onClick={handleSimulate}
              disabled={runningSim}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              <Eye className={`w-4 h-4 ${runningSim ? 'animate-spin' : ''}`} />
              {runningSim ? 'Simulando...' : 'Rodar Simulação'}
            </button>
          </div>

          {simReport && (
            <div className="space-y-6 animate-in fade-in">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-xs text-slate-500 block">Clientes Analisados</span>
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">{simReport.clientsScanned}</span>
                </div>
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-xs text-slate-500 block">Aniversários Encontrados</span>
                  <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {simReport.clientBirthdaysFound + simReport.familyBirthdaysFound}
                  </span>
                </div>
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-xs text-slate-500 block">Mensagens Geradas</span>
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{simReport.messagesEnqueued}</span>
                </div>
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-xs text-slate-500 block">Ignorados por LGPD</span>
                  <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{simReport.lgpdSkipped}</span>
                </div>
              </div>

              {/* Simulation Result List */}
              <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                  Resultado Detalhado da Simulação ({simReport.details.length} ações mapeadas)
                </h3>

                {simReport.details.length === 0 ? (
                  <p className="text-sm text-slate-400 py-6 text-center">
                    Nenhum cliente, familiar ou feriado fixo identificado para a data informada.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {simReport.details.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-2"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{item.clientName}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">({item.targetName})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ChannelBadge channel={item.channel} />
                            <EventTypeBadge type={item.eventType} />
                          </div>
                        </div>

                        {item.renderedSubject && (
                          <div className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold">
                            Assunto: {item.renderedSubject}
                          </div>
                        )}

                        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-xs text-slate-800 dark:text-slate-300 whitespace-pre-line font-mono">
                          {item.renderedBody || 'Nenhum corpo gerado'}
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

      {/* TAB 2: DISPARO REAL DE HOJE */}
      {activeTab === 'run' && (
        <div className="space-y-6">
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm text-center max-w-xl mx-auto space-y-4 transition-colors">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
              <Zap className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Disparar Rotina de Hoje Imediatamente</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              O motor irá escanear o banco de dados para a data de hoje, gerar mensagens para todos os aniversariantes e datas fixas, e enfileirar o envio no worker.
            </p>

            <button
              onClick={handleRunToday}
              disabled={runningReal}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              <Play className={`w-4 h-4 ${runningReal ? 'animate-spin' : 'fill-current'}`} />
              {runningReal ? 'Executando Varredura e Enfileiramento...' : 'Iniciar Varredura Agora'}
            </button>
          </div>

          {realReport && (
            <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm animate-in fade-in transition-colors">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Relatório de Execução do Job
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500 block">Clientes Varridos</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white">{realReport.clientsScanned}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500 block">Mensagens Enfileiradas</span>
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{realReport.messagesEnqueued}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500 block">Já Enviadas Hoje (Puladas)</span>
                  <span className="text-xl font-bold text-slate-600 dark:text-slate-400">{realReport.alreadySentSkipped}</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500 block">Bloqueadas por LGPD</span>
                  <span className="text-xl font-bold text-amber-600 dark:text-amber-400">{realReport.lgpdSkipped}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
