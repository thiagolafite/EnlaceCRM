import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 [DB MIGRATION] Aplicando criação de tabelas e alinhamento de chaves estrangeiras...');

  // 1. Criar tabela Company se não existir
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Company" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "tradeName" TEXT DEFAULT '',
      "document" TEXT DEFAULT '',
      "status" TEXT NOT NULL DEFAULT 'TRIAL',
      "plan" TEXT NOT NULL DEFAULT 'STARTER',
      "maxClients" INTEGER NOT NULL DEFAULT 500,
      "trialEndsAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
    );
  `);
  console.log('✅ 1. Tabela "Company" criada/verificada.');

  // 2. Inserir empresa padrão
  await prisma.$executeRawUnsafe(`
    INSERT INTO "Company" ("id", "name", "tradeName", "status", "plan", "maxClients", "updatedAt")
    VALUES ('default_company', 'Empresa Principal', 'Enlace CRM', 'ACTIVE', 'ENTERPRISE', 10000, CURRENT_TIMESTAMP)
    ON CONFLICT ("id") DO NOTHING;
  `);
  console.log('✅ 2. Empresa padrão "default_company" inserida.');

  // 3. Garantir que empresas de usuários existentes também existam em Company
  try {
    const users: any[] = await prisma.$queryRawUnsafe(`SELECT DISTINCT "companyId" FROM "User" WHERE "companyId" IS NOT NULL;`);
    for (const u of users) {
      if (u.companyId) {
        await prisma.$executeRawUnsafe(`
          INSERT INTO "Company" ("id", "name", "tradeName", "status", "plan", "maxClients", "updatedAt")
          VALUES ($1, $2, $3, 'ACTIVE', 'STARTER', 500, CURRENT_TIMESTAMP)
          ON CONFLICT ("id") DO NOTHING;
        `, u.companyId, `Empresa (${u.companyId})`, 'Enlace');
      }
    }
    console.log('✅ 3. Empresas de usuários existentes mapeadas.');
  } catch (e) {
    console.log('ℹ️ Sem usuários prévios para mapear.');
  }

  // 4. Limpar ou alinhar CompanySettings com companyId existente
  try {
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='CompanySettings' AND column_name='companyId') THEN
          UPDATE "CompanySettings" SET "companyId" = 'default_company' WHERE "companyId" IS NULL OR "companyId" NOT IN (SELECT "id" FROM "Company");
        END IF;
      END $$;
    `);
  } catch (e) {
    console.log('ℹ️ Ajuste em CompanySettings:', e);
  }

  console.log('🎉 Migração SQL base concluída!');
}

main()
  .catch((e) => {
    console.error('❌ Erro na migração SQL:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
