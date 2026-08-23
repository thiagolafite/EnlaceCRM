"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_COMMEMORATIVE_DATES = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
exports.DEFAULT_COMMEMORATIVE_DATES = [
    // JANEIRO
    {
        name: 'Ano Novo / Confraternização Universal',
        day: 1,
        month: 1,
        description: 'Feriado Nacional — Celebração do início de um novo ano repleto de paz e prosperidade',
        category: 'FIXED',
        targetAudience: 'ALL_CLIENTS',
    },
    // MARÇO
    {
        name: 'Dia Internacional da Mulher',
        day: 8,
        month: 3,
        description: 'Homenagem ao protagonismo, força e conquistas de todas as mulheres',
        category: 'CULTURAL',
        targetAudience: 'ALL_CLIENTS',
    },
    {
        name: 'Dia do Consumidor',
        day: 15,
        month: 3,
        description: 'Data corporativa de valorização dos direitos, parceria e preferência dos clientes',
        category: 'CORPORATE',
        targetAudience: 'ALL_CLIENTS',
    },
    // ABRIL
    {
        name: 'Tiradentes',
        day: 21,
        month: 4,
        description: 'Feriado Nacional — Homenagem a Joaquim José da Silva Xavier e aos ideais de liberdade',
        category: 'FIXED',
        targetAudience: 'ALL_CLIENTS',
    },
    // MAIO
    {
        name: 'Dia do Trabalhador',
        day: 1,
        month: 5,
        description: 'Feriado Nacional — Homenagem a todos os trabalhadores e profissionais',
        category: 'FIXED',
        targetAudience: 'ALL_CLIENTS',
    },
    {
        name: 'Dia das Mães',
        day: 10,
        month: 5,
        description: 'Celebração do amor incondicional materno e união familiar',
        category: 'CULTURAL',
        targetAudience: 'ALL_CLIENTS',
    },
    // JUNHO
    {
        name: 'Dia dos Namorados',
        day: 12,
        month: 6,
        description: 'Celebração do amor, cumplicidade e união entre casais',
        category: 'CULTURAL',
        targetAudience: 'ALL_CLIENTS',
    },
    {
        name: 'São João & Festas Juninas',
        day: 24,
        month: 6,
        description: 'Celebração da rica tradição cultural brasileira e alegria das festas juninas',
        category: 'CULTURAL',
        targetAudience: 'ALL_CLIENTS',
    },
    // JULHO
    {
        name: 'Dia do Amigo e da Amizade',
        day: 20,
        month: 7,
        description: 'Celebração dos laços sinceros de amizade, carinho e companheirismo',
        category: 'CULTURAL',
        targetAudience: 'ALL_CLIENTS',
    },
    {
        name: 'Dia dos Avós',
        day: 26,
        month: 7,
        description: 'Homenagem e carinho à sabedoria e amor dos avós na família',
        category: 'CULTURAL',
        targetAudience: 'ALL_CLIENTS',
    },
    // AGOSTO
    {
        name: 'Dia dos Pais',
        day: 9,
        month: 8,
        description: 'Celebração e reconhecimento do amor paterno e dedicação familiar',
        category: 'CULTURAL',
        targetAudience: 'ALL_CLIENTS',
    },
    // SETEMBRO
    {
        name: 'Independência do Brasil',
        day: 7,
        month: 9,
        description: 'Feriado Nacional — Comemoração da emancipação e história do Brasil',
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
    // OUTUBRO
    {
        name: 'Dia Internacional do Idoso',
        day: 1,
        month: 10,
        description: 'Respeito, carinho e valorização da sabedoria da melhor idade',
        category: 'CULTURAL',
        targetAudience: 'ALL_CLIENTS',
    },
    {
        name: 'Nossa Senhora Aparecida / Dia das Crianças',
        day: 12,
        month: 10,
        description: 'Feriado Nacional — Padroeira do Brasil e celebração da alegria da infância',
        category: 'FIXED',
        targetAudience: 'ALL_CLIENTS',
    },
    {
        name: 'Dia dos Professores',
        day: 15,
        month: 10,
        description: 'Homenagem e gratidão aos mestres e educadores que transformam o futuro',
        category: 'CULTURAL',
        targetAudience: 'ALL_CLIENTS',
    },
    // NOVEMBRO
    {
        name: 'Finados',
        day: 2,
        month: 11,
        description: 'Feriado Nacional — Dia de respeito e memória aos entes queridos',
        category: 'FIXED',
        targetAudience: 'ALL_CLIENTS',
    },
    {
        name: 'Proclamação da República',
        day: 15,
        month: 11,
        description: 'Feriado Nacional — Marco histórico da instituição da República no Brasil',
        category: 'FIXED',
        targetAudience: 'ALL_CLIENTS',
    },
    {
        name: 'Dia Nacional da Consciência Negra',
        day: 20,
        month: 11,
        description: 'Feriado Nacional — Reflexão, valorização da cultura afro-brasileira e igualdade',
        category: 'FIXED',
        targetAudience: 'ALL_CLIENTS',
    },
    {
        name: 'Black Friday & Oportunidades Especiais',
        day: 27,
        month: 11,
        description: 'Temporada de benefícios, ofertas e condições exclusivas para clientes parceiros',
        category: 'CORPORATE',
        targetAudience: 'ALL_CLIENTS',
    },
    // DEZEMBRO
    {
        name: 'Natal',
        day: 25,
        month: 12,
        description: 'Feriado Nacional — Celebração de harmonia, união, paz e renovação da esperança',
        category: 'FIXED',
        targetAudience: 'ALL_CLIENTS',
    },
    {
        name: 'Véspera de Ano Novo / Réveillon',
        day: 31,
        month: 12,
        description: 'Celebração de encerramento do ciclo e boas-vindas ao novo ano',
        category: 'FIXED',
        targetAudience: 'ALL_CLIENTS',
    },
];
async function main() {
    console.log('🌱 Iniciando Seed do Enlace CRM...');
    // 1. Criar Usuário Admin Inicial
    const adminPassword = await bcryptjs_1.default.hash('admin123', 10);
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
            companyName: 'Enlace Tecnologia e Relacionamento',
            tradeName: 'Enlace CRM',
            document: '12.345.678/0001-90',
            contactEmail: 'contato@enlacecrm.com.br',
            contactPhone: '+5571981805744',
            ownerWhatsappPhone: '+5571981805744',
            callmebotApiKey: '',
            callmebotEnabled: true,
            callmebotSimulateMode: false,
            schedulerHour: 6,
            schedulerMinute: 0,
            schedulerEnabled: true,
        },
    });
    console.log('🏢 Configurações da Empresa criadas (CallMeBot)');
    // 3. Cadastrar Todas as Datas Comemorativas e Feriados Padrão
    for (const dateData of exports.DEFAULT_COMMEMORATIVE_DATES) {
        const existing = await prisma.commemorativeDate.findFirst({
            where: { name: dateData.name, month: dateData.month, day: dateData.day },
        });
        if (!existing) {
            await prisma.commemorativeDate.create({
                data: dateData,
            });
        }
        else {
            await prisma.commemorativeDate.update({
                where: { id: existing.id },
                data: {
                    description: dateData.description,
                    category: dateData.category,
                    targetAudience: dateData.targetAudience,
                    active: true,
                },
            });
        }
    }
    console.log(`📅 ${exports.DEFAULT_COMMEMORATIVE_DATES.length} Datas comemorativas e feriados nacionais cadastrados!`);
    // 4. Criar Templates de Mensagens Padrão para WhatsApp
    const templatesData = [
        {
            name: 'Aniversário do Cliente (WhatsApp)',
            eventType: 'CLIENT_BIRTHDAY',
            channel: 'WHATSAPP',
            content: `Olá, {{primeiro_nome}}! 🎉🎂

Hoje é um dia muito especial! Toda a equipe da {{nome_empresa}} deseja a você um feliz aniversário, repleto de saúde, conquistas e momentos inesquecíveis.

É um imenso privilégio ter você conosco. Parabéns pelo seu dia! ✨🎈`,
            active: true,
        },
        {
            name: 'Aniversário de Familiar (WhatsApp)',
            eventType: 'FAMILY_BIRTHDAY',
            channel: 'WHATSAPP',
            content: `Olá, {{primeiro_nome}}! 💐

Soubemos que hoje {{parentesco_possessivo}}, {{nome_familiar}}, está comemorando aniversário! 🥳

Nós da {{nome_empresa}} queremos estender nossos mais calorosos parabéns e desejar um dia maravilhoso e cheio de celebrações para toda a sua família! 🥂✨`,
            active: true,
        },
        {
            name: 'Data Fixa — Dia do Cliente (WhatsApp)',
            eventType: 'FIXED_DATE',
            channel: 'WHATSAPP',
            content: `Olá, {{primeiro_nome}}! 🌟

Hoje é o Dia do Cliente e queremos expressar nossa mais sincera gratidão pela sua confiança e parceria com a {{nome_empresa}}.

Você é o motivo de buscarmos a excelência todos os dias. Muito obrigado por caminhar ao nosso lado! 🤝💙`,
            active: true,
        },
        {
            name: 'Data Fixa — Natal & Boas Festas (WhatsApp)',
            eventType: 'FIXED_DATE',
            channel: 'WHATSAPP',
            content: `Prezado(a) {{primeiro_nome}}! 🎄✨

Ao encerrarmos mais um ciclo, nós da {{nome_empresa}} queremos desejar a você e toda sua família um Feliz Natal e um Ano Novo repleto de realizações, saúde e sucesso!

Que o próximo ano seja ainda mais brilhante! 🥂🎆`,
            active: true,
        },
        {
            name: 'Data Fixa — Dia das Mães (WhatsApp)',
            eventType: 'FIXED_DATE',
            channel: 'WHATSAPP',
            content: `Olá, {{primeiro_nome}}! 🌸💐

Neste Dia das Mães, nós da {{nome_empresa}} queremos desejar a você e sua família um dia repleto de amor, carinho e momentos especiais.

Parabéns a todas as mães que inspiram nossas vidas todos os dias! 💖✨`,
            active: true,
        },
        {
            name: 'Data Fixa — Dia dos Pais (WhatsApp)',
            eventType: 'FIXED_DATE',
            channel: 'WHATSAPP',
            content: `Olá, {{primeiro_nome}}! 👔🌟

Neste Dia dos Pais, a equipe da {{nome_empresa}} deseja a você e sua família um domingo abençoado, com muitas alegrias e celebração.

Feliz Dia dos Pais! 🥂👏`,
            active: true,
        },
    ];
    for (const tpl of templatesData) {
        const existing = await prisma.messageTemplate.findFirst({
            where: { name: tpl.name },
        });
        if (!existing) {
            await prisma.messageTemplate.create({
                data: tpl,
            });
        }
        else {
            await prisma.messageTemplate.update({
                where: { id: existing.id },
                data: {
                    content: tpl.content,
                    eventType: tpl.eventType,
                    channel: tpl.channel,
                    active: tpl.active,
                },
            });
        }
    }
    console.log(`📝 ${templatesData.length} Templates de Mensagem criados com sucesso!`);
    console.log('\n✨ Seed finalizado com sucesso! Base limpa de clientes e com o calendário nacional completo.');
}
main()
    .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
