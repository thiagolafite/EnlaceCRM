import React from 'react';
import { FileCheck, ArrowLeft, AlertCircle, Scale, Users } from 'lucide-react';

export const TermsOfUse: React.FC = () => {
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
            Termos Gerais • Versão 1.0
          </span>
        </div>

        {/* Header */}
        <div className="card-warm p-8 mb-6 shadow-panel">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-[#FDF0E6] dark:bg-[#2A1C16] text-[#C85A32] dark:text-[#F39C74] rounded-2xl border border-[#F5D2BF] dark:border-[#4C2D20]">
              <FileCheck className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#A09388]">TERMOS & CONDIÇÕES</p>
              <h1 className="text-2xl lg:text-3xl font-serif font-normal tracking-tight">Termos de Uso do Serviço</h1>
              <p className="text-xs text-[#756557] dark:text-[#B5A599] mt-0.5">
                Condições gerais de utilização da plataforma Vínculo / Enlace CRM
              </p>
            </div>
          </div>
          <p className="text-xs text-[#A09388] font-mono">Última atualização: Outubro de 2026 • Versão 1.0</p>
        </div>

        {/* Content Body */}
        <div className="card-warm p-8 space-y-8 text-xs leading-relaxed shadow-subtle">
          <section>
            <h2 className="text-sm font-semibold text-[#1E1611] dark:text-[#F5EFE8] mb-3 flex items-center gap-2 font-serif">
              <Scale className="w-4 h-4 text-[#C85A32]" />
              1. Objeto e Aceitação
            </h2>
            <p className="text-[#756557] dark:text-[#B5A599] mb-2">
              Estes Termos de Uso regulam o acesso e a utilização do software SaaS <strong>Vínculo / Enlace CRM</strong>. Ao criar uma conta ou utilizar a plataforma, o usuário declara ter lido, compreendido e aceito integralmente estas disposições.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-[#1E1611] dark:text-[#F5EFE8] mb-3 flex items-center gap-2 font-serif">
              <Users className="w-4 h-4 text-[#C85A32]" />
              2. Responsabilidades do Usuário Contratante (Controlador)
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-[#756557] dark:text-[#B5A599]">
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
