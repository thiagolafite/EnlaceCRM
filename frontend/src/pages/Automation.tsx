import { useState, useEffect } from 'react';
import {
  Zap,
  Eye,
} from 'lucide-react';
import { api } from '../services/api';
import { EventTypeBadge } from '../components/Badge';
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

  useEffect(() => {
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

      {/* Header Editorial */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b hairline-border">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#6C757D] dark:text-[#ADB5BD] mb-0.5">MOTOR & ROTINAS</p>
          <h1 className="text-2xl lg:text-3xl font-serif text-[#1A1E24] dark:text-[#F1F3F5] font-normal tracking-tight">
            Motor de Automação & Simulação
          </h1>
          <p className="text-xs text-[#6C757D] dark:text-[#ADB5BD] mt-1">
            Execução do job diário de felicitações e simulador de datas (dry-run)
          </p>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex bg-[#E9ECEF] dark:bg-[#14181D] border border-[#C85A32]/25 p-1 rounded-full w-fit text-xs font-medium">
        <button
          onClick={() => setActiveTab('simulate')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all ${
            activeTab === 'simulate'
              ? 'bg-white dark:bg-[#181C21] text-[#C85A32] dark:text-[#F39C74] border border-[#C85A32]/40 shadow-xs font-semibold'
              : 'text-[#6C757D] hover:text-[#1A1E24] dark:text-[#ADB5BD]'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Simulador de Datas (Dry-Run)</span>
        </button>

        <button
          onClick={() => setActiveTab('run')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all ${
            activeTab === 'run'
              ? 'bg-white dark:bg-[#181C21] text-[#C85A32] dark:text-[#F39C74] border border-[#C85A32]/40 shadow-xs font-semibold'
              : 'text-[#6C757D] hover:text-[#1A1E24] dark:text-[#ADB5BD]'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Disparo Imediato de Hoje</span>
        </button>
      </div>

      {/* TAB 1: SIMULADOR (DRY-RUN) */}
      {activeTab === 'simulate' && (
        <div className="space-y-5">
          <div className="card-warm p-4 flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#495057] dark:text-[#ADB5BD]">
                Selecione a Data para Simulação:
              </label>
              <div className="flex flex-wrap items-center gap-2.5">
                <input
                  type="date"
                  value={simDate}
                  onChange={(e) => setSimDate(e.target.value)}
                  className="bg-[#FFFFFF] dark:bg-[#14181D] border border-[#C85A32]/35 dark:border-[#C85A32]/40 focus:border-[#C85A32] dark:focus:border-[#E07A5F] rounded-xl py-2 px-3 text-xs text-[#1A1E24] dark:text-[#F1F3F5] outline-none font-mono"
                />
                <span className="text-xs text-[#6C757D] dark:text-[#ADB5BD]">
                  (Simula aniversários e feriados sem disparar mensagens reais)
                </span>
              </div>
            </div>

            <button
              onClick={handleSimulate}
              disabled={runningSim}
              className="btn-terracotta"
            >
              <Eye className={`w-3.5 h-3.5 ${runningSim ? 'animate-spin' : ''}`} />
              <span>{runningSim ? 'Simulando...' : 'Rodar Simulação'}</span>
            </button>
          </div>

          {simReport && (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="card-warm p-5">
                  <span className="text-xs text-[#6C757D] dark:text-[#ADB5BD] font-medium block">Clientes Analisados</span>
                  <span className="text-3xl font-serif text-[#1A1E24] dark:text-[#F1F3F5] mt-1 block">{simReport.clientsScanned}</span>
                </div>
                <div className="card-warm p-5 border-2 border-[#C85A32]">
                  <span className="text-xs text-[#C85A32] dark:text-[#F39C74] font-medium block">Aniversários Encontrados</span>
                  <span className="text-3xl font-serif text-[#C85A32] dark:text-[#F39C74] mt-1 block">
                    {simReport.clientBirthdaysFound + simReport.familyBirthdaysFound}
                  </span>
                </div>
                <div className="card-warm p-5">
                  <span className="text-xs text-[#6C757D] dark:text-[#ADB5BD] font-medium block">Mensagens Geradas</span>
                  <span className="text-3xl font-serif text-emerald-600 dark:text-emerald-400 mt-1 block">{simReport.alertsGenerated}</span>
                </div>
                <div className="card-warm p-5">
                  <span className="text-xs text-[#6C757D] dark:text-[#ADB5BD] font-medium block">Ignorados por LGPD</span>
                  <span className="text-3xl font-serif text-[#6C757D] dark:text-[#ADB5BD] mt-1 block">{simReport.lgpdSkipped}</span>
                </div>
              </div>

              {/* Simulation Result List */}
              <div className="card-warm p-6">
                <h3 className="text-base font-serif text-[#1A1E24] dark:text-[#F1F3F5] mb-4">
                  Resultado Detalhado da Simulação ({simReport.details.length} ações mapeadas)
                </h3>

                {simReport.details.length === 0 ? (
                  <p className="text-xs text-[#6C757D] dark:text-[#ADB5BD] py-6 text-center">
                    Nenhum cliente, familiar ou feriado fixo identificado para a data informada.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {simReport.details.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#14181D] border border-[#C85A32]/25 space-y-2"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#1A1E24] dark:text-[#F1F3F5] text-xs">{item.clientName}</span>
                            <span className="text-xs text-[#6C757D] dark:text-[#ADB5BD]">({item.targetName})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <EventTypeBadge type={item.eventType} />
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-[#F8F9FA] dark:bg-[#181C21] text-xs text-[#1A1E24] dark:text-[#F1F3F5] font-mono whitespace-pre-line border border-[#C85A32]/30">
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
          <div className="card-warm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-xl">
              <h3 className="text-lg font-serif text-[#1A1E24] dark:text-[#F1F3F5]">
                Executar Motor de Felicitações para a Data Atual
              </h3>
              <p className="text-xs text-[#6C757D] dark:text-[#ADB5BD] leading-relaxed">
                Esta ação varre todos os clientes ativos, calcula aniversários do dia e datas comemorativas, gera os alertas e notifica seu WhatsApp via CallMeBot.
              </p>
            </div>

            <button
              onClick={handleRunToday}
              disabled={runningReal}
              className="btn-terracotta shrink-0 py-3 px-6"
            >
              <Zap className={`w-4 h-4 ${runningReal ? 'animate-spin' : ''}`} />
              <span>{runningReal ? 'Processando...' : 'Iniciar Motor de Hoje'}</span>
            </button>
          </div>

          {realReport && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="card-warm p-5">
                  <span className="text-xs text-[#6C757D] dark:text-[#ADB5BD] font-medium block">Clientes Analisados</span>
                  <span className="text-3xl font-serif text-[#1A1E24] dark:text-[#F1F3F5] mt-1 block">{realReport.clientsScanned}</span>
                </div>
                <div className="card-warm p-5 border-2 border-[#C85A32]">
                  <span className="text-xs text-[#C85A32] dark:text-[#F39C74] font-medium block">Alertas Gerados</span>
                  <span className="text-3xl font-serif text-[#C85A32] dark:text-[#F39C74] mt-1 block">{realReport.alertsGenerated}</span>
                </div>
                <div className="card-warm p-5">
                  <span className="text-xs text-[#6C757D] dark:text-[#ADB5BD] font-medium block">Já Existentes (Ignorados)</span>
                  <span className="text-3xl font-serif text-[#6C757D] dark:text-[#ADB5BD] mt-1 block">{realReport.alreadyGeneratedSkipped}</span>
                </div>
                <div className="card-warm p-5">
                  <span className="text-xs text-[#6C757D] dark:text-[#ADB5BD] font-medium block">Status WhatsApp</span>
                  <span className="text-3xl font-serif text-[#1A1E24] dark:text-[#F1F3F5] mt-1 block">{realReport.ownerNotificationStatus}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
