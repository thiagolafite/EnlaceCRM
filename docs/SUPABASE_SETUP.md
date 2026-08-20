# 🐘 Guia de Integração com o Supabase (PostgreSQL) — Enlace CRM

Este guia ensina como conectar o **Enlace CRM** ao **Supabase** e colocar o banco de dados online na nuvem.

---

## ⚡ Passo 1: Criar o Projeto no Supabase (Gratuito)

1. Acesse [https://supabase.com](https://supabase.com) e faça login (pode usar sua conta GitHub).
2. Clique em **"New project"**.
3. Preencha os dados:
   - **Name:** `EnlaceCRM` (ou o nome que preferir).
   - **Database Password:** Escolha uma senha forte e **guarde-a** (você usará na connection string).
   - **Region:** Escolha a região mais próxima (ex: `South America (São Paulo)` ou `East US`).
4. Clique em **"Create new project"** e aguarde cerca de 1 a 2 minutos até o banco ser provisionado.

---

## 🚀 Passo 2: Criar as Tabelas e Dados Iniciais

Você tem **duas opções super simples**:

### Opção A — Direto pelo Painel do Supabase (Mais Rápida — 30 segundos):
1. No painel do seu projeto no Supabase, clique no menu lateral em **SQL Editor** (ícone `>_`).
2. Clique em **"New query"**.
3. Abra o arquivo [`backend/prisma/supabase_schema.sql`](../backend/prisma/supabase_schema.sql), copie todo o conteúdo e cole no editor do Supabase.
4. Clique no botão verde **"Run"** (ou pressione `Ctrl + Enter`).
5. **Pronto!** Todas as tabelas, chaves estrangeiras, índices e dados iniciais (Admin, templates de WhatsApp e datas comemorativas) foram criados instantaneamente!

---

### Opção B — Via Linha de Comando com Prisma:
1. No Supabase, vá em **Project Settings** (ícone de engrenagem) ➔ **Database**.
2. Role até a seção **Connection String** e selecione a aba **URI**:
   - Para `DATABASE_URL`: selecione o modo **Transaction** (porta 6543).
   - Para `DIRECT_URL`: selecione o modo **Session** (porta 5432).
3. No seu arquivo `backend/.env`, preencha as variáveis substituindo `[YOUR_PASSWORD]` pela senha que você definiu:
   ```env
   DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
   JWT_SECRET="enlace_crm_super_secret_jwt_key_2026"
   ```
4. No terminal, execute:
   ```bash
   cd backend
   npx prisma db push
   npx ts-node prisma/seed.ts
   ```

---

## 🌐 Passo 3: Colocar o Projeto Online (Deploy na Nuvem)

### Backend (API Express + Scheduler)
Recomendamos o **Render.com** ou **Railway.app** (ambos gratuitos/freemium):
1. Crie uma conta no [Render.com](https://render.com).
2. Clique em **New + ➔ Web Service** e conecte seu repositório `thiagolafite/EnlaceCRM`.
3. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npx prisma generate && npm run build` (ou `npm install && npx prisma generate`)
   - **Start Command:** `npm run start` (ou `npx ts-node src/server.ts`)
4. Adicione as variáveis de ambiente:
   - `DATABASE_URL` (Sua URL do Supabase)
   - `DIRECT_URL` (Sua Direct URL do Supabase)
   - `JWT_SECRET` (Sua chave secreta)
   - `PORT` = `3333` (ou a porta padrão atribuída)

### Frontend (React + Vite)
Recomendamos a **Vercel** ou **Netlify**:
1. Acesse [Vercel.com](https://vercel.com) e importe o repositório `thiagolafite/EnlaceCRM`.
2. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** `Vite`
3. Adicione a variável de ambiente:
   - `VITE_API_URL` = `https://sua-api-no-render.onrender.com/api`
4. Clique em **Deploy**!

---

## 🔐 Credenciais Padrão Criadas no Supabase
- **E-mail:** `admin@enlace.com.br`
- **Senha:** `admin123`
