import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { messageRoute } from './api/messageRoute';

export async function agentModule(fastify: FastifyInstance, opts: FastifyPluginOptions) {
  // Enregistrer la route des messages
  await fastify.register(messageRoute);
}
