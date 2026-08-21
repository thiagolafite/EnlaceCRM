import React, { useEffect, useState } from 'react';
import {
  Activity,
  Shield,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Server,
  Database,
  Cpu,
  Clock,
  Building2,
  User,
  Terminal,
  Eye,
  Trash2,
  Zap,
  Lock,
  Flame,
  FileCode,
  Sparkles,
  Crown,
} from 'lucide-react';
import { api } from '../services/api';
import { SystemLog, SystemMetrics, User as UserType } from '../types';
import { Modal } from '../components/Modal';

interface MonitoringProps {
  currentUser?: UserType | null;
}

export function Monitoring({ currentUser }: MonitoringProps) {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const isMaster = currentUser?.role === 'MASTER' || currentUser?.email === 'tigolafite@gmail.com';

  const loadData = async () => {
    try {
      setLoading(true);
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
      const message =
        type === 'SECURITY'
          ? `[Alerta de Segurança Simulado] Tentativa de injeção ou token inválido bloqueada com sucesso.`
          : `[Erro Simulado] Falha controlada de teste gerada no painel Master.`;

      await api.testLog({ type, message });
      setActionSuccessMessage(`Evento de teste (${type}) registrado com sucesso no banco de dados!`);
      setTimeout(() => setActionSuccessMessage(null), 4000);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao simular log');
    } finally {
      setSimulating(false);
    }
  };

  const handleClearLogs = async () => {
    if (!confirm('Deseja realmente limpar logs com mais de 30 dias?')) return;
    try {
      const res = await api.clearLogs(30);
      alert(`${res.deletedCount} logs antigos foram removidos com sucesso.`);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao limpar logs');
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
          badge: 'bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
          icon: ShieldAlert,
          color: 'text-purple-600',
        };
      case 'WARN':
        return {
          badge: 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          icon: AlertTriangle,
          color: 'text-amber-600',
        };
      default:
        return {
          badge: 'bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
          icon: Activity,
          color: 'text-sky-600',
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
        <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 flex items-center justify-center mx-auto text-rose-600">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Acesso Restrito ao Usuário Master</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          O painel de monitoramento de infraestrutura e logs de segurança é restrito a administradores Master globais.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast de Confirmação */}
      {actionSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="w-4 h-4" /> {actionSuccessMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white shadow-xs flex items-center gap-1">
              <Crown className="w-3 h-3" /> EXCLUSIVO MASTER
            </span>
            <span className="text-xs text-slate-400 font-mono">auditoria em tempo real</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Activity className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Central de Monitoramento & Auditoria de Segurança
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Painel 360º de erros de sistema, incidentes de segurança, tentativas de invasão e saúde do banco Supabase.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleSimulateLog('SECURITY')}
            disabled={simulating}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold hover:bg-purple-100 transition-all shadow-xs"
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Testar Alerta Segurança
          </button>

          <button
            onClick={() => handleSimulateLog('ERROR')}
            disabled={simulating}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold hover:bg-rose-100 transition-all shadow-xs"
          >
            <Flame className="w-3.5 h-3.5" /> Testar Log de Erro
          </button>

          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Atualizar
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Erros 24h */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Erros (Últimas 24h)</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {metrics.counts.errors24h}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                {metrics.counts.errors24h === 0 ? (
                  <span className="text-emerald-500 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Sistema estável sem erros
                  </span>
                ) : (
                  <span className="text-rose-500 font-bold">Atenção a falhas recentes</span>
                )}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-600 flex items-center justify-center font-bold">
              <Flame className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Segurança */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Auditoria & Segurança (24h)</span>
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
                {metrics.counts.securityIncidents24h}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                Tentativas de login e acessos
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 text-purple-600 flex items-center justify-center font-bold">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Supabase Latency */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Banco de Dados (Supabase)</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                <span>{metrics.database.status}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 block">
                Latência: {metrics.database.latencyMs}ms • PostgreSQL
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-600 flex items-center justify-center font-bold">
              <Database className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Infra & Tenants */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Empresas / Tenants</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {metrics.counts.activeTenantsCount} empresa{metrics.counts.activeTenantsCount === 1 ? '' : 's'}
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                {metrics.counts.totalUsers} usuários • Uptime: {formatUptime(metrics.systemHealth.uptimeSeconds)}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-600 flex items-center justify-center font-bold">
              <Building2 className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Level Filter */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => { setLevelFilter('ALL'); setPage(1); }}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                levelFilter === 'ALL'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => { setLevelFilter('ERROR'); setPage(1); }}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                levelFilter === 'ERROR'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-500 hover:text-rose-600'
              }`}
            >
              <Flame className="w-3 h-3" /> Erros
            </button>
            <button
              type="button"
              onClick={() => { setLevelFilter('SECURITY'); setPage(1); }}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                levelFilter === 'SECURITY'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-purple-600'
              }`}
            >
              <ShieldAlert className="w-3 h-3" /> Segurança
            </button>
            <button
              type="button"
              onClick={() => { setLevelFilter('WARN'); setPage(1); }}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                levelFilter === 'WARN'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-500 hover:text-amber-600'
              }`}
            >
              <AlertTriangle className="w-3 h-3" /> Avisos
            </button>
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-1.5 px-3 text-xs text-slate-700 dark:text-slate-300 outline-none"
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
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por mensagem, IP, e-mail..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-1.5 pl-8 pr-3 text-xs text-slate-900 dark:text-slate-100 outline-none"
          />
        </form>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm transition-colors">
        {loading ? (
          <div className="py-16 text-center text-slate-400">Consultando logs do sistema...</div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
            <p className="font-bold text-slate-700 dark:text-slate-300">Nenhum registro de erro ou incidente encontrado</p>
            <p className="text-xs">O sistema está operando perfeitamente com os filtros selecionados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-5">Data / Hora</th>
                  <th className="py-3.5 px-5">Nível</th>
                  <th className="py-3.5 px-5">Ação / Categoria</th>
                  <th className="py-3.5 px-5">Mensagem do Evento</th>
                  <th className="py-3.5 px-5">Usuário / Empresa</th>
                  <th className="py-3.5 px-5">IP Origem</th>
                  <th className="py-3.5 px-5 text-right">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
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
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedLog(log);
                        setIsDetailModalOpen(true);
                      }}
                    >
                      <td className="py-3.5 px-5 font-mono whitespace-nowrap text-slate-500 dark:text-slate-400">
                        {formattedDate}
                      </td>

                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${theme.badge}`}>
                          <Icon className="w-3 h-3" /> {log.level}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 whitespace-nowrap font-mono">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{log.action}</span>
                        <span className="text-[10px] text-slate-400 block">{log.category}</span>
                      </td>

                      <td className="py-3.5 px-5 max-w-md">
                        <div className="font-medium truncate text-slate-800 dark:text-slate-200" title={log.message}>
                          {log.message}
                        </div>
                      </td>

                      <td className="py-3.5 px-5 whitespace-nowrap text-slate-500 dark:text-slate-400">
                        <div>{log.userEmail || 'Anônimo / Sistema'}</div>
                        {log.companyId && (
                          <div className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">{log.companyId}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-5 whitespace-nowrap font-mono text-[11px] text-slate-500">
                        {log.ipAddress || '—'}
                      </td>

                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                            setIsDetailModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
        )}

        {/* Pagination & Clear */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearLogs}
              className="text-slate-400 hover:text-rose-600 text-xs font-semibold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Limpar logs antigos (+30 dias)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="font-bold text-slate-600 dark:text-slate-400">
              Página {page} de {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40"
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
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="font-bold text-slate-400 block text-[10px] uppercase">Nível</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{selectedLog.level}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 block text-[10px] uppercase">Categoria</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{selectedLog.category}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 block text-[10px] uppercase">Ação</span>
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">{selectedLog.action}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 block text-[10px] uppercase">Data & Hora</span>
                <span className="text-slate-800 dark:text-slate-200 font-mono">
                  {new Date(selectedLog.createdAt).toLocaleString('pt-BR')}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-400 block text-[10px] uppercase">Usuário</span>
                <span className="text-slate-800 dark:text-slate-200">{selectedLog.userEmail || 'Sistema'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-400 block text-[10px] uppercase">IP de Origem</span>
                <span className="text-slate-800 dark:text-slate-200 font-mono">{selectedLog.ipAddress || '—'}</span>
              </div>
            </div>

            {/* Mensagem */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Mensagem do Evento:</label>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-semibold leading-relaxed">
                {selectedLog.message}
              </div>
            </div>

            {/* Detalhes / Stack Trace */}
            {selectedLog.details && (
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-indigo-500" /> Stack Trace / Carga do Evento (JSON):
                </label>
                <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-60 leading-tight">
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
              <div className="text-[10px] text-slate-400 font-mono truncate">
                <strong>User-Agent:</strong> {selectedLog.userAgent}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
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
