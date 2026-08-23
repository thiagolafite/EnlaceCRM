import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Listas de nomes comuns para inferência em português
const FEMALE_NAMES = new Set([
  'maria', 'ana', 'mariana', 'beatriz', 'juliana', 'camila', 'patricia', 'fernanda', 'lucia', 'helena',
  'claudia', 'renata', 'larissa', 'amanda', 'aline', 'bruna', 'carolina', 'leticia', 'gabriela',
  'vanessa', 'jessica', 'sabrina', 'tatiana', 'raquel', 'monica', 'bianca', 'luana', 'priscila',
  'elizabeth', 'valeria', 'debora', 'daniela', 'paula', 'carla', 'marina', 'simone', 'cristina',
  'sonia', 'regina', 'teresa', 'silvia', 'adriana', 'rose', 'rosana', 'marcia', 'fatima', 'neuza',
  'rita', 'cleide', 'ivone', 'leila', 'marlene', 'sandra', 'vera', 'marta', 'isabela', 'laura',
  'sophia', 'alice', 'valentina', 'helena', 'manuela', 'lorena', 'livia', 'giovanna', 'clara'
]);

const MALE_NAMES = new Set([
  'thiago', 'tiago', 'carlos', 'joao', 'pedro', 'lucas', 'marcelo', 'paulo', 'andre', 'felipe',
  'rodrigo', 'gabriel', 'rafael', 'bruno', 'matheus', 'gustavo', 'leonardo', 'marcos', 'fernando',
  'eduardo', 'diego', 'ricardo', 'alexandre', 'vitor', 'victor', 'daniel', 'roberto', 'fabio',
  'luiz', 'luis', 'jose', 'antonio', 'francisco', 'manoel', 'manuel', 'sergio', 'jorge', 'claudio',
  'rogerio', 'marcio', 'julio', 'cesar', 'mauricio', 'renato', 'flavio', 'valter', 'edson', 'gilberto',
  'alberto', 'arthur', 'bernardo', 'heitor', 'davi', 'lorenzo', 'theo', 'miguel', 'guilherme', 'nicolas'
]);

function inferGenderFromName(fullName: string): 'FEMALE' | 'MALE' | 'NOT_SPECIFIED' {
  const firstName = fullName.trim().split(' ')[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  if (FEMALE_NAMES.has(firstName)) return 'FEMALE';
  if (MALE_NAMES.has(firstName)) return 'MALE';
  
  // Regras de terminação comum em português
  if (firstName.endsWith('a') && !['lucas', 'alexandre', 'joshua'].includes(firstName)) return 'FEMALE';
  if (firstName.endsWith('o') || firstName.endsWith('os') || firstName.endsWith('or') || firstName.endsWith('el')) return 'MALE';
  
  return 'NOT_SPECIFIED';
}

async function run() {
  console.log('🔄 Iniciando atualização dos cadastros existentes com gênero e perfis familiares...');

  // 1. Atualizar Familiares
  const familyMembers = await prisma.familyMember.findMany();
  console.log(`Encontrados ${familyMembers.length} familiares cadastrados.`);

  let updatedFamilyCount = 0;
  for (const fm of familyMembers) {
    let gender: 'FEMALE' | 'MALE' | 'NOT_SPECIFIED' = (fm.gender as any) || 'NOT_SPECIFIED';

    if (gender === 'NOT_SPECIFIED' || !gender) {
      if (['MOTHER', 'DAUGHTER', 'SISTER', 'GRANDMOTHER'].includes(fm.relationship)) {
        gender = 'FEMALE';
      } else if (['FATHER', 'SON', 'BROTHER', 'GRANDFATHER'].includes(fm.relationship)) {
        gender = 'MALE';
      } else {
        gender = inferGenderFromName(fm.name);
      }

      await prisma.familyMember.update({
        where: { id: fm.id },
        data: { gender },
      });
      updatedFamilyCount++;
      console.log(`  ✓ Familiar "${fm.name}" (${fm.relationship}) -> Gênero: ${gender}`);
    }
  }

  // 2. Atualizar Clientes
  const clients = await prisma.client.findMany({
    include: { familyMembers: true },
  });
  console.log(`\nEncontrados ${clients.length} clientes cadastrados.`);

  let updatedClientsCount = 0;
  for (const client of clients) {
    const currentGender = client.gender;
    const inferredGender = currentGender && currentGender !== 'NOT_SPECIFIED' 
      ? currentGender 
      : inferGenderFromName(client.name);

    const hasChildren = client.familyMembers.some((fm) => ['CHILD', 'SON', 'DAUGHTER'].includes(fm.relationship));
    const isMother = client.isMother || (inferredGender === 'FEMALE' && hasChildren);
    const isFather = client.isFather || (inferredGender === 'MALE' && hasChildren);

    await prisma.client.update({
      where: { id: client.id },
      data: {
        gender: inferredGender,
        isMother,
        isFather,
      },
    });
    updatedClientsCount++;
    console.log(`  ✓ Cliente "${client.name}" -> Gênero: ${inferredGender} | Mãe: ${isMother} | Pai: ${isFather}`);
  }

  console.log(`\n🎉 Concluído com sucesso!`);
  console.log(`- Familiares atualizados: ${updatedFamilyCount}/${familyMembers.length}`);
  console.log(`- Clientes atualizados: ${updatedClientsCount}/${clients.length}`);
}

run()
  .catch((e) => {
    console.error('Erro na migração:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
