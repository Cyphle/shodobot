import Fastify, { FastifyInstance } from 'fastify';
import { configureApp } from './app';

// Mock de l'agent AI pour les tests d'intégration
jest.mock('./agent/core/agent', () => ({
  processMessage: jest.fn().mockResolvedValue('Mocked AI response for integration test')
}));

// Mock de la configuration
jest.mock('./config/config', () => ({
  config: {
    groq: {
      apiKey: 'test-api-key',
      model: 'llama-3.2-3b-preview',
      temperature: 0.7,
      maxTokens: 1000,
    },
    agent: {
      maxHistorySize: 10,
    },
    frontend: {
      url: 'http://localhost:5173'
    },
    server: {
      port: 3001,
      host: '0.0.0.0'
    }
  }
}));

// Mock de LangChain
jest.mock('@langchain/groq', () => ({
  ChatGroq: jest.fn().mockImplementation(() => ({
    invoke: jest.fn().mockResolvedValue({
      content: 'Mocked AI response for integration test'
    })
  }))
}));

describe('App Integration', () => {
  let fastify: FastifyInstance;

  beforeAll(async () => {
    fastify = Fastify({
      logger: false
    });
    await configureApp(fastify);
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/health'
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual({
        success: true,
        message: 'Server is running',
        timestamp: expect.any(String)
      });
    });
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
      expect(body.message).toContain('Mocked AI response for integration test');
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
  });

  describe('404 handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/unknown-route'
      });

      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.body)).toEqual({
        success: false,
        message: 'Route not found'
      });
    });
  });
});
