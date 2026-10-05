import { PrismaClient } from '@prisma/client';

async function testDirect() {
  const directUrl = 'postgresql://postgres:katchu%40741852@db.gspusljoauuhbouoylby.supabase.co:5432/postgres?connect_timeout=15';
  console.log('Testing direct URL:', directUrl);
  const prisma = new PrismaClient({
    datasources: { db: { url: directUrl } }
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
