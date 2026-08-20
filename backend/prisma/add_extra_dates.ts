import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addCarnivalAndEaster() {
  const extraDates = [
    {
      name: 'Carnaval & Terça-feira Gorda',
      day: 17,
      month: 2,
      description: 'Ponto Facultativo / Festividade Nacional — Celebração da maior festa cultural do Brasil',
      category: 'CULTURAL',
      targetAudience: 'ALL_CLIENTS',
    },
    {
      name: 'Quarta-feira de Cinzas',
      day: 18,
      month: 2,
      description: 'Encerramento das festividades carnavalescas e início da Quaresma',
      category: 'CULTURAL',
      targetAudience: 'ALL_CLIENTS',
    },
    {
      name: 'Sexta-Feira Santa / Paixão de Cristo',
      day: 3,
      month: 4,
      description: 'Feriado Nacional — Reflexão, espiritualidade e união familiar',
      category: 'FIXED',
      targetAudience: 'ALL_CLIENTS',
    },
    {
      name: 'Páscoa',
      day: 5,
      month: 4,
      description: 'Celebração de renovação, esperança, vida e união em família',
      category: 'CULTURAL',
      targetAudience: 'ALL_CLIENTS',
    },
    {
      name: 'Corpus Christi',
      day: 4,
      month: 6,
      description: 'Ponto Facultativo / Celebração religiosa e tradicional no Brasil',
      category: 'CULTURAL',
      targetAudience: 'ALL_CLIENTS',
    },
    {
      name: 'Véspera de Natal',
      day: 24,
      month: 12,
      description: 'Noite de confraternização e ceia em família',
      category: 'FIXED',
      targetAudience: 'ALL_CLIENTS',
    },
  ];

  for (const d of extraDates) {
    const existing = await prisma.commemorativeDate.findFirst({
      where: { name: d.name, month: d.month, day: d.day },
    });
    if (!existing) {
      await prisma.commemorativeDate.create({ data: d });
    }
  }

  console.log('✅ Carnaval, Páscoa, Corpus Christi e Véspera de Natal adicionados ao banco com sucesso!');
}

addCarnivalAndEaster()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
