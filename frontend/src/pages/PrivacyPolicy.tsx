import React from 'react';
import { ShieldCheck, ArrowLeft, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F1F3F5] dark:bg-[#111418] text-[#1A1E24] dark:text-[#F1F3F5] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Top bar navigation */}
        <div className="mb-8 flex items-center justify-between">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-[#6C757D] hover:text-[#1A1E24] dark:text-[#ADB5BD] dark:hover:text-[#F1F3F5] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para o Início
          </a>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#FFFFFF] text-[#C85A32] dark:bg-[#181C21] dark:text-[#F39C74] border border-[#C85A32]">
            <AlertCircle className="w-3.5 h-3.5" />
            Texto-base institucional • Versão 1.0
          </span>
        </div>

        {/* Header */}
        <div className="card-warm p-8 mb-6 shadow-panel">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-[#FFFFFF] dark:bg-[#14181D] text-[#C85A32] dark:text-[#F39C74] rounded-2xl border border-[#C85A32]/40">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#6C757D] dark:text-[#ADB5BD]">GOVERNANÇA & PRIVACIDADE</p>
              <h1 className="text-2xl lg:text-3xl font-serif font-normal tracking-tight text-[#1A1E24] dark:text-[#F1F3F5]">Política de Privacidade & Proteção de Dados</h1>
              <p className="text-xs text-[#6C757D] dark:text-[#ADB5BD] mt-0.5">
                Em total conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD)
              </p>
            </div>
          </div>
          <p className="text-xs text-[#6C757D] dark:text-[#ADB5BD] font-mono">Última atualização: Outubro de 2026 • Versão 1.0</p>
        </div>

        {/* Content Body */}
        <div className="card-warm p-8 space-y-8 text-xs leading-relaxed shadow-subtle">
          <section>
            <h2 className="text-sm font-semibold text-[#1A1E24] dark:text-[#F1F3F5] mb-3 flex items-center gap-2 font-serif">
              <FileText className="w-4 h-4 text-[#C85A32]" />
              1. Visão Geral e Papéis (Controlador vs. Operador)
            </h2>
            <p className="text-[#495057] dark:text-[#ADB5BD] mb-2">
              O <strong>Vínculo / Enlace CRM</strong> opera na qualidade de <strong>Operador de Dados Pessoais</strong>, disponibilizando infraestrutura de software para gestão de relacionamentos e automação de felicitações.
            </p>
            <p className="text-[#495057] dark:text-[#ADB5BD]">
              A <strong>Empresa Contratante (Tenant)</strong> atua como <strong>Controladora de Dados Pessoais</strong>, sendo a responsável direta por coletar o consentimento dos titulares, definir a legitimidade do tratamento e gerenciar as solicitações de seus clientes finais.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-[#1A1E24] dark:text-[#F1F3F5] mb-3 flex items-center gap-2 font-serif">
              <CheckCircle2 className="w-4 h-4 text-[#C85A32]" />
              2. Dados Coletados e Princípio da Minimização
            </h2>
            <p className="text-[#495057] dark:text-[#ADB5BD] mb-3">
              Coletamos estritamente os dados necessários para o envio personalizado de felicitações em datas especiais:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[#495057] dark:text-[#ADB5BD]">
              <li><strong>Titulares:</strong> Nome, data de nascimento, telefone/WhatsApp, e-mail, empresa, endereço e gênero/parentesco.</li>
              <li><strong>Familiares:</strong> Nome, parentesco com o titular, data de nascimento, gênero e consentimento do titular.</li>
              <li><strong>Registros de Auditoria:</strong> Endereço IP, data/hora das ações, navegador e logs de envio de mensagens.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-[#1A1E24] dark:text-[#F1F3F5] mb-3 flex items-center gap-2 font-serif">
              <ShieldCheck className="w-4 h-4 text-[#C85A32]" />
              3. Direitos dos Titulares (Artigo 18 da LGPD)
            </h2>
            <p className="text-[#495057] dark:text-[#ADB5BD] mb-3">
              Garantimos diretamente na interface as ferramentas para que o controlador atenda aos direitos previstos no Art. 18 da LGPD:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#FFFFFF] dark:bg-[#14181D] border border-[#C85A32]/30">
                <strong className="text-[#1A1E24] dark:text-[#F1F3F5] block mb-1">Portabilidade (Art. 18, V)</strong>
                <span className="text-[#495057] dark:text-[#ADB5BD]">Exportação completa de todos os dados do cliente e histórico em formato aberto JSON.</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FFFFFF] dark:bg-[#14181D] border border-[#C85A32]/30">
                <strong className="text-[#1A1E24] dark:text-[#F1F3F5] block mb-1">Direito ao Esquecimento (Art. 18, VI)</strong>
                <span className="text-[#495057] dark:text-[#ADB5BD]">Anonimização irreversível dos dados pessoais mediante confirmação de segurança.</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FFFFFF] dark:bg-[#14181D] border border-[#C85A32]/30">
                <strong className="text-[#1A1E24] dark:text-[#F1F3F5] block mb-1">Revogação de Consentimento (Art. 18, IX)</strong>
                <span className="text-[#495057] dark:text-[#ADB5BD]">Opção de Opt-out imediato que suspende qualquer notificação automática.</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FFFFFF] dark:bg-[#14181D] border border-[#C85A32]/30">
                <strong className="text-[#1A1E24] dark:text-[#F1F3F5] block mb-1">Proteção de Menores (Art. 14)</strong>
                <span className="text-[#495057] dark:text-[#ADB5BD]">Trava automática de proteção para menores de 18 anos sem envio direto desautorizado.</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
