import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TemplateSeedItem {
  name: string;
  eventType: 'CLIENT_BIRTHDAY' | 'FAMILY_BIRTHDAY' | 'FIXED_DATE';
  channel: 'WHATSAPP' | 'EMAIL';
  dateNameMatch?: string; // name in commemorativeDate table
  subject?: string;
  content: string;
}

export const ALL_MESSAGE_TEMPLATES: TemplateSeedItem[] = [
  // =========================================================================
  // 1. ANIVERSÁRIOS DE CLIENTES
  // =========================================================================
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

  // =========================================================================
  // 2. ANIVERSÁRIOS DE FAMILIARES
  // =========================================================================
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

  // =========================================================================
  // 3. ANO NOVO / CONFRATERNIZAÇÃO UNIVERSAL (01/01)
  // =========================================================================
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

  // =========================================================================
  // 4. CARNAVAL (17/02)
  // =========================================================================
  {
    name: 'Carnaval & Festividades (WhatsApp)',
    eventType: 'FIXED_DATE',
    channel: 'WHATSAPP',
    dateNameMatch: 'Carnaval / Terça-feira Gorda',
    content: `Olá, {{primeiro_nome}}! 🎭🎉

Desejamos a você um excelente período de Carnaval! Que esses dias sejam de descanso, boas energias e muita alegria ao lado das pessoas que você ama.

Aproveite com segurança e renove as energias! ✨ — {{nome_empresa}}`,
  },
  {
    name: 'Carnaval & Festividades (E-mail)',
    eventType: 'FIXED_DATE',
    channel: 'EMAIL',
    dateNameMatch: 'Carnaval / Terça-feira Gorda',
    subject: '🎭 Desejamos um ótimo Carnaval e um excelente descanso! — {{nome_empresa}}',
    content: `Olá, {{primeiro_nome}},

O Carnaval chegou e é o momento perfeito para recarregar as energias, descansar e desfrutar de bons momentos ao lado da família e amigos! 🎉✨

A equipe da {{nome_empresa}} deseja a você um feriado com muita paz, alegria e segurança.

Um abraço,
Equipe {{nome_empresa}}`,
  },

  // =========================================================================
  // 5. DIA INTERNACIONAL DA MULHER (08/03)
  // =========================================================================
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

  // =========================================================================
  // 6. DIA DO CONSUMIDOR (15/03)
  // =========================================================================
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

Cordialmente,
Equipe {{nome_empresa}}`,
  },

  // =========================================================================
  // 7. PÁSCOA (05/04)
  // =========================================================================
  {
    name: 'Páscoa & Renovação (WhatsApp)',
    eventType: 'FIXED_DATE',
    channel: 'WHATSAPP',
    dateNameMatch: 'Domingo de Páscoa',
    content: `Feliz Páscoa, {{primeiro_nome}}! 🕊️🍫

Que este domingo seja repleto de amor, paz, esperança e momentos acolhedores em família. Que a renovação da Páscoa ilumine seus caminhos!

São os votos de toda a equipe {{nome_empresa}}! 💖✨`,
  },
  {
    name: 'Páscoa & Renovação (E-mail)',
    eventType: 'FIXED_DATE',
    channel: 'EMAIL',
    dateNameMatch: 'Domingo de Páscoa',
    subject: '🕊️ Feliz Páscoa! Votos de paz, harmonia e renovação — {{nome_empresa}}',
    content: `Olá, {{primeiro_nome}},

A Páscoa é um momento especial de união, partilha e renovação das esperanças em nossos corações. 🕊️✨

Desejamos a você e a todos os seus familiares um domingo doce, iluminado e abençoado.

Feliz Páscoa!

Abraços fraternos,
Equipe {{nome_empresa}}`,
  },

  // =========================================================================
  // 8. DIA DO TRABALHO (01/05)
  // =========================================================================
  {
    name: 'Dia do Trabalhador (WhatsApp)',
    eventType: 'FIXED_DATE',
    channel: 'WHATSAPP',
    dateNameMatch: 'Dia do Trabalhador / Dia do Trabalho',
    content: `Olá, {{primeiro_nome}}! 💼👏

Neste 1º de Maio, parabenizamos você pelo seu trabalho, dedicação e empenho diário. São os profissionais dedicados que constroem um futuro melhor para todos!

Tenha um excelente feriado de descanso e merecido reconhecimento! 🌟 — {{nome_empresa}}`,
  },
  {
    name: 'Dia do Trabalhador (E-mail)',
    eventType: 'FIXED_DATE',
    channel: 'EMAIL',
    dateNameMatch: 'Dia do Trabalhador / Dia do Trabalho',
    subject: '💼 Homenagem ao Dia do Trabalhador — {{nome_empresa}}',
    content: `Prezado(a) {{nome_cliente}},

O trabalho é a força motriz que realiza sonhos, gera oportunidades e transforma a sociedade. 🌟✨

Neste Dia do Trabalhador, queremos parabenizar você pela sua dedicação, perseverança e talento. Que o seu esforço continue rendendo frutos valorosos.

Tenha um excelente dia de descanso e celebração!

Atenciosamente,
Equipe {{nome_empresa}}`,
  },

  // =========================================================================
  // 9. DIA DAS MÃES (10/05)
  // =========================================================================
  {
    name: 'Dia das Mães (WhatsApp)',
    eventType: 'FIXED_DATE',
    channel: 'WHATSAPP',
    dateNameMatch: 'Dia das Mães',
    content: `Olá, {{primeiro_nome}}! 🌸💐

Neste Dia das Mães, a equipe da {{nome_empresa}} deseja a você e sua família um domingo repleto de afeto, carinho, sorrisos e abraços apertados.

Parabéns a todas as mães pelo amor incondicional que ilumina nossas vidas! 💖✨`,
  },
  {
    name: 'Dia das Mães (E-mail)',
    eventType: 'FIXED_DATE',
    channel: 'EMAIL',
    dateNameMatch: 'Dia das Mães',
    subject: '🌸 Feliz Dia das Mães! Uma homenagem especial da {{nome_empresa}}',
    content: `Prezada {{nome_cliente}},

Mãe é sinônimo de amor sem medidas, aconchego, força e sabedoria. 💖💐

Neste domingo tão especial, a {{nome_empresa}} deseja a você e à sua família um Dia das Mães memorável, com muitos abraços, gratidão e sorrisos.

Que seja um dia abençoado e repleto de momentos inesquecíveis!

Com carinho,
Equipe {{nome_empresa}}`,
  },

  // =========================================================================
  // 10. DIA DOS NAMORADOS (12/06)
  // =========================================================================
  {
    name: 'Dia dos Namorados (WhatsApp)',
    eventType: 'FIXED_DATE',
    channel: 'WHATSAPP',
    dateNameMatch: 'Dia dos Namorados',
    content: `Feliz Dia dos Namorados, {{primeiro_nome}}! ❤️🥂

Que o amor, a cumplicidade, a parceria e o carinho estejam sempre presentes em sua vida. Tenha um dia especial e cheio de comemorações ao lado de quem você ama! ✨ — {{nome_empresa}}`,
  },
  {
    name: 'Dia dos Namorados (E-mail)',
    eventType: 'FIXED_DATE',
    channel: 'EMAIL',
    dateNameMatch: 'Dia dos Namorados',
    subject: '❤️ Feliz Dia dos Namorados! Celebre o amor e a união — {{nome_empresa}}',
    content: `Olá, {{primeiro_nome}},

O amor e a parceria são o tempero especial que tornam a caminhada mais leve e bonita! ❤️✨

Neste 12 de Junho, a {{nome_empresa}} deseja a você momentos inesquecíveis de cumplicidade, carinho e celebração.

Feliz Dia dos Namorados!

Abraços,
Equipe {{nome_empresa}}`,
  },

  // =========================================================================
  // 11. SÃO JOÃO & FESTAS JUNINAS (24/06)
  // =========================================================================
  {
    name: 'São João & Festas Juninas (WhatsApp)',
    eventType: 'FIXED_DATE',
    channel: 'WHATSAPP',
    dateNameMatch: 'São João & Festas Juninas',
    content: `Viva São João, {{primeiro_nome}}! 🌽🔥🪗

Que o calor da fogueira, a alegria das tradições e a companhia de quem a gente gosta tragam muita paz e festança boa para você e sua família!

Um excelente São João! 🎊 — {{nome_empresa}}`,
  },
  {
    name: 'São João & Festas Juninas (E-mail)',
    eventType: 'FIXED_DATE',
    channel: 'EMAIL',
    dateNameMatch: 'São João & Festas Juninas',
    subject: '🌽 Viva São João! Alegria, tradição e boas energias — {{nome_empresa}}',
    content: `Olá, {{primeiro_nome}},

O mês de junho traz uma das tradições mais queridas e alegres do nosso país! 🔥✨

Nós da {{nome_empresa}} desejamos a você e toda a sua família um período junino com muita música, comidas típicas, união e celebração.

Bom São João!

Com carinho,
Equipe {{nome_empresa}}`,
  },

  // =========================================================================
  // 12. DIA DOS PAIS (09/08)
  // =========================================================================
  {
    name: 'Dia dos Pais (WhatsApp)',
    eventType: 'FIXED_DATE',
    channel: 'WHATSAPP',
    dateNameMatch: 'Dia dos Pais',
    content: `Olá, {{primeiro_nome}}! 👔🌟

Neste Dia dos Pais, a equipe da {{nome_empresa}} deseja a você e sua família um domingo abençoado, repleto de momentos especiais, carinho e celebração.

Parabéns a todos os pais pelo exemplo, proteção e dedicação! 🥂👏`,
  },
  {
    name: 'Dia dos Pais (E-mail)',
    eventType: 'FIXED_DATE',
    channel: 'EMAIL',
    dateNameMatch: 'Dia dos Pais',
    subject: '👔 Feliz Dia dos Pais! Uma homenagem especial da {{nome_empresa}}',
    content: `Prezado(a) {{nome_cliente}},

Ser pai é ser porto seguro, exemplo de integridade, dedicação e guia para a vida inteira. 👔✨

Neste Dia dos Pais, a {{nome_empresa}} parabeniza você e todos os pais de sua família. Que este domingo seja repleto de boas lembranças, abraços e homenagens merecidas.

Feliz Dia dos Pais!

Atenciosamente,
Equipe {{nome_empresa}}`,
  },

  // =========================================================================
  // 13. DIA DO CLIENTE (15/09)
  // =========================================================================
  {
    name: 'Dia do Cliente (WhatsApp)',
    eventType: 'FIXED_DATE',
    channel: 'WHATSAPP',
    dateNameMatch: 'Dia do Cliente',
    content: `Olá, {{primeiro_nome}}! 🌟🤝

Hoje é o Dia do Cliente e nós da {{nome_empresa}} queremos expressar nossa mais sincera gratidão pela sua preferência e parceria constante.

Você é o motivo de buscarmos a excelência todos os dias. Muito obrigado por caminhar conosco! 💙✨`,
  },
  {
    name: 'Dia do Cliente (E-mail)',
    eventType: 'FIXED_DATE',
    channel: 'EMAIL',
    dateNameMatch: 'Dia do Cliente',
    subject: '🌟 Dia do Cliente: Obrigado por sua parceria e confiança! — {{nome_empresa}}',
    content: `Prezado(a) {{nome_cliente}},

No Dia do Cliente, dedicamos nosso mais profundo agradecimento a você, que confia no nosso trabalho e faz parte da nossa jornada. 🌟🤝

Sua parceria nos inspira a aprimorar nossos processos e oferecer sempre a mais alta qualidade. É um verdadeiro privilégio atendê-lo(a).

Muito obrigado por sua preferência e confiança!

Com consideração e apreço,
Equipe {{nome_empresa}}`,
  },

  // =========================================================================
  // 14. DIA DAS CRIANÇAS (12/10)
  // =========================================================================
  {
    name: 'Dia das Crianças (WhatsApp)',
    eventType: 'FIXED_DATE',
    channel: 'WHATSAPP',
    dateNameMatch: 'Nossa Senhora Aparecida / Dia das Crianças',
    content: `Olá, {{primeiro_nome}}! 🎈🧸

Que a pureza, a alegria contagiante e a imaginação das crianças inspirem o nosso dia a dia. Desejamos a você e toda sua família um feriado iluminado e cheio de sorrisos!

Feliz Dia das Crianças! ✨ — {{nome_empresa}}`,
  },
  {
    name: 'Dia das Crianças (E-mail)',
    eventType: 'FIXED_DATE',
    channel: 'EMAIL',
    dateNameMatch: 'Nossa Senhora Aparecida / Dia das Crianças',
    subject: '🎈 Feliz Dia das Crianças! Que a alegria e o encanto façam parte do seu dia — {{nome_empresa}}',
    content: `Olá, {{primeiro_nome}},

As crianças nos ensinam diariamente sobre a beleza da simplicidade, a curiosidade pelo mundo e a alegria sincera de viver! 🧸✨

Desejamos a você e sua família um excelente feriado de 12 de Outubro, repleto de momentos leves e prazerosos ao lado dos pequenos.

Com carinho,
Equipe {{nome_empresa}}`,
  },

  // =========================================================================
  // 15. BLACK FRIDAY (27/11)
  // =========================================================================
  {
    name: 'Black Friday & Oportunidades (WhatsApp)',
    eventType: 'FIXED_DATE',
    channel: 'WHATSAPP',
    dateNameMatch: 'Black Friday & Oportunidades Especiais',
    content: `Olá, {{primeiro_nome}}! 🏷️⚡

A temporada de oportunidades especiais chegou! Na {{nome_empresa}}, preparamos condições exclusivas para valorizar nossos parceiros e clientes fiéis.

Fale com nossa equipe e confira o que reservamos para você! 🤝🚀`,
  },
  {
    name: 'Black Friday & Oportunidades (E-mail)',
    eventType: 'FIXED_DATE',
    channel: 'EMAIL',
    dateNameMatch: 'Black Friday & Oportunidades Especiais',
    subject: '🏷️ Condições Especiais e Exclusivas para Clientes Parceiros — {{nome_empresa}}',
    content: `Prezado(a) {{nome_cliente}},

Nesta temporada especial, queremos expressar nosso apreço pela sua parceria oferecendo condições e novidades exclusivas preparadas especialmente para você. 🌟⚡

Entre em contato com nossa equipe para conhecer os benefícios e oportunidades dedicadas ao seu perfil.

Estamos à sua inteira disposição!

Atenciosamente,
Equipe {{nome_empresa}}`,
  },

  // =========================================================================
  // 16. NATAL & BOAS FESTAS (25/12)
  // =========================================================================
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

  // =========================================================================
  // 17. VÉSPERA DE ANO NOVO / RÉVEILLON (31/12)
  // =========================================================================
  {
    name: 'Véspera de Ano Novo / Réveillon (WhatsApp)',
    eventType: 'FIXED_DATE',
    channel: 'WHATSAPP',
    dateNameMatch: 'Véspera de Ano Novo / Réveillon',
    content: `Prezado(a) {{primeiro_nome}}! 🥂🎆

Estamos nos despedindo de mais um ano de muito trabalho e vitórias! A equipe da {{nome_empresa}} agradece pela caminhada conjunta e deseja a você um Réveillon inesquecível e um Ano Novo extraordinário!

Boas Festas e até 2027! ✨🤝`,
  },
  {
    name: 'Véspera de Ano Novo / Réveillon (E-mail)',
    eventType: 'FIXED_DATE',
    channel: 'EMAIL',
    dateNameMatch: 'Véspera de Ano Novo / Réveillon',
    subject: '🥂 Brindemos ao encerramento de um grande ano! Feliz Réveillon — {{nome_empresa}}',
    content: `Prezado(a) {{nome_cliente}},

Ao encerrarmos mais um ciclo, olhamos para trás com gratidão por todas as metas alcançadas e pela parceria de valor que construímos com você. 🥂🎆

Que a virada do ano renove suas energias, traga prosperidade e abra as portas para grandes realizações no ano que se inicia.

Tenha uma noite de Réveillon maravilhosa ao lado de seus entes queridos!

Um grande abraço,
Equipe {{nome_empresa}}`,
  },
];

export async function seedAllTemplates() {
  console.log('📝 Populando templates prontos para WhatsApp e E-mail no Supabase...');

  // Buscar datas para vincular com commemorativeDateId
  const dbDates = await prisma.commemorativeDate.findMany();

  // Limpar templates anteriores
  await prisma.messageTemplate.deleteMany({});

  for (const tpl of ALL_MESSAGE_TEMPLATES) {
    let dateId: string | null = null;
    if (tpl.dateNameMatch) {
      const match = dbDates.find((d) => d.name.toLowerCase().includes(tpl.dateNameMatch!.toLowerCase()));
      if (match) {
        dateId = match.id;
      }
    }

    await prisma.messageTemplate.create({
      data: {
        name: tpl.name,
        eventType: tpl.eventType,
        channel: tpl.channel,
        subject: tpl.subject || null,
        commemorativeDateId: dateId,
        content: tpl.content,
        active: true,
      },
    });
  }

  console.log(`✅ ${ALL_MESSAGE_TEMPLATES.length} templates cadastrados com sucesso (WhatsApp & E-mail)!`);
}

if (require.main === module) {
  seedAllTemplates()
    .catch(console.error)
    .finally(async () => {
      await prisma.$disconnect();
    });
}
