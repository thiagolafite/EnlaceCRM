import React, { useEffect, useState } from 'react';
import {
  Users as UsersIcon,
  UserPlus,
  Search,
  ShieldCheck,
  UserCheck,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Crown,
  Building2,
  AlertCircle,
  Check,
  Ban,
  Clock,
} from 'lucide-react';
import { api } from '../services/api';
import { User as UserType } from '../types';
import { Modal } from '../components/Modal';
import { ErrorBanner } from '../components/ErrorBanner';

interface UsersProps {
  currentUser?: UserType | null;
}

export function Users({ currentUser }: UsersProps) {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING_APPROVAL' | 'ACTIVE' | 'BLOCKED'>('ALL');

  // Estados de Erro Direcionais
  const [pageError, setPageError] = useState<{ message: string; solution?: string } | null>(null);
  const [modalError, setModalError] = useState<{ message: string; solution?: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const isMaster = currentUser?.role === 'MASTER';

  const [form, setForm] = useState<{
    name: string;
    email: string;
    role: 'MASTER' | 'ADMIN' | 'OPERATOR';
    status: 'ACTIVE' | 'PENDING_APPROVAL' | 'BLOCKED';
    companyId: string;
    password: string;
    confirmPassword: string;
  }>({
    name: '',
    email: '',
    role: 'ADMIN',
    status: 'ACTIVE',
    companyId: '',
    password: '',
    confirmPassword: '',
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      setPageError(null);
      const data = await api.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Erro ao carregar usuários:', err);
      setPageError({
        message: err.message || 'Erro ao carregar lista de usuários.',
        solution: err.solution || 'Verifique sua conexão com o servidor e tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenModal = (userToEdit?: UserType) => {
    setShowPassword(false);
    setModalError(null);
    if (userToEdit) {
      setEditingUser(userToEdit);
      setForm({
        name: userToEdit.name,
        email: userToEdit.email,
        role: userToEdit.role,
        status: (userToEdit.status as any) || 'ACTIVE',
        companyId: userToEdit.companyId || '',
        password: '',
        confirmPassword: '',
      });
    } else {
      setEditingUser(null);
      setForm({
        name: '',
        email: '',
        role: 'ADMIN',
        status: isMaster ? 'ACTIVE' : 'PENDING_APPROVAL',
        companyId: '',
        password: '',
        confirmPassword: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!editingUser && (!form.password || form.password.length < 6)) {
      setModalError({
        message: 'A senha deve ter no mínimo 6 caracteres.',
        solution: 'Digite uma senha com 6 ou mais dígitos para garantir a segurança da conta.',
      });
      return;
    }

    if (form.password && form.password !== form.confirmPassword) {
      setModalError({
        message: 'As senhas digitadas não conferem.',
        solution: 'Certifique-se de que digitou a mesma senha nos campos "Senha" e "Confirme a nova senha".',
      });
      return;
    }

    try {
      setSaving(true);
      if (editingUser) {
        const payload: any = {
          name: form.name,
          email: form.email,
          role: form.role,
          status: form.status,
        };
        if (form.password) {
          payload.password = form.password;
        }
        if (isMaster && form.companyId) {
          payload.companyId = form.companyId;
        }
        await api.updateUser(editingUser.id, payload);
      } else {
        await api.createUser({
          name: form.name,
          email: form.email,
          role: form.role as any,
          password: form.password,
        });
      }

      setIsModalOpen(false);
      await loadUsers();
    } catch (err: any) {
      setModalError({
        message: err.message || 'Erro ao salvar dados do usuário.',
        solution: err.solution || 'Verifique se o e-mail já não pertence a outro usuário ou se as permissões estão corretas.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleApproval = async (userToApprove: UserType, approve: boolean) => {
    try {
      setApprovingId(userToApprove.id);
      setPageError(null);
      await api.toggleUserApproval(userToApprove.id, approve);
      await loadUsers();
    } catch (err: any) {
      setPageError({
        message: err.message || 'Erro ao alterar status de aprovação do usuário.',
        solution: err.solution || 'Verifique se você possui permissões de nível MASTER.',
      });
    } finally {
      setApprovingId(null);
    }
  };

  const handleDelete = async (userToDelete: UserType) => {
    if (currentUser && userToDelete.id === currentUser.id) {
      setPageError({
        message: 'Você não pode excluir sua própria conta conectada.',
        solution: 'Para remover este usuário, utilize outra conta de administrador.',
      });
      return;
    }

    if (userToDelete.role === 'MASTER') {
      setPageError({
        message: 'O usuário MASTER principal não pode ser excluído.',
        solution: 'A conta MASTER é o administrador raiz do sistema e deve ser mantida.',
      });
      return;
    }

    if (!confirm(`Deseja realmente remover o usuário "${userToDelete.name}" (${userToDelete.email})?`)) {
      return;
    }

    try {
      setPageError(null);
      await api.deleteUser(userToDelete.id);
      await loadUsers();
    } catch (err: any) {
      setPageError({
        message: err.message || 'Erro ao remover usuário.',
        solution: err.solution || 'Verifique se o usuário ainda existe no banco de dados.',
      });
    }
  };

  const pendingUsers = users.filter((u) => u.status === 'PENDING_APPROVAL');

  const filteredUsers = users.filter((u) => {
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'PENDING_APPROVAL' && u.status !== 'PENDING_APPROVAL') return false;
      if (statusFilter === 'ACTIVE' && (u.status !== 'ACTIVE' && u.status !== undefined)) return false;
      if (statusFilter === 'BLOCKED' && u.status !== 'BLOCKED') return false;
    }
    const s = search.toLowerCase().trim();
    if (!s) return true;
    return (
      u.name.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s) ||
      (u.companyId && u.companyId.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <ErrorBanner
        error={pageError?.message || null}
        solution={pageError?.solution}
        onClose={() => setPageError(null)}
        onRetry={loadUsers}
      />

      {/* Master Mode Banner */}
      {isMaster && (
        <div className="card-warm p-5 border border-[#C85A32]/30 dark:border-[#C85A32]/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#1C222A] border-2 border-[#C85A32] text-[#C85A32] flex items-center justify-center font-bold shrink-0 shadow-subtle">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1A1E24] dark:text-[#F1F3F5] flex items-center gap-2">
                Controle de Acesso & Trava de Segurança Master Ativa
              </h3>
              <p className="text-xs text-[#6C757D] dark:text-[#ADB5BD]">
                Novos cadastros no sistema iniciam bloqueados e só têm permissão para acessar o CRM após a sua aprovação explícita.
              </p>
            </div>
          </div>
          <span className="shrink-0 px-3 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-[#1A1E24] text-[#F1F3F5] dark:bg-[#2A313A] dark:text-[#F1F3F5] border border-[#C85A32]/40">
            SUPER_ADMIN
          </span>
        </div>
      )}

      {/* Pending Approvals Alert Banner */}
      {isMaster && pendingUsers.length > 0 && (
        <div className="p-5 rounded-3xl bg-[#FFFFFF] dark:bg-[#14181D] border-2 border-[#C85A32] space-y-3.5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#C85A32] animate-ping"></span>
              <h4 className="font-serif text-base text-[#1A1E24] dark:text-[#F1F3F5] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#C85A32]" />
                {pendingUsers.length} novo{pendingUsers.length === 1 ? '' : 's'} cadastro{pendingUsers.length === 1 ? '' : 's'} aguardando sua autorização:
              </h4>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#C85A32] text-white">
              Ação Requerida
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {pendingUsers.map((pu) => (
              <div
                key={pu.id}
                className="p-4 rounded-2xl bg-[#F8F9FA] dark:bg-[#181C21] border border-[#C85A32]/35 flex items-center justify-between gap-3 shadow-subtle"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-xs text-[#1A1E24] dark:text-[#F1F3F5] truncate">
                    {pu.name}
                  </div>
                  <div className="text-[11px] text-[#6C757D] dark:text-[#ADB5BD] truncate">
                    {pu.email} • <span className="font-mono text-[#C85A32]">{pu.companyId}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    disabled={approvingId === pu.id}
                    onClick={() => handleToggleApproval(pu, true)}
                    className="btn-terracotta text-xs"
                  >
                    <Check className="w-3.5 h-3.5" /> Aprovar & Ativar
                  </button>
                  <button
                    type="button"
                    disabled={approvingId === pu.id}
                    onClick={() => handleToggleApproval(pu, false)}
                    className="p-2 rounded-xl text-[#6C757D] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Rejeitar / Bloquear"
                  >
                    <Ban className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header Editorial */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b hairline-border">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#6C757D] dark:text-[#ADB5BD] mb-0.5">SEGURANÇA & ACESSO</p>
          <h1 className="text-2xl lg:text-3xl font-serif text-[#1A1E24] dark:text-[#F1F3F5] font-normal tracking-tight">
            Usuários & Permissões do Sistema
          </h1>
          <p className="text-xs text-[#6C757D] dark:text-[#ADB5BD] mt-1">
            Gerenciamento de operadores e administradores com controle de acesso Master
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="btn-terracotta"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Novo Usuário</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="card-warm p-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Status Filter */}
        <div className="flex items-center gap-1 p-1 rounded-full bg-[#E9ECEF] dark:bg-[#14181D] border border-[#C85A32]/25 text-xs font-medium w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-full transition-all ${
              statusFilter === 'ALL'
                ? 'bg-white dark:bg-[#181C21] text-[#C85A32] dark:text-[#F39C74] border border-[#C85A32]/40 shadow-xs font-semibold'
                : 'text-[#6C757D] hover:text-[#1A1E24] dark:text-[#ADB5BD]'
            }`}
          >
            Todos ({users.length})
          </button>
          {isMaster && (
            <button
              type="button"
              onClick={() => setStatusFilter('PENDING_APPROVAL')}
              className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1 ${
                statusFilter === 'PENDING_APPROVAL'
                  ? 'bg-[#C85A32] text-white font-semibold shadow-xs'
                  : 'text-[#6C757D] hover:text-[#1A1E24] dark:text-[#ADB5BD]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Pendentes ({pendingUsers.length})
            </button>
          )}
          <button
            type="button"
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1 ${
              statusFilter === 'ACTIVE'
                ? 'bg-[#1A1E24] text-[#F1F3F5] dark:bg-[#2A313A] dark:text-[#F1F3F5] border border-[#C85A32]/40 font-semibold shadow-xs'
                : 'text-[#6C757D] hover:text-[#1A1E24] dark:text-[#ADB5BD]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Ativos
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6C757D]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="w-full bg-[#FFFFFF] dark:bg-[#14181D] border border-[#C85A32]/35 dark:border-[#C85A32]/40 focus:border-[#C85A32] dark:focus:border-[#E07A5F] rounded-xl py-2 pl-9 pr-3 text-xs text-[#1A1E24] dark:text-[#F1F3F5] placeholder:text-[#6C757D] outline-none transition-colors"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="card-warm overflow-hidden shadow-subtle transition-colors">
        {loading ? (
          <div className="py-16 text-center text-[#6C757D] text-xs">Carregando usuários do sistema...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-[#6C757D] space-y-2">
            <UsersIcon className="w-8 h-8 mx-auto text-[#6C757D]/60" />
            <p className="font-serif text-[#1A1E24] dark:text-[#F1F3F5] text-base">Nenhum usuário encontrado</p>
            <p className="text-xs text-[#6C757D] dark:text-[#ADB5BD]">Cadastre novos operadores ou administradores.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F1F3F5] dark:bg-[#14181D] text-[#495057] dark:text-[#ADB5BD] text-[11px] font-semibold border-b border-[#C85A32]/25">
                <tr>
                  <th className="py-3.5 px-4">Usuário</th>
                  <th className="py-3.5 px-4">Perfil</th>
                  <th className="py-3.5 px-4">Status de Acesso</th>
                  {isMaster && <th className="py-3.5 px-4">Empresa / Tenant</th>}
                  <th className="py-3.5 px-4">Data de Cadastro</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C85A32]/20 dark:divide-[#C85A32]/20 text-[#1A1E24] dark:text-[#F1F3F5]">
                {filteredUsers.map((u) => {
                  const isCurrent = currentUser && currentUser.id === u.id;
                  const isPending = u.status === 'PENDING_APPROVAL';
                  const isBlocked = u.status === 'BLOCKED';

                  const formattedDate = u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '—';

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-[#E9ECEF]/60 dark:hover:bg-[#1E252E]/60 transition-colors ${
                        isPending ? 'bg-[#C85A32]/10 dark:bg-[#C85A32]/20' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${
                              u.role === 'MASTER'
                                ? 'bg-[#1C222A] text-[#C85A32] border-[#C85A32]'
                                : 'bg-[#FFFFFF] text-[#1A1E24] border-[#C85A32]/35 dark:bg-[#14181D] dark:text-[#F1F3F5]'
                            }`}
                          >
                            {u.role === 'MASTER' ? <Crown className="w-3.5 h-3.5 text-[#C85A32]" /> : u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-[#1A1E24] dark:text-[#F1F3F5] flex items-center gap-2">
                              <span>{u.name}</span>
                              {isCurrent && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFFFFF] text-[#C85A32] border border-[#C85A32] dark:bg-[#181C21]">
                                  Você
                                </span>
                              )}
                            </div>
                            <div className="text-[#6C757D] dark:text-[#ADB5BD] flex items-center gap-1 mt-0.5 text-[11px]">
                              <Mail className="w-3 h-3 text-[#C85A32]" /> {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {u.role === 'MASTER' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFFFFF] text-[#C85A32] border border-[#C85A32] dark:bg-[#181C21] font-semibold text-[11px]">
                            <Crown className="w-3 h-3 text-[#C85A32]" /> MASTER
                          </span>
                        ) : u.role === 'ADMIN' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFFFFF] text-[#1A1E24] border border-[#C85A32]/35 dark:bg-[#181C21] dark:text-[#F1F3F5] font-medium text-[11px]">
                            <ShieldCheck className="w-3 h-3 text-[#C85A32]" /> Administrador
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFFFFF] text-[#6C757D] border border-[#C85A32]/35 dark:bg-[#181C21] dark:text-[#ADB5BD] font-medium text-[11px]">
                            <UserCheck className="w-3 h-3" /> Operador
                          </span>
                        )}
                      </td>

                      {/* Status de Acesso */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFFFFF] text-[#C85A32] dark:bg-[#181C21] border border-[#C85A32] font-medium text-[11px]">
                            <Clock className="w-3 h-3 text-[#C85A32] animate-spin" /> Aguardando Liberação
                          </span>
                        ) : isBlocked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 font-medium text-[11px]">
                            <Ban className="w-3 h-3 text-rose-600" /> Desativado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-medium text-[11px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Ativo
                          </span>
                        )}
                      </td>

                      {isMaster && (
                        <td className="py-3.5 px-4 text-[#6C757D] dark:text-[#ADB5BD] font-mono whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full bg-[#FFFFFF] dark:bg-[#14181D] border border-[#C85A32]/30 text-[10px]">
                            {u.companyId || 'default_company'}
                          </span>
                        </td>
                      )}

                      <td className="py-3.5 px-4 text-[#6C757D] dark:text-[#ADB5BD] font-mono whitespace-nowrap text-[11px]">
                        {formattedDate}
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                        {isMaster && isPending && (
                          <button
                            onClick={() => handleToggleApproval(u, true)}
                            disabled={approvingId === puId(u)}
                            title="Aprovar e Liberar Acesso"
                            className="btn-terracotta text-[11px] py-1 px-2.5"
                          >
                            <Check className="w-3 h-3" /> Aprovar
                          </button>
                        )}

                        {isMaster && !isPending && u.role !== 'MASTER' && (
                          <button
                            onClick={() => handleToggleApproval(u, isBlocked)}
                            title={isBlocked ? 'Reativar Usuário' : 'Bloquear Usuário'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isBlocked
                                ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950'
                                : 'text-[#6C757D] hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                            }`}
                          >
                            {isBlocked ? <Check className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenModal(u)}
                          title="Editar usuário / Redefinir senha"
                          className="p-1.5 rounded-lg text-[#6C757D] hover:text-[#1A1E24] dark:hover:text-[#F1F3F5] hover:bg-[#E9ECEF] dark:hover:bg-[#1E252E] transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(u)}
                          disabled={Boolean(isCurrent || u.role === 'MASTER')}
                          title={
                            isCurrent
                              ? 'Não é possível excluir o próprio usuário'
                              : u.role === 'MASTER'
                              ? 'Usuário MASTER não pode ser excluído'
                              : 'Excluir usuário'
                          }
                          className={`p-1.5 rounded-lg transition-colors ${
                            isCurrent || u.role === 'MASTER'
                              ? 'text-[#6C757D]/40 cursor-not-allowed'
                              : 'text-[#6C757D] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Criar / Editar Usuário */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Editar Usuário / Redefinir Senha' : 'Novo Usuário do Sistema'}
        subtitle="Defina o perfil de permissão, e-mail de acesso e senha de segurança"
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <ErrorBanner
            error={modalError?.message || null}
            solution={modalError?.solution}
            onClose={() => setModalError(null)}
          />

          <div>
            <label className="block text-xs font-medium text-[#495057] dark:text-[#ADB5BD] mb-1">
              Nome Completo *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C85A32]" />
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Carlos Silva"
                className="w-full bg-[#FFFFFF] dark:bg-[#14181D] border border-[#C85A32]/35 dark:border-[#C85A32]/40 focus:border-[#C85A32] dark:focus:border-[#E07A5F] rounded-xl py-2 pl-10 pr-3 text-xs text-[#1A1E24] dark:text-[#F1F3F5] outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#495057] dark:text-[#ADB5BD] mb-1">
              E-mail de Login *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C85A32]" />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="usuario@enlacecrm.com.br"
                className="w-full bg-[#FFFFFF] dark:bg-[#14181D] border border-[#C85A32]/35 dark:border-[#C85A32]/40 focus:border-[#C85A32] dark:focus:border-[#E07A5F] rounded-xl py-2 pl-10 pr-3 text-xs text-[#1A1E24] dark:text-[#F1F3F5] outline-none transition-colors"
              />
            </div>
          </div>

          {/* Role selector */}
          <div>
            <label className="block text-xs font-medium text-[#495057] dark:text-[#ADB5BD] mb-1">
              Perfil de Acesso / Permissão *
            </label>
            <div className={`grid gap-3 ${isMaster ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {isMaster && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'MASTER' })}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    form.role === 'MASTER'
                      ? 'border-[#C85A32] bg-[#FFFFFF] text-[#C85A32] dark:border-[#C85A32] dark:bg-[#181C21] dark:text-[#F39C74]'
                      : 'border-[#C85A32]/25 bg-[#FFFFFF] dark:bg-[#14181D] text-[#6C757D] dark:text-[#ADB5BD]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Crown className="w-5 h-5 text-[#C85A32]" />
                    {form.role === 'MASTER' && <CheckCircle2 className="w-4 h-4 text-[#C85A32]" />}
                  </div>
                  <div className="font-semibold text-xs text-[#1A1E24] dark:text-[#F1F3F5]">MASTER</div>
                  <div className="text-[10px] text-[#6C757D] dark:text-[#ADB5BD] mt-0.5 leading-tight">
                    Acesso global a todas empresas.
                  </div>
                </button>
              )}

              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'ADMIN' })}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  form.role === 'ADMIN'
                    ? 'border-[#C85A32] bg-[#1A1E24] text-[#F1F3F5] dark:bg-[#2A313A] dark:text-[#F1F3F5]'
                    : 'border-[#C85A32]/25 bg-[#FFFFFF] dark:bg-[#14181D] text-[#6C757D] dark:text-[#ADB5BD]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <ShieldCheck className="w-5 h-5" />
                  {form.role === 'ADMIN' && <CheckCircle2 className="w-4 h-4" />}
                </div>
                <div className="font-semibold text-xs">Administrador</div>
                <div className="text-[10px] opacity-80 mt-0.5 leading-tight">
                  Acesso a cadastros e automações.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'OPERATOR' })}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  form.role === 'OPERATOR'
                    ? 'border-[#C85A32] bg-[#1A1E24] text-[#F1F3F5] dark:bg-[#2A313A] dark:text-[#F1F3F5]'
                    : 'border-[#C85A32]/25 bg-[#FFFFFF] dark:bg-[#14181D] text-[#6C757D] dark:text-[#ADB5BD]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <UserCheck className="w-5 h-5" />
                  {form.role === 'OPERATOR' && <CheckCircle2 className="w-4 h-4" />}
                </div>
                <div className="font-semibold text-xs">Operador</div>
                <div className="text-[10px] opacity-80 mt-0.5 leading-tight">
                  Operação diária de alertas e agenda.
                </div>
              </button>
            </div>
          </div>

          {/* Status selector (Master only) */}
          {isMaster && editingUser && (
            <div>
              <label className="block text-xs font-medium text-[#495057] dark:text-[#ADB5BD] mb-1">
                Status da Conta / Liberação
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                className="w-full bg-[#FFFFFF] dark:bg-[#14181D] border border-[#C85A32]/35 dark:border-[#C85A32]/40 focus:border-[#C85A32] dark:focus:border-[#E07A5F] rounded-xl py-2 px-3 text-xs text-[#1A1E24] dark:text-[#F1F3F5] outline-none"
              >
                <option value="ACTIVE">🟢 Ativo (Acesso Liberado)</option>
                <option value="PENDING_APPROVAL">⏳ Pendente de Aprovação</option>
                <option value="BLOCKED">⛔ Bloqueado / Desativado</option>
              </select>
            </div>
          )}

          {/* Master Company Tenant Edit */}
          {isMaster && editingUser && (
            <div>
              <label className="block text-xs font-medium text-[#495057] dark:text-[#ADB5BD] mb-1">
                ID da Empresa / Tenant (Controle Master)
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C85A32]" />
                <input
                  type="text"
                  value={form.companyId}
                  onChange={(e) => setForm({ ...form, companyId: e.target.value })}
                  placeholder="default_company ou ID da empresa"
                  className="w-full bg-[#FFFFFF] dark:bg-[#14181D] border border-[#C85A32]/35 dark:border-[#C85A32]/40 focus:border-[#C85A32] dark:focus:border-[#E07A5F] rounded-xl py-2 pl-10 pr-3 text-xs text-[#1A1E24] dark:text-[#F1F3F5] font-mono outline-none"
                />
              </div>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#14181D] border border-[#C85A32]/30 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-[#495057] dark:text-[#ADB5BD]">
                {editingUser ? 'Redefinir Senha do Usuário' : 'Senha de Acesso *'}
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-[#C85A32] dark:text-[#F39C74] font-medium hover:underline flex items-center gap-1"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showPassword ? 'Ocultar' : 'Visualizar'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#C85A32]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required={!editingUser}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={editingUser ? 'Digitar nova senha' : 'Mínimo 6 dígitos'}
                  className="w-full bg-[#F8F9FA] dark:bg-[#181C21] border border-[#C85A32]/35 dark:border-[#C85A32]/40 focus:border-[#C85A32] dark:focus:border-[#E07A5F] rounded-xl py-2 pl-9 pr-3 text-xs text-[#1A1E24] dark:text-[#F1F3F5] outline-none font-mono"
                />
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#C85A32]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required={Boolean(form.password)}
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Confirme a nova senha"
                  className="w-full bg-[#F8F9FA] dark:bg-[#181C21] border border-[#C85A32]/35 dark:border-[#C85A32]/40 focus:border-[#C85A32] dark:focus:border-[#E07A5F] rounded-xl py-2 pl-9 pr-3 text-xs text-[#1A1E24] dark:text-[#F1F3F5] outline-none font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t hairline-border">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-terracotta"
            >
              {saving ? 'Salvando...' : editingUser ? 'Atualizar Usuário' : 'Cadastrar Usuário'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function puId(u: UserType) {
  return u.id;
}
