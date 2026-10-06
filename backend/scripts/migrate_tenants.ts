import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  console.log(`🚀 [MIGRATE TENANTS] Iniciando migração de dados multi-tenant... ${isDryRun ? '(MODO DRY-RUN - nenhuma alteração será salva)' : ''}`);

  // 1. Garantir empresa padrão
  const defaultCompanyId = 'default_company';
  console.log(`\n🏢 1. Verificando empresa padrão: ${defaultCompanyId}...`);

  const existingDefault = await prisma.company.findUnique({
    where: { id: defaultCompanyId },
  });

  if (!existingDefault) {
    console.log(` -> Criando empresa padrão (${defaultCompanyId})...`);
    if (!isDryRun) {
      await prisma.company.create({
        data: {
          id: defaultCompanyId,
          name: 'Empresa Principal',
          tradeName: 'Enlace CRM',
          status: 'ACTIVE',
          plan: 'ENTERPRISE',
          maxClients: 10000,
        },
      });
    }
  } else {
    console.log(` -> Empresa padrão já existe (${existingDefault.name}).`);
  }

  // 2. Buscar usuários e garantir empresa
  console.log('\n👥 2. Verificando usuários e vinculação de empresa...');
  const users = await prisma.user.findMany();
  for (const user of users) {
    const targetCompanyId = user.companyId || defaultCompanyId;
    const compExists = await prisma.company.findUnique({ where: { id: targetCompanyId } });
    if (!compExists) {
      console.log(` -> Criando empresa ${targetCompanyId} para o usuário ${user.email}...`);
      if (!isDryRun) {
        await prisma.company.create({
          data: {
            id: targetCompanyId,
            name: `Empresa de ${user.name}`,
            tradeName: user.name,
            status: 'ACTIVE',
            plan: 'STARTER',
          },
        });
      }
    }
    if (!user.companyId) {
      console.log(` -> Atualizando user ${user.email} para companyId: ${defaultCompanyId}`);
      if (!isDryRun) {
        await prisma.user.update({
          where: { id: user.id },
          data: { companyId: defaultCompanyId },
        });
      }
    }
  }

  // 3. Clientes e alertas
  console.log('\n👤 3. Verificando clientes e alertas...');
  const clients = await prisma.client.findMany({ include: { alerts: true } });
  for (const client of clients) {
    const clientCompanyId = client.companyId || defaultCompanyId;
    for (const alert of client.alerts) {
      if (!alert.companyId || alert.companyId !== clientCompanyId) {
        console.log(` -> Vinculando alert ${alert.id} à empresa ${clientCompanyId}...`);
        if (!isDryRun) {
          await prisma.alert.update({
            where: { id: alert.id },
            data: { companyId: clientCompanyId },
          });
        }
      }
    }
  }

  // 4. Configurações por empresa
  console.log('\n⚙️ 4. Garantindo configurações para todas as empresas...');
  const companies = await prisma.company.findMany({ include: { settings: true } });
  for (const comp of companies) {
    if (!comp.settings) {
      console.log(` -> Criando CompanySettings para a empresa ${comp.id} (${comp.name})...`);
      if (!isDryRun) {
        await prisma.companySettings.create({
          data: {
            companyId: comp.id,
            ownerWhatsappPhone: '',
            callmebotApiKey: '',
            callmebotEnabled: true,
            callmebotSimulateMode: true,
            schedulerHour: 6,
            schedulerMinute: 0,
            schedulerEnabled: true,
          },
        });
      }
    }
  }

  console.log('\n✅ [MIGRATE TENANTS] Migração multi-tenant finalizada com sucesso!');
}

main()
  .catch((err) => {
    console.error('❌ [MIGRATE TENANTS Error]:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
