import { useEffect, useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Heart,
  Phone,
  Mail,
  Building2,
  Calendar,
  Sparkles,
  MapPin,
  Home,
  Download,
  UserX,
  ShieldCheck,
  Copy,
  Check,
} from 'lucide-react';
import { api } from '../services/api';
import { Client, FamilyMember } from '../types';
import { Modal } from '../components/Modal';
import { StatusBadge, LgpdBadge } from '../components/Badge';
import { ErrorBanner } from '../components/ErrorBanner';

export function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Estados de Erro Direcionais
  const [pageError, setPageError] = useState<{ message: string; solution?: string } | null>(null);
  const [clientModalError, setClientModalError] = useState<{ message: string; solution?: string } | null>(null);
  const [familyModalError, setFamilyModalError] = useState<{ message: string; solution?: string } | null>(null);

  // Modal LGPD Exportação de Dados
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportDataContent, setExportDataContent] = useState<any | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [copiedExport, setCopiedExport] = useState(false);

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
    consentSource: string;
    consentNote: string;
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
    consentSource: 'MANUAL',
    consentNote: '',
    notes: '',
  });

  // Modal Familiares
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [selectedClientForFamily, setSelectedClientForFamily] = useState<Client | null>(null);
  const [editingFamilyMember, setEditingFamilyMember] = useState<FamilyMember | null>(null);
  const [loadingFamilyCep, setLoadingFamilyCep] = useState(false);
  const [familyForm, setFamilyForm] = useState<{
    name: string;
    gender: 'FEMALE' | 'MALE' | 'OTHER' | 'NOT_SPECIFIED';
    relationship: string;
    birthDate: string;
    phone: string;
    email: string;
    consentHolderConfirmed: boolean;
    allowMinorNotifications: boolean;
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
    gender: 'FEMALE',
    relationship: 'MOTHER',
    birthDate: '',
    phone: '',
    email: '',
    consentHolderConfirmed: true,
    allowMinorNotifications: false,
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
      setPageError(null);
      const res = await api.getClients({
        search: search || undefined,
        status: statusFilter || undefined,
        limit: 100,
      });
      const clientList = Array.isArray(res)
        ? res
        : Array.isArray((res as any)?.data)
        ? (res as any).data
        : [];
      setClients(clientList);
    } catch (err: any) {
      console.error('Erro ao carregar clientes:', err);
      setPageError({
        message: err.message || 'Erro ao carregar lista de clientes.',
        solution: err.solution || 'Verifique sua conexão ou recarregue a página.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [search, statusFilter]);

  // Consulta automática de CEP (ViaCEP)
  const handleFetchCep = async (cepValue: string, target: 'client' | 'family') => {
    const cleanCep = cepValue.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    try {
      if (target === 'client') setLoadingClientCep(true);
      else setLoadingFamilyCep(true);

      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

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
      console.warn('Não foi possível buscar o CEP automaticamente:', err);
    } finally {
      if (target === 'client') setLoadingClientCep(false);
      else setLoadingFamilyCep(false);
    }
  };

  const handleOpenClientModal = (client?: Client) => {
    setClientModalError(null);
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
        consentSource: client.consentSource || 'MANUAL',
        consentNote: client.consentNote || '',
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
        consentSource: 'MANUAL',
        consentNote: '',
        notes: '',
      });
    }
    setIsClientModalOpen(true);
  };

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientModalError(null);
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
        consentSource: clientForm.consentSource,
        consentNote: clientForm.consentNote || null,
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
      setClientModalError({
        message: err.message || 'Erro ao salvar cliente',
        solution: err.solution || 'Verifique se os campos obrigatórios estão preenchidos corretamente.',
      });
    }
  };

  const handleDeleteClient = async (id: string, name: string) => {
    if (!confirm(`Deseja realmente remover o cliente "${name}" e todos os seus familiares vinculados?`)) {
      return;
    }
    try {
      setPageError(null);
      await api.deleteClient(id);
      await loadClients();
    } catch (err: any) {
      setPageError({
        message: err.message || 'Erro ao excluir cliente',
        solution: err.solution || 'Atualize a página e tente novamente.',
      });
    }
  };

  /**
   * LGPD Art. 18, V — Exportação de Dados do Titular (Portabilidade)
   */
  const handleExportClient = async (client: Client) => {
    try {
      setPageError(null);
      setExportLoading(true);
      setIsExportModalOpen(true);
      setCopiedExport(false);
      const data = await api.exportClientData(client.id);
      setExportDataContent(data);
    } catch (err: any) {
      setIsExportModalOpen(false);
      setPageError({
        message: err.message || 'Erro ao exportar dados do cliente',
        solution: err.solution || 'Tente novamente em instantes.',
      });
    } finally {
      setExportLoading(false);
    }
  };

  /**
   * LGPD Art. 18, VI — Anonimização de Dados do Titular (Direito ao Esquecimento)
   */
  const handleAnonymizeClient = async (client: Client) => {
    const confirmation = prompt(
      `ATENÇÃO — DIREITO AO ESQUECIMENTO (LGPD Art. 18, VI):\n\nEsta ação anonimizará permanentemente todos os dados pessoais do cliente "${client.name}" e de seus familiares vinculados.\n\nNome, telefone, e-mail, CPF/CNPJ, endereço e data de nascimento serão IRREVERSIVELMENTE excluídos.\n\nPara confirmar esta operação, digite "ANONIMIZAR":`
    );

    if (confirmation !== 'ANONIMIZAR') {
      if (confirmation !== null) {
        alert('Confirmação incorreta. Operação de anonimização cancelada.');
      }
      return;
    }

    try {
      setPageError(null);
      await api.anonymizeClient(client.id);
      await loadClients();
      alert('Dados pessoais do cliente e de seus familiares foram anonimizados com sucesso!');
    } catch (err: any) {
      setPageError({
        message: err.message || 'Erro ao anonimizar dados do cliente',
        solution: err.solution || 'Verifique suas permissões de administrador.',
      });
    }
  };

  /**
   * LGPD Art. 18, IX — Toggle Opt-Out / Opt-In
   */
  const handleToggleLgpd = async (client: Client) => {
    const isOptedOut = Boolean(client.optOutAt) || !client.lgpdConsent;

    if (isOptedOut) {
      const source = prompt(
        `Reativar consentimento e opt-in para "${client.name}"?\n\nInforme a fonte do consentimento:\n1. CONTRATO\n2. WHATSAPP\n3. FORMULARIO\n4. VERBAL\n5. MANUAL`,
        'MANUAL'
      );
      if (!source) return;

      try {
        setPageError(null);
        await api.optInClient(client.id, source.toUpperCase().trim());
        await loadClients();
      } catch (err: any) {
        setPageError({
          message: err.message || 'Erro ao reativar consentimento',
          solution: err.solution || 'Tente novamente em instantes.',
        });
      }
    } else {
      if (!confirm(`Registrar Opt-out (revogação de consentimento) para "${client.name}"?\n\nNenhuma mensagem automática será gerada para ele ou seus familiares.`)) {
        return;
      }

      try {
        setPageError(null);
        await api.optOutClient(client.id);
        await loadClients();
      } catch (err: any) {
        setPageError({
          message: err.message || 'Erro ao registrar opt-out',
          solution: err.solution || 'Tente novamente em instantes.',
        });
      }
    }
  };

  const inferGenderFromRelationship = (rel: string): 'FEMALE' | 'MALE' | 'NOT_SPECIFIED' => {
    if (['MOTHER', 'DAUGHTER', 'SISTER', 'GRANDMOTHER'].includes(rel)) return 'FEMALE';
    if (['FATHER', 'SON', 'BROTHER', 'GRANDFATHER'].includes(rel)) return 'MALE';
    return 'NOT_SPECIFIED';
  };

  // Gerenciamento de Familiares
  const handleOpenFamilyModal = async (client: Client, memberToEdit?: FamilyMember) => {
    setSelectedClientForFamily(client);
    setEditingFamilyMember(memberToEdit || null);
    setFamilyModalError(null);
    if (memberToEdit) {
      setFamilyForm({
        name: memberToEdit.name,
        gender: (memberToEdit.gender as any) || 'NOT_SPECIFIED',
        relationship: memberToEdit.relationship,
        birthDate: memberToEdit.birthDate ? memberToEdit.birthDate.split('T')[0] : '',
        phone: memberToEdit.phone || '',
        email: memberToEdit.email || '',
        consentHolderConfirmed: memberToEdit.consentHolderConfirmed ?? true,
        allowMinorNotifications: Boolean(memberToEdit.allowMinorNotifications),
        sameAddressAsClient: Boolean(memberToEdit.sameAddressAsClient),
        zipCode: memberToEdit.zipCode || '',
        address: memberToEdit.address || '',
        addressNumber: memberToEdit.addressNumber || '',
        addressComplement: memberToEdit.addressComplement || '',
        neighborhood: memberToEdit.neighborhood || '',
        city: memberToEdit.city || '',
        state: memberToEdit.state || '',
        notes: memberToEdit.notes || '',
      });
    } else {
      setFamilyForm({
        name: '',
        gender: 'FEMALE',
        relationship: 'MOTHER',
        birthDate: '',
        phone: '',
        email: '',
        consentHolderConfirmed: true,
        allowMinorNotifications: false,
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
    }
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
    setFamilyModalError(null);

    try {
      const payload: any = {
        name: familyForm.name,
        gender: familyForm.gender || 'NOT_SPECIFIED',
        relationship: familyForm.relationship,
        birthDate: familyForm.birthDate ? new Date(familyForm.birthDate).toISOString() : null,
        phone: familyForm.phone || null,
        email: familyForm.email || null,
        consentHolderConfirmed: familyForm.consentHolderConfirmed,
        allowMinorNotifications: familyForm.allowMinorNotifications,
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
        await api.createFamilyMember({ clientId: selectedClientForFamily.id, ...payload });
      }

      // Recarregar cliente e modal
      const updatedClient = await api.getClientById(selectedClientForFamily.id);
      setSelectedClientForFamily(updatedClient);
      setEditingFamilyMember(null);
      setFamilyForm({
        name: '',
        gender: 'FEMALE',
        relationship: 'MOTHER',
        birthDate: '',
        phone: '',
        email: '',
        consentHolderConfirmed: true,
        allowMinorNotifications: false,
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
      setFamilyModalError({
        message: err.message || 'Erro ao salvar familiar',
        solution: err.solution || 'Verifique se a data de nascimento e os dados obrigatórios foram preenchidos.',
      });
    }
  };

  const handleDeleteFamilyMember = async (id: string, name: string) => {
    if (!confirm(`Deseja remover o familiar "${name}"?`)) return;
    try {
      setFamilyModalError(null);
      await api.deleteFamilyMember(id);
      if (selectedClientForFamily) {
        const updatedClient = await api.getClientById(selectedClientForFamily.id);
        setSelectedClientForFamily(updatedClient);
      }
      await loadClients();
    } catch (err: any) {
      setFamilyModalError({
        message: err.message || 'Erro ao remover familiar',
        solution: err.solution || 'Atualize a página e tente novamente.',
      });
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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Editorial */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b hairline-border">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-[#A09388] mb-0.5">RELACIONAMENTO</p>
          <h1 className="text-2xl lg:text-3xl font-serif text-[#1E1611] dark:text-[#F5EFE8] font-normal tracking-tight">
            Clientes & Árvore Familiar
          </h1>
          <p className="text-xs text-[#756557] dark:text-[#B5A599] mt-1">
            Gerenciamento de titulares, familiares e preferências de contato
          </p>
        </div>

        <button
          onClick={() => handleOpenClientModal()}
          className="btn-terracotta"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Novo Cliente</span>
        </button>
      </div>

      {/* Alerta de Erro Direcional na Página */}
      {pageError && (
        <ErrorBanner
          error={pageError.message}
          solution={pageError.solution}
          onClose={() => setPageError(null)}
        />
      )}

      {/* Filter & Search Bar */}
      <div className="card-warm p-3.5 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#A09388]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, CPF/CNPJ, email, telefone, cidade ou bairro..."
            className="w-full bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] dark:focus:border-[#F39C74] rounded-xl py-2 pl-9 pr-3 text-xs text-[#1E1611] dark:text-[#F5EFE8] placeholder:text-[#A09388] outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] dark:focus:border-[#F39C74] rounded-xl py-2 px-3 text-xs font-medium text-[#1E1611] dark:text-[#F5EFE8] outline-none"
          >
            <option value="">Todos os status</option>
            <option value="ACTIVE">Ativos</option>
            <option value="INACTIVE">Inativos</option>
          </select>
        </div>
      </div>

      {/* Clients Table */}
      <div className="card-warm overflow-hidden transition-colors">
        {loading ? (
          <div className="py-16 text-center text-[#A09388] text-xs">Carregando lista de clientes...</div>
        ) : clients.length === 0 ? (
          <div className="py-16 text-center text-[#A09388] space-y-2">
            <Users className="w-8 h-8 mx-auto text-[#A09388]/60" />
            <p className="font-serif text-[#1E1611] dark:text-[#F5EFE8] text-base">Nenhum cliente encontrado</p>
            <p className="text-xs text-[#756557] dark:text-[#B5A599]">Cadastre seu primeiro cliente para iniciar os alertas e felicitações.</p>
          </div>
        ) : (
          <>
            {/* 1. VISÃO EM TABELA (DESKTOP / TABLET >= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF6F0] dark:bg-[#15100E] text-[#756557] dark:text-[#B5A599] text-[11px] font-semibold border-b border-[#EDE5DC] dark:border-[#2A211D]">
                  <tr>
                    <th className="py-3.5 px-4">Cliente / Empresa</th>
                    <th className="py-3.5 px-4">Contatos</th>
                    <th className="py-3.5 px-4">Endereço</th>
                    <th className="py-3.5 px-4">Aniversário</th>
                    <th className="py-3.5 px-4">Familiares</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">LGPD</th>
                    <th className="py-3.5 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDE5DC]/70 dark:divide-[#2A211D]/70 text-[#1E1611] dark:text-[#F5EFE8]">
                  {clients.map((client) => {
                    const bDateFormatted = client.birthDate
                      ? new Date(client.birthDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
                      : 'Não informada';

                    const locationStr = [client.neighborhood, client.city, client.state]
                      .filter(Boolean)
                      .join(', ');

                    return (
                      <tr key={client.id} className="hover:bg-[#FAF6F0]/60 dark:hover:bg-[#201814]/60 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-[#1E1611] dark:text-[#F5EFE8]">{client.name}</span>
                            {client.isMother && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FDF2EC] text-[#B84E29] border border-[#F6D5C2] dark:bg-[#2D1A14] dark:text-[#F39C74] dark:border-[#522F22]">
                                Mãe
                              </span>
                            )}
                            {client.isFather && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EEF3F8] text-[#2C5282] border border-[#CFDDE8] dark:bg-[#172230] dark:text-[#7EB0D5] dark:border-[#2B3E55]">
                                Pai
                              </span>
                            )}
                            {!client.isMother && !client.isFather && client.gender === 'FEMALE' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F3ECE4] text-[#756557] border border-[#EDE5DC] dark:bg-[#221B17] dark:text-[#B5A599] dark:border-[#2A211D]">
                                Mulher
                              </span>
                            )}
                            {!client.isMother && !client.isFather && client.gender === 'MALE' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F3ECE4] text-[#756557] border border-[#EDE5DC] dark:bg-[#221B17] dark:text-[#B5A599] dark:border-[#2A211D]">
                                Homem
                              </span>
                            )}
                          </div>
                          {client.companyName && (
                            <div className="text-[11px] text-[#756557] dark:text-[#B5A599] flex items-center gap-1 mt-0.5">
                              <Building2 className="w-3 h-3 text-[#A09388]" /> {client.companyName}
                            </div>
                          )}
                          {client.document && (
                            <div className="text-[10px] text-[#A09388] font-mono mt-0.5">{client.maskedDocument || client.document}</div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 space-y-0.5">
                          {client.phone && (
                            <a
                              href={`https://wa.me/${client.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Conversar no WhatsApp"
                              className="flex items-center gap-1 text-[#1E1611] dark:text-[#F5EFE8] hover:text-[#C85A32] dark:hover:text-[#F39C74] font-mono transition-colors"
                            >
                              <Phone className="w-3 h-3 text-[#C85A32] dark:text-[#F39C74]" />
                              <span>{client.phone}</span>
                            </a>
                          )}
                          {client.email && (
                            <div className="flex items-center gap-1 text-[#756557] dark:text-[#B5A599]">
                              <Mail className="w-3 h-3 text-[#A09388]" /> {client.email}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {locationStr || client.address ? (
                            <div className="space-y-0.5 max-w-[180px]">
                              {client.address && (
                                <div className="text-[#1E1611] dark:text-[#F5EFE8] truncate" title={`${client.address}, ${client.addressNumber || 'S/N'}`}>
                                  {client.address}, {client.addressNumber || 'S/N'}
                                </div>
                              )}
                              {locationStr && (
                                <div className="text-[11px] text-[#756557] dark:text-[#B5A599] flex items-center gap-1 truncate" title={locationStr}>
                                  <MapPin className="w-3 h-3 text-[#A09388] shrink-0" />
                                  <span className="truncate">{locationStr}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-[#A09388] italic">Não informado</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[#756557] dark:text-[#B5A599]">
                          {bDateFormatted}
                        </td>

                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleOpenFamilyModal(client)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6F0] hover:bg-[#F3ECE4] dark:bg-[#221B17] dark:hover:bg-[#2A211D] border border-[#EDE5DC] dark:border-[#2A211D] text-[#1E1611] dark:text-[#F5EFE8] text-xs font-medium transition-colors"
                          >
                            <Heart className="w-3 h-3 text-[#C85A32] dark:text-[#F39C74]" />
                            <span>{client.familyMembers?.length || 0} familiar(es)</span>
                          </button>
                        </td>

                        <td className="py-3.5 px-4">
                          <StatusBadge status={client.status} />
                        </td>

                        <td className="py-3.5 px-4">
                          <LgpdBadge
                            consent={client.lgpdConsent}
                            optOutAt={client.optOutAt}
                            source={client.consentSource}
                            onToggle={() => handleToggleLgpd(client)}
                          />
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => handleExportClient(client)}
                            title="Exportar Dados (LGPD Art. 18)"
                            className="p-1.5 rounded-lg text-[#A09388] hover:text-[#C85A32] hover:bg-[#FDF6F0] dark:hover:bg-[#2A1C16] transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenClientModal(client)}
                            title="Editar cliente"
                            className="p-1.5 rounded-lg text-[#A09388] hover:text-[#1E1611] dark:hover:text-[#F5EFE8] hover:bg-[#FAF6F0] dark:hover:bg-[#221B17] transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleAnonymizeClient(client)}
                            title="Anonimizar Dados (LGPD Art. 18, VI — Direito ao Esquecimento)"
                            className="p-1.5 rounded-lg text-[#A09388] hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                          >
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClient(client.id, client.name)}
                            title="Remover cliente"
                            className="p-1.5 rounded-lg text-[#A09388] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
              {clients.map((client) => {
                const bDateFormatted = client.birthDate
                  ? new Date(client.birthDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
                  : 'Não informada';

                return (
                  <div key={client.id} className="p-4 space-y-3">
                    {/* Header do Card */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-semibold text-sm text-[#1E1611] dark:text-[#F5EFE8]">
                            {client.name}
                          </h4>
                          {client.isMother && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FDF2EC] text-[#B84E29] border border-[#F6D5C2] dark:bg-[#2D1A14] dark:text-[#F39C74] dark:border-[#522F22]">
                              Mãe
                            </span>
                          )}
                          {client.isFather && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EEF3F8] text-[#2C5282] border border-[#CFDDE8] dark:bg-[#172230] dark:text-[#7EB0D5] dark:border-[#2B3E55]">
                              Pai
                            </span>
                          )}
                        </div>
                        {client.companyName && (
                          <div className="text-[11px] text-[#756557] dark:text-[#B5A599] flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-[#A09388]" /> {client.companyName}
                          </div>
                        )}
                        {client.document && (
                          <div className="text-[10px] text-[#A09388] font-mono mt-0.5">{client.maskedDocument || client.document}</div>
                        )}
                      </div>

                      <StatusBadge status={client.status} />
                    </div>

                    {/* Contatos & Aniversário */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-3 rounded-2xl bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] space-y-0.5">
                        <span className="text-[10px] font-mono uppercase text-[#A09388] block">Aniversário</span>
                        <div className="font-mono text-[#1E1611] dark:text-[#F5EFE8] text-[11px]">
                          {bDateFormatted}
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] space-y-0.5">
                        <span className="text-[10px] font-mono uppercase text-[#A09388] block">Familiares</span>
                        <button
                          onClick={() => handleOpenFamilyModal(client)}
                          className="font-medium text-[#1E1611] dark:text-[#F5EFE8] flex items-center gap-1 hover:underline text-[11px]"
                        >
                          <Heart className="w-3 h-3 text-[#C85A32] dark:text-[#F39C74]" /> {client.familyMembers?.length || 0} pessoa(s)
                        </button>
                      </div>
                    </div>

                    {/* Botões Rápidos de Ação */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t hairline-border">
                      <div className="flex items-center gap-2">
                        {client.phone && (
                          <a
                            href={`https://wa.me/${client.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 rounded-full bg-[#C85A32] hover:bg-[#B34A24] text-white font-medium text-xs flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" /> WhatsApp
                          </a>
                        )}
                        <LgpdBadge
                          consent={client.lgpdConsent}
                          optOutAt={client.optOutAt}
                          source={client.consentSource}
                          onToggle={() => handleToggleLgpd(client)}
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleExportClient(client)}
                          title="Exportar Dados (LGPD)"
                          className="p-1.5 rounded-lg text-[#A09388] hover:bg-[#FAF6F0] dark:hover:bg-[#221B17] hover:text-[#C85A32]"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenClientModal(client)}
                          className="p-1.5 rounded-lg text-[#A09388] hover:bg-[#FAF6F0] dark:hover:bg-[#221B17] hover:text-[#1E1611] dark:hover:text-[#F5EFE8]"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleAnonymizeClient(client)}
                          title="Anonimizar Dados"
                          className="p-1.5 rounded-lg text-[#A09388] hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/40"
                        >
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client.id, client.name)}
                          className="p-1.5 rounded-lg text-[#A09388] hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
          {clientModalError && (
            <ErrorBanner
              error={clientModalError.message}
              solution={clientModalError.solution}
              onClose={() => setClientModalError(null)}
            />
          )}

          {/* Seção 1: Identificação & Contato */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C85A32] dark:text-[#F39C74] flex items-center gap-1.5 border-b hairline-border pb-2">
              <Users className="w-4 h-4" /> Dados Pessoais & Contato
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#756557] dark:text-[#B5A599] mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  placeholder="Ex: Mariana Oliveira da Costa"
                  className="w-full bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] dark:focus:border-[#F39C74] rounded-xl py-2 px-3 text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#756557] dark:text-[#B5A599] mb-1">CPF ou CNPJ</label>
                <input
                  type="text"
                  value={clientForm.document}
                  onChange={(e) => setClientForm({ ...clientForm, document: e.target.value })}
                  placeholder="000.000.000-00"
                  className="w-full bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] dark:focus:border-[#F39C74] rounded-xl py-2 px-3 text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none font-mono transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#756557] dark:text-[#B5A599] mb-1">Telefone / WhatsApp *</label>
                <input
                  type="text"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                  placeholder="+5511999999999"
                  className="w-full bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] dark:focus:border-[#F39C74] rounded-xl py-2 px-3 text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none font-mono transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#756557] dark:text-[#B5A599] mb-1">E-mail</label>
                <input
                  type="email"
                  value={clientForm.email}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                  placeholder="cliente@exemplo.com.br"
                  className="w-full bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] dark:focus:border-[#F39C74] rounded-xl py-2 px-3 text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#756557] dark:text-[#B5A599] mb-1">Empresa / PJ</label>
                <input
                  type="text"
                  value={clientForm.companyName}
                  onChange={(e) => setClientForm({ ...clientForm, companyName: e.target.value })}
                  placeholder="Empresa onde trabalha"
                  className="w-full bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] dark:focus:border-[#F39C74] rounded-xl py-2 px-3 text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#756557] dark:text-[#B5A599] mb-1">Data de Nascimento</label>
                <input
                  type="date"
                  value={clientForm.birthDate}
                  onChange={(e) => setClientForm({ ...clientForm, birthDate: e.target.value })}
                  className="w-full bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] dark:focus:border-[#F39C74] rounded-xl py-2 px-3 text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#756557] dark:text-[#B5A599] mb-1">Status</label>
                <select
                  value={clientForm.status}
                  onChange={(e) => setClientForm({ ...clientForm, status: e.target.value as any })}
                  className="w-full bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] dark:focus:border-[#F39C74] rounded-xl py-2 px-3 text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none transition-colors"
                >
                  <option value="ACTIVE">Ativo</option>
                  <option value="INACTIVE">Inativo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Seção 2: Segmentação Inteligente para Datas Comemorativas */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C85A32] dark:text-[#F39C74] flex items-center gap-1.5 border-b hairline-border pb-2">
              <Sparkles className="w-4 h-4" /> Segmentação Familiar & Gênero
            </h4>
            <p className="text-xs text-[#756557] dark:text-[#B5A599]">
              Estes campos permitem que o sistema filtre automaticamente o cliente em datas como Dia das Mães, Dia dos Pais, Dia da Mulher, etc.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-[#756557] dark:text-[#B5A599] mb-1">Gênero / Sexo</label>
                <select
                  value={clientForm.gender || 'NOT_SPECIFIED'}
                  onChange={(e) => setClientForm({ ...clientForm, gender: e.target.value as any })}
                  className="w-full bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] dark:focus:border-[#F39C74] rounded-xl py-2 px-3 text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none transition-colors"
                >
                  <option value="NOT_SPECIFIED">Não Informado</option>
                  <option value="FEMALE">Feminino (Mulher)</option>
                  <option value="MALE">Masculino (Homem)</option>
                  <option value="OTHER">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#756557] dark:text-[#B5A599] mb-1">Profissão / Ocupação (Opcional)</label>
                <input
                  type="text"
                  value={clientForm.profession}
                  onChange={(e) => setClientForm({ ...clientForm, profession: e.target.value })}
                  placeholder="Ex: Médico(a), Advogado(a), Professor(a)"
                  className="w-full bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] dark:focus:border-[#F39C74] rounded-xl py-2 px-3 text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none transition-colors"
                />
              </div>

              <div className="sm:col-span-2 flex flex-wrap gap-4 p-3.5 rounded-2xl bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D]">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-[#1E1611] dark:text-[#F5EFE8]">
                  <input
                    type="checkbox"
                    checked={clientForm.isMother}
                    onChange={(e) => setClientForm({ ...clientForm, isMother: e.target.checked })}
                    className="w-4 h-4 rounded text-[#C85A32] focus:ring-[#C85A32] border-[#EDE5DC] dark:border-[#2A211D]"
                  />
                  <span>🌸 É Mãe (Receber felicitações no Dia das Mães)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-[#1E1611] dark:text-[#F5EFE8]">
                  <input
                    type="checkbox"
                    checked={clientForm.isFather}
                    onChange={(e) => setClientForm({ ...clientForm, isFather: e.target.checked })}
                    className="w-4 h-4 rounded text-[#2C5282] focus:ring-[#2C5282] border-[#EDE5DC] dark:border-[#2A211D]"
                  />
                  <span>👔 É Pai (Receber felicitações no Dia dos Pais)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Seção 3: Endereço Completo */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C85A32] dark:text-[#F39C74] flex items-center gap-1.5 border-b hairline-border pb-2">
              <MapPin className="w-4 h-4" /> Endereço do Cliente
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-[#756557] dark:text-[#B5A599] mb-1">
                  CEP {loadingClientCep && <span className="text-[10px] text-[#C85A32] font-normal">(Buscando...)</span>}
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
                  className="w-full bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] dark:focus:border-[#F39C74] rounded-xl py-2 px-3 text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none font-mono transition-colors"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#756557] dark:text-[#B5A599] mb-1">Logradouro (Rua / Av)</label>
                <input
                  type="text"
                  value={clientForm.address}
                  onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                  placeholder="Ex: Av. Paulista"
                  className="w-full bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] dark:focus:border-[#F39C74] rounded-xl py-2 px-3 text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#756557] dark:text-[#B5A599] mb-1">Número</label>
                <input
                  type="text"
                  value={clientForm.addressNumber}
                  onChange={(e) => setClientForm({ ...clientForm, addressNumber: e.target.value })}
                  placeholder="1000"
                  className="w-full bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] dark:focus:border-[#F39C74] rounded-xl py-2 px-3 text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#756557] dark:text-[#B5A599] mb-1">Complemento</label>
                <input
                  type="text"
                  value={clientForm.addressComplement}
                  onChange={(e) => setClientForm({ ...clientForm, addressComplement: e.target.value })}
                  placeholder="Apto 101, Bloco B"
                  className="w-full bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] dark:focus:border-[#F39C74] rounded-xl py-2 px-3 text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#756557] dark:text-[#B5A599] mb-1">Bairro</label>
                <input
                  type="text"
                  value={clientForm.neighborhood}
                  onChange={(e) => setClientForm({ ...clientForm, neighborhood: e.target.value })}
                  placeholder="Bela Vista"
                  className="w-full bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] dark:focus:border-[#F39C74] rounded-xl py-2 px-3 text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none transition-colors"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#756557] dark:text-[#B5A599] mb-1">Cidade</label>
                <input
                  type="text"
                  value={clientForm.city}
                  onChange={(e) => setClientForm({ ...clientForm, city: e.target.value })}
                  placeholder="São Paulo"
                  className="w-full bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] dark:focus:border-[#F39C74] rounded-xl py-2 px-3 text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#756557] dark:text-[#B5A599] mb-1">Estado (UF)</label>
                <input
                  type="text"
                  maxLength={2}
                  value={clientForm.state}
                  onChange={(e) => setClientForm({ ...clientForm, state: e.target.value.toUpperCase() })}
                  placeholder="SP"
                  className="w-full bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] dark:focus:border-[#F39C74] rounded-xl py-2 px-3 text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none uppercase font-mono transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#756557] dark:text-[#B5A599] mb-1">Notas / Observações</label>
            <textarea
              rows={2}
              value={clientForm.notes}
              onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
              placeholder="Preferências, histórico de relacionamento..."
              className="w-full bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] dark:focus:border-[#F39C74] rounded-xl py-2 px-3 text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none transition-colors"
            />
          </div>

          {/* Seção 4: Governança LGPD */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 border-b hairline-border pb-2">
              <ShieldCheck className="w-4 h-4" /> Governança de Privacidade & LGPD (Art. 7º e 18)
            </h4>

            <div className="p-3.5 rounded-2xl bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] space-y-3">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="lgpdConsent"
                  checked={clientForm.lgpdConsent}
                  onChange={(e) => setClientForm({ ...clientForm, lgpdConsent: e.target.checked })}
                  className="w-4 h-4 mt-0.5 rounded text-emerald-600 bg-white dark:bg-[#1A1513] border-[#EDE5DC] dark:border-[#2A211D]"
                />
                <div>
                  <span className="text-xs font-semibold text-[#1E1611] dark:text-[#F5EFE8] block">
                    Consentimento LGPD Ativo
                  </span>
                  <span className="text-[11px] text-[#756557] dark:text-[#B5A599]">
                    O titular concedeu consentimento para armazenamento de dados e envio de mensagens comemorativas.
                  </span>
                </div>
              </label>

              {clientForm.lgpdConsent && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t hairline-border">
                  <div>
                    <label className="block text-[11px] font-medium text-[#756557] dark:text-[#B5A599] mb-1">
                      Origem / Fonte do Consentimento *
                    </label>
                    <select
                      value={clientForm.consentSource}
                      onChange={(e) => setClientForm({ ...clientForm, consentSource: e.target.value })}
                      className="w-full bg-white dark:bg-[#1A1513] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] rounded-xl py-1.5 px-2.5 text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none"
                    >
                      <option value="MANUAL">Cadastro Manual / Presencial</option>
                      <option value="WHATSAPP">Conversa de WhatsApp</option>
                      <option value="CONTRATO">Cláusula Contratual</option>
                      <option value="FORMULARIO">Formulário Digital / Site</option>
                      <option value="VERBAL">Acordo Verbal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#756557] dark:text-[#B5A599] mb-1">
                      Observação / Evidência (Opcional)
                    </label>
                    <input
                      type="text"
                      value={clientForm.consentNote}
                      onChange={(e) => setClientForm({ ...clientForm, consentNote: e.target.value })}
                      placeholder="Ex: Assinado na proposta 1024"
                      className="w-full bg-white dark:bg-[#1A1513] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] rounded-xl py-1.5 px-2.5 text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t hairline-border">
            <button
              type="button"
              onClick={() => setIsClientModalOpen(false)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-terracotta"
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
          <form onSubmit={handleSaveFamilyMember} className="p-4 rounded-3xl bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] space-y-4">
            {familyModalError && (
              <ErrorBanner
                error={familyModalError.message}
                solution={familyModalError.solution}
                onClose={() => setFamilyModalError(null)}
              />
            )}

            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#C85A32] dark:text-[#F39C74]">
                {editingFamilyMember ? 'Editar Familiar' : '+ Adicionar Novo Familiar'}
              </h4>

              {selectedClientForFamily && (
                <button
                  type="button"
                  onClick={handleCopyClientAddressToFamily}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDF6F0] dark:bg-[#2A1C16] border border-[#F5D2BF] dark:border-[#4C2D20] text-[#C85A32] dark:text-[#F39C74] text-[11px] font-semibold hover:bg-[#FAF0E6] transition-colors"
                >
                  <Home className="w-3.5 h-3.5" /> Usar mesmo endereço do cliente
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#756557] dark:text-[#B5A599] mb-1">Nome do Familiar *</label>
                <input
                  type="text"
                  required
                  value={familyForm.name}
                  onChange={(e) => setFamilyForm({ ...familyForm, name: e.target.value })}
                  placeholder="Ex: Dona Helena Silveira"
                  className="w-full bg-white dark:bg-[#1A1513] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] rounded-xl py-2 px-3 text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#756557] dark:text-[#B5A599] mb-1">Parentesco *</label>
                <select
                  value={familyForm.relationship}
                  onChange={(e) => {
                    const newRel = e.target.value as any;
                    const suggestedGender = inferGenderFromRelationship(newRel);
                    setFamilyForm({
                      ...familyForm,
                      relationship: newRel,
                      gender: suggestedGender !== 'NOT_SPECIFIED' ? suggestedGender : familyForm.gender,
                    });
                  }}
                  className="w-full bg-white dark:bg-[#1A1513] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] rounded-xl py-2 px-3 text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none"
                >
                  {Object.entries(RELATIONSHIP_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#756557] dark:text-[#B5A599] mb-1">Gênero / Sexo *</label>
                <select
                  value={familyForm.gender || 'NOT_SPECIFIED'}
                  onChange={(e) => setFamilyForm({ ...familyForm, gender: e.target.value as any })}
                  className="w-full bg-white dark:bg-[#1A1513] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] rounded-xl py-2 px-3 text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none"
                >
                  <option value="NOT_SPECIFIED">Não Informado</option>
                  <option value="FEMALE">Feminino (Mulher)</option>
                  <option value="MALE">Masculino (Homem)</option>
                  <option value="OTHER">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#756557] dark:text-[#B5A599] mb-1">Data de Nascimento *</label>
                <input
                  type="date"
                  required
                  value={familyForm.birthDate}
                  onChange={(e) => setFamilyForm({ ...familyForm, birthDate: e.target.value })}
                  className="w-full bg-white dark:bg-[#1A1513] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] rounded-xl py-2 px-3 text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#756557] dark:text-[#B5A599] mb-1">Telefone (Opcional - LGPD)</label>
                <input
                  type="text"
                  value={familyForm.phone}
                  onChange={(e) => setFamilyForm({ ...familyForm, phone: e.target.value })}
                  placeholder="+55..."
                  className="w-full bg-white dark:bg-[#1A1513] border border-[#EDE5DC] dark:border-[#2A211D] focus:border-[#C85A32] rounded-xl py-2 px-3 text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none font-mono"
                />
              </div>
            </div>

            {/* Governança LGPD do Familiar & Menores */}
            <div className="pt-2 border-t hairline-border space-y-2.5">
              <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Governança LGPD & Proteção a Menores
              </div>

              <div className="space-y-2 p-3 rounded-2xl bg-white dark:bg-[#1A1513] border border-[#EDE5DC] dark:border-[#2A211D]">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={familyForm.consentHolderConfirmed}
                    onChange={(e) => setFamilyForm({ ...familyForm, consentHolderConfirmed: e.target.checked })}
                    className="w-4 h-4 mt-0.5 rounded text-emerald-600 bg-white dark:bg-[#1A1513] border-[#EDE5DC] dark:border-[#2A211D]"
                  />
                  <div>
                    <span className="text-xs font-semibold text-[#1E1611] dark:text-[#F5EFE8] block">
                      Consentimento do Titular Confirmado
                    </span>
                    <span className="text-[11px] text-[#756557] dark:text-[#B5A599]">
                      O titular principal autorizou expressamente o cadastro deste familiar.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2 cursor-pointer select-none pt-2 border-t hairline-border">
                  <input
                    type="checkbox"
                    checked={familyForm.allowMinorNotifications}
                    onChange={(e) => setFamilyForm({ ...familyForm, allowMinorNotifications: e.target.checked })}
                    className="w-4 h-4 mt-0.5 rounded text-[#C85A32] bg-white dark:bg-[#1A1513] border-[#EDE5DC] dark:border-[#2A211D]"
                  />
                  <div>
                    <span className="text-xs font-semibold text-[#1E1611] dark:text-[#F5EFE8] block">
                      Permitir Notificações se Menor de 18 Anos (Exceção Registrada)
                    </span>
                    <span className="text-[11px] text-[#756557] dark:text-[#B5A599]">
                      Por padrão, o sistema protege menores e não gera mensagens diretas sem autorização prévia.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Endereço do Familiar */}
            <div className="pt-2 border-t hairline-border space-y-2.5">
              <div className="text-[11px] font-bold text-[#756557] dark:text-[#B5A599] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#C85A32]" /> Endereço do Familiar (Opcional)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] font-medium text-[#756557] dark:text-[#B5A599] mb-0.5">
                    CEP {loadingFamilyCep && <span className="text-[#C85A32]">(Buscando...)</span>}
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
                    className="w-full bg-white dark:bg-[#1A1513] border border-[#EDE5DC] dark:border-[#2A211D] rounded-xl py-1.5 px-2.5 text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-medium text-[#756557] dark:text-[#B5A599] mb-0.5">Logradouro / Rua</label>
                  <input
                    type="text"
                    value={familyForm.address}
                    onChange={(e) => setFamilyForm({ ...familyForm, address: e.target.value, sameAddressAsClient: false })}
                    placeholder="Rua, Avenida..."
                    className="w-full bg-white dark:bg-[#1A1513] border border-[#EDE5DC] dark:border-[#2A211D] rounded-xl py-1.5 px-2.5 text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-[#756557] dark:text-[#B5A599] mb-0.5">Número</label>
                  <input
                    type="text"
                    value={familyForm.addressNumber}
                    onChange={(e) => setFamilyForm({ ...familyForm, addressNumber: e.target.value, sameAddressAsClient: false })}
                    placeholder="123"
                    className="w-full bg-white dark:bg-[#1A1513] border border-[#EDE5DC] dark:border-[#2A211D] rounded-xl py-1.5 px-2.5 text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-[#756557] dark:text-[#B5A599] mb-0.5">Complemento</label>
                  <input
                    type="text"
                    value={familyForm.addressComplement}
                    onChange={(e) => setFamilyForm({ ...familyForm, addressComplement: e.target.value, sameAddressAsClient: false })}
                    placeholder="Apto, Bloco"
                    className="w-full bg-white dark:bg-[#1A1513] border border-[#EDE5DC] dark:border-[#2A211D] rounded-xl py-1.5 px-2.5 text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-[#756557] dark:text-[#B5A599] mb-0.5">Bairro</label>
                  <input
                    type="text"
                    value={familyForm.neighborhood}
                    onChange={(e) => setFamilyForm({ ...familyForm, neighborhood: e.target.value, sameAddressAsClient: false })}
                    placeholder="Bairro"
                    className="w-full bg-white dark:bg-[#1A1513] border border-[#EDE5DC] dark:border-[#2A211D] rounded-xl py-1.5 px-2.5 text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-medium text-[#756557] dark:text-[#B5A599] mb-0.5">Cidade</label>
                  <input
                    type="text"
                    value={familyForm.city}
                    onChange={(e) => setFamilyForm({ ...familyForm, city: e.target.value, sameAddressAsClient: false })}
                    placeholder="Cidade"
                    className="w-full bg-white dark:bg-[#1A1513] border border-[#EDE5DC] dark:border-[#2A211D] rounded-xl py-1.5 px-2.5 text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-[#756557] dark:text-[#B5A599] mb-0.5">UF</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={familyForm.state}
                    onChange={(e) => setFamilyForm({ ...familyForm, state: e.target.value.toUpperCase(), sameAddressAsClient: false })}
                    placeholder="BA"
                    className="w-full bg-white dark:bg-[#1A1513] border border-[#EDE5DC] dark:border-[#2A211D] rounded-xl py-1.5 px-2.5 text-xs text-[#1E1611] dark:text-[#F5EFE8] outline-none uppercase font-mono"
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
                      gender: 'FEMALE',
                      relationship: 'MOTHER',
                      birthDate: '',
                      phone: '',
                      email: '',
                      consentHolderConfirmed: true,
                      allowMinorNotifications: false,
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
                  className="btn-secondary"
                >
                  Cancelar Edição
                </button>
              )}
              <button
                type="submit"
                className="btn-terracotta"
              >
                {editingFamilyMember ? 'Atualizar Familiar' : 'Adicionar Familiar'}
              </button>
            </div>
          </form>

          {/* Lista de Familiares Existentes */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#1E1611] dark:text-[#F5EFE8]">
              Familiares Cadastrados ({selectedClientForFamily?.familyMembers?.length || 0})
            </h4>

            {(!selectedClientForFamily?.familyMembers || selectedClientForFamily.familyMembers.length === 0) ? (
              <p className="text-xs text-[#A09388] py-4 text-center">Nenhum familiar cadastrado para este cliente.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {selectedClientForFamily.familyMembers.map((fm) => {
                  const fmLocation = [fm.address, fm.neighborhood, fm.city, fm.state].filter(Boolean).join(', ');

                  return (
                    <div
                      key={fm.id}
                      className="p-3.5 rounded-2xl bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D] flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-semibold text-[#1E1611] dark:text-[#F5EFE8]">{fm.name}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FDF2EC] text-[#B84E29] border border-[#F6D5C2] dark:bg-[#2D1A14] dark:text-[#F39C74] dark:border-[#522F22]">
                            {RELATIONSHIP_LABELS[fm.relationship] || fm.relationship}
                          </span>
                          {fm.gender === 'FEMALE' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F3ECE4] text-[#756557] border border-[#EDE5DC] dark:bg-[#221B17] dark:text-[#B5A599] dark:border-[#2A211D]">
                              Feminino
                            </span>
                          )}
                          {fm.gender === 'MALE' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F3ECE4] text-[#756557] border border-[#EDE5DC] dark:bg-[#221B17] dark:text-[#B5A599] dark:border-[#2A211D]">
                              Masculino
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#756557] dark:text-[#B5A599] flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="w-3 h-3 text-[#A09388]" />
                            {new Date(fm.birthDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                          </span>
                          {fm.phone && <span className="font-mono">• {fm.phone}</span>}
                        </div>
                        {fmLocation && (
                          <div className="text-[10px] text-[#A09388] flex items-center gap-1 mt-0.5 truncate" title={fmLocation}>
                            <MapPin className="w-2.5 h-2.5 text-[#C85A32] shrink-0" />
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
                              gender: (fm.gender as any) || inferGenderFromRelationship(fm.relationship),
                              relationship: fm.relationship,
                              birthDate: fm.birthDate ? fm.birthDate.split('T')[0] : '',
                              phone: fm.phone || '',
                              email: fm.email || '',
                              consentHolderConfirmed: fm.consentHolderConfirmed ?? true,
                              allowMinorNotifications: Boolean(fm.allowMinorNotifications),
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
                          className="p-1.5 text-[#A09388] hover:text-[#1E1611] dark:hover:text-[#F5EFE8] hover:bg-white dark:hover:bg-[#1A1513] rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFamilyMember(fm.id, fm.name)}
                          className="p-1.5 text-[#A09388] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
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

          <div className="flex justify-end pt-2 border-t hairline-border">
            <button
              type="button"
              onClick={() => setIsFamilyModalOpen(false)}
              className="btn-secondary"
            >
              Fechar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal LGPD Exportação de Dados (Portabilidade - Art. 18, V) */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => {
          setIsExportModalOpen(false);
          setExportDataContent(null);
        }}
        title="Relatório de Portabilidade de Dados (LGPD Art. 18, V)"
        subtitle="Visualização e extração de todos os dados pessoais e registros vinculados a este titular"
        maxWidth="2xl"
      >
        <div className="space-y-4">
          {exportLoading ? (
            <div className="py-12 text-center text-[#A09388] text-xs animate-pulse">
              Gerando relatório de portabilidade de dados...
            </div>
          ) : exportDataContent ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs">
                <div className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Relatório emitido em conformidade com o Art. 18, V da Lei Geral de Proteção de Dados.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(exportDataContent, null, 2));
                      setCopiedExport(true);
                      setTimeout(() => setCopiedExport(false), 2000);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white dark:bg-[#18181B] border border-emerald-300 dark:border-emerald-700 text-[#1E1611] dark:text-[#F5EFE8] hover:bg-stone-50 text-[11px] font-semibold transition-colors"
                  >
                    {copiedExport ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    {copiedExport ? 'Copiado!' : 'Copiar JSON'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(exportDataContent, null, 2)], {
                        type: 'application/json;charset=utf-8;',
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `portabilidade-lgpd-${exportDataContent?.titular?.name?.replace(/\s+/g, '_') || 'cliente'}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    Baixar JSON
                  </button>
                </div>
              </div>

              {/* Prévia dos Dados */}
              <div className="max-h-96 overflow-y-auto rounded-2xl bg-[#FAF6F0] dark:bg-[#120F0D] border border-[#EDE5DC] dark:border-[#2A211D] p-3 text-[11px] font-mono text-[#1E1611] dark:text-[#F5EFE8]">
                <pre className="whitespace-pre-wrap">{JSON.stringify(exportDataContent, null, 2)}</pre>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-[#A09388] text-xs">Nenhum dado retornado.</div>
          )}

          <div className="flex justify-end pt-2 border-t hairline-border">
            <button
              type="button"
              onClick={() => {
                setIsExportModalOpen(false);
                setExportDataContent(null);
              }}
              className="btn-secondary"
            >
              Fechar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
