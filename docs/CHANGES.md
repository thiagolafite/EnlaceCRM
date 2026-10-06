# Registro de Mudanças — Enlace CRM v2 SaaS

Documento de rastreamento das alterações efetuadas em cada fase da transição para SaaS Multiempresa.

---

## 📌 Fase 0 — Segredos e Configuração (Concluída)

### 1. Modificações de Código e Configuração
- **`backend/src/config/index.ts`**:
  - Removido fallback inseguro de `JWT_SECRET`.
  - Implementada validação de schema de variáveis de ambiente com **Zod** no boot (`DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET >= 32 chars`, `APP_URL`, `CORS_ORIGINS`, `CRON_SECRET >= 16 chars`, `MASTER_EMAIL`, `PORT`, `NODE_ENV`). A aplicação bloqueia a inicialização se faltar qualquer chave mandatória.
- **Remoção de Telefones e Contatos Hardcoded**:
  - `backend/src/services/SettingsService.ts`: Default de `ownerWhatsappPhone` alterado para string vazia.
  - `backend/prisma/schema.prisma`: Removidos telefones pessoais de valores padrão e documentações.
  - `frontend/src/pages/Settings.tsx` & `frontend/src/pages/Clients.tsx`: Placeholders e valores padrão normalizados para vazio / exemplos neutros.
- **Remoção de E-mail de Usuário Master Hardcoded**:
  - `backend/src/services/AuthService.ts`: Removida constante `MASTER_EMAIL` e lógica de auto-promover e-mail específico. A verificação agora é 100% orientada à `role` do banco.
  - `backend/src/controllers/LogController.ts`: Autorização restrita a `currentUser.role === 'MASTER'`.
  - `frontend/src/components/Layout.tsx`, `frontend/src/pages/Users.tsx`, `frontend/src/pages/Monitoring.tsx`: Removida checagem por e-mail específico.
- **Consolidação de Seeds e Limpeza**:
  - Criado `backend/prisma/seed.ts` único e idempotente com datas comemorativas e templates pré-configurados.
  - Removidos scripts redundantes de `backend/prisma/` e `dev.db`.
  - Scripts de manutenção movidos para `backend/scripts/`.
  - Removidos scripts `sync` e `push` de `package.json` raiz.
  - `.gitignore` fortalecido contra `.env*`, `*.db`, `prisma/*.js`, etc.

### 2. Novas Variáveis de Ambiente
| Variável | Obrigatória? | Descrição | Exemplo / Padrão |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | Sim | URI Postgres Pooler | `postgresql://...:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Sim | URI Postgres Direta | `postgresql://...:5432/postgres` |
| `JWT_SECRET` | Sim | Chave de assinatura JWT (mínimo 32 chars) | `chave_com_mais_de_32_caracteres_segura` |
| `APP_URL` | Não | URL base do Frontend | `http://localhost:5173` |
| `CORS_ORIGINS` | Não | Origens permitidas | `http://localhost:5173,http://localhost:3333` |
| `CRON_SECRET` | Não | Segredo para disparo do cron interno | `super_cron_secret_enlace_2026` |
| `MASTER_EMAIL` | Não | E-mail do Master para bootstrap | `master@enlacecrm.com.br` |
| `BOOTSTRAP_ADMIN_EMAIL` | Opcional | E-mail do Admin a criar no seed | `admin@suaempresa.com.br` |
| `BOOTSTRAP_ADMIN_PASSWORD` | Opcional | Senha do Admin a criar no seed | `senha_segura_min_10` |

---

## 📌 Fase 1 — Multi-Tenant e Permissões (Concluída)

