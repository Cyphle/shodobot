import Fastify from 'fastify';
import app from './app';
import { config } from './config/config';

const fastify = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    }
  }
});

const start = async () => {
  try {
    await fastify.register(app);
    await fastify.listen({ port: config.server.port, host: config.server.host });
    console.log(`🚀 Server running on http://${config.server.host}:${config.server.port}`);
    console.log(`📡 Health check: http://${config.server.host}:${config.server.port}/health`);
    console.log(`💬 Chat endpoint: http://${config.server.host}:${config.server.port}/api/message`);
    console.log(`🤖 AI Agent: ${config.groq.model} (${config.agent.maxHistorySize} pairs max)`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Gestion gracieuse de l'arrêt
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await fastify.close();
  console.log('Process terminated');
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await fastify.close();
  console.log('Process terminated');
});

start();

export default fastify;
