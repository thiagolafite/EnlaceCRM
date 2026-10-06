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

