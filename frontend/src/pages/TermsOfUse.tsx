import React from 'react';
import { FileCheck, ArrowLeft, AlertCircle, Scale, Users } from 'lucide-react';

export const TermsOfUse: React.FC = () => {
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
            Termos Gerais • Versão 1.0
          </span>
        </div>

        {/* Header */}
        <div className="card-warm p-8 mb-6 shadow-panel">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-[#FFFFFF] dark:bg-[#14181D] text-[#C85A32] dark:text-[#F39C74] rounded-2xl border border-[#C85A32]/40">
              <FileCheck className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#6C757D] dark:text-[#ADB5BD]">TERMOS & CONDIÇÕES</p>
              <h1 className="text-2xl lg:text-3xl font-serif font-normal tracking-tight text-[#1A1E24] dark:text-[#F1F3F5]">Termos de Uso do Serviço</h1>
              <p className="text-xs text-[#6C757D] dark:text-[#ADB5BD] mt-0.5">
                Condições gerais de utilização da plataforma Vínculo / Enlace CRM
              </p>
            </div>
          </div>
          <p className="text-xs text-[#6C757D] dark:text-[#ADB5BD] font-mono">Última atualização: Outubro de 2026 • Versão 1.0</p>
        </div>

        {/* Content Body */}
        <div className="card-warm p-8 space-y-8 text-xs leading-relaxed shadow-subtle">
          <section>
            <h2 className="text-sm font-semibold text-[#1A1E24] dark:text-[#F1F3F5] mb-3 flex items-center gap-2 font-serif">
              <Scale className="w-4 h-4 text-[#C85A32]" />
              1. Objeto e Aceitação
            </h2>
            <p className="text-[#495057] dark:text-[#ADB5BD] mb-2">
              Estes Termos de Uso regulam o acesso e a utilização do software SaaS <strong>Vínculo / Enlace CRM</strong>. Ao criar uma conta ou utilizar a plataforma, o usuário declara ter lido, compreendido e aceito integralmente estas disposições.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-[#1A1E24] dark:text-[#F1F3F5] mb-3 flex items-center gap-2 font-serif">
              <Users className="w-4 h-4 text-[#C85A32]" />
              2. Responsabilidades do Usuário Contratante (Controlador)
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-[#495057] dark:text-[#ADB5BD]">
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
