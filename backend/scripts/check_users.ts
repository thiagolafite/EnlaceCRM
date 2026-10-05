import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log('--- Usuários no Banco de Dados Supabase ---');
  console.table(users);
}

checkUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