### 1. Modificações de Modelo e Banco de Dados
- **`backend/prisma/schema.prisma`**:
  - Adicionado modelo `Company` (`id`, `name`, `tradeName`, `document`, `status: TRIAL|ACTIVE|SUSPENDED|CANCELED`, `plan: STARTER|PRO|ENTERPRISE`, `maxClients`, `trialEndsAt`).
  - Adicionado modelo `CompanySettings` (relação 1:1 com `Company`, com campos `callmebotApiKeyIv` e `callmebotApiKeyTag` para suporte a criptografia AES-256-GCM).
  - FK `companyId` obrigatória em `User`, `Client`, `Alert` e `CompanySettings`.
  - FK `companyId` opcional em `MessageTemplate` e `CommemorativeDate` (nulo = modelo global compartilhado).
  - Índices multi-tenant criados em `[companyId, status]`, `[companyId, alertDate]`, `[companyId, notificationStatus]`, `[companyId, active]`, etc.
  - Criado script de migração idempotente `backend/scripts/migrate_tenants.ts` com flag `--dry-run`.

### 2. Isolamento e Regras de Negócio Multi-Tenant
- **Helper `scopeByCompany` e AppError 404**:
  - Aplicado em todos os serviços (`ClientService`, `FamilyMemberService`, `AlertService`, `SettingsService`, `TemplateService`, `CommemorativeDateService`, `UserService`, `AutomationService`).
  - Consultas por ID utilizam `findFirst({ where: { id, ...scopeByCompany(user) } })` e retornam `404` em caso de incompatibilidade de tenant, evitando enumeração de recursos.
- **Criptografia de Segredos em Repouso**:
  - Implementado `backend/src/utils/crypto.ts` com cifra `AES-256-GCM` para chaves de terceiros (`callmebotApiKey`).
  - API sanitizada para retornar `hasCallmebotApiKey: boolean`, mascarando ou omitindo o valor real na resposta.
- **Controle de Acesso RBAC**:
  - Middleware `requireRole` protegendo rotas críticas (`/users*`, `/logs*`, `/settings*`, `/automation*`, `/commemorative-dates`, `/templates`).
  - `OPERATOR`: Permissões restritas a clientes, familiares e alertas (leitura de templates/datas).
  - `ADMIN`: Controle de recursos de sua empresa; impossibilitado de criar/promover para `MASTER`, mudar o próprio perfil ou excluir/bloquear o último `ADMIN` da empresa.
  - `MASTER`: Visualização de logs e métricas agregadas globais, aprovação de novos cadastros e manutenção de datas/templates globais.
- **Autenticação Reforçada**:
  - Dummy `bcrypt.compare` implementado em `AuthService.login` contra ataques de temporização (timing attacks).
  - Validade do token JWT reduzida de 7 dias para 8 horas.
  - `authMiddleware` com cache em memória (45s) e checagem de contas bloqueadas ou pendentes de aprovação.
  - Novo cadastro (`register`) cria automaticamente uma nova `Company` com status `TRIAL` e usuário `ADMIN` com status `PENDING_APPROVAL`.

### 3. Endurecimento de Segurança
- **`backend/src/app.ts`**:
  - Ativação do `helmet` para proteção de cabeçalhos HTTP.
  - `trust proxy` ativado para compatibilidade com gateways e proxies reversos.
  - Limite estrito de 100kb para payloads JSON.
  - `express-rate-limit` aplicado ao login (10 / 15 min por IP+email), registro e API geral.
  - Global error handler estruturado com classes tipadas `AppError`, geração de `requestId` e mascaramento de campos confidenciais nos logs.
  - Retenção de `SystemLog` configurada para 90 dias com sanitização de passwords/tokens.

---

## 📌 Melhoria de UX & Suporte — Mensagens de Erro Direcionais em Todo o Sistema

### 1. Backend (`backend/src/utils/formatError.ts`)
- Implementado formatador e tradutor automático de erros de banco de dados (códigos Prisma `P2002`, `P2025`, `P2003`, `P2021`, etc.), erros de validação Zod e `AppError`.
- Respostas padronizadas com contrato estruturado:
  - `error`: Explicação clara e em linguagem acessível sobre o que impediu a operação.
  - `solution`: Ação direta e prática indicando ao usuário exatamente como resolver (ex: "Verifique o formato do CPF", "Informe outro e-mail", "Remova os vínculos antes de excluir").
  - `requestId`: Identificador UUID único para rastreamento no painel de auditoria do Master.

