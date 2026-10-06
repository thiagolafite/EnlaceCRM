# Registro de Decisões de Arquitetura e Segurança (ADR)

Este documento registra todas as decisões técnicas, arquiteturais e de segurança tomadas na evolução do **Enlace CRM v2** para a plataforma SaaS Multi-Tenant.

---

## [ADR-001] Fase 0 — Validação Rígida de Variáveis de Ambiente e Eliminação de Segredos Hardcoded

- **Data**: 2026-10-05
- **Status**: Aprovado e Implementado
- **Contexto**: A aplicação possuía valores padrão inseguros em código (como fallback de `JWT_SECRET`, e-mails e telefones de teste). Além disso, não havia barreira de inicialização se variáveis vitais estivessem ausentes.
- **Decisão**:
  1. Utilizar **Zod** em `backend/src/config/index.ts` para validar estritamente `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET` (mínimo 32 caracteres), `APP_URL`, `CORS_ORIGINS`, `CRON_SECRET` e `MASTER_EMAIL` no momento do boot. Caso alguma falte, o processo aborta imediatamente.
  2. Eliminar o e-mail do `MASTER` hardcoded do código-fonte e interfaces (`AuthService`, `LogController`, `Layout`, `Users`, `Monitoring`). O papel de `MASTER` é estritamente controlado pela coluna `role` persistida no banco de dados.
  3. Desacoplar a criação de usuário administrador padrão: o seed só gera administradores caso as variáveis `BOOTSTRAP_ADMIN_EMAIL` e `BOOTSTRAP_ADMIN_PASSWORD` estejam explicitamente definidas no ambiente de execução.
  4. Eliminar telefones pessoais e credenciais padrão de schemas, seeds, controllers e telas frontend.
  5. Consolidar os scripts de seed em um único arquivo idempotente (`backend/prisma/seed.ts`), movendo rotinas utilitárias para `backend/scripts/`.
- **Consequências**: Maior segurança operacional, conformidade com os princípios de 12-Factor App e eliminação de vazamentos acidentais de credenciais em repositórios.

---

## [ADR-002] Fase 1 — Isolamento Multi-Tenant, RBAC Granular e Endurecimento de Segurança

- **Data**: 2026-10-05
- **Status**: Aprovado e Implementado
- **Contexto**: O sistema operava originalmente em modelo single-tenant ou com isolamento parcial frágil, permitindo vazamento de dados entre empresas, acesso desprotegido a rotas administrativas e armazenamento em texto puro de credenciais de integração.
- **Decisão**:
  1. **Modelo de Dados Multi-Tenant**: Criação da entidade `Company` com relação 1:N com `User`, `Client`, `Alert` e 1:1 com `CompanySettings`. As entidades `MessageTemplate` e `CommemorativeDate` agora suportam `companyId` nulo (padrão global do sistema compartilhado) ou preenchido (personalizado pela empresa).
  2. **Isolamento por Escopo e 404 para Não Pertencentes**: Aplicação do helper `scopeByCompany(user)` em todos os serviços. Consultas por ID utilizam `findFirst({ where: { id, companyId } })` e retornam 404 (evitando ataques de enumeração ou timing attack).
  3. **Criptografia em Repouso**: Chaves de API de terceiros (`callmebotApiKey`) são criptografadas com **AES-256-GCM** com IV aleatório e tag de autenticação. A API nunca retorna a chave em claro para o cliente web (apenas `hasCallmebotApiKey: boolean`).
  4. **Controle de Acesso Baseado em Função (RBAC)**:
     - `OPERATOR`: Permissão de CRUD em Clientes, Familiares e Alertas; somente leitura em Datas e Templates.
     - `ADMIN`: Controle integral sobre sua própria empresa, configurações, usuários da empresa e motor de automação. Protegido contra exclusão/bloqueio do último administrador ativo e contra auto-promoção a `MASTER`.
     - `MASTER`: Gestão global de empresas, aprovação de novos cadastros (`TRIAL`), métricas agregadas e logs de auditoria do sistema.
  5. **Proteção de Autenticação e Timing Attacks**: Implementação de comparação de hash fictício (`bcrypt.compare`) quando o usuário não existe, expiração de token JWT reduzida para 8 horas, e verificação contínua no banco via cache em memória (45 segundos) para revogação imediata de contas bloqueadas.
  6. **Endurecimento de Rede e Middleware**:
     - `helmet` para proteção de cabeçalhos HTTP.
     - `trust proxy` configurado para compatibilidade segura com proxies e Vercel.
     - Limite de payload JSON em 100kb para mitigar negação de serviço.
     - `express-rate-limit` aplicado a endpoints de login (10 / 15 min por IP+email), registro e chamadas gerais de API.
     - Sanitização e mascaramento de senhas, tokens e credenciais em logs de erro e `SystemLog` (retenção padrão de 90 dias).
