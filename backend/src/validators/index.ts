import { z } from 'zod';
import { normalizePhoneBR } from '../utils/phone';

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.string().email('E-mail inválido'));

// ==========================================
// 1. AUTENTICAÇÃO
// ==========================================
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').trim(),
  email: emailSchema,
  password: z.string().min(10, 'A senha deve ter no mínimo 10 caracteres para conformidade de segurança'),
});

// ==========================================
// 2. CLIENTES
// ==========================================
export const createClientSchema = z.object({
  name: z.string().min(2, 'Nome do cliente é obrigatório').trim(),
  document: z.string().optional().nullable().transform((v) => (v ? v.trim() : null)),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .optional()
    .nullable()
    .or(z.literal(''))
    .transform((v) => (v ? v.trim().toLowerCase() : null)),
  phone: z.string().optional().nullable().transform((v) => (v ? normalizePhoneBR(v) : null)),
  companyName: z.string().optional().nullable().transform((v) => (v ? v.trim() : null)),
  birthDate: z.string().optional().nullable().transform((v) => (v ? new Date(v) : null)),
  
  zipCode: z.string().optional().nullable().transform((v) => (v ? v.trim() : null)),
  address: z.string().optional().nullable().transform((v) => (v ? v.trim() : null)),
  addressNumber: z.string().optional().nullable().transform((v) => (v ? v.trim() : null)),
  addressComplement: z.string().optional().nullable().transform((v) => (v ? v.trim() : null)),
  neighborhood: z.string().optional().nullable().transform((v) => (v ? v.trim() : null)),
  city: z.string().optional().nullable().transform((v) => (v ? v.trim() : null)),
  state: z.string().optional().nullable().transform((v) => (v ? v.trim().toUpperCase() : null)),

  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  gender: z.enum(['FEMALE', 'MALE', 'OTHER', 'NOT_SPECIFIED']).default('NOT_SPECIFIED'),
  isMother: z.boolean().default(false),
  isFather: z.boolean().default(false),
  profession: z.string().optional().nullable().transform((v) => (v ? v.trim() : null)),

  lgpdConsent: z.boolean().default(true),
  notes: z.string().optional().nullable().transform((v) => (v ? v.trim() : null)),
});

export const updateClientSchema = createClientSchema.partial();

export const listClientQuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  lgpdConsent: z.enum(['true', 'false']).optional().transform((v) => (v === undefined ? undefined : v === 'true')),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ==========================================
// 3. FAMILIARES
// ==========================================
export const createFamilyMemberSchema = z.object({
  clientId: z.string().min(1, 'ID do cliente é obrigatório'),
  name: z.string().min(2, 'Nome do familiar é obrigatório').trim(),
  gender: z.enum(['FEMALE', 'MALE', 'OTHER', 'NOT_SPECIFIED']).default('NOT_SPECIFIED'),
  relationship: z.string().min(1, 'Grau de parentesco é obrigatório'),
  birthDate: z.string().min(1, 'Data de nascimento é obrigatória').transform((v) => new Date(v)),
  phone: z.string().optional().nullable().transform((v) => (v ? normalizePhoneBR(v) : null)),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .optional()
    .nullable()
    .or(z.literal(''))
    .transform((v) => (v ? v.trim().toLowerCase() : null)),
  
  sameAddressAsClient: z.boolean().default(false),
  zipCode: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  addressNumber: z.string().optional().nullable(),
  addressComplement: z.string().optional().nullable(),
  neighborhood: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateFamilyMemberSchema = createFamilyMemberSchema.omit({ clientId: true }).partial();

// ==========================================
// 4. DATAS COMEMORATIVAS
// ==========================================
export const createCommemorativeDateSchema = z.object({
  name: z.string().min(2, 'Nome da data comemorativa é obrigatório').trim(),
  day: z.coerce.number().int().min(1).max(31, 'Dia deve ser entre 1 e 31'),
  month: z.coerce.number().int().min(1).max(12, 'Mês deve ser entre 1 e 12'),
  year: z.coerce.number().int().optional().nullable(),
  description: z.string().optional().nullable().transform((v) => (v ? v.trim() : null)),
  category: z.enum(['FIXED', 'CULTURAL', 'CORPORATE']).default('FIXED'),
  targetAudience: z.enum(['ALL_CLIENTS', 'MOTHERS_ONLY', 'FATHERS_ONLY', 'CUSTOM']).default('ALL_CLIENTS'),
  active: z.boolean().default(true),
  isGlobal: z.boolean().optional(),
});

export const updateCommemorativeDateSchema = createCommemorativeDateSchema.partial();

// ==========================================
// 5. TEMPLATES DE MENSAGEM
// ==========================================
export const createTemplateSchema = z.object({
  name: z.string().min(2, 'Nome do template é obrigatório').trim(),
  eventType: z.enum(['CLIENT_BIRTHDAY', 'FAMILY_BIRTHDAY', 'FIXED_DATE']),
  channel: z.enum(['WHATSAPP', 'EMAIL']).default('WHATSAPP'),
  commemorativeDateId: z.string().optional().nullable(),
  subject: z.string().optional().nullable().transform((v) => (v ? v.trim() : null)),
  content: z.string().min(1, 'Conteúdo do template é obrigatório'),
  active: z.boolean().default(true),
  isGlobal: z.boolean().optional(),
});

export const updateTemplateSchema = createTemplateSchema.partial();

// ==========================================
// 6. CONFIGURAÇÕES DA EMPRESA (WHITELIST SEGURA)
// ==========================================
export const updateSettingsSchema = z.object({
  companyName: z.string().min(2).optional(),
  tradeName: z.string().optional(),
  document: z.string().optional().nullable(),
  contactEmail: z.string().trim().toLowerCase().optional().nullable().or(z.literal('')),
  contactPhone: z.string().optional().nullable().transform((v) => (v ? normalizePhoneBR(v) : null)),

  ownerWhatsappPhone: z.string().optional().nullable().transform((v) => (v ? normalizePhoneBR(v) : '')),
  callmebotApiKey: z.string().optional(),
  callmebotEnabled: z.boolean().optional(),
  callmebotSimulateMode: z.boolean().optional(),

  schedulerHour: z.coerce.number().int().min(0).max(23).optional(),
  schedulerMinute: z.coerce.number().int().min(0).max(59).optional(),
  schedulerEnabled: z.boolean().optional(),
});

// ==========================================
// 7. USUÁRIOS
// ==========================================
export const createUserSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório').trim(),
  email: emailSchema,
  password: z.string().min(10, 'A senha deve ter no mínimo 10 caracteres'),
  role: z.enum(['ADMIN', 'OPERATOR']).default('OPERATOR'),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: emailSchema.optional(),
  password: z.string().min(10).optional(),
  role: z.enum(['ADMIN', 'OPERATOR', 'MASTER']).optional(),
  status: z.enum(['ACTIVE', 'PENDING_APPROVAL', 'BLOCKED']).optional(),
});

// ==========================================
// 8. LOGS
// ==========================================
export const listLogsQuerySchema = z.object({
  level: z.string().optional(),
  category: z.string().optional(),
  action: z.string().optional(),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});