### 2. Frontend (`frontend/src/components/ErrorBanner.tsx`)
- Criado componente `ErrorBanner` visualmente elegante com suporte a tema claro e escuro.
- Exibição destacada da seção **"Como resolver:"**.
- Botão de retentativa rápida (`Tentar Novamente`) e botão de fechar.

### 3. Telas e Modais Integrados
- `Login.tsx`: Notificações de bloqueio, pendência de aprovação e credenciais incorretas com passos claros.
- `Clients.tsx`: Tratamento no formulário de titulares e formulário de familiares.
- `Settings.tsx`: Feedback na atualização cadastral, configuração e teste de conexão do CallMeBot.
- `Users.tsx`: Validações de senha, permissões e aprovação de usuários.
- `Templates.tsx`: Validações de tags, salvamento e preview em tempo real.
- `Calendar.tsx`: Validação de datas fixas e envio de felicitações.
- `Alerts.tsx`: Execução de varredura e alteração de status de envio.
- `Automation.tsx`: Execução imediata e simulador de datas (dry-run).
- `Dashboard.tsx`: Monitoramento e disparo rápido de automação.
- `Monitoring.tsx`: Auditoria SOC e limpeza de logs.

---

## 📌 Fase 2 — Unificação de Build, Strict Mode, Docker & Deploy (Concluída)

### 1. Limpeza de Código Morto e Refatoração
- **Remoção de Módulos Legados**:
  - `backend/src/controllers/SendHistoryController.ts` & `backend/src/services/SendHistoryService.ts`.
  - `backend/src/queues/MessageQueue.ts`.
  - `backend/src/providers/email/EmailProvider.ts` & `backend/src/providers/whatsapp/WhatsAppProvider.ts`.
  - `frontend/src/pages/History.tsx`.
- **Modernização de Provedores**:
  - `CallMeBotProvider` atualizado com tipagem limpa, configuração centralizada e logs seguros.

### 2. TypeScript Strict Mode
- **Backend & Frontend**:
  - Ativação das diretivas: `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`, `noUnusedLocals: true`, `noUnusedParameters: true`, `noFallthroughCasesInSwitch: true`.
  - Remoção de todos os imports e parâmetros não utilizados em todas as páginas, componentes e utilitários.
  - Verificação de compilação sem emissão (`tsc --noEmit`) passando com **0 erros** no backend e no frontend.

### 3. Unificação de Build e Testes
- **Build Unificado**:
  - `npm run build` na raiz executa sequencialmente: geração do cliente Prisma, compilação do backend TypeScript (`tsc`) e compilação do frontend SPA (`tsc && vite build && node copy-dist.js`).
  - Scripts dedicados adicionados: `build:backend` e `build:frontend`.
- **Suíte de Testes Unitários**:
  - `backend/tests/automation.test.ts` validando 15 asserções (interpolação dinâmica, cálculo de datas/idades, criptografia AES-256-GCM, normalização telefônica E.164, escopo de tenant e validações Zod). **15/15 testes passando**.

### 4. Containerização & Arquivos de Deploy
- **`backend/Dockerfile`**:
  - Multi-stage build (`node:20-alpine`), separação de dependências de desenvolvimento/produção, execução com usuário sem privilégios `node` e `HEALTHCHECK` configurado para `/health`.
- **`frontend/Dockerfile`**:
  - Multi-stage build com distribuição estática de alta performance servida via `nginx:alpine` com suporte a roteamento SPA e `/health`.
- **`docker-compose.yml`**:
  - Orquestração de desenvolvimento/produção local integrando `PostgreSQL 16 Alpine` (com checagem de integridade e volume persistente), `Backend API` e `Frontend Web`.
