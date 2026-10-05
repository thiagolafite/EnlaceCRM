import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const ALL_ANNUAL_COMMEMORATIVE_DATES = [
  // JANEIRO
  {
    name: 'Ano Novo / Confraternização Universal',
    day: 1,
    month: 1,
    description: 'Feriado Nacional — Celebração do início de um novo ano repleto de paz, saúde e conquistas',
    category: 'FIXED',
    targetAudience: 'ALL_CLIENTS',
  },
  {
    name: 'Dia de Reis & Epifania',
    day: 6,
    month: 1,
    description: 'Tradição cultural que encerra o ciclo natalino com votos de prosperidade e harmonia',
    category: 'CULTURAL',
    targetAudience: 'ALL_CLIENTS',
  },
  {
    name: 'Dia da Gratidão',
    day: 6,
    month: 1,
    description: 'Dia de agradecer pelas parcerias, confiança e relações humanas construídas',
    category: 'CORPORATE',
    targetAudience: 'ALL_CLIENTS',
  },

  // FEVEREIRO
  {
    name: 'Dia da Amizade & São Valentim',
    day: 14,
    month: 2,
    description: 'Celebração universal do companheirismo, lealdade e afeto',
    category: 'CULTURAL',
    targetAudience: 'ALL_CLIENTS',
  },
  {
    name: 'Segunda-feira de Carnaval',
    day: 16,
    month: 2,
    description: 'Ponto Facultativo — Abertura da semana carnavalesca no Brasil',
    category: 'CULTURAL',
    targetAudience: 'ALL_CLIENTS',
  },
  {
    name: 'Carnaval / Terça-feira Gorda',
    day: 17,
    month: 2,
    description: 'Festividade Nacional — A maior festa popular da cultura e alegria brasileira',
    category: 'CULTURAL',
    targetAudience: 'ALL_CLIENTS',
  },
  {
    name: 'Quarta-feira de Cinzas',
    day: 18,
    month: 2,
    description: 'Ponto Facultativo — Encerramento do Carnaval e tempo de renovação',
    category: 'CULTURAL',
    targetAudience: 'ALL_CLIENTS',
  },

  // MARÇO
  {
    name: 'Dia Internacional da Mulher',
    day: 8,
    month: 3,
    description: 'Homenagem ao protagonismo, coragem, inspiração e força de todas as mulheres',
    category: 'CULTURAL',
    targetAudience: 'ALL_CLIENTS',
  },
  {
    name: 'Dia Mundial dos Direitos do Consumidor',
    day: 15,
    month: 3,
    description: 'Data corporativa de valorização, transparência e respeito à parceria com nossos clientes',
    category: 'CORPORATE',
    targetAudience: 'ALL_CLIENTS',
  },
  {
    name: 'Dia Internacional da Felicidade',
    day: 20,
    month: 3,
    description: 'Celebração global promovendo o bem-estar e a alegria nas relações humanas',
    category: 'CULTURAL',
    targetAudience: 'ALL_CLIENTS',
  },

  // ABRIL
  {
    name: 'Sexta-feira Santa / Paixão de Cristo',
    day: 3,
    month: 4,
    description: 'Feriado Nacional — Reflexão, espiritualidade, serenidade e união familiar',
    category: 'FIXED',
    targetAudience: 'ALL_CLIENTS',
  },
  {
    name: 'Domingo de Páscoa',
    day: 5,
    month: 4,
    description: 'Celebração de renovação da esperança, recomeços e união em família',
    category: 'CULTURAL',
    targetAudience: 'ALL_CLIENTS',
  },
  {
    name: 'Dia dos Povos Indígenas',
    day: 19,
    month: 4,
    description: 'Valorização e respeito à riqueza cultural e raízes dos povos originários do Brasil',
    category: 'CULTURAL',
    targetAudience: 'ALL_CLIENTS',
  },
  {
    name: 'Tiradentes',
    day: 21,
    month: 4,
    description: 'Feriado Nacional — Homenagem aos ideais de liberdade e liderança histórica',
    category: 'FIXED',
    targetAudience: 'ALL_CLIENTS',
  },

  // MAIO
  {
    name: 'Dia do Trabalhador / Dia do Trabalho',
    day: 1,
    month: 5,
    description: 'Feriado Nacional — Reconhecimento a todos os profissionais que movem o país',
    category: 'FIXED',
    targetAudience: 'ALL_CLIENTS',
  },
  {
    name: 'Dia das Mães',
    day: 10,
    month: 5,
    description: 'Homenagem calorosa ao amor incondicional, dedicação e carinho de todas as mães',
    category: 'CULTURAL',
    targetAudience: 'ALL_CLIENTS',
  },
  {
    name: 'Dia Internacional da Família',
    day: 15,
    month: 5,
    description: 'Celebração da base de afeto, acolhimento e sustentação de nossas vidas',
    category: 'CULTURAL',
    targetAudience: 'ALL_CLIENTS',
  },

  // JUNHO
  {
    name: 'Corpus Christi',
    day: 4,
    month: 6,
    description: 'Ponto Facultativo — Tradição e fé expressas nos tapetes coloridos e união comunitária',
    category: 'CULTURAL',
    targetAudience: 'ALL_CLIENTS',
  },
  {
    name: 'Dia dos Namorados',
    day: 12,
    month: 6,
    description: 'Celebração do amor, parceria, cumplicidade e carinho entre casais',
    category: 'CULTURAL',
    targetAudience: 'ALL_CLIENTS',
  },
  {
    name: 'São João & Festas Juninas',
    day: 24,
    month: 6,
    description: 'Celebração da mais autêntica tradição popular, música e alegria brasileira',
    category: 'CULTURAL',
    targetAudience: 'ALL_CLIENTS',
  },

  // JULHO
  {
    name: 'Dia do Amigo e da Amizade',
    day: 20,
    month: 7,
    description: 'Celebrando laços verdadeiros de lealdade, parceria e confiança',
    category: 'CULTURAL',
    targetAudience: 'ALL_CLIENTS',
  },
  {
    name: 'Dia dos Avós',
    day: 26,
    month: 7,
    description: 'Homenagem e carinho à sabedoria, acolhimento e amor infinito dos avós',
    category: 'CULTURAL',
    targetAudience: 'ALL_CLIENTS',
  },

  // AGOSTO
  {
    name: 'Dia dos Pais',
    day: 9,
    month: 8,
    description: 'Celebração e reconhecimento do amor paterno, exemplo e orientação na família',
    category: 'CULTURAL',
    targetAudience: 'ALL_CLIENTS',
  },
  {
    name: 'Dia do Estudante & Dia do Advogado',
    day: 11,
    month: 8,
    description: 'Homenagem à busca contínua pelo saber, justiça e desenvolvimento social',
    category: 'CULTURAL',
    targetAudience: 'ALL_CLIENTS',
  },

  // SETEMBRO
  {
    name: 'Independência do Brasil',
    day: 7,
    month: 9,
    description: 'Feriado Nacional — Comemoração cívica da emancipação e soberania brasileira',
    category: 'FIXED',
    targetAudience: 'ALL_CLIENTS',
  },
  {
    name: 'Dia do Cliente',
    day: 15,
    month: 9,
    description: 'Data magna de agradecimento e celebração da parceria com nossos clientes',
    category: 'CORPORATE',
    targetAudience: 'ALL_CLIENTS',
  },
  {
    name: 'Dia da Árvore & Preservação',
    day: 21,
    month: 9,
    description: 'Conscientização ambiental e compromisso com o futuro sustentável do planeta',
    category: 'CULTURAL',
    targetAudience: 'ALL_CLIENTS',
  },

  // OUTUBRO
  {
    name: 'Dia Internacional do Idoso',
    day: 1,
    month: 10,
    description: 'Respeito, consideração e gratidão à experiência e sabedoria da melhor idade',
    category: 'CULTURAL',
    targetAudience: 'ALL_CLIENTS',
  },
  {
    name: 'Nossa Senhora Aparecida / Dia das Crianças',
    day: 12,
    month: 10,
    description: 'Feriado Nacional — Padroeira do Brasil e celebração da alegria e imaginação infantil',
    category: 'FIXED',
    targetAudience: 'ALL_CLIENTS',
  },
  {
    name: 'Dia dos Professores',
    day: 15,
    month: 10,
    description: 'Gratidão profunda aos educadores que transformam vidas e formam o futuro',
    category: 'CULTURAL',
    targetAudience: 'ALL_CLIENTS',
  },
  {
    name: 'Halloween & Dia do Saci',
    day: 31,
    month: 10,
    description: 'Celebração festiva, divertida e resgate do folclore cultural brasileiro',
    category: 'CULTURAL',
    targetAudience: 'ALL_CLIENTS',
  },

  // NOVEMBRO
  {
    name: 'Finados',
    day: 2,
    month: 11,
    description: 'Feriado Nacional — Dia de respeito, saudade e homenagem à memória dos entes queridos',
    category: 'FIXED',
    targetAudience: 'ALL_CLIENTS',
  },
  {
    name: 'Proclamação da República',
    day: 15,
    month: 11,
    description: 'Feriado Nacional — Celebração da cidadania, democracia e república no Brasil',
    category: 'FIXED',
    targetAudience: 'ALL_CLIENTS',
  },
  {
    name: 'Dia Nacional de Zumbi e da Consciência Negra',
    day: 20,
    month: 11,
    description: 'Feriado Nacional — Reflexão, igualdade e valorização da cultura afro-brasileira',
    category: 'FIXED',
    targetAudience: 'ALL_CLIENTS',
  },
  {
    name: 'Black Friday & Oportunidades Especiais',
    day: 27,
    month: 11,
    description: 'Temporada de benefícios, parcerias fortalecidas e condições exclusivas aos clientes',
    category: 'CORPORATE',
    targetAudience: 'ALL_CLIENTS',
  },

  // DEZEMBRO
  {
    name: 'Dia Nacional da Família',
    day: 8,
    month: 12,
    description: 'Valorização dos laços mais preciosos de afeto, cuidado e apoio mútuo',
    category: 'CULTURAL',
    targetAudience: 'ALL_CLIENTS',
  },
  {
    name: 'Véspera de Natal',
    day: 24,
    month: 12,
    description: 'Noite mágica de reunião, ceia, confraternização e abraços em família',
    category: 'FIXED',
    targetAudience: 'ALL_CLIENTS',
  },
  {
    name: 'Natal',
    day: 25,
    month: 12,
    description: 'Feriado Nacional — Celebração do nascimento, união, paz e amor ao próximo',
    category: 'FIXED',
    targetAudience: 'ALL_CLIENTS',
  },
  {
    name: 'Véspera de Ano Novo / Réveillon',
    day: 31,
    month: 12,
    description: 'Celebração de encerramento do ciclo e boas-vindas com esperança ao novo ano',
    category: 'FIXED',
    targetAudience: 'ALL_CLIENTS',
  },
];

