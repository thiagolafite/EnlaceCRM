import React, { useEffect, useState } from 'react';
import {
  Users as UsersIcon,
  UserPlus,
  Search,
  Shield,
  ShieldCheck,
  UserCheck,
  Edit2,
  Trash2,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Sparkles,
  Crown,
  Building2,
  ShieldAlert,
  AlertCircle,
  Check,
  Ban,
  Clock,
} from 'lucide-react';
import { api } from '../services/api';
import { User as UserType } from '../types';
import { Modal } from '../components/Modal';

interface UsersProps {
  currentUser?: UserType | null;
}

export function Users({ currentUser }: UsersProps) {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING_APPROVAL' | 'ACTIVE' | 'BLOCKED'>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const isMaster = currentUser?.role === 'MASTER' || currentUser?.email === 'tigolafite@gmail.com';

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
      const data = await api.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenModal = (userToEdit?: UserType) => {
    setShowPassword(false);
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

    if (!editingUser && (!form.password || form.password.length < 6)) {
      alert('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (form.password && form.password !== form.confirmPassword) {
      alert('As senhas digitadas não conferem');
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
      alert(err.message || 'Erro ao salvar usuário');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleApproval = async (userToApprove: UserType, approve: boolean) => {
    try {
      setApprovingId(userToApprove.id);
      await api.toggleUserApproval(userToApprove.id, approve);
      await loadUsers();
    } catch (err: any) {
      alert(err.message || 'Erro ao alterar status de aprovação do usuário');
    } finally {
      setApprovingId(null);
    }
  };

  const handleDelete = async (userToDelete: UserType) => {
    if (currentUser && userToDelete.id === currentUser.id) {
      alert('Você não pode excluir sua própria conta conectada.');
      return;
    }

    if (userToDelete.role === 'MASTER') {
      alert('O usuário MASTER principal não pode ser excluído.');
      return;
    }

    if (!confirm(`Deseja realmente remover o usuário "${userToDelete.name}" (${userToDelete.email})?`)) {
      return;
    }

    try {
      await api.deleteUser(userToDelete.id);
      await loadUsers();
    } catch (err: any) {
      alert(err.message || 'Erro ao remover usuário');
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
      {/* Master Mode Banner */}
      {isMaster && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-indigo-500/15 border border-amber-500/30 flex items-center justify-between gap-4 shadow-luxury">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-glow-amber/40 shrink-0">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black font-outfit text-amber-950 dark:text-amber-200 flex items-center gap-2">
                Controle de Acesso & Trava de Segurança Master Ativa
              </h3>
              <p className="text-xs text-amber-800/90 dark:text-amber-300/80 font-medium">
                Novos cadastros no sistema iniciam **bloqueados** e só têm permissão para acessar o CRM após a sua aprovação explícita.
              </p>
            </div>
          </div>
          <span className="shrink-0 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-xs">
            SUPER_ADMIN
          </span>
        </div>
      )}

      {/* Pending Approvals Alert Banner */}
      {isMaster && pendingUsers.length > 0 && (
        <div className="p-6 rounded-3xl bg-amber-500/10 border-2 border-amber-400/80 dark:border-amber-500/40 shadow-glow-amber/20 space-y-3.5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
              <h4 className="font-black font-outfit text-sm text-amber-950 dark:text-amber-100 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                {pendingUsers.length} novo{pendingUsers.length === 1 ? '' : 's'} cadastro{pendingUsers.length === 1 ? '' : 's'} aguardando sua autorização:
              </h4>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white">
              Ação Requerida
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {pendingUsers.map((pu) => (
              <div
                key={pu.id}
                className="p-4 rounded-2xl bg-white/90 dark:bg-obsidian-900/90 border border-amber-200/80 dark:border-amber-500/20 flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="min-w-0">
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                    {pu.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {pu.email} • <span className="font-mono text-indigo-600 dark:text-indigo-400">{pu.companyId}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    disabled={approvingId === pu.id}
                    onClick={() => handleToggleApproval(pu, true)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs shadow-xs flex items-center gap-1 transition-all disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" /> Aprovar & Ativar
                  </button>
                  <button
                    type="button"
                    disabled={approvingId === pu.id}
                    onClick={() => handleToggleApproval(pu, false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-obsidian-800 transition-colors"
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black font-outfit text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <UsersIcon className="w-5 h-5" />
            </span>
            <span>Usuários & Permissões do Sistema</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gerenciamento de operadores e administradores com trava de ativação manual Master.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-95 text-white font-black text-xs shadow-glow-indigo transition-all"
        >
          <UserPlus className="w-4 h-4" /> Novo Usuário
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
        {/* Status Filter */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              statusFilter === 'ALL'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Todos ({users.length})
          </button>
          {isMaster && (
            <button
              type="button"
              onClick={() => setStatusFilter('PENDING_APPROVAL')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                statusFilter === 'PENDING_APPROVAL'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-500 hover:text-amber-600'
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Pendentes ({pendingUsers.length})
            </button>
          )}
          <button
            type="button"
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
              statusFilter === 'ACTIVE'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-emerald-600'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Ativos
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, e-mail ou empresa..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm transition-colors">
        {loading ? (
          <div className="py-16 text-center text-slate-400">Carregando usuários do sistema...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <UsersIcon className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">Nenhum usuário encontrado</p>
            <p className="text-xs">Cadastre novos operadores ou administradores.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-4 px-6">Usuário</th>
                  <th className="py-4 px-6">Perfil</th>
                  <th className="py-4 px-6">Status de Acesso</th>
                  {isMaster && <th className="py-4 px-6">Empresa / Tenant</th>}
                  <th className="py-4 px-6">Data de Cadastro</th>
                  <th className="py-4 px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300 text-xs">
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
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${
                        isPending ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-2xl border flex items-center justify-center font-bold text-xs shrink-0 shadow-sm ${
                              u.role === 'MASTER'
                                ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 ring-2 ring-amber-500/20'
                                : 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-200 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400'
                            }`}
                          >
                            {u.role === 'MASTER' ? <Crown className="w-4 h-4 text-amber-500" /> : u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                              <span>{u.name}</span>
                              {isCurrent && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                  Você
                                </span>
                              )}
                            </div>
                            <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-400" /> {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        {u.role === 'MASTER' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700/80 text-amber-800 dark:text-amber-300 font-black">
                            <Crown className="w-3 h-3 text-amber-500" /> MASTER
                          </span>
                        ) : u.role === 'ADMIN' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 font-bold">
                            <ShieldCheck className="w-3 h-3 text-purple-600" /> Administrador
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 font-bold">
                            <UserCheck className="w-3 h-3 text-emerald-600" /> Operador
                          </span>
                        )}
                      </td>

                      {/* Status de Acesso */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-700">
                            <Clock className="w-3 h-3 text-amber-600 animate-spin" /> Aguardando Liberação
                          </span>
                        ) : isBlocked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold border border-rose-300 dark:border-rose-700">
                            <Ban className="w-3 h-3 text-rose-600" /> Desativado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800/60">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Ativo
                          </span>
                        )}
                      </td>

                      {isMaster && (
                        <td className="py-4 px-6 text-slate-600 dark:text-slate-400 font-mono whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                            {u.companyId || 'default_company'}
                          </span>
                        </td>
                      )}

                      <td className="py-4 px-6 text-slate-500 dark:text-slate-400 font-mono whitespace-nowrap">
                        {formattedDate}
                      </td>

                      <td className="py-4 px-6 text-right space-x-1.5 whitespace-nowrap">
                        {/* Quick Master Approval Button */}
                        {isMaster && isPending && (
                          <button
                            onClick={() => handleToggleApproval(u, true)}
                            disabled={approvingId === u.id}
                            title="Aprovar e Liberar Acesso"
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm inline-flex items-center gap-1 transition-all"
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
                                : 'text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            {isBlocked ? <Check className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenModal(u)}
                          title="Editar usuário / Redefinir senha"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
                              ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                              : 'text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800'
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
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nome Completo *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Carlos Silva"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-3 text-sm text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              E-mail de Login *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="usuario@enlacecrm.com.br"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2.5 pl-10 pr-3 text-sm text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>
          </div>

          {/* Role selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Perfil de Acesso / Permissão *
            </label>
            <div className={`grid gap-3 ${isMaster ? 'grid-cols-3' : 'grid-cols-2'}`}>
              {isMaster && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'MASTER' })}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    form.role === 'MASTER'
                      ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/30'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Crown className="w-5 h-5 text-amber-500" />
                    {form.role === 'MASTER' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                  </div>
                  <div className="font-bold text-xs">MASTER</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                    Acesso global a todas empresas.
                  </div>
                </button>
              )}

              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'ADMIN' })}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  form.role === 'ADMIN'
                    ? 'border-purple-500 bg-purple-50/70 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 ring-2 ring-purple-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  {form.role === 'ADMIN' && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
                </div>
                <div className="font-bold text-xs">Administrador</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                  Acesso a cadastros e automações.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'OPERATOR' })}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  form.role === 'OPERATOR'
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  {form.role === 'OPERATOR' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <div className="font-bold text-xs">Operador</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                  Operação diária de alertas e agenda.
                </div>
              </button>
            </div>
          </div>

          {/* Status selector (Master only) */}
          {isMaster && editingUser && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status da Conta / Liberação
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-slate-100 outline-none"
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
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ID da Empresa / Tenant (Controle Master)
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={form.companyId}
                  onChange={(e) => setForm({ ...form, companyId: e.target.value })}
                  placeholder="default_company ou ID da empresa"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 pl-10 pr-3 text-xs text-slate-900 dark:text-slate-100 font-mono outline-none"
                />
              </div>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {editingUser ? 'Redefinir Senha do Usuário' : 'Senha de Acesso *'}
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showPassword ? 'Ocultar' : 'Visualizar'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required={!editingUser}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={editingUser ? 'Digitar nova senha' : 'Mínimo 6 dígitos'}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 dark:text-slate-100 outline-none font-mono"
                />
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required={Boolean(form.password)}
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Confirme a nova senha"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 dark:text-slate-100 outline-none font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {saving ? 'Salvando...' : editingUser ? 'Atualizar Usuário' : 'Cadastrar Usuário'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