- **`vercel.json`**:
  - Configuração de roteamento SPA e injeção de cabeçalhos de segurança HTTP (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`).
- **`render.yaml` & `railway.toml`**:
  - Blueprints declarativos para deploy em nuvem do serviço backend com monitoramento contínuo em `/health`.

---

## 📌 Fase 3 — Fluxo Principal de Automação & Notificação (Concluída)

### 1. Schema do Banco de Dados & Deduplicação
- **`backend/prisma/schema.prisma`**:
  - Adicionada coluna `dedupeKey String? @unique` ao modelo `Alert`.
  - Adicionada coluna `notificationChannel String? @default("CALLMEBOT")` ao modelo `Alert`.
  - Índice único composto garante que o mesmo evento comemorativo ou aniversário para o mesmo cliente/familiar nunca seja registrado mais de uma vez na mesma data para a mesma empresa.
  - Script idempotente de migração de dedupe keys existente: `backend/scripts/migrate_dedupe_keys.ts` com `--dry-run`.
  - Schema sincronizado com a base de dados PostgreSQL.

### 2. Tratamento de Fuso Horário e Regras de Datas
- **`backend/src/utils/time.ts` & `backend/src/utils/dateUtils.ts`**:
  - `todayInSaoPaulo()` / `parseDateSP()`: Cálculos centralizados no fuso horário oficial `America/Sao_Paulo` (UTC-3).
  - `getBirthDateUtcParts()`: Datas de nascimento avaliadas de forma determinística em UTC.
  - Regra de 29 de Fevereiro: comemoração automática em 28/02 para anos não bissextos e exatamente em 29/02 para anos bissextos.
  - `calculateAgeSP()`: Cálculo preciso de idade evitando variações de fuso horário.

### 3. Audience Matcher Estrito
- **`backend/src/utils/audienceMatcher.ts`**:
  - Eliminação de inferências genéricas de gênero + filhos.
  - `MOTHERS_ONLY`: Exclusivo para clientes com `isMother: true` ou familiares com parentesco `MOTHER`.
  - `FATHERS_ONLY`: Exclusivo para clientes com `isFather: true` ou familiares com parentesco `FATHER`.
  - `WOMEN_ONLY` / `MEN_ONLY`: Validação estrita baseada na coluna `gender`.

### 4. Provedores de Notificação e Resiliência
- **`backend/src/providers/notification/`**:
  - `NotificationProvider.ts`: Interface comum e padronizada para provedores.
  - `CallMeBotProvider.ts`: Normalização E.164, quebra inteligente de mensagens com mais de 3.200 caracteres em blocos numerados `[Parte 1/N]`, sanitização de telefones e proteção contra vazamento de chaves nos logs.
  - `UltraMsgProvider.ts`: Provedor alternativo para contingência via API UltraMsg.
  - `EmailProvider.ts`: Provedor de fallback corporativo via Nodemailer.
  - `NotificationDispatcher.ts`: Despachante orquestrado que executa a cadeia de contingência (CallMeBot -> UltraMsg -> Email) com até 3 tentativas e backoff exponencial.

### 5. Motor de Automação Multi-Tenant & Scheduler
- **`backend/src/services/AutomationService.ts`**:
  - `scanAndDispatchForCompany`: Varredura estritamente isolada por tenant, mesclagem inteligente de templates (empresa sobrepõe global), eliminação de N+1 queries com inserção em lote (`createMany({ skipDuplicates: true })`), e envio de resumo para o contato/chave do administrador daquela empresa.
  - `runGlobalSchedulerTick`: Varredura periódica de empresas por minuto; falhas em um tenant não afetam o processamento dos demais.
  - `resendDailyNotification`: Reenvio manual com orientações direcionais caso a chave ou telefone não estejam configurados.
- **`backend/src/jobs/scheduler.ts`**:
  - Agendador por minuto operando no fuso de São Paulo e mantendo estado de última execução (`lastCronRunAt`, `lastCronStatus`).
- **`backend/src/app.ts`**:
  - `/api/health` monitorando latência real do banco de dados e status do agendador.

### 6. Testes Automatizados
- **`backend/tests/automation.test.ts`**:
  - Suíte completa de 31 testes unitários cobrindo:
    1. Interpolação dinâmica de variáveis
    2. Fuso SP, datas UTC e 29 de Fevereiro
    3. Audience Matcher e regras de gênero/paternidade
    4. Criptografia AES-256-GCM
    5. Normalização telefônica E.164
    6. Chunking de mensagens longas
    7. Escopo e isolamento multi-tenant
    8. Validações de payload Zod
  - **31/31 testes aprovados com sucesso**.



