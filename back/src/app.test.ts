import Fastify, { FastifyInstance } from 'fastify';
import app from './app';

describe('Chat API', () => {
  let fastify: FastifyInstance;

  beforeAll(async () => {
    fastify = Fastify();
    await fastify.register(app);
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
  });

  describe('POST /api/message', () => {
    it('should handle a valid message', async () => {
      const message = 'Hello, this is a test message';
      
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/message',
        payload: { message }
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual({
        success: true,
        message: 'Ok I received your message',
        data: {
          receivedMessage: message,
          timestamp: expect.any(String)
        }
      });
    });

    it('should reject empty message', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/message',
        payload: { message: '' }
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.message).toContain('must NOT have fewer than 1 characters');
    });

    it('should reject message with only whitespace', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/message',
        payload: { message: '   ' }
      });

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body)).toEqual({
        success: false,
        message: 'Message cannot be empty'
      });
    });

    it('should reject request without message field', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/message',
        payload: {}
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.message).toContain('must have required property');
    });

    it('should reject non-string message', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/message',
        payload: { message: {} }
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.message).toContain('must be string');
    });
  });
});
