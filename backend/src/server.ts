import app from './app';
import { config } from './config';
import { initScheduler } from './jobs/scheduler';
import { prisma } from './utils/prisma';

const server = app.listen(config.port, async () => {
  if (config.nodeEnv !== 'production') {
    console.log(`=========================================`);
    console.log(`🚀 Enlace CRM Backend API rodando na porta ${config.port}`);
    console.log(`🔗 Healthcheck: http://localhost:${config.port}/api/health`);
    console.log(`=========================================`);
  }

  // Iniciar agendador diário
  await initScheduler();
});

const gracefulShutdown = async (signal: string) => {
  if (config.nodeEnv !== 'production') {
    console.log(`\n🛑 Recebido sinal ${signal}. Encerrando Enlace CRM graciosamente...`);
  }
  server.close(async () => {
    await prisma.$disconnect();
    if (config.nodeEnv !== 'production') {
      console.log('🏁 Enlace CRM encerrado com segurança.');
    }
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
