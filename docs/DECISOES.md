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
