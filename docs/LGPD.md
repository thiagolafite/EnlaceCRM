# Diretrizes de Conformidade com a LGPD (Lei nº 13.709/2018) — Enlace CRM

Este documento estabelece a governança, as responsabilidades e os procedimentos técnicos e jurídicos aplicáveis ao tratamento de dados pessoais na plataforma **Enlace CRM v2 SaaS**.

---

## 1. Definição de Papéis e Responsabilidades (Art. 5º da LGPD)

| Papel | Entidade | Descrição |
| :--- | :--- | :--- |
| **Controlador** | **Empresa Contratante (Tenant / Cliente SaaS)** | Pessoa jurídica ou natural que utiliza o Enlace CRM para gerenciar sua carteira de clientes, definindo quais dados são coletados e as finalidades das felicitações. |
| **Operador** | **Enlace CRM (Plataforma / Provedor SaaS)** | Responsável técnico por processar, armazenar e automatizar o envio das comunicações estritamente sob as instruções do Controlador e nos termos do contrato de serviço. |
| **Encarregado (DPO)** | Designado pela administração | Canal de comunicação institucional para requisições de titulares e notificações da Autoridade Nacional de Proteção de Dados (ANPD). |

---

## 2. Dados Pessoais Coletados e Finalidades do Tratamento

### 2.1. Titulares (Clientes Finais Cadastrados)
- **Dados Coletados**: Nome completo, CPF/CNPJ (opcional), telefone móvel (E.164), e-mail, data de nascimento, endereço residencial/comercial, gênero, profissão e status de paternidade/maternidade (`isMother`/`isFather`).
- **Finalidade**: Personalização de felicitações em datas comemorativas e aniversários, fortalecimento de relacionamento comercial e envio de lembretes aos operadores da empresa.
- **Base Legal**:
  - *Execução de Contrato e Procedimentos Preliminares* (Art. 7º, Inciso V);
  - *Consentimento Expresso ou Legítimo Interesse* (Art. 7º, Incisos I e IX).

### 2.2. Familiares e Dependentes
- **Dados Coletados**: Nome, grau de parentesco, data de nascimento, gênero e endereço (opcional).
- **Minimização**: Telefones e e-mails de familiares são de preenchimento opcional.
- **Proteção a Crianças e Adolescentes (Art. 14)**:
  - O sistema bloqueia, por padrão, o disparo de notificações e felicitações para menores de 18 anos (`calculateAgeSP < 18`).
  - A inclusão de menores exige registro de consentimento específico e confirmação expressa do titular responsável (`consentHolderConfirmed` e `allowMinorNotifications`).

---

## 3. Direitos dos Titulares (Art. 18 da LGPD)

O Enlace CRM disponibiliza ferramentas nativas no painel para que o Controlador atenda imediatamente às solicitações dos titulares:

1. **Confirmação e Acesso (Art. 18, I e II)**:
   - Visualização transparente de todos os dados do titular e familiares no catálogo de clientes.
2. **Portabilidade dos Dados (Art. 18, V)**:
   - Endpoint nativo `GET /api/clients/:id/export` que gera relatório estruturado em formato JSON interoperável com todo o histórico cadastral, dados familiares, registros de consentimento e histórico de alertas.
3. **Revogação do Consentimento / Opt-Out (Art. 18, IX)**:
   - Botão rápido de Opt-Out (`PATCH /api/clients/:id/opt-out`) que interrompe imediatamente todas as rotinas automatizadas para o titular e seus familiares.
   - Tags de rodapé customizáveis nos templates de mensagem com instruções de cancelamento (ex: *"Responda SAIR para não receber mais comunicações"*).
4. **Direito ao Esquecimento e Anonimização (Art. 18, VI)**:
   - Ação de exclusão/anonimização `POST /api/clients/:id/anonymize` que limpa permanentemente todos os dados de identificação pessoal (CPF, telefone, e-mail, endereço, data de nascimento, notas), substitui o nome por identificador neutro (`TITULAR_ANONIMIZADO_XXXX`) e registra auditoria SOC sem qualquer dado pessoal.

---

## 4. Medidas de Segurança Técnica e Criptografia (Art. 46)

1. **Criptografia em Repouso**:
   - Chaves de integração externa (`callmebotApiKey`) armazenadas com cifra **AES-256-GCM** com IV aleatório e Authentication Tag.
   - Senhas de usuários protegidas com **Bcrypt** (salt rounds = 10) e defesa contra timing attacks.
2. **Mascaramento de Dados Sensíveis**:
   - CPF/CNPJ mascarados em todas as listagens (`123.***.***-01` e `12.***.***/0001-90`).
   - Respostas de API e logs do sistema nunca expõem senhas, tokens ou chaves de API.
3. **Isolamento Rígido Multi-Tenant**:
   - Todas as consultas de banco de dados são obrigatoriamente filtradas pelo `companyId` autenticado (`scopeByCompany`). Tentativas de acesso entre empresas respondem com status HTTP `404 Not Found`.

---

## 5. Sub-processadores Homologados

Para a prestação contínua do serviço, o Enlace CRM utiliza os seguintes provedores de infraestrutura que mantêm conformidade com padrões internacionais de segurança (ISO 27001, SOC 2):

| Sub-processador | Função / Serviço | Localização dos Dados |
| :--- | :--- | :--- |
| **Supabase (PostgreSQL)** | Banco de dados relacional criptografado | AWS Oregon (us-west-2) / São Paulo (sa-east-1) |
| **Render / Railway / Docker** | Execução de aplicação e APIs Backend | EUA / Servidor Próprio |
| **Vercel** | Hospedagem estática de borda (SPA Frontend) | Global Edge Network |
| **CallMeBot / UltraMsg** | Gateway de envio de notificações WhatsApp | Europa / EUA |
| **Nodemailer / SMTP Corporativo** | Envio de e-mails transacionais e fallback | Servidor Dedicado |

---

## 6. Retenção e Descarte de Dados

- **Logs de Auditoria e Sistema (`SystemLog`)**: Retenção automática de **90 dias**, com rotina periódica de expurgo.
- **Histórico de Alertas (`Alert`)**: Retido durante o ciclo de relacionamento do cliente com o tenant contratante ou até solicitação de exclusão.
- **Encerramento da Conta**: Em caso de cancelamento do contrato pelo tenant, os dados podem ser exportados integralmente em até 30 dias antes do descarte permanente do banco de dados.