- **Consequências**: Conformidade com LGPD, isolamento robusto entre diferentes empresas contratantes e segurança reforçada contra vulnerabilidades OWASP Top 10.

---

## [ADR-003] Tratamento de Erros Direcionais com Instruções de Resolução em Todo o Sistema

- **Data**: 2026-10-05
- **Status**: Aprovado e Implementado
- **Contexto**: Erros brutos de banco de dados (Prisma codes `P2002`, `P2025`, falhas de foreign key, timeouts de rede) ou falhas de validação estavam resultando em popups genéricos via `alert()` ou respostas técnicas sem direcionamento ao usuário final sobre o motivo do erro e como solucioná-lo.
- **Decisão**:
  1. **Backend**: Criação do módulo `backend/src/utils/formatError.ts` que intercepta erros do Prisma, Zod, AppError e Express, retornando um contrato JSON estruturado: `{ error: string, solution: string, requestId: string, timestamp: string }`.
  2. **Frontend Service API**: `frontend/src/services/api.ts` atualizado com classe `ApiError` estendendo `Error`, carregando `solution` e `requestId` para que qualquer camada possa exibir orientações claras.
  3. **Componente Visual Unificado (`ErrorBanner`)**: Criação de `frontend/src/components/ErrorBanner.tsx` com visual moderno, suporte a tema claro e escuro, destaque para "Como resolver" com ícone, ação de retentativa (`onRetry`) e fechamento (`onClose`).
  4. **Padronização em Todas as Telas**: Substituição de alertas nativos do navegador por `ErrorBanner` em todas as páginas e modais (`Login`, `Clients`, `Settings`, `Users`, `Templates`, `Calendar`, `Alerts`, `Automation`, `Dashboard`, `Monitoring`).
- **Consequências**: Experiência do usuário (UX) clara e resolutiva, eliminação de stack traces ou detalhes técnicos de infraestrutura visíveis ao usuário final, e facilidade de suporte técnico através do `requestId`.

---

## [ADR-004] Fase 2 — Unificação de Build, TypeScript Strict, Eliminação de Código Morto e Configurações de Deploy

