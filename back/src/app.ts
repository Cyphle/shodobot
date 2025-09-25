import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { agentModule } from './agent';
import { config } from './config/config';

export default async function app(fastify: FastifyInstance, opts: FastifyPluginOptions) {
  // Enregistrement des plugins de sécurité
  await fastify.register(helmet);
        await fastify.register(cors, {
          origin: config.frontend.url,
          credentials: true
        });
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute'
  });

  // Route de santé
  fastify.get('/health', async (request, reply) => {
    return {
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString()
    };
  });

  // Enregistrement du module agent
  await fastify.register(agentModule);

  // Route 404
  fastify.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      success: false,
      message: 'Route not found'
    });
  });
}
