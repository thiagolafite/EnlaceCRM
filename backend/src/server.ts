import app from './app';
import { config } from './config';
import { MessageQueue } from './queues/MessageQueue';
import { initScheduler } from './jobs/scheduler';
import { prisma } from './utils/prisma';

const server = app.listen(config.port, async () => {
  console.log(`=========================================`);
  console.log(`🚀 Enlace CRM Backend API rodando na porta ${config.port}`);
  console.log(`🔗 Healthcheck: http://localhost:${config.port}/api/health`);
  console.log(`=========================================`);

  // Iniciar worker de fila assíncrona
  MessageQueue.startWorkerLoop(2500);

  // Iniciar agendador diário
  await initScheduler();
});

const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Recebido sinal ${signal}. Encerrando Enlace CRM graciosamente...`);
  MessageQueue.stopWorkerLoop();
  server.close(async () => {
    await prisma.$disconnect();
    console.log('🏁 Enlace CRM encerrado com segurança.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
