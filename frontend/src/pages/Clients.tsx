import React, { useEffect, useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Heart,
  Phone,
  Mail,
  Building2,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Plus,
  X,
  Sparkles,
  MapPin,
  Home,
  Check,
} from 'lucide-react';
import { api } from '../services/api';
import { Client, FamilyMember } from '../types';
import { Modal } from '../components/Modal';
import { StatusBadge, LgpdBadge } from '../components/Badge';

export function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal Cliente (Criar / Editar)
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [loadingClientCep, setLoadingClientCep] = useState(false);
  const [clientForm, setClientForm] = useState<{
    name: string;
    document: string;
    email: string;
    phone: string;
    companyName: string;
    birthDate: string;
    gender: 'FEMALE' | 'MALE' | 'OTHER' | 'NOT_SPECIFIED';
    isMother: boolean;
    isFather: boolean;
    profession: string;
    
    // Endereço
    zipCode: string;
    address: string;
    addressNumber: string;
    addressComplement: string;
    neighborhood: string;
    city: string;
    state: string;

    status: 'ACTIVE' | 'INACTIVE';
    lgpdConsent: boolean;
    notes: string;
  }>({
    name: '',
    document: '',
    email: '',
    phone: '',
    companyName: '',
    birthDate: '',
    gender: 'NOT_SPECIFIED',
    isMother: false,
    isFather: false,
    profession: '',
    zipCode: '',
    address: '',
    addressNumber: '',
    addressComplement: '',
    neighborhood: '',
    city: '',
    state: '',
    status: 'ACTIVE',
    lgpdConsent: true,
    notes: '',
  });

  // Modal Familiares
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [selectedClientForFamily, setSelectedClientForFamily] = useState<Client | null>(null);
  const [editingFamilyMember, setEditingFamilyMember] = useState<FamilyMember | null>(null);
  const [loadingFamilyCep, setLoadingFamilyCep] = useState(false);
  const [familyForm, setFamilyForm] = useState<{
    name: string;
    relationship: FamilyMember['relationship'];
    birthDate: string;
    phone: string;
    email: string;
    
    // Endereço
    sameAddressAsClient: boolean;
    zipCode: string;
    address: string;
    addressNumber: string;
    addressComplement: string;
    neighborhood: string;
    city: string;
    state: string;

    notes: string;
  }>({
    name: '',
    relationship: 'MOTHER',
    birthDate: '',
    phone: '',
    email: '',
    sameAddressAsClient: false,
    zipCode: '',
    address: '',
    addressNumber: '',
    addressComplement: '',
    neighborhood: '',
    city: '',
    state: '',
    notes: '',
  });

  const loadClients = async () => {
    try {
      setLoading(true);
      const res = await api.getClients({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setClients(res.data);
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [search, statusFilter]);

  // Busca automática de CEP via ViaCEP API
  const handleFetchCep = async (cep: string, target: 'client' | 'family') => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    try {
      if (target === 'client') setLoadingClientCep(true);
      else setLoadingFamilyCep(true);

      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();

      if (!data.erro) {
        if (target === 'client') {
          setClientForm((prev) => ({
            ...prev,
            address: data.logradouro || prev.address,
            neighborhood: data.bairro || prev.neighborhood,
            city: data.localidade || prev.city,
            state: data.uf || prev.state,
          }));
        } else {
          setFamilyForm((prev) => ({
            ...prev,
            address: data.logradouro || prev.address,
            neighborhood: data.bairro || prev.neighborhood,
            city: data.localidade || prev.city,
            state: data.uf || prev.state,
          }));
        }
      }
    } catch (err) {
      console.error('Erro ao consultar CEP:', err);
    } finally {
      if (target === 'client') setLoadingClientCep(false);
      else setLoadingFamilyCep(false);
    }
  };

  const handleOpenClientModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setClientForm({
        name: client.name,
        document: client.document || '',
        email: client.email || '',
        phone: client.phone || '',
        companyName: client.companyName || '',
        birthDate: client.birthDate ? client.birthDate.split('T')[0] : '',
        gender: (client.gender as any) || 'NOT_SPECIFIED',
        isMother: Boolean(client.isMother),
        isFather: Boolean(client.isFather),
        profession: client.profession || '',
        zipCode: client.zipCode || '',
        address: client.address || '',
        addressNumber: client.addressNumber || '',
        addressComplement: client.addressComplement || '',
        neighborhood: client.neighborhood || '',
        city: client.city || '',
        state: client.state || '',
        status: client.status,
        lgpdConsent: client.lgpdConsent,
        notes: client.notes || '',
      });
    } else {
      setEditingClient(null);
      setClientForm({
        name: '',
        document: '',
        email: '',
        phone: '',
        companyName: '',
        birthDate: '',
        gender: 'NOT_SPECIFIED',
        isMother: false,
        isFather: false,
        profession: '',
        zipCode: '',
        address: '',
        addressNumber: '',
        addressComplement: '',
        neighborhood: '',
        city: '',
        state: '',
        status: 'ACTIVE',
        lgpdConsent: true,
        notes: '',
      });
    }
    setIsClientModalOpen(true);
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        name: clientForm.name,
        document: clientForm.document || null,
        email: clientForm.email || null,
        phone: clientForm.phone || null,
        companyName: clientForm.companyName || null,
        birthDate: clientForm.birthDate ? new Date(clientForm.birthDate).toISOString() : null,
        gender: clientForm.gender || 'NOT_SPECIFIED',
        isMother: Boolean(clientForm.isMother),
        isFather: Boolean(clientForm.isFather),
        profession: clientForm.profession || null,
        zipCode: clientForm.zipCode || null,
        address: clientForm.address || null,
        addressNumber: clientForm.addressNumber || null,
        addressComplement: clientForm.addressComplement || null,
        neighborhood: clientForm.neighborhood || null,
        city: clientForm.city || null,
        state: clientForm.state || null,
        status: clientForm.status,
        lgpdConsent: clientForm.lgpdConsent,
        notes: clientForm.notes || null,
      };

      if (editingClient) {
        await api.updateClient(editingClient.id, payload);
      } else {
        await api.createClient(payload);
      }
      setIsClientModalOpen(false);
      await loadClients();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar cliente');
    }
  };

  const handleDeleteClient = async (id: string, name: string) => {
    if (!confirm(`Deseja realmente remover o cliente "${name}" e todos os seus familiares vinculados?`)) {
      return;
    }
    try {
      await api.deleteClient(id);
      await loadClients();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir cliente');
    }
  };

  const handleToggleLgpd = async (client: Client) => {
    const nextConsent = !client.lgpdConsent;
    const msg = nextConsent
      ? `Ativar consentimento LGPD para ${client.name}? O motor voltará a gerar alertas para ele e seus familiares.`
      : `Revogar consentimento LGPD para ${client.name}? Nenhum alerta será gerado para ele enquanto o opt-out estiver ativo.`;

    if (!confirm(msg)) return;

    try {
      await api.toggleLgpd(client.id, nextConsent);
      await loadClients();
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar consentimento LGPD');
    }
  };

  // Gerenciamento de Familiares
  const handleOpenFamilyModal = async (client: Client) => {
    setSelectedClientForFamily(client);
    setEditingFamilyMember(null);
    setFamilyForm({
      name: '',
      relationship: 'MOTHER',
      birthDate: '',
      phone: '',
      email: '',
      sameAddressAsClient: false,
      zipCode: '',
      address: '',
      addressNumber: '',
      addressComplement: '',
      neighborhood: '',
      city: '',
      state: '',
      notes: '',
    });
    setIsFamilyModalOpen(true);
  };

  const handleCopyClientAddressToFamily = () => {
    if (!selectedClientForFamily) return;
    setFamilyForm((prev) => ({
      ...prev,
      sameAddressAsClient: true,
      zipCode: selectedClientForFamily.zipCode || '',
      address: selectedClientForFamily.address || '',
      addressNumber: selectedClientForFamily.addressNumber || '',
      addressComplement: selectedClientForFamily.addressComplement || '',
      neighborhood: selectedClientForFamily.neighborhood || '',
      city: selectedClientForFamily.city || '',
      state: selectedClientForFamily.state || '',
    }));
  };

  const handleSaveFamilyMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientForFamily) return;

    try {
      const payload: any = {
        name: familyForm.name,
        relationship: familyForm.relationship,
        birthDate: new Date(familyForm.birthDate).toISOString(),
        phone: familyForm.phone || null,
        email: familyForm.email || null,
        sameAddressAsClient: familyForm.sameAddressAsClient,
        zipCode: familyForm.zipCode || null,
        address: familyForm.address || null,
        addressNumber: familyForm.addressNumber || null,
        addressComplement: familyForm.addressComplement || null,
        neighborhood: familyForm.neighborhood || null,
        city: familyForm.city || null,
        state: familyForm.state || null,
        notes: familyForm.notes || null,
      };

      if (editingFamilyMember) {
        await api.updateFamilyMember(editingFamilyMember.id, payload);
      } else {
        await api.createFamilyMember({
          ...payload,
          clientId: selectedClientForFamily.id,
        });
      }

      const updatedClient = await api.getClientById(selectedClientForFamily.id);
      setSelectedClientForFamily(updatedClient);
      setEditingFamilyMember(null);
      setFamilyForm({
        name: '',
        relationship: 'MOTHER',
        birthDate: '',
        phone: '',
        email: '',
        sameAddressAsClient: false,
        zipCode: '',
        address: '',
        addressNumber: '',
        addressComplement: '',
        neighborhood: '',
        city: '',
        state: '',
        notes: '',
      });
      await loadClients();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar familiar');
    }
  };

  const handleDeleteFamilyMember = async (id: string, name: string) => {
    if (!confirm(`Deseja remover o familiar "${name}"?`)) return;
    try {
      await api.deleteFamilyMember(id);
      if (selectedClientForFamily) {
        const updatedClient = await api.getClientById(selectedClientForFamily.id);
        setSelectedClientForFamily(updatedClient);
      }
      await loadClients();
    } catch (err: any) {
      alert(err.message || 'Erro ao remover familiar');
    }
  };

  const RELATIONSHIP_LABELS: Record<string, string> = {
    MOTHER: 'Mãe',
    FATHER: 'Pai',
    SON: 'Filho',
    DAUGHTER: 'Filha',
    SPOUSE: 'Cônjuge / Esposo(a)',
    BROTHER: 'Irmão',
    SISTER: 'Irmã',
    GRANDFATHER: 'Avô',
    GRANDMOTHER: 'Avó',
    OTHER: 'Outro Parentesco',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Clientes & Familiares</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Cadastre seus clientes com endereço completo e vincule os familiares para felicitações humanizadas.
          </p>
        </div>

        <button
          onClick={() => handleOpenClientModal()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all"
        >
          <UserPlus className="w-4 h-4" /> Novo Cliente
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-3 transition-colors">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, CPF/CNPJ, email, telefone, cidade ou bairro..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-sm text-slate-700 dark:text-slate-300 outline-none"
          >
            <option value="">Todos os status</option>
            <option value="ACTIVE">Ativos</option>
            <option value="INACTIVE">Inativos</option>
          </select>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm transition-colors">
        {loading ? (
          <div className="py-16 text-center text-slate-400">Carregando lista de clientes...</div>
        ) : clients.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Users className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">Nenhum cliente encontrado</p>
            <p className="text-xs">Cadastre seu primeiro cliente para iniciar os alertas.</p>
          </div>
        ) : (
          <>
            {/* 1. VISÃO EM TABELA (DESKTOP / TABLET >= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-4 px-6">Cliente / Empresa</th>
                    <th className="py-4 px-6">Contatos</th>
                    <th className="py-4 px-6">Endereço</th>
                    <th className="py-4 px-6">Aniversário</th>
                    <th className="py-4 px-6">Familiares</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">LGPD</th>
                    <th className="py-4 px-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                  {clients.map((client) => {
                    const bDateFormatted = client.birthDate
                      ? new Date(client.birthDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
                      : 'Não informada';

                    const locationStr = [client.neighborhood, client.city, client.state]
                      .filter(Boolean)
                      .join(', ');

                    return (
                      <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900 dark:text-slate-100">{client.name}</div>
                          {client.companyName && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                              <Building2 className="w-3 h-3 text-slate-400" /> {client.companyName}
                            </div>
                          )}
                          {client.document && (
                            <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{client.document}</div>
                          )}
                        </td>

                        <td className="py-4 px-6 space-y-1 text-xs">
                          {client.phone && (
                            <a
                              href={`https://wa.me/${client.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Conversar no WhatsApp"
                              className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-mono transition-colors group"
                            >
                              <Phone className="w-3 h-3 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                              <span className="underline-offset-2 hover:underline">{client.phone}</span>
                            </a>
                          )}
                          {client.email && (
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                              <Mail className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> {client.email}
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-6">
                          {locationStr || client.address ? (
                            <div className="text-xs space-y-0.5 max-w-[180px]">
                              {client.address && (
                                <div className="text-slate-800 dark:text-slate-200 font-medium truncate" title={`${client.address}, ${client.addressNumber || 'S/N'}`}>
                                  {client.address}, {client.addressNumber || 'S/N'}
                                </div>
                              )}
                              {locationStr && (
                                <div className="text-[11px] text-slate-400 flex items-center gap-1 truncate" title={locationStr}>
                                  <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                                  <span className="truncate">{locationStr}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Não informado</span>
                          )}
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                            <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>{bDateFormatted}</span>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <button
                            onClick={() => handleOpenFamilyModal(client)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-pink-50 dark:bg-pink-950/50 hover:bg-pink-100 dark:hover:bg-pink-950/80 border border-pink-200 dark:border-pink-800/40 text-pink-700 dark:text-pink-300 text-xs font-semibold transition-all"
                          >
                            <Heart className="w-3.5 h-3.5 text-pink-500 dark:text-pink-400" />
                            <span>{client.familyMembers?.length || 0} familiar(es)</span>
                          </button>
                        </td>

                        <td className="py-4 px-6">
                          <StatusBadge status={client.status} />
                        </td>

                        <td className="py-4 px-6">
                          <LgpdBadge
                            consent={client.lgpdConsent}
                            onToggle={() => handleToggleLgpd(client)}
                          />
                        </td>

                        <td className="py-4 px-6 text-right space-x-2">
                          <button
                            onClick={() => handleOpenClientModal(client)}
                            title="Editar cliente"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClient(client.id, client.name)}
                            title="Remover cliente"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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

            {/* 2. VISÃO EM CARDS TOUCH (MOBILE < 768px) */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/60">
              {clients.map((client) => {
                const bDateFormatted = client.birthDate
                  ? new Date(client.birthDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
                  : 'Não informada';

                return (
                  <div key={client.id} className="p-4 space-y-3">
                    {/* Header do Card */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                          {client.name}
                        </h4>
                        {client.companyName && (
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" /> {client.companyName}
                          </div>
                        )}
                        {client.document && (
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">{client.document}</div>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <StatusBadge status={client.status} />
                      </div>
                    </div>

                    {/* Contatos & Aniversário */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Aniversário</span>
                        <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-500" /> {bDateFormatted}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Familiares</span>
                        <button
                          onClick={() => handleOpenFamilyModal(client)}
                          className="font-bold text-pink-600 dark:text-pink-400 flex items-center gap-1 hover:underline"
                        >
                          <Heart className="w-3.5 h-3.5 text-pink-500" /> {client.familyMembers?.length || 0} pessoa(s)
                        </button>
                      </div>
                    </div>

                    {/* Botões Rápidos de Ação */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                      <div className="flex items-center gap-2">
                        {client.phone && (
                          <a
                            href={`https://wa.me/${client.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                          >
                            <Phone className="w-3.5 h-3.5" /> WhatsApp
                          </a>
                        )}
                        <LgpdBadge
                          consent={client.lgpdConsent}
                          onToggle={() => handleToggleLgpd(client)}
                        />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenClientModal(client)}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client.id, client.name)}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Modal Criar / Editar Cliente */}
      <Modal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        title={editingClient ? 'Editar Cliente' : 'Novo Cliente'}
        subtitle="Preencha os dados de identificação, contato e endereço completo"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveClient} className="space-y-5">
          {/* Seção 1: Identificação & Contato */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Users className="w-4 h-4" /> Dados Pessoais & Contato
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  placeholder="Ex: Mariana Oliveira da Costa"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">CPF ou CNPJ</label>
                <input
                  type="text"
                  value={clientForm.document}
                  onChange={(e) => setClientForm({ ...clientForm, document: e.target.value })}
                  placeholder="000.000.000-00"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Telefone / WhatsApp *</label>
                <input
                  type="text"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                  placeholder="+5571981805744"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">E-mail</label>
                <input
                  type="email"
                  value={clientForm.email}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                  placeholder="cliente@exemplo.com.br"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Empresa / PJ</label>
                <input
                  type="text"
                  value={clientForm.companyName}
                  onChange={(e) => setClientForm({ ...clientForm, companyName: e.target.value })}
                  placeholder="Empresa onde trabalha"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Data de Nascimento</label>
                <input
                  type="date"
                  value={clientForm.birthDate}
                  onChange={(e) => setClientForm({ ...clientForm, birthDate: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                <select
                  value={clientForm.status}
                  onChange={(e) => setClientForm({ ...clientForm, status: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none"
                >
                  <option value="ACTIVE">Ativo</option>
                  <option value="INACTIVE">Inativo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Seção 2: Segmentação Inteligente para Datas Comemorativas */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Sparkles className="w-4 h-4" /> Segmentação Familiar & Gênero (Filtros Automáticos)
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Estes campos permitem que o sistema filtre automaticamente o cliente em datas como **Dia das Mães**, **Dia dos Pais**, **Dia da Mulher**, etc.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Gênero / Sexo</label>
                <select
                  value={clientForm.gender || 'NOT_SPECIFIED'}
                  onChange={(e) => setClientForm({ ...clientForm, gender: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none"
                >
                  <option value="NOT_SPECIFIED">Não Informado</option>
                  <option value="FEMALE">Feminino (Mulher)</option>
                  <option value="MALE">Masculino (Homem)</option>
                  <option value="OTHER">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Profissão / Ocupação (Opcional)</label>
                <input
                  type="text"
                  value={clientForm.profession}
                  onChange={(e) => setClientForm({ ...clientForm, profession: e.target.value })}
                  placeholder="Ex: Médico(a), Advogado(a), Professor(a)"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>

              <div className="sm:col-span-2 flex flex-wrap gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={clientForm.isMother}
                    onChange={(e) => setClientForm({ ...clientForm, isMother: e.target.checked })}
                    className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500 border-slate-300 dark:border-slate-700"
                  />
                  <span>🌸 É Mãe (Receber felicitações no Dia das Mães)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={clientForm.isFather}
                    onChange={(e) => setClientForm({ ...clientForm, isFather: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700"
                  />
                  <span>👔 É Pai (Receber felicitações no Dia dos Pais)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Seção 2: Endereço Completo */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
              <MapPin className="w-4 h-4 text-rose-500" /> Endereço do Cliente
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  CEP {loadingClientCep && <span className="text-[10px] text-indigo-500 font-normal">(Buscando...)</span>}
                </label>
                <input
                  type="text"
                  value={clientForm.zipCode}
                  onChange={(e) => {
                    const val = e.target.value;
                    setClientForm({ ...clientForm, zipCode: val });
                    if (val.replace(/\D/g, '').length === 8) {
                      handleFetchCep(val, 'client');
                    }
                  }}
                  placeholder="00000-000"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Logradouro (Rua / Av)</label>
                <input
                  type="text"
                  value={clientForm.address}
                  onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                  placeholder="Ex: Av. Paulista"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Número</label>
                <input
                  type="text"
                  value={clientForm.addressNumber}
                  onChange={(e) => setClientForm({ ...clientForm, addressNumber: e.target.value })}
                  placeholder="1000"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Complemento</label>
                <input
                  type="text"
                  value={clientForm.addressComplement}
                  onChange={(e) => setClientForm({ ...clientForm, addressComplement: e.target.value })}
                  placeholder="Apto 101, Bloco B"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bairro</label>
                <input
                  type="text"
                  value={clientForm.neighborhood}
                  onChange={(e) => setClientForm({ ...clientForm, neighborhood: e.target.value })}
                  placeholder="Bela Vista"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cidade</label>
                <input
                  type="text"
                  value={clientForm.city}
                  onChange={(e) => setClientForm({ ...clientForm, city: e.target.value })}
                  placeholder="São Paulo"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Estado (UF)</label>
                <input
                  type="text"
                  maxLength={2}
                  value={clientForm.state}
                  onChange={(e) => setClientForm({ ...clientForm, state: e.target.value.toUpperCase() })}
                  placeholder="SP"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none uppercase font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notas / Observações</label>
            <textarea
              rows={2}
              value={clientForm.notes}
              onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
              placeholder="Preferências, histórico de relacionamento..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-sm text-slate-900 dark:text-slate-100 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="lgpdConsent"
              checked={clientForm.lgpdConsent}
              onChange={(e) => setClientForm({ ...clientForm, lgpdConsent: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
            />
            <label htmlFor="lgpdConsent" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer font-medium">
              Consentimento LGPD Ativo (Permite gerar alertas de datas comemorativas)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsClientModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30"
            >
              {editingClient ? 'Atualizar Cliente' : 'Salvar Cliente'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Familiares do Cliente */}
      <Modal
        isOpen={isFamilyModalOpen}
        onClose={() => setIsFamilyModalOpen(false)}
        title={selectedClientForFamily ? `Familiares de ${selectedClientForFamily.name}` : 'Familiares'}
        subtitle="Gerencie os familiares associados para felicitações automáticas e endereços"
        maxWidth="2xl"
      >
        <div className="space-y-6">
          {/* Form Adicionar/Editar Familiar */}
          <form onSubmit={handleSaveFamilyMember} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {editingFamilyMember ? 'Editar Familiar' : '+ Adicionar Novo Familiar'}
              </h4>

              {selectedClientForFamily && (
                <button
                  type="button"
                  onClick={handleCopyClientAddressToFamily}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold hover:bg-indigo-100 transition-colors"
                >
                  <Home className="w-3.5 h-3.5" /> Usar mesmo endereço do cliente
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Nome do Familiar *</label>
                <input
                  type="text"
                  required
                  value={familyForm.name}
                  onChange={(e) => setFamilyForm({ ...familyForm, name: e.target.value })}
                  placeholder="Ex: Dona Helena Silveira"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Parentesco *</label>
                <select
                  value={familyForm.relationship}
                  onChange={(e) => setFamilyForm({ ...familyForm, relationship: e.target.value as any })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-slate-100 outline-none"
                >
                  {Object.entries(RELATIONSHIP_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Data de Nascimento *</label>
                <input
                  type="date"
                  required
                  value={familyForm.birthDate}
                  onChange={(e) => setFamilyForm({ ...familyForm, birthDate: e.target.value })}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Telefone (Opcional - LGPD)</label>
                <input
                  type="text"
                  value={familyForm.phone}
                  onChange={(e) => setFamilyForm({ ...familyForm, phone: e.target.value })}
                  placeholder="+55..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>
            </div>

            {/* Endereço do Familiar */}
            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2.5">
              <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" /> Endereço do Familiar (Opcional)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                    CEP {loadingFamilyCep && <span className="text-indigo-500">(Buscando...)</span>}
                  </label>
                  <input
                    type="text"
                    value={familyForm.zipCode}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFamilyForm({ ...familyForm, zipCode: val, sameAddressAsClient: false });
                      if (val.replace(/\D/g, '').length === 8) {
                        handleFetchCep(val, 'family');
                      }
                    }}
                    placeholder="00000-000"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Logradouro / Rua</label>
                  <input
                    type="text"
                    value={familyForm.address}
                    onChange={(e) => setFamilyForm({ ...familyForm, address: e.target.value, sameAddressAsClient: false })}
                    placeholder="Rua, Avenida..."
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Número</label>
                  <input
                    type="text"
                    value={familyForm.addressNumber}
                    onChange={(e) => setFamilyForm({ ...familyForm, addressNumber: e.target.value, sameAddressAsClient: false })}
                    placeholder="123"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Complemento</label>
                  <input
                    type="text"
                    value={familyForm.addressComplement}
                    onChange={(e) => setFamilyForm({ ...familyForm, addressComplement: e.target.value, sameAddressAsClient: false })}
                    placeholder="Apto, Bloco"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Bairro</label>
                  <input
                    type="text"
                    value={familyForm.neighborhood}
                    onChange={(e) => setFamilyForm({ ...familyForm, neighborhood: e.target.value, sameAddressAsClient: false })}
                    placeholder="Bairro"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Cidade</label>
                  <input
                    type="text"
                    value={familyForm.city}
                    onChange={(e) => setFamilyForm({ ...familyForm, city: e.target.value, sameAddressAsClient: false })}
                    placeholder="Cidade"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">UF</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={familyForm.state}
                    onChange={(e) => setFamilyForm({ ...familyForm, state: e.target.value.toUpperCase(), sameAddressAsClient: false })}
                    placeholder="BA"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none uppercase font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              {editingFamilyMember && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingFamilyMember(null);
                    setFamilyForm({
                      name: '',
                      relationship: 'MOTHER',
                      birthDate: '',
                      phone: '',
                      email: '',
                      sameAddressAsClient: false,
                      zipCode: '',
                      address: '',
                      addressNumber: '',
                      addressComplement: '',
                      neighborhood: '',
                      city: '',
                      state: '',
                      notes: '',
                    });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancelar Edição
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/30"
              >
                {editingFamilyMember ? 'Atualizar Familiar' : 'Adicionar Familiar'}
              </button>
            </div>
          </form>

          {/* Lista de Familiares Existentes */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Familiares Cadastrados ({selectedClientForFamily?.familyMembers?.length || 0})
            </h4>

            {(!selectedClientForFamily?.familyMembers || selectedClientForFamily.familyMembers.length === 0) ? (
              <p className="text-xs text-slate-400 py-4 text-center">Nenhum familiar cadastrado para este cliente.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {selectedClientForFamily.familyMembers.map((fm) => {
                  const fmLocation = [fm.address, fm.neighborhood, fm.city, fm.state].filter(Boolean).join(', ');

                  return (
                    <div
                      key={fm.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{fm.name}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-pink-800 dark:bg-pink-950/80 dark:text-pink-300">
                            {RELATIONSHIP_LABELS[fm.relationship] || fm.relationship}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {new Date(fm.birthDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                          </span>
                          {fm.phone && <span>• {fm.phone}</span>}
                        </div>
                        {fmLocation && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 truncate" title={fmLocation}>
                            <MapPin className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                            <span className="truncate">{fmLocation}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingFamilyMember(fm);
                            setFamilyForm({
                              name: fm.name,
                              relationship: fm.relationship,
                              birthDate: fm.birthDate ? fm.birthDate.split('T')[0] : '',
                              phone: fm.phone || '',
                              email: fm.email || '',
                              sameAddressAsClient: fm.sameAddressAsClient || false,
                              zipCode: fm.zipCode || '',
                              address: fm.address || '',
                              addressNumber: fm.addressNumber || '',
                              addressComplement: fm.addressComplement || '',
                              neighborhood: fm.neighborhood || '',
                              city: fm.city || '',
                              state: fm.state || '',
                              notes: fm.notes || '',
                            });
                          }}
                          className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFamilyMember(fm.id, fm.name)}
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsFamilyModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Fechar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