- **Data**: 2026-10-05
- **Status**: Aprovado e Implementado
- **Contexto**: O projeto continha múltiplos módulos órfãos e obsoletos do v1 (`SendHistoryService`, `MessageQueue`, `EmailProvider`, `WhatsAppProvider`, `History.tsx`), configurações permissivas do compilador TypeScript que mascaravam `any` e variáveis não utilizadas, scripts de build fragmentados e ausência de especificações formais para orquestração e deploy em nuvem (Docker, Vercel, Render, Railway).
- **Decisão**:
  1. **Eliminação de Código Morto**: Exclusão de controladores legados, provedores obsoletos e telas não utilizadas, consolidando a arquitetura em torno dos serviços multi-tenant ativos e do provedor CallMeBot/Email moderno.
  2. **TypeScript Strict Mode**: Ativação rigorosa de `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`, `noUnusedLocals: true`, `noUnusedParameters: true` tanto em `backend/tsconfig.json` quanto em `frontend/tsconfig.json`, com correção de todas as declarações não utilizadas.
  3. **Pipeline de Build Unificada**: Script `"build"` no `package.json` raiz orquestra a geração do cliente Prisma, compilação do backend (`tsc`) e compilação do frontend SPA (`vite build` + `copy-dist.js`).
  4. **Containerização Multi-Estágio**:
     - `backend/Dockerfile`: Baseado em `node:20-alpine`, com build separado, execução por usuário não-root `node` e verificação de saúde periódica via `HEALTHCHECK` no endpoint `/health`.
     - `frontend/Dockerfile`: Build otimizado em Node.js com distribuição servida via `nginx:alpine` e roteamento SPA.
     - `docker-compose.yml`: Orquestração local completa com PostgreSQL 16 Alpine com healthcheck e volumes persistentes.
  5. **Configurações de Deploy Prontas para Nuvem**:
     - `vercel.json`: Regras de rewrite SPA e cabeçalhos de segurança HTTP (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`).
     - `render.yaml` & `railway.toml`: Blueprints declarativos com comandos de build, start e monitoramento de saúde `/health`.
- **Consequências**: Repositório limpo, tipagem segura garantida pelo compilador, processos de CI/CD automatizáveis e empacotamento pronto para qualquer provedor de nuvem ou servidor próprio.

---

## [ADR-005] Fase 3 — Fluxo Principal de Automação, Fuso Horário São Paulo, Deduplicação e Cadeia de Notificação

- **Data**: 2026-10-05
- **Status**: Aprovado e Implementado
- **Contexto**: A automação original misturava clientes de diferentes empresas em um único envio para um WhatsApp centralizado, não calculava fusos horários de forma determinística (podendo falhar ao cruzar meia-noite em servidores em UTC), não tratava 29 de fevereiro em anos não bissextos, inferia paternidade/maternidade de forma insegura por gênero, sofria com consultas N+1 ao banco de dados e não possuía chave única de deduplicação nem provedores de contingência caso o CallMeBot falhasse.
- **Decisão**:
  1. **Isolamento por Empresa na Automação (`AutomationService`)**:
     - `scanAndDispatchForCompany(companyId, referenceDate, isDryRun)`: Processa estritamente os clientes, familiares e configurações da empresa alvo.
     - Mesclagem de templates com fallback inteligente (templates personalizados da empresa sobrepõem os modelos globais).
     - Assinatura e contexto com o nome comercial (`tradeName` / `name`) da empresa.
     - Alertas gerados contendo obrigatoriamente `companyId`.
     - Notificação diária enviada diretamente para o telefone e chave do administrador daquela empresa.
  2. **Tratamento de Fuso Horário (`America/Sao_Paulo`) e 29 de Fevereiro**:
     - Centralizado em `backend/src/utils/time.ts` e `backend/src/utils/dateUtils.ts`.
     - Datas de nascimento armazenadas em UTC e avaliadas contra os componentes do dia no fuso de São Paulo (`todayInSaoPaulo`).
     - Clientes/familiares nascidos em 29/02: em anos bissextos disparam em 29/02; em anos não bissextos (como 2025, 2026) disparam automaticamente no dia 28/02.
  3. **Audience Matcher com Regras Estritas**:
     - `MOTHERS_ONLY`: aceita `isMother === true` ou parentesco `MOTHER`. Rejeita inferências genéricas de gênero + filhos.
     - `FATHERS_ONLY`: aceita `isFather === true` ou parentesco `FATHER`.
     - `WOMEN_ONLY` / `MEN_ONLY`: validação estrita do gênero cadastrado.
  4. **Deduplicação e Eliminação de Consultas N+1**:
     - Adicionada coluna `dedupeKey String? @unique` na tabela `Alert` no padrão: `${companyId}|${clientId}|${familyMemberId || 'CLIENT'}|${commemorativeDateId || 'BIRTHDAY'}|${eventType}|${targetSP.year}-${targetSP.month}-${targetSP.day}`.
     - Busca prévia em lote dos alertas existentes e inserção via `createMany({ skipDuplicates: true })`.
     - Script idempotente de migração com suporte a `--dry-run` em `backend/scripts/migrate_dedupe_keys.ts`.
  5. **Cadeia de Notificação com Fallback e Chunking**:
     - Arquitetura de provedores sob interface comum `NotificationProvider`.
     - `CallMeBotProvider`: Normalização E.164, quebra de mensagens longas (>3200 caracteres) em partes numeradas `[Parte X/N]`, sem vazamento de segredos em logs.
     - `UltraMsgProvider`: Provedor WhatsApp alternativo de contingência.
     - `EmailProvider`: Provedor de fallback via e-mail corporativo (`Nodemailer`).
     - `NotificationDispatcher`: Executa a cadeia sequencialmente com até 3 retentativas e backoff exponencial em caso de instabilidade.
  6. **Orquestrador e Monitoramento do Scheduler**:
     - `runGlobalSchedulerTick`: Varre empresas a cada minuto no fuso de São Paulo; o erro em uma empresa é capturado e registrado em `SystemLog` sem interromper as demais.
     - Endpoint `/api/health` retorna latência do banco de dados, `lastCronRunAt` e `lastCronStatus`.
- **Consequências**: Automação multi-tenant 100% isolada, imune a duplicações acidentais de alertas, resiliente a falhas de canal de comunicação e pontual no fuso horário do Brasil.

---

## [ADR-006] Fase 4 — Governança LGPD, Consentimento, Proteção a Menores, Direitos do Titular e Mascaramento de Dados

- **Data**: 2026-10-06
- **Status**: Aprovado e Implementado
- **Contexto**: A plataforma trata dados pessoais (nomes, telefones, aniversários, graus de parentesco, CPF/CNPJ) e precisa garantir plena conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD), com salvaguardas para direitos dos titulares, proteção especial a menores de idade, controle de consentimento, opt-out ágil e anonimização auditável.
- **Decisão**:
  1. **Consentimento e Rastreabilidade (`Client`)**:
     - Campo `lgpdConsent Boolean @default(false)` obrigatório para participação nas rotinas de automação.
     - Registro de origem do consentimento (`consentSource`: 'CONTRATO', 'WHATSAPP', 'FORMULARIO', 'VERBAL', 'MANUAL'), notas de evidência (`consentNote`), data de alteração (`consentUpdatedAt`) e usuário responsável (`consentUpdatedBy`).
     - Script idempotente de migração com suporte a `--dry-run` em `backend/scripts/migrate_lgpd_fields.ts`.
  2. **Proteção Especial a Menores e Familiares (`FamilyMember`)**:
     - Campo `consentHolderConfirmed Boolean @default(false)` para comprovação de que o titular autorizou o cadastro do familiar.
     - Campo `allowMinorNotifications Boolean @default(false)`. O motor de automação calcula dinamicamente a idade no fuso de São Paulo (`calculateAgeSP`) e bloqueia preventivamente qualquer notificação para menores de 18 anos sem exceção expressa.
  3. **Mecanismo Rápido de Opt-Out / Opt-In**:
     - Coluna `optOutAt DateTime?` no titular e familiar.
     - Ações rápidas na interface do painel e no backend (`/clients/:id/opt-out`, `/clients/:id/opt-in`, `/family-members/:id/opt-out`, `/family-members/:id/opt-in`).
     - Titulares ou familiares com opt-out registrado são ignorados em todas as varreduras automáticas.
  4. **Direitos do Titular (Art. 18 da LGPD)**:
     - **Portabilidade de Dados (Art. 18, V)**: Endpoint `GET /clients/:id/export` gera relatório JSON estruturado com todos os dados pessoais, familiares vinculados, histórico de alertas e metadados de consentimento, permitindo visualização, cópia para área de transferência e download de arquivo `.json` no frontend.
     - **Direito ao Esquecimento / Anonimização (Art. 18, VI)**: Endpoint `POST /clients/:id/anonymize` higieniza e substitui permanentemente campos de identificação (nome, telefone, e-mail, documento, endereço e nascimento) por identificadores irreversíveis (`TITULAR_ANONIMIZADO_XXXX`), inativa o cadastro, registra opt-out e grava auditoria no `SystemLog` sem dados pessoais.
  5. **Validação e Mascaramento de CPF/CNPJ**:
     - Utilitário `backend/src/utils/maskDocument.ts` com validação algorítmica de dígitos verificadores módulo 11 (rejeitando sequências homogêneas e dígitos inválidos).
     - Mascaramento em consultas e listagens públicas: `123.***.***-01` e `12.***.***/0001-90`.
  6. **Termos de Uso e Política de Privacidade**:
     - Páginas públicas dedicadas (`/privacy-policy` e `/terms-of-use`) com textos-base editáveis sinalizados como pendentes de revisão jurídica.
     - Checkbox de aceite obrigatório de termos na tela de criação de conta (`User.termsAcceptedAt`, `User.termsVersion`).
  7. **Manual de Governança LGPD**:
     - Documentação jurídica e técnica completa em `docs/LGPD.md`, detalhando a divisão de papéis (Controlador vs. Operador), bases legais aplicáveis (Consentimento Art. 7º, I; Legítimo Interesse Art. 7º, IX; Execução de Contrato Art. 7º, V), sub-processadores autorizados e ciclo de vida de retenção de dados.
- **Consequências**: Conformidade integral com a legislação brasileira de proteção de dados, mitigação de riscos jurídicos para as empresas contratantes e respeito irrestrito à privacidade dos titulares.


