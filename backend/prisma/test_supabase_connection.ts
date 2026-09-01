import { PrismaClient } from '@prisma/client';

const candidateUrls = [
  {
    name: 'Direct Supabase URL (db.<ref>.supabase.co:5432)',
    url: 'postgresql://postgres:katchu%40741852@db.gspusljoauuhbouoylby.supabase.co:5432/postgres?connect_timeout=10',
  },
  {
    name: 'Pooler Session (aws-0-us-west-2:5432)',
    url: 'postgresql://postgres.gspusljoauuhbouoylby:katchu%40741852@aws-0-us-west-2.pooler.supabase.com:5432/postgres?connect_timeout=10',
  },
  {
    name: 'Pooler Transaction (aws-0-us-west-2:6543)',
    url: 'postgresql://postgres.gspusljoauuhbouoylby:katchu%40741852@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connect_timeout=10',
  },
  {
    name: 'Pooler Session (aws-0-sa-east-1 / São Paulo)',
    url: 'postgresql://postgres.gspusljoauuhbouoylby:katchu%40741852@aws-0-sa-east-1.pooler.supabase.com:5432/postgres?connect_timeout=10',
  },
  {
    name: 'Pooler Transaction (aws-0-sa-east-1 / São Paulo)',
    url: 'postgresql://postgres.gspusljoauuhbouoylby:katchu%40741852@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connect_timeout=10',
  },
  {
    name: 'Pooler Session (aws-0-us-east-1 / N. Virginia)',
    url: 'postgresql://postgres.gspusljoauuhbouoylby:katchu%40741852@aws-0-us-east-1.pooler.supabase.com:5432/postgres?connect_timeout=10',
  },
];

async function testAll() {
  console.log('🔍 Testando conexões com o Supabase...\n');

  for (const candidate of candidateUrls) {
    process.stdout.write(`Testing [${candidate.name}]... `);
    const prisma = new PrismaClient({
      datasources: {
        db: { url: candidate.url },
      },
    });

    try {
      const userCount = await prisma.user.count();
      const clientCount = await prisma.client.count();
      console.log(`✅ CONECTADO COM SUCESSO!`);
      console.log(`   Usuários: ${userCount} | Clientes: ${clientCount}`);
      console.log(`   👉 URL VENCEDORA: ${candidate.url}\n`);
      await prisma.$disconnect();
      return candidate.url;
    } catch (err: any) {
      console.log(`❌ Falha: ${err.message?.slice(0, 100)}...`);
    } finally {
      await prisma.$disconnect();
    }
  }

  console.log('\n⚠️ Nenhuma URL automática conectou diretamente. Pode ser necessário reativar o projeto no Supabase se estiver pausado (free tier pause).');
}

testAll();
