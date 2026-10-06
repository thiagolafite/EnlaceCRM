import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  console.log(`🚀 Iniciando migração de dedupeKey para Alertas existentes (${isDryRun ? 'MODO DRY-RUN' : 'MODO PRODUÇÃO'})...`);

  const alerts = await prisma.alert.findMany({
    where: {
      dedupeKey: null,
    },
    select: {
      id: true,
      companyId: true,
      clientId: true,
      familyMemberId: true,
      commemorativeDateId: true,
      eventType: true,
      alertDate: true,
    },
  });

  console.log(`📊 Encontrados ${alerts.length} alertas sem dedupeKey.`);

  let updated = 0;
  const seenKeys = new Set<string>();

  for (const alert of alerts) {
    const dateStr = alert.alertDate.toISOString().split('T')[0];
    let dedupeKey = `${alert.companyId}|${alert.clientId}|${alert.familyMemberId || ''}|${alert.commemorativeDateId || ''}|${alert.eventType}|${dateStr}`;
    
    // Se por acaso já existir duplicata nos dados antigos, adicionamos sufixo do id para não colidir
    if (seenKeys.has(dedupeKey)) {
      dedupeKey = `${dedupeKey}|${alert.id}`;
    }
    seenKeys.add(dedupeKey);

    if (!isDryRun) {
      await prisma.alert.update({
        where: { id: alert.id },
        data: { dedupeKey },
      });
    }
    updated++;
  }

  console.log(`✅ Migração concluída: ${updated} alertas processados com dedupeKey único.`);
}

main()
  .catch((e) => {
    console.error('❌ Erro na migração de dedupeKey:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
