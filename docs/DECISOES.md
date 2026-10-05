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
