"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dateUtils_1 = require("../src/utils/dateUtils");
const interpolator_1 = require("../src/utils/interpolator");
const AutomationService_1 = require("../src/services/AutomationService");
const AlertService_1 = require("../src/services/AlertService");
const CallMeBotProvider_1 = require("../src/providers/notification/CallMeBotProvider");
const prisma = new client_1.PrismaClient();
async function runTests() {
    console.log('🧪 ===============================================');
    console.log('🧪 INICIANDO BATERIA DE TESTES — ENLACE V2');
    console.log('🧪 ===============================================\n');
    let passed = 0;
    let failed = 0;
    function assert(condition, testName) {
        if (condition) {
            console.log(`  ✅ [PASS] ${testName}`);
            passed++;
        }
        else {
            console.error(`  ❌ [FAIL] ${testName}`);
            failed++;
        }
    }
    try {
        // -------------------------------------------------------------
        // Teste 1: Interpolação de Variáveis
        // -------------------------------------------------------------
        console.log('--- Teste 1: Interpolação Dinâmica de Variáveis ---');
        const tpl = 'Olá, {{primeiro_nome}}! Soubemos que {{parentesco_possessivo}}, {{nome_familiar}}, comemora aniversário hoje. — {{nome_empresa}}';
        const rendered = (0, interpolator_1.interpolateTemplate)(tpl, {
            clientName: 'Thiago Silva Lafite Lima',
            familyName: 'Helena Silveira',
            relationship: 'MOTHER',
            companyName: 'Enlace CRM',
        });
        assert(rendered.includes('Thiago') &&
            rendered.includes('sua mãe') &&
            rendered.includes('Helena Silveira') &&
            rendered.includes('Enlace CRM'), 'Interpolação de nome_cliente, primeiro_nome, parentesco_possessivo e empresa');
        // -------------------------------------------------------------
        // Teste 2: Utilitários de Data & Idade (Resiliente a Fuso Horário)
        // -------------------------------------------------------------
        console.log('\n--- Teste 2: Utilitários de Data & Idade ---');
        const today = new Date();
        const bDate = new Date(1990, today.getMonth(), today.getDate());
        assert((0, dateUtils_1.isSameDayAndMonth)(bDate, today), 'isSameDayAndMonth identifica data de aniversário no mesmo dia');
        const bDateIso = `1990-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        assert((0, dateUtils_1.isSameDayAndMonth)(bDateIso, today), 'isSameDayAndMonth funciona com string ISO YYYY-MM-DD');
        const age = (0, dateUtils_1.calculateAge)(new Date(1990, 0, 1), new Date(2026, 0, 1));
        assert(age === 36, 'calculateAge calcula idade exata');
        // -------------------------------------------------------------
        // Teste 3: Autenticação JWT
        // -------------------------------------------------------------
        console.log('\n--- Teste 3: Autenticação JWT ---');
        const token = jsonwebtoken_1.default.sign({ id: 'test_admin_id', email: 'admin@enlace.com.br', role: 'ADMIN' }, process.env.JWT_SECRET || 'enlace_secret_key_123', { expiresIn: '1d' });
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'enlace_secret_key_123');
        assert(decoded.email === 'admin@enlace.com.br', 'Geração e validação de token JWT');
        // -------------------------------------------------------------
        // Teste 4: Formatação CallMeBot e Sanitização de Telefone
        // -------------------------------------------------------------
        console.log('\n--- Teste 4: Provedor CallMeBot ---');
        const cleanPhone = CallMeBotProvider_1.CallMeBotProvider.sanitizePhone('+55 (71) 98180-5744');
        assert(cleanPhone === '5571981805744', 'Sanitização de número de telefone para formato internacional');
        const cleanPhoneDddOnly = CallMeBotProvider_1.CallMeBotProvider.sanitizePhone('71981805744');
        assert(cleanPhoneDddOnly === '5571981805744', 'Adiciona DDI 55 quando omitido');
        // -------------------------------------------------------------
        // Teste 5: Varredura de Automação, Alertas e LGPD
        // -------------------------------------------------------------
        console.log('\n--- Teste 5: Varredura de Automação & Geração de Alertas ---');
        const report = await AutomationService_1.AutomationService.scanAndDispatch(today, false);
        assert(report.clientsScanned > 0, 'Varredura lê clientes ativos');
        assert(report.clientBirthdaysFound >= 1, 'Identifica aniversariantes do dia');
        assert(report.details.length > 0, 'Gera lista detalhada de alertas');
        // -------------------------------------------------------------
        // Teste 6: Gestão de Alertas e Marcação de Envio Manual
        // -------------------------------------------------------------
        console.log('\n--- Teste 6: Gestão de Alertas & Envio Manual ---');
        const alerts = await AlertService_1.AlertService.listAlerts({ limit: 1 });
        assert(alerts.data.length > 0, 'Alertas gravados e recuperados do banco de dados');
        if (alerts.data.length > 0) {
            const firstAlert = alerts.data[0];
            const updated = await AlertService_1.AlertService.toggleSentManual(firstAlert.id, true);
            assert(updated.sentToClientManual === true && updated.sentToClientManualAt !== null, 'Marcação manual de "Enviado ao cliente" atualiza flag e timestamp');
            const toggledBack = await AlertService_1.AlertService.toggleSentManual(firstAlert.id, false);
            assert(toggledBack.sentToClientManual === false, 'Desmarcação de envio manual funciona perfeitamente');
        }
        // -------------------------------------------------------------
        // Teste 7: Estatísticas do Dashboard
        // -------------------------------------------------------------
        console.log('\n--- Teste 7: Estatísticas do Dashboard ---');
        const stats = await AlertService_1.AlertService.getDashboardStats();
        assert(typeof stats.totalClients === 'number' && stats.totalClients > 0, 'Estatísticas de total de clientes carregadas');
        assert(typeof stats.todayAlerts === 'number', 'Estatísticas de alertas de hoje carregadas');
        console.log('\n===============================================');
        console.log(`🏁 RESULTADO FINAL: ${passed} PASSOU | ${failed} FALHOU`);
        console.log('===============================================\n');
        if (failed > 0) {
            process.exit(1);
        }
    }
    catch (err) {
        console.error('❌ Erro durante a execução dos testes:', err);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
runTests();
