"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_ANNUAL_COMMEMORATIVE_DATES = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.ALL_ANNUAL_COMMEMORATIVE_DATES = [
    // ==========================================
    // JANEIRO
    // ==========================================
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
    // ==========================================
    // FEVEREIRO
    // ==========================================
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
    // ==========================================
    // MARÇO
    // ==========================================
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
    // ==========================================
    // ABRIL
    // ==========================================
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
    // ==========================================
    // MAIO
    // ==========================================
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
    // ==========================================
    // JUNHO
    // ==========================================
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
    // ==========================================
    // JULHO
    // ==========================================
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
    // ==========================================
    // AGOSTO
    // ==========================================
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
    // ==========================================
    // SETEMBRO
    // ==========================================
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
    // ==========================================
    // OUTUBRO
    // ==========================================
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
    // ==========================================
    // NOVEMBRO
    // ==========================================
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
    // ==========================================
    // DEZEMBRO
    // ==========================================
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
async function populateAllAnnualDates() {
    console.log('📅 Preenchendo calendário anual completo no Supabase...');
    // Limpar datas existentes e recriar com a lista completa oficial
    await prisma.alert.deleteMany({});
    await prisma.commemorativeDate.deleteMany({});
    for (const dateData of exports.ALL_ANNUAL_COMMEMORATIVE_DATES) {
        await prisma.commemorativeDate.create({
            data: dateData,
        });
    }
    console.log(`✅ ${exports.ALL_ANNUAL_COMMEMORATIVE_DATES.length} datas comemorativas fixas cadastradas com sucesso para os 12 meses!`);
}
populateAllAnnualDates()
    .catch(console.error)
    .finally(async () => {
    await prisma.$disconnect();
});
