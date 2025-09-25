import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { agentModule } from './agent';
import { config } from './config/config';

// Création de l'instance Fastify
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

// Configuration de l'application
export async function configureApp(fastifyInstance: any) {
  // Enregistrement des plugins de sécurité
  await fastifyInstance.register(helmet);
  await fastifyInstance.register(cors, {
    origin: config.frontend.url,
    credentials: true
  });
  await fastifyInstance.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute'
  });

  // Route de santé
  fastifyInstance.get('/health', async (request: any, reply: any) => {
    return {
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString()
    };
  });

  // Enregistrement du module agent
  await fastifyInstance.register(agentModule);

  // Route 404
  fastifyInstance.setNotFoundHandler((request: any, reply: any) => {
    reply.status(404).send({
      success: false,
      message: 'Route not found'
    });
  });
}

// Démarrage du serveur
const start = async () => {
  try {
    await configureApp(fastify);
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

// Démarrer le serveur
start();

export default fastify;
