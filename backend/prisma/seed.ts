import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando Seed do Enlace CRM v2...');

  // 1. Criar Usuário Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@enlace.com.br' },
    update: {
      passwordHash: adminPassword,
    },
    create: {
      name: 'Administrador Enlace',
      email: 'admin@enlace.com.br',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log(`👤 Usuário Admin criado: ${admin.email} (senha: admin123)`);

  // 2. Criar Configurações Padrão da Empresa (com CallMeBot para o dono)
  await prisma.companySettings.upsert({
    where: { id: 'default_company' },
    update: {
      ownerWhatsappPhone: '+5571981805744',
    },
    create: {
      id: 'default_company',
      companyName: 'Enlace Soluções Corporativas Ltda',
      tradeName: 'Enlace CRM',
      document: '12.345.678/0001-90',
      contactEmail: 'contato@enlacecrm.com.br',
      contactPhone: '+5511988887777',
      ownerWhatsappPhone: '+5571981805744',
      callmebotApiKey: '',
      callmebotEnabled: true,
      callmebotSimulateMode: true,
      schedulerHour: 6,
      schedulerMinute: 0,
      schedulerEnabled: true,
    },
  });
  console.log('🏢 Configurações da Empresa criadas (CallMeBot)');

  // 3. Criar Datas Comemorativas Fixas do Calendário Brasileiro
  const commemorativeDatesData = [
    {
      name: 'Ano Novo',
      day: 1,
      month: 1,
      description: 'Celebração da virada de ano e novos começos',
      category: 'FIXED',
      targetAudience: 'ALL_CLIENTS',
    },
    {
      name: 'Dia Internacional da Mulher',
      day: 8,
      month: 3,
      description: 'Homenagem a todas as mulheres clientes e parceiras',
      category: 'FIXED',
      targetAudience: 'ALL_CLIENTS',
    },
    {
      name: 'Dia das Mães',
      day: 10,
      month: 5,
      description: 'Celebração comemorativa do Dia das Mães',
      category: 'FIXED',
      targetAudience: 'ALL_CLIENTS',
    },
    {
      name: 'Dia dos Namorados',
      day: 12,
      month: 6,
      description: 'Celebração do amor e união',
      category: 'FIXED',
      targetAudience: 'ALL_CLIENTS',
    },
    {
      name: 'Dia dos Pais',
      day: 10,
      month: 8,
      description: 'Celebração comemorativa do Dia dos Pais',
      category: 'FIXED',
      targetAudience: 'ALL_CLIENTS',
    },
    {
      name: 'Dia do Cliente',
      day: 15,
      month: 9,
      description: 'Homenagem e agradecimento pela parceria e confiança',
      category: 'FIXED',
      targetAudience: 'ALL_CLIENTS',
    },
    {
      name: 'Dia das Crianças',
      day: 12,
      month: 10,
      description: 'Celebração da alegria e infância',
      category: 'FIXED',
      targetAudience: 'ALL_CLIENTS',
    },
    {
      name: 'Natal',
      day: 25,
      month: 12,
      description: 'Votos de paz, harmonia e prosperidade no Natal',
      category: 'FIXED',
      targetAudience: 'ALL_CLIENTS',
    },
  ];

  for (const dateData of commemorativeDatesData) {
    const existing = await prisma.commemorativeDate.findFirst({
      where: { name: dateData.name, month: dateData.month, day: dateData.day },
    });
    if (!existing) {
      await prisma.commemorativeDate.create({ data: dateData });
    }
  }
  console.log('📅 Datas comemorativas criadas');

  // 4. Criar Templates de Mensagem Padrão (com foco em WhatsApp pronto para envio manual)
  const templatesData = [
    {
      name: 'Aniversário do Cliente',
      eventType: 'CLIENT_BIRTHDAY',
      channel: 'WHATSAPP',
      content:
        'Olá, *{{primeiro_nome}}*! 🎉🎂\n\nHoje é um dia muito especial! Toda a equipe da *{{nome_empresa}}* deseja a você um feliz aniversário, repleto de saúde, conquistas e momentos inesquecíveis.\n\nÉ um imenso privilégio ter você conosco. Parabéns pelo seu dia! ✨🎈',
    },
    {
      name: 'Aniversário de Familiar',
      eventType: 'FAMILY_BIRTHDAY',
      channel: 'WHATSAPP',
      content:
        'Olá, *{{primeiro_nome}}*! 💐\n\nSoubemos que hoje {{parentesco_possessivo}}, *{{nome_familiar}}*, está comemorando aniversário! 🥳\n\nNós da *{{nome_empresa}}* queremos estender nossos mais calorosos parabéns e desejar um dia maravilhoso e cheio de celebrações para toda a sua família! 🥂✨',
    },
    {
      name: 'Dia do Cliente',
      eventType: 'FIXED_DATE',
      channel: 'WHATSAPP',
      content:
        'Olá, *{{primeiro_nome}}*! 🌟\n\nHoje é o *Dia do Cliente* e nós da *{{nome_empresa}}* queremos agradecer de coração por sua parceria e confiança em nosso trabalho.\n\nVocê é a razão de buscarmos sempre o melhor todos os dias. Muito obrigado! 🤝✨',
    },
    {
      name: 'Natal e Fim de Ano',
      eventType: 'FIXED_DATE',
      channel: 'WHATSAPP',
      content:
        'Olá, *{{primeiro_nome}}*! 🎄✨\n\nQue este Natal encha o seu lar de paz, amor e esperança. Nós da *{{nome_empresa}}* agradecemos por este ano compartilhado e desejamos um Ano Novo repleto de prosperidade e sucesso! 🎆🥂',
    },
  ];

  for (const t of templatesData) {
    const existing = await prisma.messageTemplate.findFirst({
      where: { name: t.name },
    });
    if (!existing) {
      await prisma.messageTemplate.create({ data: t });
    }
  }
  console.log('📝 Templates de Mensagem criados');

  // 5. Criar Clientes de Exemplo
  const today = new Date();

  // Cliente 1: Thiago Silva Lafite Lima (Faz aniversário hoje)
  const clientThiago = await prisma.client.create({
    data: {
      name: 'Thiago Silva Lafite Lima',
      document: '013.874.335-55',
      email: 'thiago_lafite@hotmail.com',
      phone: '+5571981805744',
      companyName: 'LafiteLima Tecnologia',
      birthDate: new Date(1990, today.getMonth(), today.getDate()),
      status: 'ACTIVE',
      lgpdConsent: true,
      notes: 'Cliente VIP',
      familyMembers: {
        create: [
          {
            name: 'Mariana Lima',
            relationship: 'SPOUSE',
            birthDate: new Date(1992, 4, 15),
          },
        ],
      },
    },
  });

  // Cliente 2: Mariana (Aniversário hoje)
  const client1 = await prisma.client.create({
    data: {
      name: 'Mariana Oliveira da Costa',
      document: '123.456.789-00',
      email: 'mariana.costa@exemplo.com.br',
      phone: '+5511987654321',
      companyName: 'Costa & Associados',
      birthDate: new Date(1990, today.getMonth(), today.getDate()),
      status: 'ACTIVE',
      lgpdConsent: true,
      notes: 'Cliente desde 2021',
      familyMembers: {
        create: [
          {
            name: 'Lucas Costa',
            relationship: 'SPOUSE',
            birthDate: new Date(1988, 5, 20),
            phone: '+5511987654322',
          },
          {
            name: 'Sofia Costa',
            relationship: 'DAUGHTER',
            birthDate: new Date(2018, 10, 14),
          },
        ],
      },
    },
  });

  // Cliente 3: Carlos (com mãe fazendo aniversário hoje)
  const client2 = await prisma.client.create({
    data: {
      name: 'Carlos Eduardo Silveira',
      document: '987.654.321-11',
      email: 'carlos.silveira@techcorp.com.br',
      phone: '+5511976543210',
      companyName: 'TechCorp Brasil',
      birthDate: new Date(1985, 3, 12),
      status: 'ACTIVE',
      lgpdConsent: true,
      notes: 'Diretor Comercial',
      familyMembers: {
        create: [
          {
            name: 'Dona Helena Silveira',
            relationship: 'MOTHER',
            birthDate: new Date(1958, today.getMonth(), today.getDate()),
            notes: 'Mãe do Carlos',
          },
        ],
      },
    },
  });

  console.log(`👥 Clientes de exemplo criados: ${clientThiago.name}, ${client1.name}, ${client2.name}`);
  console.log('✅ Seed v2 finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
