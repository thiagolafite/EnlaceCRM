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

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const isMaster = currentUser?.role === 'MASTER' || currentUser?.email === 'tigolafite@gmail.com';

  const [form, setForm] = useState<{
    name: string;
    email: string;
    role: 'MASTER' | 'ADMIN' | 'OPERATOR';
    companyId: string;
    password: string;
    confirmPassword: string;
  }>({
    name: '',
    email: '',
    role: 'ADMIN',
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

  const filteredUsers = users.filter((u) => {
    const s = search.toLowerCase().trim();
    if (!s) return true;
    return (
      u.name.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s) ||
      (u.companyId && u.companyId.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-6">
      {/* Master Mode Banner if master user */}
      {isMaster && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-indigo-500/15 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/30">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-amber-950 dark:text-amber-200 flex items-center gap-2">
                Painel Master Ativado — Acesso Global Irrestrito
              </h3>
              <p className="text-xs text-amber-800/90 dark:text-amber-300/80">
                Você está conectado como **MASTER ({currentUser?.email})**. Você possui privilégios para visualizar todas as empresas, alterar senhas e gerenciar qualquer conta do sistema.
              </p>
            </div>
          </div>
          <span className="shrink-0 px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-white shadow-sm">
            SUPER_ADMIN
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <UsersIcon className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Usuários do Sistema
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Cadastre administradores e operadores para gerenciar os contatos e mensagens do Enlace CRM.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all"
        >
          <UserPlus className="w-4 h-4" /> Novo Usuário
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3 transition-colors">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar usuário por nome, e-mail ou empresa..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none"
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
                  <th className="py-4 px-6">Perfil de Acesso</th>
                  {isMaster && <th className="py-4 px-6">Empresa / Tenant</th>}
                  <th className="py-4 px-6">Data de Cadastro</th>
                  <th className="py-4 px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                {filteredUsers.map((u) => {
                  const isCurrent = currentUser && currentUser.id === u.id;
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
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-2xl border flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${
                              u.role === 'MASTER'
                                ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 ring-2 ring-amber-500/20'
                                : 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-200 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400'
                            }`}
                          >
                            {u.role === 'MASTER' ? <Crown className="w-5 h-5 text-amber-500" /> : u.name.charAt(0).toUpperCase()}
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
                            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-400" /> {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        {u.role === 'MASTER' ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700/80 text-amber-800 dark:text-amber-300 text-xs font-black shadow-xs">
                            <Crown className="w-3.5 h-3.5 text-amber-500" />
                            <span>MASTER GLOBAL</span>
                          </div>
                        ) : u.role === 'ADMIN' ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 text-xs font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                            <span>Administrador</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Operador</span>
                          </div>
                        )}
                      </td>

                      {isMaster && (
                        <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-400 font-mono">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                            {u.companyId || 'default_company'}
                          </span>
                        </td>
                      )}

                      <td className="py-4 px-6 text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {formattedDate}
                      </td>

                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenModal(u)}
                          title="Editar usuário / Redefinir senha"
                          className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
                          className={`p-2 rounded-xl transition-colors ${
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
                  Acesso total a cadastros e automações.
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
