"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_COMMEMORATIVE_DATES = void 0;
exports.seedStandardDates = seedStandardDates;
const client_1 = require("@prisma/client");
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
async function seedStandardDates() {
    console.log('📅 Cadastrando datas comemorativas e feriados nacionais padrão no Supabase...');
    for (const dateData of exports.DEFAULT_COMMEMORATIVE_DATES) {
        const existing = await prisma.commemorativeDate.findFirst({
            where: {
                name: dateData.name,
                month: dateData.month,
                day: dateData.day,
            },
        });
        if (existing) {
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
        else {
            await prisma.commemorativeDate.create({
                data: {
                    name: dateData.name,
                    day: dateData.day,
                    month: dateData.month,
                    description: dateData.description,
                    category: dateData.category,
                    targetAudience: dateData.targetAudience,
                    active: true,
                },
            });
        }
    }
    console.log(`✅ ${exports.DEFAULT_COMMEMORATIVE_DATES.length} datas comemorativas e feriados cadastrados com sucesso!`);
}
if (require.main === module) {
    seedStandardDates()
        .catch((e) => {
        console.error('Erro ao cadastrar datas padrão:', e);
    })
        .finally(async () => {
        await prisma.$disconnect();
    });
}