export const ALL_MESSAGE_TEMPLATES = [
  // 1. ANIVERSÁRIOS DE CLIENTES
  {
    name: 'Aniversário do Cliente (WhatsApp)',
    eventType: 'CLIENT_BIRTHDAY',
    channel: 'WHATSAPP',
    content: `Olá, {{primeiro_nome}}! 🎉🎂

Hoje é um dia muito especial! Toda a equipe da {{nome_empresa}} deseja a você um feliz aniversário, com muita saúde, paz, prosperidade e momentos inesquecíveis.

É um imenso privilégio ter você como nosso cliente e parceiro. Parabéns pelo seu dia! ✨🎈`,
  },
  {
    name: 'Aniversário do Cliente (E-mail)',
    eventType: 'CLIENT_BIRTHDAY',
    channel: 'EMAIL',
    subject: '🎉 Feliz Aniversário, {{primeiro_nome}}! Os mais sinceros votos da {{nome_empresa}}',
    content: `Prezado(a) {{nome_cliente}},

Hoje é um dia de celebração e alegria! 🎂✨

Toda a equipe da {{nome_empresa}} vem, por meio desta mensagem, desejar a você um Feliz Aniversário, repleto de saúde, realizações e muitas conquistas pessoais e profissionais.

Agradecemos imensamente pela sua confiança e por fazer parte da nossa história. Que este novo ciclo venha acompanhado de momentos memoráveis ao lado das pessoas que você ama.

Parabéns pelo seu dia!

Com os melhores cumprimentos,
Equipe {{nome_empresa}}`,
  },

  // 2. ANIVERSÁRIOS DE FAMILIARES
  {
    name: 'Aniversário de Familiar (WhatsApp)',
    eventType: 'FAMILY_BIRTHDAY',
    channel: 'WHATSAPP',
    content: `Olá, {{primeiro_nome}}! 💐🥳

Soubemos que hoje {{parentesco_possessivo}}, {{nome_familiar}}, está celebrando mais um ano de vida! 

Nós da {{nome_empresa}} queremos estender nossos mais afetuosos parabéns e desejar um dia maravilhoso e repleto de celebrações para toda a sua família! 🥂✨`,
  },
  {
    name: 'Aniversário de Familiar (E-mail)',
    eventType: 'FAMILY_BIRTHDAY',
    channel: 'EMAIL',
    subject: '💐 Parabéns para {{nome_familiar}}! Votos especiais da {{nome_empresa}}',
    content: `Olá, {{primeiro_nome}},

Ficamos muito felizes em saber que hoje é aniversário de {{parentesco_possessivo}}, {{nome_familiar}}! 🥳🎂

Em nome de toda a equipe da {{nome_empresa}}, enviamos nossos mais calorosos cumprimentos e votos de muita saúde, alegria e união para toda a família.

Que seja um dia inesquecível e repleto de comemorações especiais!

Um grande abraço,
Equipe {{nome_empresa}}`,
  },

  // 3. ANO NOVO
  {
    name: 'Ano Novo / Confraternização Universal (WhatsApp)',
    eventType: 'FIXED_DATE',
    channel: 'WHATSAPP',
    dateNameMatch: 'Ano Novo / Confraternização Universal',
    content: `Feliz Ano Novo, {{primeiro_nome}}! 🎆🥂

Que este novo ciclo traga saúde, serenidade, novos projetos e grandes realizações para você e toda a sua família.

Muito obrigado por sua parceria e confiança. Estamos prontos para caminhar juntos em mais um ano de sucesso! ✨🤝 — {{nome_empresa}}`,
  },
  {
    name: 'Ano Novo / Confraternização Universal (E-mail)',
    eventType: 'FIXED_DATE',
    channel: 'EMAIL',
    dateNameMatch: 'Ano Novo / Confraternização Universal',
    subject: '🥂 Feliz Ano Novo! Que este novo ciclo seja de prosperidade e realizações — {{nome_empresa}}',
    content: `Prezado(a) {{nome_cliente}},

Um novo ano se inicia repleto de oportunidades, esperança e novas conquistas! 🎆✨

Nós da {{nome_empresa}} queremos expressar nossa gratidão pela sua parceria e reafirmar nosso compromisso com a excelência ao seu lado.

Desejamos a você e a todos os seus familiares um Ano Novo próspero, com muita saúde, sabedoria e momentos memoráveis.

Feliz Ano Novo!

Atenciosamente,
Equipe {{nome_empresa}}`,
  },

  // 4. DIA INTERNACIONAL DA MULHER
  {
    name: 'Dia Internacional da Mulher (WhatsApp)',
    eventType: 'FIXED_DATE',
    channel: 'WHATSAPP',
    dateNameMatch: 'Dia Internacional da Mulher',
    content: `Olá, {{primeiro_nome}}! 🌸✨

Neste Dia Internacional da Mulher, a equipe da {{nome_empresa}} presta sua homenagem a todas as mulheres por sua força, sensibilidade e liderança transformadora.

Parabéns por fazer a diferença todos os dias e inspirar o mundo ao seu redor! 💐👏`,
  },
  {
    name: 'Dia Internacional da Mulher (E-mail)',
    eventType: 'FIXED_DATE',
    channel: 'EMAIL',
    dateNameMatch: 'Dia Internacional da Mulher',
    subject: '🌸 Homenagem ao Dia Internacional da Mulher — {{nome_empresa}}',
    content: `Prezada {{nome_cliente}},

Neste 8 de Março, celebramos o Dia Internacional da Mulher com profundo respeito e admiração por sua trajetória, conquistas e determinação. 🌸✨

Agradecemos imensamente por sua presença e parceria com a {{nome_empresa}}. Que o seu dia seja repleto de reconhecimento e carinho.

Parabéns por sua força inspiradora!

Com carinho e admiração,
Equipe {{nome_empresa}}`,
  },

  // 5. DIA DO CONSUMIDOR
  {
    name: 'Dia do Consumidor (WhatsApp)',
    eventType: 'FIXED_DATE',
    channel: 'WHATSAPP',
    dateNameMatch: 'Dia Mundial dos Direitos do Consumidor',
    content: `Olá, {{primeiro_nome}}! 🛍️🤝

Hoje é o Dia do Consumidor e queremos agradecer por escolher a {{nome_empresa}}. 

Sua confiança é a nossa maior motivação para entregar o melhor atendimento e soluções de excelência. Conte sempre conosco! 💙✨`,
  },
  {
    name: 'Dia do Consumidor (E-mail)',
    eventType: 'FIXED_DATE',
    channel: 'EMAIL',
    dateNameMatch: 'Dia Mundial dos Direitos do Consumidor',
    subject: '🤝 Dia do Consumidor: Nosso agradecimento pela sua preferência — {{nome_empresa}}',
    content: `Prezado(a) {{nome_cliente}},

Hoje é o Dia Mundial do Consumidor, uma data dedicada a valorizar quem dá sentido a tudo o que fazemos: você! 🌟

Agradecemos pela parceria, pela confiança e pela oportunidade de fazer parte do seu dia a dia. Continuaremos trabalhando para superar suas expectativas com transparência, qualidade e dedicação.

Muito obrigado por ser nosso cliente!

Atenciosamente,
Equipe {{nome_empresa}}`,
  },

  // 6. DIA DAS MÃES
  {
    name: 'Dia das Mães (WhatsApp)',
    eventType: 'FIXED_DATE',
    channel: 'WHATSAPP',
    dateNameMatch: 'Dia das Mães',
    content: `Feliz Dia das Mães, {{primeiro_nome}}! 🌷💖

Hoje celebramos o amor mais puro e dedicado que existe. Que o seu dia seja iluminado, repleto de carinho, homenagens e abraços apertados.

A equipe da {{nome_empresa}} deseja a você um maravilhoso Dia das Mães! ✨💐`,
  },
  {
    name: 'Dia das Mães (E-mail)',
    eventType: 'FIXED_DATE',
    channel: 'EMAIL',
    dateNameMatch: 'Dia das Mães',
    subject: '🌷 Feliz Dia das Mães! Uma homenagem cheia de carinho da {{nome_empresa}}',
    content: `Prezada {{nome_cliente}},

Ser mãe é cultivar o amor em sua forma mais generosa, forte e inspiradora. 💖✨

Neste Dia das Mães, nós da {{nome_empresa}} queremos prestar nossa sincera homenagem a você, desejando que este domingo seja marcado por muita paz, sorrisos e celebrações em família.

Parabéns por sua dedicação incansável e por ser esse exemplo de vida!

Com muito carinho e admiração,
Equipe {{nome_empresa}}`,
  },

  // 7. DIA DOS PAIS
  {
    name: 'Dia dos Pais (WhatsApp)',
    eventType: 'FIXED_DATE',
    channel: 'WHATSAPP',
    dateNameMatch: 'Dia dos Pais',
    content: `Feliz Dia dos Pais, {{primeiro_nome}}! 👔💙

Hoje é dia de homenagear sua força, presença e dedicação exemplar na família. 

A equipe da {{nome_empresa}} deseja a você um dia memorável, cercado de carinho, respeito e momentos especiais com quem você mais ama! 🥂✨`,
  },
  {
    name: 'Dia dos Pais (E-mail)',
    eventType: 'FIXED_DATE',
    channel: 'EMAIL',
    dateNameMatch: 'Dia dos Pais',
    subject: '👔 Feliz Dia dos Pais! Nossos mais calorosos cumprimentos — {{nome_empresa}}',
    content: `Prezado {{nome_cliente}},

Ser pai é ser porto seguro, exemplo de integridade e inspiração diária para toda a família. 💙✨

Neste Dia dos Pais, a {{nome_empresa}} celebra a sua jornada e deseja que o seu dia seja repleto de reconhecimento, afeto e celebrações inesquecíveis.

Parabéns pelo seu dia!

Com sincera consideração,
Equipe {{nome_empresa}}`,
  },

  // 8. DIA DO CLIENTE
  {
    name: 'Dia do Cliente (WhatsApp)',
    eventType: 'FIXED_DATE',
    channel: 'WHATSAPP',
    dateNameMatch: 'Dia do Cliente',
    content: `Olá, {{primeiro_nome}}! 🌟🤝

Neste 15 de Setembro, celebramos o Dia do Cliente e o nosso maior motivo de comemoração é ter você caminhando ao nosso lado.

Muito obrigado por sua preferência, lealdade e confiança na {{nome_empresa}}. É uma honra atendê-lo(a)! ✨💙`,
  },
  {
    name: 'Dia do Cliente (E-mail)',
    eventType: 'FIXED_DATE',
    channel: 'EMAIL',
    dateNameMatch: 'Dia do Cliente',
    subject: '🌟 15 de Setembro — Feliz Dia do Cliente! Nossa sincera gratidão — {{nome_empresa}}',
    content: `Prezado(a) {{nome_cliente}},

Hoje é um dos dias mais importantes do nosso calendário: o Dia do Cliente! 🌟🤝

Cada projeto, melhoria e conquista da {{nome_empresa}} existe para entregar a melhor experiência e os melhores resultados para você. 

Agradecemos imensamente pela sua confiança contínua e parceria ao longo de toda a nossa caminhada.

Conte sempre com nossa dedicação integral!

Com estima e gratidão,
Equipe {{nome_empresa}}`,
  },

  // 9. NATAL
  {
    name: 'Natal & Boas Festas (WhatsApp)',
    eventType: 'FIXED_DATE',
    channel: 'WHATSAPP',
    dateNameMatch: 'Natal',
    content: `Feliz Natal, {{primeiro_nome}}! 🎄✨

Que o espírito natalino encha o seu lar de harmonia, saúde, luz e união. Nós da {{nome_empresa}} agradecemos imensamente por mais um ano de parceria.

Tenha uma noite mágica e abençoada ao lado de quem você ama! 🥂🎁`,
  },
  {
    name: 'Natal & Boas Festas (E-mail)',
    eventType: 'FIXED_DATE',
    channel: 'EMAIL',
    dateNameMatch: 'Natal',
    subject: '🎄 Feliz Natal e Boas Festas! Agradecemos por caminhar ao nosso lado — {{nome_empresa}}',
    content: `Prezado(a) {{nome_cliente}},

O Natal é a época mais bonita do ano, momento de reunir quem amamos, celebrar a vida e renovar a esperança e a fraternidade em nossos corações. 🎄✨

Agradecemos imensamente pela confiança depositada na {{nome_empresa}} durante todo este ano. Foi um grande prazer atendê-lo(a) e compartilhar conquistas juntos.

Desejamos a você e a todos os seus familiares um Santo e Feliz Natal!

Com profundo respeito e gratidão,
Equipe {{nome_empresa}}`,
  },
];

