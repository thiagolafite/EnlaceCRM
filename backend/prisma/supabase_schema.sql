-- =========================================================
-- ENLACE CRM — SCRIPT DE BANCO DE DADOS SUPABASE (POSTGRESQL)
-- Execute este script no SQL Editor do Supabase para criar
-- toda a estrutura e dados iniciais com 1 clique!
-- =========================================================

-- Habilitar extensão para geração de UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Usuários do Sistema
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "name" TEXT NOT NULL,
    "email" TEXT UNIQUE NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Configurações da Empresa & CallMeBot
CREATE TABLE IF NOT EXISTS "CompanySettings" (
    "id" TEXT PRIMARY KEY DEFAULT 'default_company',
    "companyName" TEXT NOT NULL DEFAULT 'Empresa Enlace',
    "tradeName" TEXT NOT NULL DEFAULT 'Enlace CRM',
    "document" TEXT DEFAULT '',
    "contactEmail" TEXT DEFAULT 'contato@enlacecrm.com.br',
    "contactPhone" TEXT DEFAULT '+5511999999999',
    "ownerWhatsappPhone" TEXT DEFAULT '+5571981805744',
    "callmebotApiKey" TEXT DEFAULT '',
    "callmebotEnabled" BOOLEAN NOT NULL DEFAULT true,
    "callmebotSimulateMode" BOOLEAN NOT NULL DEFAULT false,
    "schedulerHour" INTEGER NOT NULL DEFAULT 6,
    "schedulerMinute" INTEGER NOT NULL DEFAULT 0,
    "schedulerEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de Clientes
CREATE TABLE IF NOT EXISTS "Client" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "name" TEXT NOT NULL,
    "document" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "companyName" TEXT,
    "birthDate" TIMESTAMP WITH TIME ZONE,
    "zipCode" TEXT,
    "address" TEXT,
    "addressNumber" TEXT,
    "addressComplement" TEXT,
    "neighborhood" TEXT,
    "city" TEXT,
    "state" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "lgpdConsent" BOOLEAN NOT NULL DEFAULT true,
    "lgpdConsentDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabela de Familiares
CREATE TABLE IF NOT EXISTS "FamilyMember" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "birthDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "sameAddressAsClient" BOOLEAN NOT NULL DEFAULT false,
    "zipCode" TEXT,
    "address" TEXT,
    "addressNumber" TEXT,
    "addressComplement" TEXT,
    "neighborhood" TEXT,
    "city" TEXT,
    "state" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_family_client" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 5. Tabela de Datas Comemorativas Fixas
CREATE TABLE IF NOT EXISTS "CommemorativeDate" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "name" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'FIXED',
    "targetAudience" TEXT NOT NULL DEFAULT 'ALL_CLIENTS',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabela de Templates de Mensagens
CREATE TABLE IF NOT EXISTS "MessageTemplate" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "name" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'WHATSAPP',
    "commemorativeDateId" TEXT,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_template_commemorative_date" FOREIGN KEY ("commemorativeDateId") REFERENCES "CommemorativeDate"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- 7. Tabela de Alertas de Felicitações
CREATE TABLE IF NOT EXISTS "Alert" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "clientId" TEXT NOT NULL,
    "familyMemberId" TEXT,
    "commemorativeDateId" TEXT,
    "templateId" TEXT,
    "eventType" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientPhone" TEXT,
    "targetName" TEXT NOT NULL,
    "contextDescription" TEXT NOT NULL,
    "renderedMessage" TEXT NOT NULL,
    "notificationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "notificationError" TEXT,
    "sentToClientManual" BOOLEAN NOT NULL DEFAULT false,
    "sentToClientManualAt" TIMESTAMP WITH TIME ZONE,
    "alertDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_alert_client" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "fk_alert_family" FOREIGN KEY ("familyMemberId") REFERENCES "FamilyMember"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "fk_alert_date" FOREIGN KEY ("commemorativeDateId") REFERENCES "CommemorativeDate"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "fk_alert_template" FOREIGN KEY ("templateId") REFERENCES "MessageTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- 8. Tabela de Fila de Processamento
CREATE TABLE IF NOT EXISTS "QueueJob" (
    "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    "type" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "error" TEXT,
    "scheduledFor" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- DADOS INICIAIS (SEED)
-- =========================================================

-- Inserir Usuário Administrador (senha: admin123)
INSERT INTO "User" ("id", "name", "email", "passwordHash", "role")
VALUES (
    'admin_default_id',
    'Administrador Enlace',
    'admin@enlace.com.br',
    '$2b$10$wS2Wb/zC5g0wUjA55XmZ4.iFq4hG8UqfV6U5U5p.Z8n8R4X7Q9r7K', -- bcrypt hash de admin123
    'ADMIN'
)
ON CONFLICT ("email") DO NOTHING;

-- Inserir Configurações Iniciais da Empresa
INSERT INTO "CompanySettings" (
    "id", "companyName", "tradeName", "document", "contactEmail", "contactPhone", 
    "ownerWhatsappPhone", "callmebotApiKey", "callmebotEnabled", "callmebotSimulateMode", 
    "schedulerHour", "schedulerMinute", "schedulerEnabled"
)
VALUES (
    'default_company',
    'Enlace Tecnologia e Relacionamento',
    'Enlace CRM',
    '12.345.678/0001-90',
    'contato@enlacecrm.com.br',
    '+5571981805744',
    '+5571981805744',
    '',
    true,
    false,
    6,
    0,
    true
)
ON CONFLICT ("id") DO NOTHING;

-- Inserir Datas Comemorativas Fixas Brasileiras
INSERT INTO "CommemorativeDate" ("name", "day", "month", "category", "targetAudience", "description")
VALUES
    ('Dia das Mães', 10, 5, 'CULTURAL', 'MOTHERS_ONLY', 'Homenagem às mães (2º domingo de maio)'),
    ('Dia dos Pais', 9, 8, 'CULTURAL', 'FATHERS_ONLY', 'Homenagem aos pais (2º domingo de agosto)'),
    ('Dia dos Namorados', 12, 6, 'CULTURAL', 'ALL_CLIENTS', 'Celebração do amor e companheirismo'),
    ('Dia do Cliente', 15, 9, 'CORPORATE', 'ALL_CLIENTS', 'Agradecimento e valorização pela parceria'),
    ('Dia das Crianças', 12, 10, 'CULTURAL', 'ALL_CLIENTS', 'Comemoração com os pequenos da família'),
    ('Natal', 25, 12, 'FIXED', 'ALL_CLIENTS', 'Votos de paz, união e renovação de esperanças'),
    ('Ano Novo / Réveillon', 1, 1, 'FIXED', 'ALL_CLIENTS', 'Boas-vindas ao novo ciclo e prosperidade'),
    ('Dia Internacional da Mulher', 8, 3, 'CULTURAL', 'ALL_CLIENTS', 'Reconhecimento à força e protagonismo feminino');

-- Inserir Templates Padrão de Mensagem WhatsApp
INSERT INTO "MessageTemplate" ("name", "eventType", "channel", "content", "active")
VALUES
    (
        'Aniversário do Cliente (WhatsApp)',
        'CLIENT_BIRTHDAY',
        'WHATSAPP',
        'Olá, {{primeiro_nome}}! 🎉🎂

Hoje é um dia muito especial! Toda a equipe da {{nome_empresa}} deseja a você um feliz aniversário, repleto de saúde, conquistas e momentos inesquecíveis.

É um imenso privilégio ter você conosco. Parabéns pelo seu dia! ✨🎈',
        true
    ),
    (
        'Aniversário de Familiar (WhatsApp)',
        'FAMILY_BIRTHDAY',
        'WHATSAPP',
        'Olá, {{primeiro_nome}}! 💐

Soubemos que hoje {{parentesco_possessivo}}, {{nome_familiar}}, está comemorando aniversário! 🥳

Nós da {{nome_empresa}} queremos estender nossos mais calorosos parabéns e desejar um dia maravilhoso e cheio de celebrações para toda a sua família! 🥂✨',
        true
    ),
    (
        'Data Fixa — Dia do Cliente (WhatsApp)',
        'FIXED_DATE',
        'WHATSAPP',
        'Olá, {{primeiro_nome}}! 🌟

Hoje é o Dia do Cliente e queremos expressar nossa mais sincera gratidão pela sua confiança e parceria com a {{nome_empresa}}.

Você é o motivo de buscarmos a excelência todos os dias. Muito obrigado por caminhar ao nosso lado! 🤝💙',
        true
    ),
    (
        'Data Fixa — Fim de Ano & Boas Festas (WhatsApp)',
        'FIXED_DATE',
        'WHATSAPP',
        'Prezado(a) {{primeiro_nome}}! 🎄✨

Ao encerrarmos mais um ciclo, nós da {{nome_empresa}} queremos desejar a você e toda sua família um Feliz Natal e um Ano Novo repleto de realizações, saúde e sucesso!

Que o próximo ano seja ainda mais brilhante! 🥂🎆',
        true
    );
