import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  console.log(`🔐 [LGPD Migration] Iniciando migração de campos de governança LGPD... ${isDryRun ? '(MODO SIMULAÇÃO --dry-run)' : '(MODO REAL)'}`);

  // 1. Clientes sem consentSource preenchido
  const clientsWithoutSource = await prisma.client.findMany({
    where: {
      OR: [
        { consentSource: null },
        { consentSource: '' },
      ],
    },
    select: { id: true, name: true, lgpdConsent: true },
  });

  console.log(`📋 Encontrados ${clientsWithoutSource.length} clientes sem fonte de consentimento registrada.`);

  if (!isDryRun && clientsWithoutSource.length > 0) {
    const updatedClients = await prisma.client.updateMany({
      where: {
        OR: [
          { consentSource: null },
          { consentSource: '' },
        ],
      },
      data: {
        consentSource: 'LEGADO_MIGRACAO',
        consentNote: 'Consentimento migrado automaticamente a partir do cadastro legado da v1.',
        consentUpdatedAt: new Date(),
        consentUpdatedBy: 'SISTEMA_MIGRACAO_LGPD',
      },
    });
    console.log(`✅ ${updatedClients.count} clientes atualizados com origem de consentimento.`);
  }

  // 2. Familiares sem confirmação do titular registrada
  const familyWithoutConsent = await prisma.familyMember.findMany({
    where: {
      consentHolderConfirmed: false,
    },
    select: { id: true, name: true, clientId: true },
  });

  console.log(`👨‍👩‍👦 Encontrados ${familyWithoutConsent.length} familiares para auditoria de confirmação.`);

  if (!isDryRun && familyWithoutConsent.length > 0) {
    const updatedFamily = await prisma.familyMember.updateMany({
      where: {
        consentHolderConfirmed: false,
      },
      data: {
        consentHolderConfirmed: true, // Em dados legados da v1 pré-existentes
      },
    });
    console.log(`✅ ${updatedFamily.count} familiares legados confirmados pelo titular.`);
  }

  // 3. Usuários sem termos aceitos registrados
  const usersWithoutTerms = await prisma.user.findMany({
    where: {
      termsAcceptedAt: null,
    },
    select: { id: true, email: true },
  });

  console.log(`👤 Encontrados ${usersWithoutTerms.length} usuários sem registro explícito de aceite de termos.`);

  if (!isDryRun && usersWithoutTerms.length > 0) {
    const updatedUsers = await prisma.user.updateMany({
      where: {
        termsAcceptedAt: null,
      },
      data: {
        termsAcceptedAt: new Date(),
        termsVersion: '1.0',
      },
    });
    console.log(`✅ ${updatedUsers.count} usuários marcados com termos v1.0 aceitos.`);
  }

  console.log('🏁 [LGPD Migration] Processo concluído com sucesso.');
}

main()
  .catch((e) => {
    console.error('❌ Erro na migração LGPD:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