async function main() {
  console.log('🌱 [SEED] Iniciando seed idempotente do Enlace CRM...');

  // 1. Criar usuário inicial seguro apenas se variáveis de bootstrap forem fornecidas
  const bootstrapEmail = process.env.BOOTSTRAP_ADMIN_EMAIL || process.env.MASTER_EMAIL;
  const bootstrapPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD;

  if (bootstrapEmail && bootstrapPassword) {
    const cleanEmail = bootstrapEmail.toLowerCase().trim();
    const isMaster = cleanEmail === (process.env.MASTER_EMAIL || '').toLowerCase().trim();
    const role = isMaster ? 'MASTER' : 'ADMIN';
    const passwordHash = await bcrypt.hash(bootstrapPassword, 10);

    const user = await prisma.user.upsert({
      where: { email: cleanEmail },
      update: {
        name: isMaster ? 'Administrador Master' : 'Administrador',
        passwordHash,
        role,
        status: 'ACTIVE',
      },
      create: {
        name: isMaster ? 'Administrador Master' : 'Administrador',
        email: cleanEmail,
        passwordHash,
        role,
        status: 'ACTIVE',
        companyId: 'default_company',
      },
    });
    console.log(`✅ [SEED] Usuário inicial bootstrap configurado para ${user.email} (Role: ${user.role})`);
  } else {
    console.log('ℹ️ [SEED] Nenhum usuário bootstrap criado (defina BOOTSTRAP_ADMIN_EMAIL e BOOTSTRAP_ADMIN_PASSWORD para inicializar admin via seed).');
  }

  // 2. Configurações padrão da empresa (sem dados sensíveis)
  await prisma.companySettings.upsert({
    where: { id: 'default_company' },
    update: {},
    create: {
      id: 'default_company',
      companyName: 'Enlace Soluções Corporativas',
      tradeName: 'Enlace CRM',
      document: '',
      contactEmail: '',
      contactPhone: '',
      ownerWhatsappPhone: '',
      callmebotApiKey: '',
      callmebotEnabled: true,
      callmebotSimulateMode: true,
      schedulerHour: 6,
      schedulerMinute: 0,
      schedulerEnabled: true,
    },
  });
  console.log('✅ [SEED] Configurações padrão da empresa garantidas');

  // 3. Cadastrar Todas as Datas Comemorativas (Idempotente)
  for (const dateData of ALL_ANNUAL_COMMEMORATIVE_DATES) {
    const existing = await prisma.commemorativeDate.findFirst({
      where: { name: dateData.name, month: dateData.month, day: dateData.day },
    });

    if (!existing) {
      await prisma.commemorativeDate.create({
        data: dateData,
      });
    } else {
      await prisma.commemorativeDate.update({
        where: { id: existing.id },
        data: {
          description: dateData.description,
          category: dateData.category,
          targetAudience: dateData.targetAudience,
        },
      });
    }
  }
  console.log(`✅ [SEED] ${ALL_ANNUAL_COMMEMORATIVE_DATES.length} datas comemorativas fixas sincronizadas`);

  // 4. Cadastrar Templates de Mensagens (Idempotente)
  const dbDates = await prisma.commemorativeDate.findMany();

  for (const tpl of ALL_MESSAGE_TEMPLATES) {
    let dateId: string | null = null;
    if (tpl.dateNameMatch) {
      const match = dbDates.find((d) => d.name.toLowerCase().includes(tpl.dateNameMatch!.toLowerCase()));
      if (match) {
        dateId = match.id;
      }
    }

    const existingTemplate = await prisma.messageTemplate.findFirst({
      where: { name: tpl.name, eventType: tpl.eventType, channel: tpl.channel },
    });

    if (!existingTemplate) {
      await prisma.messageTemplate.create({
        data: {
          name: tpl.name,
          eventType: tpl.eventType,
          channel: tpl.channel,
          subject: (tpl as any).subject || null,
          commemorativeDateId: dateId,
          content: tpl.content,
          active: true,
        },
      });
    } else {
      await prisma.messageTemplate.update({
        where: { id: existingTemplate.id },
        data: {
          subject: (tpl as any).subject || null,
          commemorativeDateId: dateId,
          content: tpl.content,
          active: true,
        },
      });
    }
  }
  console.log(`✅ [SEED] ${ALL_MESSAGE_TEMPLATES.length} templates de mensagens sincronizados`);

  console.log('🎉 [SEED] Finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ [SEED Error]:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
