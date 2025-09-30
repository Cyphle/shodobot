import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { ChatRequest, ChatResponse } from '../../types/chat';
import { validateMessage } from '../middleware/validation';
import { processMessage } from '../core/agent';

export async function messageRoute(fastify: FastifyInstance, opts: FastifyPluginOptions) {
  fastify.post('/api/message', {
    schema: {
      body: {
        type: 'object',
        required: ['message'],
        properties: {
          message: {
            type: 'string'
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

      // Validation du message (validation personnalisée pour sécurité)
      const validationResult = validateMessage(message);
      if (!validationResult.isValid) {
        const response: ChatResponse = {
          success: false,
          message: validationResult.error || 'Message invalide'
        };
        reply.status(400).send(response);
        return;
      }

      // Traitement du message par l'agent
      const agentResponse = await processMessage(message);

      const response: ChatResponse = {
        success: true,
        message: agentResponse,
        data: {
          receivedMessage: message,
          timestamp: new Date().toISOString()
        }
      };

      reply.status(200).send(response);
    } catch (error) {
      fastify.log.error(error as Error, 'Error processing message');
      const response: ChatResponse = {
        success: false,
        message: 'Internal server error'
      };
      reply.status(500).send(response);
    }
  });
}
