/**
 * Diagnóstico de query raw direta no banco de dados.
 *
 * ⚠️ SEGURANÇA: este script NÃO contém credenciais hardcoded.
 * Use a variável de ambiente DIRECT_URL (ou DATABASE_URL) do backend/.env.
 *
 * Uso: npx ts-node scripts/test_direct_error.ts
 */
import { PrismaClient } from '@prisma/client';

async function testDirect() {
  const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

  if (!directUrl) {
    console.log('⚠️ Nenhuma connection string encontrada. Defina DIRECT_URL (ou DATABASE_URL) no backend/.env.');
    return;
  }

  console.log('Testing direct URL: [oculta — carregada do ambiente]');
  const prisma = new PrismaClient({
    datasources: { db: { url: directUrl } },
  });
  try {
    const res = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Success queryRaw:', res);
  } catch (err: any) {
    console.error('Full Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testDirect();
