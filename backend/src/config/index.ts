import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatória'),
  DIRECT_URL: z.string().min(1, 'DIRECT_URL é obrigatória'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET deve ter no mínimo 32 caracteres'),
  APP_URL: z.string().url('APP_URL deve ser uma URL válida').default('http://localhost:5173'),
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:3333'),
  CRON_SECRET: z.string().min(16, 'CRON_SECRET deve ter no mínimo 16 caracteres').default('super_cron_secret_enlace_2026'),
  MASTER_EMAIL: z.string().email('MASTER_EMAIL deve ser um e-mail válido').default('master@enlacecrm.com.br'),
  PORT: z.coerce.number().default(3333),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  BOOTSTRAP_ADMIN_EMAIL: z.string().email().optional(),
  BOOTSTRAP_ADMIN_PASSWORD: z.string().min(10).optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ [CONFIG] Erro crítico de validação de variáveis de ambiente:');
  parsed.error.issues.forEach((issue) => {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  });
  throw new Error('Configurações de ambiente inválidas. A aplicação não pode iniciar.');
}

export const env = parsed.data;

export const config = {
  port: env.PORT,
  jwtSecret: env.JWT_SECRET,
  nodeEnv: env.NODE_ENV,
  appUrl: env.APP_URL,
  corsOrigins: env.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean),
  cronSecret: env.CRON_SECRET,
  masterEmail: env.MASTER_EMAIL,
  databaseUrl: env.DATABASE_URL,
  directUrl: env.DIRECT_URL,
  bootstrapAdminEmail: env.BOOTSTRAP_ADMIN_EMAIL,
  bootstrapAdminPassword: env.BOOTSTRAP_ADMIN_PASSWORD,
};
