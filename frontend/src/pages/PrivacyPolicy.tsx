import React from 'react';
import { ShieldCheck, ArrowLeft, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF6F0] dark:bg-[#120F0D] text-[#1E1611] dark:text-[#F5EFE8] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Top bar navigation */}
        <div className="mb-8 flex items-center justify-between">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-[#756557] hover:text-[#1E1611] dark:text-[#B5A599] dark:hover:text-[#F5EFE8] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para o Início
          </a>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#FDF0E6] text-[#B84E29] dark:bg-[#2A1C16] dark:text-[#F39C74] border border-[#F5D2BF] dark:border-[#4C2D20]">
            <AlertCircle className="w-3.5 h-3.5" />
            Texto-base institucional • Versão 1.0
          </span>
        </div>

        {/* Header */}
        <div className="card-warm p-8 mb-6 shadow-panel">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-[#FDF0E6] dark:bg-[#2A1C16] text-[#C85A32] dark:text-[#F39C74] rounded-2xl border border-[#F5D2BF] dark:border-[#4C2D20]">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#A09388]">GOVERNANÇA & PRIVACIDADE</p>
              <h1 className="text-2xl lg:text-3xl font-serif font-normal tracking-tight">Política de Privacidade & Proteção de Dados</h1>
              <p className="text-xs text-[#756557] dark:text-[#B5A599] mt-0.5">
                Em total conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD)
              </p>
            </div>
          </div>
          <p className="text-xs text-[#A09388] font-mono">Última atualização: Outubro de 2026 • Versão 1.0</p>
        </div>

        {/* Content Body */}
        <div className="card-warm p-8 space-y-8 text-xs leading-relaxed shadow-subtle">
          <section>
            <h2 className="text-sm font-semibold text-[#1E1611] dark:text-[#F5EFE8] mb-3 flex items-center gap-2 font-serif">
              <FileText className="w-4 h-4 text-[#C85A32]" />
              1. Visão Geral e Papéis (Controlador vs. Operador)
            </h2>
            <p className="text-[#756557] dark:text-[#B5A599] mb-2">
              O <strong>Vínculo / Enlace CRM</strong> opera na qualidade de <strong>Operador de Dados Pessoais</strong>, disponibilizando infraestrutura de software para gestão de relacionamentos e automação de felicitações.
            </p>
            <p className="text-[#756557] dark:text-[#B5A599]">
              A <strong>Empresa Contratante (Tenant)</strong> atua como <strong>Controladora de Dados Pessoais</strong>, sendo a responsável direta por coletar o consentimento dos titulares, definir a legitimidade do tratamento e gerenciar as solicitações de seus clientes finais.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-[#1E1611] dark:text-[#F5EFE8] mb-3 flex items-center gap-2 font-serif">
              <CheckCircle2 className="w-4 h-4 text-[#C85A32]" />
              2. Dados Coletados e Princípio da Minimização
            </h2>
            <p className="text-[#756557] dark:text-[#B5A599] mb-3">
              Coletamos estritamente os dados necessários para o envio personalizado de felicitações em datas especiais:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#756557] dark:text-[#B5A599]">
              <li><strong>Titulares:</strong> Nome, data de nascimento, telefone/WhatsApp, e-mail, empresa, endereço e gênero/parentesco.</li>
              <li><strong>Familiares:</strong> Nome, parentesco com o titular, data de nascimento, gênero e consentimento do titular.</li>
              <li><strong>Registros de Auditoria:</strong> Endereço IP, data/hora das ações, navegador e logs de envio de mensagens.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-[#1E1611] dark:text-[#F5EFE8] mb-3 flex items-center gap-2 font-serif">
              <ShieldCheck className="w-4 h-4 text-[#C85A32]" />
              3. Direitos dos Titulares (Artigo 18 da LGPD)
            </h2>
            <p className="text-[#756557] dark:text-[#B5A599] mb-3">
              Garantimos diretamente na interface as ferramentas para que o controlador atenda aos direitos previstos no Art. 18 da LGPD:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D]">
                <strong className="text-[#1E1611] dark:text-[#F5EFE8] block mb-1">Portabilidade (Art. 18, V)</strong>
                <span className="text-[#756557] dark:text-[#B5A599]">Exportação completa de todos os dados do cliente e histórico em formato aberto JSON.</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D]">
                <strong className="text-[#1E1611] dark:text-[#F5EFE8] block mb-1">Direito ao Esquecimento (Art. 18, VI)</strong>
                <span className="text-[#756557] dark:text-[#B5A599]">Anonimização irreversível dos dados pessoais mediante confirmação de segurança.</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D]">
                <strong className="text-[#1E1611] dark:text-[#F5EFE8] block mb-1">Revogação de Consentimento (Art. 18, IX)</strong>
                <span className="text-[#756557] dark:text-[#B5A599]">Opção de Opt-out imediato que suspende qualquer notificação automática.</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FAF6F0] dark:bg-[#15100E] border border-[#EDE5DC] dark:border-[#2A211D]">
                <strong className="text-[#1E1611] dark:text-[#F5EFE8] block mb-1">Proteção de Menores (Art. 14)</strong>
                <span className="text-[#756557] dark:text-[#B5A599]">Trava automática de proteção para menores de 18 anos sem envio direto desautorizado.</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
