import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { isSameDayAndMonth, calculateAge } from '../src/utils/dateUtils';
import { interpolateTemplate } from '../src/utils/interpolator';
import { encrypt, decrypt } from '../src/utils/crypto';
import { normalizePhoneBR } from '../src/utils/phone';
import { scopeByCompany } from '../src/utils/tenant';
import { loginSchema, registerSchema, createClientSchema, updateSettingsSchema } from '../src/validators';

async function runTests() {
  console.log('🧪 ===============================================');
  console.log('🧪 INICIANDO BATERIA DE TESTES UNITÁRIOS — ENLACE V2');
  console.log('🧪 ===============================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
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
    const rendered = interpolateTemplate(tpl, {
      clientName: 'Thiago Silva Lafite Lima',
      familyName: 'Helena Silveira',
      relationship: 'MOTHER',
      companyName: 'Enlace CRM',
    });

    assert(
      rendered.includes('Thiago') &&
      rendered.includes('sua mãe') &&
      rendered.includes('Helena Silveira') &&
      rendered.includes('Enlace CRM'),
      'Interpolação de nome_cliente, primeiro_nome, parentesco_possessivo e empresa'
    );

    // -------------------------------------------------------------
    // Teste 2: Utilitários de Data & Idade
    // -------------------------------------------------------------
    console.log('\n--- Teste 2: Utilitários de Data & Idade ---');
    const today = new Date();
    const bDate = new Date(1990, today.getMonth(), today.getDate());
    assert(isSameDayAndMonth(bDate, today), 'isSameDayAndMonth identifica data de aniversário no mesmo dia');

    const bDateIso = `1990-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    assert(isSameDayAndMonth(bDateIso, today), 'isSameDayAndMonth funciona com string ISO YYYY-MM-DD');

    const age = calculateAge(new Date(1990, 0, 1), new Date(2026, 0, 1));
    assert(age === 36, 'calculateAge calcula idade exata');

    // -------------------------------------------------------------
    // Teste 3: Criptografia em Repouso AES-256-GCM
    // -------------------------------------------------------------
    console.log('\n--- Teste 3: Criptografia AES-256-GCM ---');
    const secretApiKey = 'secret_callmebot_key_998877';
    const encrypted = encrypt(secretApiKey);
    assert(
      Boolean(encrypted.encrypted && encrypted.iv && encrypted.tag),
      'Gera payload criptografado com IV e auth tag'
    );

    const decrypted = decrypt(encrypted.encrypted, encrypted.iv, encrypted.tag);
    assert(decrypted === secretApiKey, 'Descriptografa com precisão o segredo protegido');

    // -------------------------------------------------------------
    // Teste 4: Normalização de Telefone E.164 BR
    // -------------------------------------------------------------
    console.log('\n--- Teste 4: Normalização de Telefone E.164 ---');
    assert(normalizePhoneBR('(71) 98180-5744') === '+5571981805744', 'Normaliza telefone formatado BR com DDD');
    assert(normalizePhoneBR('71981805744') === '+5571981805744', 'Adiciona DDI +55 quando ausente');
    assert(normalizePhoneBR('+5571981805744') === '+5571981805744', 'Mantém formato E.164 válido inalterado');

    // -------------------------------------------------------------
    // Teste 5: Isolamento Multi-tenant (scopeByCompany)
    // -------------------------------------------------------------
    console.log('\n--- Teste 5: Helper de Isolamento Multi-tenant ---');
    const userContext = {
      id: 'usr_123',
      role: 'ADMIN',
      companyId: 'comp_abc_789',
    };
    const scope = scopeByCompany(userContext);
    assert(scope.companyId === 'comp_abc_789', 'scopeByCompany retorna o companyId exato do usuário');

    let errorThrown = false;
    try {
      scopeByCompany(null);
    } catch {
      errorThrown = true;
    }
    assert(errorThrown, 'scopeByCompany bloqueia e lança erro quando contexto é nulo');

    // -------------------------------------------------------------
    // Teste 6: Validação de Esquemas com Zod
    // -------------------------------------------------------------
    console.log('\n--- Teste 6: Validação Zod ---');
    const validLogin = loginSchema.safeParse({ email: 'Test@Domain.COM ', password: '123' });
    assert(validLogin.success && validLogin.data.email === 'test@domain.com', 'loginSchema normaliza e valida email');

    const invalidRegister = registerSchema.safeParse({ name: 'A', email: 'invalid', password: 'short' });
    assert(!invalidRegister.success, 'registerSchema rejeita senha menor que 10 caracteres');

    const validRegister = registerSchema.safeParse({ name: 'Admin', email: 'admin@domain.com', password: 'secure_password_10' });
    assert(validRegister.success, 'registerSchema aceita cadastro válido');

    const validClient = createClientSchema.safeParse({
      name: 'Cliente Teste',
      phone: '(11) 98765-4321',
      gender: 'FEMALE',
      isMother: true,
    });
    assert(validClient.success && validClient.data.phone === '+5511987654321', 'createClientSchema normaliza telefone E.164');

    console.log('\n===============================================');
    console.log(`🏁 RESULTADO FINAL: ${passed} PASSOU | ${failed} FALHOU`);
    console.log('===============================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err: any) {
    console.error('❌ Erro durante a execução dos testes:', err);
    process.exit(1);
  }
}

runTests();
