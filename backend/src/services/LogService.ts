import { prisma } from '../utils/prisma';
import os from 'os';

export interface CreateLogDTO {
  level?: 'INFO' | 'WARN' | 'ERROR' | 'SECURITY' | 'CRITICAL';
  category: 'AUTH' | 'DATABASE' | 'API' | 'AUTOMATION' | 'SECURITY' | 'SYSTEM';
  action: string;
  message: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  userId?: string;
  userEmail?: string;
  companyId?: string;
}

export class LogService {
  /**
   * Registra um novo log de sistema ou evento de segurança
   */
  static async createLog(data: CreateLogDTO) {
    try {
      let detailsString: string | null = null;
      if (data.details) {
        if (typeof data.details === 'string') {
          detailsString = data.details;
        } else if (data.details instanceof Error) {
          detailsString = JSON.stringify({
            name: data.details.name,
            message: data.details.message,
            stack: data.details.stack,
          });
        } else {
          detailsString = JSON.stringify(data.details);
        }
      }

      return await prisma.systemLog.create({
        data: {
          level: data.level || 'INFO',
          category: data.category,
          action: data.action,
          message: data.message,
          details: detailsString,
          ipAddress: data.ipAddress || null,
          userAgent: data.userAgent || null,
          userId: data.userId || null,
          userEmail: data.userEmail || null,
          companyId: data.companyId || null,
        },
      });
    } catch (err) {
      console.error('Falha ao salvar log no banco:', err);
      return null;
    }
  }

  /**
   * Lista logs com filtros avançados (Exclusivo Master)
   */
  static async listLogs(params: {
    level?: string;
    category?: string;
    action?: string;
    search?: string;
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const page = params.page && params.page > 0 ? Number(params.page) : 1;
    const limit = params.limit && params.limit > 0 ? Number(params.limit) : 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.level && params.level !== 'ALL') {
      where.level = params.level;
    }

    if (params.category && params.category !== 'ALL') {
      where.category = params.category;
    }

    if (params.action) {
      where.action = params.action;
    }

    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = new Date(params.startDate);
      if (params.endDate) where.createdAt.lte = new Date(params.endDate);
    }

    if (params.search && params.search.trim()) {
      const s = params.search.trim();
      where.OR = [
        { message: { contains: s, mode: 'insensitive' } },
        { action: { contains: s, mode: 'insensitive' } },
        { userEmail: { contains: s, mode: 'insensitive' } },
        { ipAddress: { contains: s } },
        { details: { contains: s, mode: 'insensitive' } },
      ];
    }

    const [total, logs] = await Promise.all([
      prisma.systemLog.count({ where }),
      prisma.systemLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Métricas de saúde do sistema, segurança e integridade (Dashboard Master)
   */
  static async getMetrics() {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Testar latência de consulta ao banco Supabase
    const dbStartTime = Date.now();
    let dbStatus = 'ONLINE';
    let dbLatencyMs = 0;
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - dbStartTime;
    } catch (e) {
      dbStatus = 'DEGRADED';
      dbLatencyMs = -1;
    }

    const [
      totalLogs,
      errors24h,
      securityIncidents24h,
      totalUsers,
      totalClients,
      activeTenants,
    ] = await Promise.all([
      prisma.systemLog.count(),
      prisma.systemLog.count({
        where: {
          level: { in: ['ERROR', 'CRITICAL'] },
          createdAt: { gte: last24h },
        },
      }),
      prisma.systemLog.count({
        where: {
          level: 'SECURITY',
          createdAt: { gte: last24h },
        },
      }),
      prisma.user.count(),
      prisma.client.count(),
      prisma.user.groupBy({
        by: ['companyId'],
      }),
    ]);

    // Uso de memória do servidor
    const memoryUsage = process.memoryUsage();
    const totalMemoryMB = Math.round(os.totalmem() / 1024 / 1024);
    const freeMemoryMB = Math.round(os.freemem() / 1024 / 1024);
    const usedMemoryMB = Math.round(memoryUsage.rss / 1024 / 1024);

    return {
      systemHealth: {
        status: dbStatus === 'ONLINE' ? 'HEALTHY' : 'WARNING',
        uptimeSeconds: Math.floor(process.uptime()),
        nodeVersion: process.version,
        platform: process.platform,
        serverTime: new Date().toISOString(),
      },
      database: {
        status: dbStatus,
        provider: 'Supabase PostgreSQL',
        latencyMs: dbLatencyMs,
      },
      memory: {
        rssMB: usedMemoryMB,
        heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        totalServerMemoryMB: totalMemoryMB,
        freeServerMemoryMB: freeMemoryMB,
      },
      counts: {
        totalLogs,
        errors24h,
        securityIncidents24h,
        totalUsers,
        totalClients,
        activeTenantsCount: activeTenants.length,
      },
    };
  }

  /**
   * Limpar logs antigos
   */
  static async clearLogs(olderThanDays = 30) {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    const res = await prisma.systemLog.deleteMany({
      where: { createdAt: { lt: cutoffDate } },
    });
    return { deletedCount: res.count };
  }
}
