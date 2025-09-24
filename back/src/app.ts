import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { ChatRequest, ChatResponse } from './types/chat';

export default async function app(fastify: FastifyInstance, opts: FastifyPluginOptions) {
  // Enregistrement des plugins
  await fastify.register(helmet);
  await fastify.register(cors, {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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

  // Route principale pour les messages
  fastify.post('/api/message', {
    schema: {
      body: {
        type: 'object',
        required: ['message'],
        properties: {
          message: {
            type: 'string',
            minLength: 1
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                receivedMessage: { type: 'string' },
                timestamp: { type: 'string' }
              }
            }
          }
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        },
        500: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { message } = request.body as ChatRequest;

      if (!message || typeof message !== 'string') {
        const response: ChatResponse = {
          success: false,
          message: 'Message is required and must be a string'
        };
        reply.status(400).send(response);
        return;
      }

      if (message.trim().length === 0) {
        const response: ChatResponse = {
          success: false,
          message: 'Message cannot be empty'
        };
        reply.status(400).send(response);
        return;
      }

      // Pour le moment, on répond simplement
      const response: ChatResponse = {
        success: true,
        message: 'Ok I received your message',
        data: {
          receivedMessage: message,
          timestamp: new Date().toISOString()
        }
      };

      reply.status(200).send(response);
    } catch (error) {
      fastify.log.error(error as Error, 'Error handling message');
      const response: ChatResponse = {
        success: false,
        message: 'Internal server error'
      };
      reply.status(500).send(response);
    }
  });

  // Route 404
  fastify.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      success: false,
      message: 'Route not found'
    });
  });
}
