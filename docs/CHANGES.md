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

### 3. Ações Manuais Necessárias pelo Usuário
- Nenhuma alteração disruptiva necessária no banco de dados para a Fase 0.
- Certificar-se de que o `JWT_SECRET` nas variáveis de ambiente possui pelo menos 32 caracteres.
