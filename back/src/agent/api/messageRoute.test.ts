import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import Fastify, { FastifyInstance } from 'fastify';
import { messageRoute } from './messageRoute';

describe('messageRoute', () => {
  let fastify: FastifyInstance;

  beforeAll(async () => {
    fastify = Fastify();
    await fastify.register(messageRoute);
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
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.message).toContain('Ok I received your message');
      expect(body.data.receivedMessage).toBe(message);
      expect(body.data.timestamp).toBeDefined();
    });

    it('should reject empty message', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/message',
        payload: { message: '' }
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.message).toBe('Message cannot be empty');
    });

    it('should reject message with only whitespace', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/message',
        payload: { message: '   ' }
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.message).toBe('Message cannot be empty');
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

    it('should reject message too long', async () => {
      const longMessage = 'a'.repeat(10001);
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/message',
        payload: { message: longMessage }
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.message).toBe('Message too long (max 10000 characters)');
    });

    it('should reject message with script tag', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/message',
        payload: { message: 'Hello <script>alert("xss")</script>' }
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.message).toBe('Message contains potentially dangerous content');
    });

    it('should reject message with javascript protocol', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/message',
        payload: { message: 'javascript:alert("xss")' }
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.message).toBe('Message contains potentially dangerous content');
    });

    it('should reject message with event handler', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/api/message',
        payload: { message: 'Hello onclick="alert(\'xss\')"' }
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
      expect(body.message).toBe('Message contains potentially dangerous content');
    });
  });
});
