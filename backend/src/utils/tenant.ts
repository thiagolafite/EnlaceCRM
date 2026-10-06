export interface AuthenticatedUserContext {
  id: string;
  name?: string;
  email?: string;
  role: string;
  companyId: string;
  status?: string;
}

/**
 * Retorna o filtro de escopo por empresa para queries do Prisma.
 * - Usuários comuns (ADMIN, OPERATOR) SEMPRE são isolados em seu próprio `companyId`.
 * - MASTER tem escopo de gerenciamento de empresas/usuários, mas ao consultar dados operacionais
 *   (clientes, familiares, alertas), o escopo da sua empresa é respeitado para evitar vazamento entre tenants.
 */
export function scopeByCompany(user?: AuthenticatedUserContext | null): { companyId: string } {
  if (!user || !user.companyId) {
    throw new Error('Contexto de empresa não identificado no usuário autenticado.');
  }

  return { companyId: user.companyId };
}
