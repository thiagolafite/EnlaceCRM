import React from 'react';
import { FileCheck, ArrowLeft, AlertCircle, Scale, Users } from 'lucide-react';

export const TermsOfUse: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F4F4F6] dark:bg-[#18191D] text-[#18191D] dark:text-[#F4F4F6] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Top bar navigation */}
        <div className="mb-8 flex items-center justify-between">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-[#686971] hover:text-[#18191D] dark:text-[#9DA0AA] dark:hover:text-[#F4F4F6] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para o Início
          </a>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#EEEEF1] text-[#18191D] dark:bg-[#24252B] dark:text-[#F4F4F6] border border-[#D7D7DD] dark:border-[#33343A]">
            <AlertCircle className="w-3.5 h-3.5 text-[#686971]" />
            Termos Gerais • Versão 1.0
          </span>
        </div>

        {/* Header */}
        <div className="card-warm p-8 mb-6 shadow-panel">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-[#18191D] dark:bg-[#F4F4F6] text-white dark:text-[#18191D] rounded-2xl border border-[#292A30] dark:border-[#E2E2E8]">
              <FileCheck className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#686971] dark:text-[#9DA0AA]">TERMOS & CONDIÇÕES</p>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#18191D] dark:text-[#F4F4F6]">Termos de Uso do Serviço</h1>
              <p className="text-xs text-[#686971] dark:text-[#9DA0AA] mt-0.5">
                Condições gerais de utilização da plataforma Enlace CRM
              </p>
            </div>
          </div>
          <p className="text-xs text-[#686971] dark:text-[#9DA0AA] font-mono">Última atualização: Outubro de 2026 • Versão 1.0</p>
        </div>

        {/* Content Body */}
        <div className="card-warm p-8 space-y-8 text-xs leading-relaxed shadow-subtle">
          <section>
            <h2 className="text-sm font-bold text-[#18191D] dark:text-[#F4F4F6] mb-3 flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#E54833]" />
              1. Objeto e Aceitação
            </h2>
            <p className="text-[#686971] dark:text-[#9DA0AA] mb-2">
              Estes Termos de Uso regulam o acesso e a utilização do software SaaS <strong className="text-[#18191D] dark:text-[#F4F4F6]">Enlace CRM</strong>. Ao criar uma conta ou utilizar a plataforma, o usuário declara ter lido, compreendido e aceito integralmente estas disposições.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-bold text-[#18191D] dark:text-[#F4F4F6] mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#E54833]" />
              2. Responsabilidades do Usuário Contratante (Controlador)
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-[#686971] dark:text-[#9DA0AA]">
              <li>Garantir a veracidade e a legitimidade dos dados cadastrados de seus clientes e familiares.</li>
              <li>Obter o consentimento prévio dos titulares para o envio de mensagens institucionais e de felicitação.</li>
              <li>Não utilizar o serviço para envio de spam, mensagens ofensivas, conteúdo ilícito ou em violação às políticas de mensageria de terceiros (como WhatsApp/Meta).</li>
              <li>Zelar pela confidencialidade de suas credenciais de acesso e chaves de API.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};
