# Enlace — CRM de Relacionamento & Alertas de Felicitações (v2)

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma_ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/WhatsApp_CallMeBot-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" />
</p>

O **Enlace** é um sistema de CRM moderno focado em fortalecer o vínculo de relacionamento entre empresas e seus clientes.

Na **versão 2**, o sistema atua como um **assistente pessoal inteligente**: ele analisa diariamente todos os aniversariantes (clientes e seus familiares) e datas comemorativas fixas, monta mensagens personalizadas com tags dinâmicas e **envia uma notificação consolidada para o WhatsApp do operador/dono via CallMeBot API** com todos os textos prontos para envio manual com 1 clique!

---

## 🌟 Principais Funcionalidades

### 1. 🤖 Notificação Diária no seu WhatsApp (CallMeBot)
- Varredura automática diária às 06:00 (ou disparo manual sob demanda).
- Envio de resumo estruturado no WhatsApp pessoal do dono contendo nome, contexto, telefone do cliente e o texto pronto formatado.
- Se não houver comemorações no dia, nenhuma mensagem desnecessária é enviada.

### 2. 👥 Cadastro Completo de Clientes & Familiares (1:N)
- Dados de identificação, empresa, e-mail, telefone e data de nascimento.
- **Endereço Completo**: CEP com preenchimento automático em tempo real via **ViaCEP**, Logradouro, Número, Complemento, Bairro, Cidade e UF.
- **Cadastro de Familiares**: Mapeamento de parentesco (Mãe, Pai, Filho, Cônjuge, Irmãos, Avós) com botão para herdar o endereço do cliente titular com 1 clique.
- **Conformidade LGPD**: Gestão de consentimento explícito (Opt-in / Opt-out).

### 3. 🔔 Painel de Alertas do Dia & Envio Manual
- 📋 **Copiar Mensagem**: Copia o texto instantaneamente com feedback visual.
- 💬 **Abrir no WhatsApp**: Link direto (`wa.me`) que abre a conversa com o contato no WhatsApp Web ou App com a mensagem pré-carregada.
- ✅ **Marcar como Enviado ao Cliente**: Controle visual de pendência/conclusão com registro de data/hora.
- 🔁 **Notificar meu WhatsApp**: Botão para reenviar o resumo do dia a qualquer momento.

### 4. 📅 Calendário & Linha do Tempo (Agenda)
- Visualização cronológica dos próximos 15, 30 e 60 dias de aniversários e datas especiais.
- Cadastro de datas comemorativas fixas e corporativas (Dia das Mães, Dia dos Pais, Natal, Dia do Cliente, etc.).

### 5. 💬 Templates de Mensagem Dinâmicos
- Tags dinâmicas: `{{nome_cliente}}`, `{{primeiro_nome}}`, `{{nome_familiar}}`, `{{parentesco_possessivo}}`, `{{nome_empresa}}`, `{{idade}}`.
- Preview em tempo real simulando balão do WhatsApp.

### 6. 🌓 Modo Claro & Modo Escuro
- Alternador de tema com 1 clique no cabeçalho e na tela de login.
- Persistência automática no `localStorage`.

---

## 🛠️ Arquitetura e Tecnologias

- **Backend**: Node.js, TypeScript, Express, Prisma ORM, SQLite (local) / PostgreSQL (produção), Node-cron, Bcrypt, JWT.
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS (`darkMode: 'class'`), Lucide React Icons.
- **Integração WhatsApp**: CallMeBot API (gratuita e sem burocracia) + Link direto Click-to-Chat (`wa.me`).

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- Node.js 18 ou superior instalado.
- Git instalado.

### 1. Clonar o Repositório
```bash
git clone https://github.com/SEU_USUARIO/enlace-crm.git
cd enlace-crm
```

### 2. Inicializar o Backend
```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Gerar banco de dados e rodar seed inicial
npx prisma generate
npx prisma db push
npx ts-node prisma/seed.ts

# Iniciar servidor da API (porta 3333)
npm run dev
```

### 3. Inicializar o Frontend
Em outro terminal:
```bash
cd frontend

# Instalar dependências
npm install

# Iniciar servidor Vite (porta 5173)
npm run dev
```

Abra o navegador em: **`http://localhost:5173`**

---

## 🔐 Credenciais de Acesso de Demonstração

- **E-mail:** `admin@enlace.com.br`
- **Senha:** `admin123`

---

## ⚙️ Como Configurar o CallMeBot (Notificações no seu WhatsApp)

1. No seu WhatsApp, adicione o contato do CallMeBot: **`+34 644 44 49 64`** (ou **`+34 644 59 71 62`**).
2. Envie a mensagem exata: `I allow callmebot to send me messages`
3. O bot responderá com sua chave numérica pessoal (ex: `apikey: 123456`).
4. No painel do Enlace, acesse **Sistema ➔ Configurações (WhatsApp)**, informe seu número de WhatsApp e sua API Key, e clique em **"Testar Envio"**!

---

## 🧪 Bateria de Testes Automatizados

O backend conta com uma suíte de testes completa cobrindo:
1. Interpolação de variáveis dinâmicas em templates.
2. Identificação de aniversários resiliente a fusos horários.
3. Autenticação e validação de tokens JWT.
4. Formatação de mensagens e sanitização de números do CallMeBot.
5. Geração de alertas e filtros de consentimento LGPD.
6. Marcação e alternância de envio manual ao cliente.

Para rodar os testes:
```bash
cd backend
npm test
```

---

## 📄 Licença

Este projeto é desenvolvido sob a licença ISC.
