import { useEffect, useState } from 'react';
import {
  Activity,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Database,
  Building2,
  Eye,
  Trash2,
  Lock,
  Flame,
  FileCode,
} from 'lucide-react';
import { api } from '../services/api';
import { SystemLog, SystemMetrics, User as UserType } from '../types';
import { Modal } from '../components/Modal';
import { ErrorBanner } from '../components/ErrorBanner';

interface MonitoringProps {
  currentUser?: UserType | null;
}

export function Monitoring({ currentUser }: MonitoringProps) {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estados de Erro Direcionais
  const [error, setError] = useState<{ message: string; solution?: string } | null>(null);

  // Filters
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal Details
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Simulation Feedback
  const [simulating, setSimulating] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const isMaster = currentUser?.role === 'MASTER';

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [logsRes, metricsRes] = await Promise.all([
        api.getLogs({
          level: levelFilter !== 'ALL' ? levelFilter : undefined,
          category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
          search: search || undefined,
          page,
          limit: 30,
        }),
        api.getLogMetrics(),
      ]);

      setLogs(logsRes.data || []);
      setTotalPages(logsRes.meta?.totalPages || 1);
      setMetrics(metricsRes);
    } catch (err: any) {
      console.error('Erro ao carregar logs de monitoramento:', err);
      setError({
        message: err.message || 'Erro ao carregar logs de auditoria e monitoramento.',
        solution: err.solution || 'Verifique se você possui permissões de nível MASTER.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [levelFilter, categoryFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSimulateLog = async (type: 'ERROR' | 'SECURITY') => {
    try {
      setSimulating(true);
      setError(null);
      const message =
        type === 'SECURITY'
          ? `[Alerta de Segurança Simulado] Tentativa de injeção ou token inválido bloqueada com sucesso.`
          : `[Erro Simulado] Falha controlada de teste gerada no painel Master.`;

      await api.testLog({ type, message });
      setActionSuccessMessage(`Evento de teste (${type}) registrado com sucesso no banco de dados!`);
      setTimeout(() => setActionSuccessMessage(null), 4000);
      await loadData();
    } catch (err: any) {
      setError({
        message: err.message || 'Erro ao simular log.',
        solution: err.solution || 'A funcionalidade de simulação de log está desabilitada em produção.',
      });
    } finally {
      setSimulating(false);
    }
  };

  const handleClearLogs = async () => {
    if (!confirm('Deseja realmente limpar logs com mais de 30 dias?')) return;
    try {
      setError(null);
      const res = await api.clearLogs(30);
      setActionSuccessMessage(`${res.deletedCount} logs antigos foram removidos com sucesso.`);
      setTimeout(() => setActionSuccessMessage(null), 4000);
      await loadData();
    } catch (err: any) {
      setError({
        message: err.message || 'Erro ao limpar logs antigos.',
        solution: err.solution || 'Verifique se você possui privilégios de MASTER.',
      });
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
      case 'ERROR':
        return {
          badge: 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          icon: XCircle,
          color: 'text-rose-600',
        };
      case 'SECURITY':
        return {
          badge: 'bg-[#FDF0E6] dark:bg-[#2A1C16] text-[#C85A32] dark:text-[#F39C74] border-[#F5D2BF] dark:border-[#4C2D20]',
          icon: ShieldAlert,
          color: 'text-[#C85A32]',
        };
      case 'WARN':
        return {
          badge: 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          icon: AlertTriangle,
          color: 'text-amber-600',
        };
      default:
        return {
          badge: 'bg-[#FAF6F0] dark:bg-[#15100E] text-[#756557] dark:text-[#B5A599] border-[#EDE5DC] dark:border-[#2A211D]',
          icon: Activity,
          color: 'text-[#756557]',
        };
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  if (!isMaster) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-[#FDF0E6] dark:bg-[#2A1C16] border border-[#F5D2BF] dark:border-[#4C2D20] flex items-center justify-center mx-auto text-[#C85A32]">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-serif text-[#1E1611] dark:text-[#F5EFE8]">Acesso Restrito ao Usuário Master</h2>
        <p className="text-xs text-[#756557] dark:text-[#B5A599]">
          O painel de monitoramento de infraestrutura e logs de segurança é restrito a administradores Master globais.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <ErrorBanner
        error={error?.message || null}
        solution={error?.solution}
        onClose={() => setError(null)}
        onRetry={loadData}
      />

      {/* Toast de Confirmação */}
      {actionSuccessMessage && (
        <div className="p-3.5 rounded-2xl bg-[#1E1611] dark:bg-[#FAF6F0] text-[#FAF6F0] dark:text-[#1E1611] font-medium text-xs flex items-center gap-2 shadow-dropdown animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Header Editorial */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b hairline-border">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#A09388]">INFRAESTRUTURA & AUDITORIA</p>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-[#1E1611] text-[#FAF6F0] dark:bg-[#FAF6F0] dark:text-[#1E1611]">
              Master
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-serif text-[#1E1611] dark:text-[#F5EFE8] font-normal tracking-tight mt-0.5">
            Auditoria de Segurança & Logs (SOC)
          </h1>
          <p className="text-xs text-[#756557] dark:text-[#B5A599] mt-1">
            Monitoramento de erros de sistema, auditoria de acessos e integridade do banco de dados
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleSimulateLog('SECURITY')}
            disabled={simulating}
            className="btn-secondary"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>Simular Alerta</span>
          </button>

          <button
            onClick={() => handleSimulateLog('ERROR')}
            disabled={simulating}
            className="btn-secondary"
          >
            <Flame className="w-3.5 h-3.5 text-rose-600" />
            <span>Simular Erro</span>
          </button>

          <button
            onClick={handleRefresh}
            className="btn-terracotta"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Erros 24h */}
          <div className="card-warm p-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-[#A09388]">Erros (Últimas 24h)</span>
              <div className="text-3xl font-serif text-[#1E1611] dark:text-[#F5EFE8] mt-1">
                {metrics.counts.errors24h}
              </div>
              <span className="text-[11px] text-[#756557] dark:text-[#B5A599] flex items-center gap-1 mt-0.5">
                {metrics.counts.errors24h === 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Sistema estável sem erros
                  </span>
                ) : (
                  <span className="text-rose-600 font-medium">Atenção a falhas recentes</span>
                )}
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-600 flex items-center justify-center font-bold">
              <Flame className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Segurança */}
          <div className="card-peach p-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-[#B84E29] dark:text-[#F39C74]">Auditoria & Segurança (24h)</span>
              <div className="text-3xl font-serif text-[#C85A32] dark:text-[#F39C74] mt-1">
                {metrics.counts.securityIncidents24h}
              </div>
              <span className="text-[11px] text-[#756557] dark:text-[#B5A599] mt-0.5 block">
                Tentativas de login e acessos
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-[#FDF6F0] dark:bg-[#1A1513] border border-[#F5D2BF] dark:border-[#4C2D20] text-[#C85A32] flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Supabase Latency */}
          <div className="card-warm p-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-[#A09388]">Banco de Dados (Supabase)</span>
              <div className="text-3xl font-serif text-[#1E1611] dark:text-[#F5EFE8] mt-1 flex items-center gap-2">
                <span>{metrics.database.status}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <span className="text-[11px] text-[#756557] dark:text-[#B5A599] font-mono mt-0.5 block">
                Latência: {metrics.database.latencyMs}ms • PostgreSQL
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-600 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Infra & Tenants */}
          <div className="card-warm p-5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-[#A09388]">Empresas / Tenants</span>
              <div className="text-3xl font-serif text-[#1E1611] dark:text-[#F5EFE8] mt-1">
                {metrics.counts.activeTenantsCount} empresa{metrics.counts.activeTenantsCount === 1 ? '' : 's'}
              </div>
              <span className="text-[11px] text-[#756557] dark:text-[#B5A599] mt-0.5 block font-mono">
                {metrics.counts.totalUsers} usuários • Uptime: {formatUptime(metrics.systemHealth.uptimeSeconds)}
              </span>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] text-[#1E1611] dark:text-[#F5EFE8] flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="card-warm p-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Level Filter */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] text-xs">
            <button
              type="button"
              onClick={() => { setLevelFilter('ALL'); setPage(1); }}
              className={`px-3 py-1 rounded-full font-medium transition-all ${
                levelFilter === 'ALL'
                  ? 'bg-white dark:bg-[#1E1512] text-[#1E1611] dark:text-[#F5EFE8] shadow-subtle font-semibold'
                  : 'text-[#756557] hover:text-[#1E1611] dark:text-[#B5A599]'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => { setLevelFilter('ERROR'); setPage(1); }}
              className={`px-3 py-1 rounded-full font-medium transition-all flex items-center gap-1 ${
                levelFilter === 'ERROR'
                  ? 'bg-rose-500 text-white shadow-subtle font-semibold'
                  : 'text-[#756557] hover:text-rose-600'
              }`}
            >
              <Flame className="w-3 h-3" /> Erros
            </button>
            <button
              type="button"
              onClick={() => { setLevelFilter('SECURITY'); setPage(1); }}
              className={`px-3 py-1 rounded-full font-medium transition-all flex items-center gap-1 ${
                levelFilter === 'SECURITY'
                  ? 'bg-[#C85A32] text-white shadow-subtle font-semibold'
                  : 'text-[#756557] hover:text-[#C85A32]'
              }`}
            >
              <ShieldAlert className="w-3 h-3" /> Segurança
            </button>
            <button
              type="button"
              onClick={() => { setLevelFilter('WARN'); setPage(1); }}
              className={`px-3 py-1 rounded-full font-medium transition-all flex items-center gap-1 ${
                levelFilter === 'WARN'
                  ? 'bg-amber-500 text-white shadow-subtle font-semibold'
                  : 'text-[#756557] hover:text-amber-600'
              }`}
            >
              <AlertTriangle className="w-3 h-3" /> Avisos
            </button>
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] dark:focus:border-[#F39C74] rounded-xl py-1.5 px-3 text-xs font-medium text-[#1E1611] dark:text-[#F5EFE8] outline-none"
          >
            <option value="ALL">Todas as Categorias</option>
            <option value="AUTH">🔑 Autenticação (AUTH)</option>
            <option value="SECURITY">🛡️ Segurança (SECURITY)</option>
            <option value="API">🌐 API & Rotas</option>
            <option value="DATABASE">🗄️ Banco de Dados</option>
            <option value="AUTOMATION">⏰ Automação & Agendador</option>
          </select>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#A09388]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por mensagem, IP, e-mail..."
            className="w-full bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] dark:focus:border-[#F39C74] rounded-xl py-1.5 pl-9 pr-3 text-xs text-[#1E1611] dark:text-[#F5EFE8] placeholder:text-[#A09388] outline-none transition-colors"
          />
        </form>
      </div>

      {/* Logs Table */}
      <div className="card-warm overflow-hidden shadow-subtle transition-colors">
        {loading ? (
          <div className="py-16 text-center text-[#A09388] text-xs">Consultando logs do sistema...</div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-[#A09388] space-y-2">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
            <p className="font-serif text-[#1E1611] dark:text-[#F5EFE8] text-base">Nenhum registro de erro ou incidente</p>
            <p className="text-xs text-[#756557] dark:text-[#B5A599]">O sistema está operando perfeitamente com os filtros selecionados.</p>
          </div>
        ) : (
          <>
            {/* 1. VISÃO EM TABELA (DESKTOP >= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF6F0] dark:bg-[#15100E] text-[#756557] dark:text-[#B5A599] text-[11px] font-semibold border-b border-[#EDE5DC] dark:border-[#2A211D]">
                  <tr>
                    <th className="py-3.5 px-4">Data / Hora</th>
                    <th className="py-3.5 px-4">Nível</th>
                    <th className="py-3.5 px-4">Ação / Categoria</th>
                    <th className="py-3.5 px-4">Mensagem do Evento</th>
                    <th className="py-3.5 px-4">Usuário / Empresa</th>
                    <th className="py-3.5 px-4">IP Origem</th>
                    <th className="py-3.5 px-4 text-right">Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDE5DC]/70 dark:divide-[#2A211D]/70 text-[#1E1611] dark:text-[#F5EFE8]">
                  {logs.map((log) => {
                    const theme = getLevelBadge(log.level);
                    const Icon = theme.icon;

                    const formattedDate = new Date(log.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    });

                    return (
                      <tr
                        key={log.id}
                        className="hover:bg-[#FAF6F0]/60 dark:hover:bg-[#201814]/60 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedLog(log);
                          setIsDetailModalOpen(true);
                        }}
                      >
                        <td className="py-3.5 px-4 font-mono text-[#756557] dark:text-[#B5A599] whitespace-nowrap">
                          {formattedDate}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${theme.badge}`}>
                            <Icon className="w-3 h-3" /> {log.level}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap font-mono">
                          <span className="font-semibold text-[#1E1611] dark:text-[#F5EFE8]">{log.action}</span>
                          <span className="text-[10px] text-[#A09388] block font-sans">{log.category}</span>
                        </td>

                        <td className="py-3.5 px-4 max-w-md">
                          <div className="font-medium truncate text-[#1E1611] dark:text-[#F5EFE8]" title={log.message}>
                            {log.message}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap text-[#756557] dark:text-[#B5A599]">
                          <div>{log.userEmail || 'Anônimo / Sistema'}</div>
                          {log.companyId && (
                            <div className="text-[10px] font-mono text-[#C85A32] dark:text-[#F39C74]">{log.companyId}</div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-[#A09388]">
                          {log.ipAddress || '—'}
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLog(log);
                              setIsDetailModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-[#A09388] hover:text-[#1E1611] dark:hover:text-[#F5EFE8] hover:bg-[#FAF6F0] dark:hover:bg-[#201814] transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 2. VISÃO EM CARDS TOUCH (MOBILE < 768px) */}
            <div className="md:hidden divide-y divide-[#EDE5DC]/70 dark:divide-[#2A211D]/70">
              {logs.map((log) => {
                const theme = getLevelBadge(log.level);
                const Icon = theme.icon;

                const formattedDate = new Date(log.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={log.id}
                    onClick={() => {
                      setSelectedLog(log);
                      setIsDetailModalOpen(true);
                    }}
                    className="p-4 space-y-2.5 hover:bg-[#FAF6F0]/60 dark:hover:bg-[#201814]/60 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${theme.badge}`}>
                        <Icon className="w-3 h-3" /> {log.level}
                      </span>
                      <span className="text-[11px] font-mono text-[#A09388]">{formattedDate}</span>
                    </div>

                    <div>
                      <div className="font-semibold text-xs text-[#1E1611] dark:text-[#F5EFE8] font-mono flex items-center justify-between">
                        <span>{log.action}</span>
                        <span className="text-[10px] text-[#A09388] font-sans font-normal">{log.category}</span>
                      </div>
                      <p className="text-xs text-[#756557] dark:text-[#B5A599] mt-1 line-clamp-2">
                        {log.message}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-[#756557] dark:text-[#B5A599] border-t hairline-border">
                      <span className="truncate">{log.userEmail || 'Sistema'}</span>
                      <span className="text-[#C85A32] dark:text-[#F39C74] font-medium flex items-center gap-1">
                        Ver detalhes ➔
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Pagination & Clear */}
        <div className="p-4 border-t hairline-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearLogs}
              className="text-[#A09388] hover:text-rose-600 text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Limpar logs antigos (+30 dias)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="btn-secondary py-1 px-3 disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="font-mono text-xs text-[#756557] dark:text-[#B5A599]">
              Página {page} de {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="btn-secondary py-1 px-3 disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        </div>
      </div>

      {/* Modal Detalhes do Log */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detalhes Técnicos do Log de Auditoria"
        subtitle={`Registro ID: ${selectedLog?.id || ''}`}
        maxWidth="2xl"
      >
        {selectedLog && (
          <div className="space-y-4 text-xs">
            {/* Log Meta Card */}
            <div className="p-4 rounded-3xl bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="font-mono text-[#A09388] block text-[10px] uppercase">Nível</span>
                <span className="font-semibold text-[#1E1611] dark:text-[#F5EFE8]">{selectedLog.level}</span>
              </div>
              <div>
                <span className="font-mono text-[#A09388] block text-[10px] uppercase">Categoria</span>
                <span className="font-semibold text-[#1E1611] dark:text-[#F5EFE8]">{selectedLog.category}</span>
              </div>
              <div>
                <span className="font-mono text-[#A09388] block text-[10px] uppercase">Ação</span>
                <span className="font-semibold text-[#C85A32] dark:text-[#F39C74] font-mono">{selectedLog.action}</span>
              </div>
              <div>
                <span className="font-mono text-[#A09388] block text-[10px] uppercase">Data & Hora</span>
                <span className="text-[#756557] dark:text-[#B5A599] font-mono">
                  {new Date(selectedLog.createdAt).toLocaleString('pt-BR')}
                </span>
              </div>
              <div>
                <span className="font-mono text-[#A09388] block text-[10px] uppercase">Usuário</span>
                <span className="text-[#756557] dark:text-[#B5A599]">{selectedLog.userEmail || 'Sistema'}</span>
              </div>
              <div>
                <span className="font-mono text-[#A09388] block text-[10px] uppercase">IP de Origem</span>
                <span className="text-[#756557] dark:text-[#B5A599] font-mono">{selectedLog.ipAddress || '—'}</span>
              </div>
            </div>

            {/* Mensagem */}
            <div>
              <label className="font-medium text-[#756557] dark:text-[#B5A599] block mb-1">Mensagem do Evento:</label>
              <div className="p-3.5 rounded-2xl bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] text-[#1E1611] dark:text-[#F5EFE8] font-medium leading-relaxed">
                {selectedLog.message}
              </div>
            </div>

            {/* Detalhes / Stack Trace */}
            {selectedLog.details && (
              <div>
                <label className="font-medium text-[#756557] dark:text-[#B5A599] block mb-1 flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-[#C85A32]" /> Stack Trace / Carga do Evento (JSON):
                </label>
                <pre className="p-4 rounded-3xl bg-[#1A1412] text-[#F39C74] font-mono text-[11px] overflow-x-auto max-h-60 leading-tight border border-[#2A201C]">
                  {(() => {
                    try {
                      return JSON.stringify(JSON.parse(selectedLog.details), null, 2);
                    } catch {
                      return selectedLog.details;
                    }
                  })()}
                </pre>
              </div>
            )}

            {selectedLog.userAgent && (
              <div className="text-[10px] text-[#A09388] font-mono truncate">
                <strong>User-Agent:</strong> {selectedLog.userAgent}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="btn-secondary"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
