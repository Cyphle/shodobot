import Fastify from 'fastify';
import app from './app';

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

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
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`🚀 Server running on http://${HOST}:${PORT}`);
    console.log(`📡 Health check: http://${HOST}:${PORT}/health`);
    console.log(`💬 Chat endpoint: http://${HOST}:${PORT}/api/message`);
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
