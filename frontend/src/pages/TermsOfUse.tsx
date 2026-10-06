import React from 'react';
import { FileCheck, ArrowLeft, AlertCircle, Scale, Users, ShieldAlert } from 'lucide-react';

export const TermsOfUse: React.FC = () => {
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
            <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
              <FileCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Termos de Uso do Serviço</h1>
              <p className="text-sm text-[#737373] dark:text-[#8E8E93]">
                Condições gerais de contratação e utilização da plataforma Enlace CRM
              </p>
            </div>
          </div>
          <p className="text-xs text-[#8E8E93]">Última atualização: Outubro de 2026 • Versão 1.0</p>
        </div>

        {/* Content Body */}
        <div className="bg-white dark:bg-[#141416] border border-[#E7E7E4] dark:border-[#242428] rounded-xl p-8 space-y-8 text-sm leading-relaxed shadow-sm">
          <section>
            <h2 className="text-base font-semibold text-[#171717] dark:text-[#EDEDEA] mb-3 flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-500" />
              1. Objeto e Aceitação
            </h2>
            <p className="text-[#737373] dark:text-[#8E8E93] mb-2">
              Estes Termos de Uso regulam o acesso e a utilização do software SaaS <strong>Enlace CRM</strong>. Ao criar uma conta ou utilizar a plataforma, o usuário declara ter lido, compreendido e aceito integralmente estas disposições.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#171717] dark:text-[#EDEDEA] mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              2. Responsabilidades do Usuário Contratante (Controlador)
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-[#737373] dark:text-[#8E8E93]">
              <li>Garantir a veracidade e a legitimidade dos dados cadastrados de seus clientes e familiares.</li>
              <li>Obter o consentimento prévio dos titulares para o envio de mensagens institucionais e de felicitação.</li>
              <li>Não utilizar o serviço para envio de spam, mensagens ofensivas, conteúdo ilícito ou em violação às políticas de mensageria de terceiros (como WhatsApp/Meta).</li>
              <li>Zelar pela confidencialidade de suas credenciais de acesso e chaves de API.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#171717] dark:text-[#EDEDEA] mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-500" />
              3. Disponibilidade e Limitação de Responsabilidade
            </h2>
            <p className="text-[#737373] dark:text-[#8E8E93] mb-2">
              O Enlace CRM empenha seus melhores esforços para manter a plataforma disponível de forma ininterrupta. No entanto, o funcionamento de canais de terceiros (tais como gateways WhatsApp, CallMeBot e provedores de telecomunicação) está sujeito a termos e estabilidade de suas respectivas redes.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#171717] dark:text-[#EDEDEA] mb-3">4. Planos, Limites e Cancelamento</h2>
            <p className="text-[#737373] dark:text-[#8E8E93]">
              O acesso aos recursos segue a capacidade e os limites de clientes do plano contratado. O contratante pode exportar seus dados a qualquer momento antes do encerramento da assinatura.
            </p>
          </section>

          <div className="pt-6 border-t border-[#E7E7E4] dark:border-[#242428] flex items-center justify-between text-xs text-[#737373] dark:text-[#8E8E93]">
            <span>Enlace CRM v2 • Todos os direitos reservados</span>
            <a href="/privacy-policy" className="text-blue-600 dark:text-blue-400 hover:underline">
              Ver Política de Privacidade →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
