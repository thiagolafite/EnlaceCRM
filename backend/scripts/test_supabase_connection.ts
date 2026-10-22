/**
 * Diagnóstico de conectividade com o banco de dados.
 *
 * ⚠️ SEGURANÇA: este script NÃO contém credenciais hardcoded.
 * Forneça as variáveis de ambiente (backend/.env ou shell):
 *   DIRECT_URL (ou DATABASE_URL) ... connection string completa (prioritária)
 *   SUPABASE_PROJECT_REF ........... ref do projeto Supabase (opcional, p/ testar poolers)
 *   SUPABASE_DB_USER ............... usuário do banco (padrão: "postgres")
 *   SUPABASE_DB_PASSWORD ........... senha do banco (valor real, sem URL-encode)
 *
 * Uso: npx ts-node scripts/test_supabase_connection.ts
 */
import { PrismaClient } from '@prisma/client';

interface Candidate {
  name: string;
  url: string;
}

function buildCandidates(): Candidate[] {
  const candidates: Candidate[] = [];

  // 1) Connection string explícita do ambiente (caminho oficial)
  const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (directUrl) {
    candidates.push({ name: 'DIRECT_URL / DATABASE_URL (ambiente)', url: directUrl });
  }

  // 2) Poolers do Supabase montados a partir de variáveis (sem segredos no código)
  const projectRef = process.env.SUPABASE_PROJECT_REF;
  const password = process.env.SUPABASE_DB_PASSWORD;
  const user = process.env.SUPABASE_DB_USER || 'postgres';

  if (projectRef && password) {
    const encodedPassword = encodeURIComponent(password);
    const regions = [
      { label: 'aws-0-us-west-2 (Oregon)', pooler: 'aws-0-us-west-2.pooler.supabase.com' },
      { label: 'aws-0-sa-east-1 (São Paulo)', pooler: 'aws-0-sa-east-1.pooler.supabase.com' },
      { label: 'aws-0-us-east-1 (N. Virginia)', pooler: 'aws-0-us-east-1.pooler.supabase.com' },
    ];

    // Conexão direta (porta 5432)
    candidates.push({
      name: `Direct (db.${projectRef}.supabase.co:5432)`,
      url: `postgresql://${user}:${encodedPassword}@db.${projectRef}.supabase.co:5432/postgres?connect_timeout=10`,
    });

    for (const region of regions) {
      candidates.push({
        name: `Pooler Session (${region.label}:5432)`,
        url: `postgresql://${user}.${projectRef}:${encodedPassword}@${region.pooler}:5432/postgres?connect_timeout=10`,
      });
      candidates.push({
        name: `Pooler Transaction (${region.label}:6543)`,
        url: `postgresql://${user}.${projectRef}:${encodedPassword}@${region.pooler}:6543/postgres?pgbouncer=true&connect_timeout=10`,
      });
    }
  }

  return candidates;
}

async function testAll() {
  const candidates = buildCandidates();

  if (candidates.length === 0) {
    console.log('⚠️ Nenhuma configuração de conexão encontrada.');
    console.log('   Defina DIRECT_URL (ou DATABASE_URL) no backend/.env.');
    console.log('   Opcionalmente, defina SUPABASE_PROJECT_REF + SUPABASE_DB_PASSWORD para testar os poolers do Supabase.');
    return;
  }

  console.log(`🔍 Testando ${candidates.length} configuração(ões) de conexão...\n`);

  for (const candidate of candidates) {
    process.stdout.write(`Testing [${candidate.name}]... `);
    const prisma = new PrismaClient({
      datasources: {
        db: { url: candidate.url },
      },
    });

    try {
      const userCount = await prisma.user.count();
      const clientCount = await prisma.client.count();
      console.log('✅ CONECTADO COM SUCESSO!');
      console.log(`   Usuários: ${userCount} | Clientes: ${clientCount}`);
      console.log(`   👉 URL VENCEDORA: ${candidate.name}\n`);
      await prisma.$disconnect();
      return candidate.url;
    } catch (err: any) {
      console.log(`❌ Falha: ${err.message?.slice(0, 100)}...`);
    } finally {
      await prisma.$disconnect();
    }
  }

  console.log('\n⚠️ Nenhuma URL conectou diretamente. Pode ser necessário reativar o projeto no Supabase se estiver pausado (free tier pause).');
}

testAll();
