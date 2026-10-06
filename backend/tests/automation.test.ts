import { interpolateTemplate } from '../src/utils/interpolator';
import { encrypt, decrypt } from '../src/utils/crypto';
import { normalizePhoneBR } from '../src/utils/phone';
import { scopeByCompany } from '../src/utils/tenant';
import { loginSchema, registerSchema, createClientSchema } from '../src/validators';
import {
  todayInSaoPaulo,
  matchesBirthdaySP,
  calculateAgeSP,
  isLeapYear,
} from '../src/utils/time';
import { matchesAudience } from '../src/utils/audienceMatcher';
import { CallMeBotProvider } from '../src/providers/notification/CallMeBotProvider';

async function runTests() {
  console.log('🧪 ===============================================');
  console.log('🧪 BATERIA DE TESTES UNITÁRIOS — ENLACE V2 (FASE 3)');
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
      relationshipPossessive: 'sua mãe',
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
    // Teste 2: Utilitários de Data, Fuso SP e 29/02
    // -------------------------------------------------------------
    console.log('\n--- Teste 2: Fuso Horário SP, UTC e 29 de Fevereiro ---');
    const spNow = todayInSaoPaulo(new Date());
    assert(Boolean(spNow.dateKey && spNow.year >= 2026), 'todayInSaoPaulo retorna componentes no fuso SP');

    // 29/02 em ano não bissexto (ex: 2026) -> comemora em 28/02
    assert(
      matchesBirthdaySP('2000-02-29T00:00:00.000Z', {
        year: 2026,
        month: 2,
        day: 28,
        hours: 0,
        minutes: 0,
        seconds: 0,
        dateKey: '2026-02-28',
      }),
      '29/02 celebra em 28/02 em anos não bissextos'
    );

    // 29/02 em ano não bissexto não celebra em 27 nem 01/03
    assert(
      !matchesBirthdaySP('2000-02-29T00:00:00.000Z', {
        year: 2026,
        month: 2,
        day: 27,
        hours: 0,
        minutes: 0,
        seconds: 0,
        dateKey: '2026-02-27',
      }),
      '29/02 não dispara em dias incorretos'
    );

    // 29/02 em ano bissexto (ex: 2024) -> celebra em 29/02
    assert(
      matchesBirthdaySP('2000-02-29T00:00:00.000Z', {
        year: 2024,
        month: 2,
        day: 29,
        hours: 0,
        minutes: 0,
        seconds: 0,
        dateKey: '2024-02-29',
      }),
      '29/02 celebra exatamente em 29/02 em anos bissextos'
    );

    assert(isLeapYear(2024) && !isLeapYear(2025) && !isLeapYear(2026), 'isLeapYear calcula corretamente anos bissextos');

    const age = calculateAgeSP('1990-05-15T00:00:00.000Z', {
      year: 2026,
      month: 5,
      day: 15,
      hours: 0,
      minutes: 0,
      seconds: 0,
      dateKey: '2026-05-15',
    });
    assert(age === 36, 'calculateAgeSP calcula idade exata com base em UTC e fuso SP');

    // -------------------------------------------------------------
    // Teste 3: Audience Matcher (Público-alvo estrito)
    // -------------------------------------------------------------
    console.log('\n--- Teste 3: Audience Matcher (Regras Estritas de Público) ---');
    assert(
      matchesAudience('ALL_CLIENTS', { isClient: true, gender: 'OTHER' }),
      'ALL_CLIENTS aceita qualquer perfil'
    );

    // MOTHERS_ONLY
    assert(
      matchesAudience('MOTHERS_ONLY', { isClient: true, isMother: true, gender: 'FEMALE' }),
      'MOTHERS_ONLY aceita cliente com isMother = true'
    );
    assert(
      matchesAudience('MOTHERS_ONLY', { isClient: false, relationship: 'MOTHER' }),
      'MOTHERS_ONLY aceita familiar com parentesco MOTHER'
    );
    assert(
      !matchesAudience('MOTHERS_ONLY', { isClient: true, isMother: false, gender: 'FEMALE' }),
      'MOTHERS_ONLY rejeita mulher sem isMother (não infere por gênero sozinho)'
    );

    // FATHERS_ONLY
    assert(
      matchesAudience('FATHERS_ONLY', { isClient: true, isFather: true, gender: 'MALE' }),
      'FATHERS_ONLY aceita cliente com isFather = true'
    );
    assert(
      matchesAudience('FATHERS_ONLY', { isClient: false, relationship: 'FATHER' }),
      'FATHERS_ONLY aceita familiar com parentesco FATHER'
    );

    // WOMEN_ONLY vs MEN_ONLY
    assert(
      matchesAudience('WOMEN_ONLY', { isClient: true, gender: 'FEMALE' }),
      'WOMEN_ONLY aceita gênero FEMALE'
    );
    assert(
      !matchesAudience('WOMEN_ONLY', { isClient: true, gender: 'MALE', isMother: true }),
      'WOMEN_ONLY rejeita gênero MALE mesmo com flag isMother acidental'
    );
    assert(
      matchesAudience('MEN_ONLY', { isClient: true, gender: 'MALE' }),
      'MEN_ONLY aceita gênero MALE'
    );
    assert(
      !matchesAudience('MEN_ONLY', { isClient: true, gender: 'FEMALE', isFather: true }),
      'MEN_ONLY rejeita gênero FEMALE mesmo com flag isFather acidental'
    );

    // -------------------------------------------------------------
    // Teste 4: Criptografia em Repouso AES-256-GCM
    // -------------------------------------------------------------
    console.log('\n--- Teste 4: Criptografia AES-256-GCM ---');
    const secretApiKey = 'secret_callmebot_key_998877';
    const encrypted = encrypt(secretApiKey);
    assert(
      Boolean(encrypted.encrypted && encrypted.iv && encrypted.tag),
      'Gera payload criptografado com IV e auth tag'
    );

    const decrypted = decrypt(encrypted.encrypted, encrypted.iv, encrypted.tag);
    assert(decrypted === secretApiKey, 'Descriptografa com precisão o segredo protegido');

    // -------------------------------------------------------------
    // Teste 5: Normalização de Telefone E.164 BR
    // -------------------------------------------------------------
    console.log('\n--- Teste 5: Normalização de Telefone E.164 ---');
    assert(normalizePhoneBR('(71) 98180-5744') === '+5571981805744', 'Normaliza telefone formatado BR com DDD');
    assert(normalizePhoneBR('71981805744') === '+5571981805744', 'Adiciona DDI +55 quando ausente');
    assert(normalizePhoneBR('+5571981805744') === '+5571981805744', 'Mantém formato E.164 válido inalterado');

    // -------------------------------------------------------------
    // Teste 6: CallMeBot Provider & Chunking
    // -------------------------------------------------------------
    console.log('\n--- Teste 6: Provedor CallMeBot & Chunking ---');
    assert(CallMeBotProvider.sanitizePhone('+55 (11) 98888-7777') === '5511988887777', 'CallMeBotProvider sanitizePhone limpa caracteres');
    const shortMsg = 'Mensagem curta';
    assert(CallMeBotProvider.splitMessage(shortMsg, 100).length === 1, 'splitMessage não fragmenta mensagens curtas');

    const longMsg = 'Linha 1\n'.repeat(500);
    const chunks = CallMeBotProvider.splitMessage(longMsg, 1000);
    assert(chunks.length > 1 && chunks[0].includes('[Parte 1/'), 'splitMessage divide texto longo adicionando marcador de partes');

    // -------------------------------------------------------------
    // Teste 7: Isolamento Multi-tenant (scopeByCompany)
    // -------------------------------------------------------------
    console.log('\n--- Teste 7: Helper de Isolamento Multi-tenant ---');
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
    // Teste 8: Validação de Esquemas com Zod
    // -------------------------------------------------------------
    console.log('\n--- Teste 8: Validação Zod ---');
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
