import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAndUpdateTemplates() {
  const templates = await prisma.messageTemplate.findMany();
  console.log(`Encontrados ${templates.length} templates no banco.`);
  
  for (const t of templates) {
    console.log(`- [${t.eventType}] [${t.channel}] ${t.name}:`);
    console.log(`  Conteúdo: ${t.content}`);
    
    // Se o template de aniversário de familiar ainda estiver falando com o titular sobre o familiar, atualiza para falar direto com o familiar!
    if (t.eventType === 'FAMILY_BIRTHDAY') {
      const newContent = t.channel === 'WHATSAPP'
        ? `Olá, {{nome_familiar}}! 💐🎂\n\nHoje é um dia muito especial! Toda a equipe da {{nome_empresa}} deseja a você um feliz aniversário, com muita saúde, paz, alegria e momentos inesquecíveis!\n\nQue seu novo ciclo seja repleto de carinho e realizações ao lado de toda a sua família. Parabéns pelo seu dia! ✨🎈`
        : `Prezada(o) {{nome_familiar}},\n\nHoje é um dia de celebração! 🎂✨\n\nToda a equipe da {{nome_empresa}} deseja a você um Feliz Aniversário, com muita saúde, paz e realizações!\n\nCordialmente,\nEquipe {{nome_empresa}}`;
      
      const newSubject = `🎉 Feliz Aniversário, {{nome_familiar}}! — {{nome_empresa}}`;

      await prisma.messageTemplate.update({
        where: { id: t.id },
        data: { content: newContent, subject: newSubject },
      });
      console.log(`  ✅ Atualizado para falar diretamente com o familiar!`);
    }
  }
}

checkAndUpdateTemplates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
