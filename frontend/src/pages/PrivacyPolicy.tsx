import React from 'react';
import { ShieldCheck, ArrowLeft, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FBFBFA] dark:bg-[#0D0D0E] text-[#171717] dark:text-[#EDEDEA] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Top bar navigation */}
        <div className="mb-8 flex items-center justify-between">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#737373] hover:text-[#171717] dark:text-[#8E8E93] dark:hover:text-[#EDEDEA] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para o Início
          </a>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <AlertCircle className="w-3.5 h-3.5" />
            Texto-base editável • Pendente de revisão jurídica
          </span>
        </div>

        {/* Header */}
        <div className="bg-white dark:bg-[#141416] border border-[#E7E7E4] dark:border-[#242428] rounded-xl p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Política de Privacidade & Proteção de Dados</h1>
              <p className="text-sm text-[#737373] dark:text-[#8E8E93]">
                Em total conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD)
              </p>
            </div>
          </div>
          <p className="text-xs text-[#8E8E93]">Última atualização: Outubro de 2026 • Versão 1.0</p>
        </div>

        {/* Content Body */}
        <div className="bg-white dark:bg-[#141416] border border-[#E7E7E4] dark:border-[#242428] rounded-xl p-8 space-y-8 text-sm leading-relaxed shadow-sm">
          <section>
            <h2 className="text-base font-semibold text-[#171717] dark:text-[#EDEDEA] mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" />
              1. Visão Geral e Papéis (Controlador vs. Operador)
            </h2>
            <p className="text-[#737373] dark:text-[#8E8E93] mb-2">
              O <strong>Enlace CRM</strong> opera na qualidade de <strong>Operador de Dados Pessoais</strong>, disponibilizando infraestrutura de software para gestão de relacionamentos e automação de felicitações.
            </p>
            <p className="text-[#737373] dark:text-[#8E8E93]">
              A <strong>Empresa Contratante (Tenant)</strong> atua como <strong>Controladora de Dados Pessoais</strong>, sendo a responsável direta por coletar o consentimento dos titulares, definir a legitimidade do tratamento e gerenciar as solicitações de seus clientes finais.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#171717] dark:text-[#EDEDEA] mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              2. Dados Coletados e Princípio da Minimização
            </h2>
            <p className="text-[#737373] dark:text-[#8E8E93] mb-3">
              Coletamos estritamente os dados necessários para o envio personalizado de felicitações em datas especiais:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#737373] dark:text-[#8E8E93]">
              <li><strong>Titulares:</strong> Nome completo, telefone WhatsApp, e-mail (opcional), data de aniversário, endereço (opcional) e status parental para datas comemorativas.</li>
              <li><strong>Familiares:</strong> Nome, grau de parentesco e data de aniversário. Telefones e e-mails são opcionais.</li>
              <li><strong>Menores de Idade:</strong> O sistema bloqueia comunicações para menores de 18 anos por padrão, exceto com consentimento expressamente registrado pelo titular responsável.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#171717] dark:text-[#EDEDEA] mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              3. Direitos dos Titulares (LGPD Art. 18)
            </h2>
            <p className="text-[#737373] dark:text-[#8E8E93] mb-3">
              Garantimos aos titulares e controladores as seguintes ferramentas de autoatendimento na plataforma:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-[#FBFBFA] dark:bg-[#0D0D0E] border border-[#E7E7E4] dark:border-[#242428]">
                <h3 className="font-medium text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">Portabilidade de Dados</h3>
                <p className="text-xs text-[#737373] dark:text-[#8E8E93]">Exportação instantânea de todo o relatório de dados pessoais em formato JSON estruturado.</p>
              </div>
              <div className="p-4 rounded-lg bg-[#FBFBFA] dark:bg-[#0D0D0E] border border-[#E7E7E4] dark:border-[#242428]">
                <h3 className="font-medium text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">Direito ao Esquecimento</h3>
                <p className="text-xs text-[#737373] dark:text-[#8E8E93]">Anonimização irreversível dos dados cadastrais com limpeza de identificadores pessoais.</p>
              </div>
              <div className="p-4 rounded-lg bg-[#FBFBFA] dark:bg-[#0D0D0E] border border-[#E7E7E4] dark:border-[#242428]">
                <h3 className="font-medium text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">Opt-Out Imediato</h3>
                <p className="text-xs text-[#737373] dark:text-[#8E8E93]">Revogação instantânea de comunicações para o titular ou familiares específicos com 1 clique.</p>
              </div>
              <div className="p-4 rounded-lg bg-[#FBFBFA] dark:bg-[#0D0D0E] border border-[#E7E7E4] dark:border-[#242428]">
                <h3 className="font-medium text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">Criptografia & Mascaramento</h3>
                <p className="text-xs text-[#737373] dark:text-[#8E8E93]">Chaves criptografadas com AES-256-GCM e CPF/CNPJ mascarados nas visualizações.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#171717] dark:text-[#EDEDEA] mb-3">4. Sub-processadores de Dados</h2>
            <p className="text-[#737373] dark:text-[#8E8E93]">
              Para execução da infraestrutura, utilizamos provedores em conformidade com padrões SOC 2 / ISO 27001 (Supabase PostgreSQL, Vercel Edge Network, Render Cloud Runtime e Gateways de Mensageria).
            </p>
          </section>

          <div className="pt-6 border-t border-[#E7E7E4] dark:border-[#242428] flex items-center justify-between text-xs text-[#737373] dark:text-[#8E8E93]">
            <span>Enlace CRM v2 • Sistema Seguro Multi-Tenant</span>
            <a href="/terms-of-use" className="text-emerald-600 dark:text-emerald-400 hover:underline">
              Ver Termos de Uso →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
