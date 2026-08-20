import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('🧹 Limpando dados de teste do Enlace CRM no Supabase...');

  // Deletar alertas, fila de jobs, familiares e clientes
  const deletedAlerts = await prisma.alert.deleteMany({});
  console.log(`🗑️ Alertas removidos: ${deletedAlerts.count}`);

  const deletedJobs = await prisma.queueJob.deleteMany({});
  console.log(`🗑️ Jobs na fila removidos: ${deletedJobs.count}`);

  const deletedFamily = await prisma.familyMember.deleteMany({});
  console.log(`🗑️ Familiares de teste removidos: ${deletedFamily.count}`);

  const deletedClients = await prisma.client.deleteMany({});
  console.log(`🗑️ Clientes de teste removidos: ${deletedClients.count}`);

  console.log('\n✨ Base de dados 100% LIMPA E ZERADA para uso oficial em produção!');
}

cleanDatabase()
  .catch((e) => {
    console.error('Erro ao limpar banco:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
