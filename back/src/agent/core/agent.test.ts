import { describe, it, expect, beforeEach } from '@jest/globals';
import { processMessage, clearHistory, getHistory } from './agent';

// Mock de la configuration
jest.mock('../../config/config', () => ({
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
    notion: {
      enabled: true,
      apiKey: 'test-notion-api-key'
    }
  }
}));

// Mock de LangChain
jest.mock('@langchain/groq', () => ({
  ChatGroq: jest.fn().mockImplementation(() => ({
    invoke: jest.fn().mockResolvedValue({
      content: 'Mocked AI response'
    })
  }))
}));

describe('Agent AI', () => {
  beforeEach(() => {
    // Effacer l'historique avant chaque test
    clearHistory();
    jest.clearAllMocks();
  });

  describe('processMessage', () => {
    it('should process a simple message', async () => {
      const message = 'Hello, how are you?';
      const result = await processMessage(message);
      expect(result).toBe('Mocked AI response');
    });

    it('should handle empty message', async () => {
      const message = '';
      const result = await processMessage(message);
      expect(result).toBe('Mocked AI response');
    });

    it('should handle message with special characters', async () => {
      const message = 'Hello @#$%^&*()_+-=[]{}|;:,.<>?';
      const result = await processMessage(message);
      expect(result).toBe('Mocked AI response');
    });

    it('should handle long message', async () => {
      const message = 'a'.repeat(1000);
      const result = await processMessage(message);
      expect(result).toBe('Mocked AI response');
    });

    it('should handle message with newlines', async () => {
      const message = 'Hello\nWorld\nHow are you?';
      const result = await processMessage(message);
      expect(result).toBe('Mocked AI response');
    });

    it('should return error message on failure', async () => {
      // Réinitialiser le mock pour forcer une erreur
      jest.resetModules();
      
      // Mock qui va échouer
      jest.doMock('@langchain/groq', () => ({
        ChatGroq: jest.fn().mockImplementation(() => ({
          invoke: jest.fn().mockRejectedValue(new Error('API Error'))
        }))
      }));

      // Recharger le module pour utiliser le nouveau mock
      const { processMessage: processMessageWithError } = await import('./agent');
      
      const message = 'Test message';
      const result = await processMessageWithError(message);
      expect(result).toBe('Désolé, je rencontre un problème technique. Pouvez-vous réessayer ?');
    });
  });

  describe('History Management', () => {
    it('should maintain conversation history', async () => {
      await processMessage('First message');
      await processMessage('Second message');
      
      const history = getHistory();
      expect(history).toHaveLength(4); // 2 user + 2 assistant messages
      expect(history[0].content).toBe('First message');
      expect(history[1].content).toBe('Mocked AI response');
      expect(history[2].content).toBe('Second message');
      expect(history[3].content).toBe('Mocked AI response');
    });

    it('should clear history', async () => {
      await processMessage('Test message');
      expect(getHistory()).toHaveLength(2);
      
      clearHistory();
      expect(getHistory()).toHaveLength(0);
    });

    it('should limit history size', async () => {
      // Ajouter plus de messages que la limite
      for (let i = 0; i < 15; i++) {
        await processMessage(`Message ${i}`);
      }
      
      const history = getHistory();
      expect(history.length).toBeLessThanOrEqual(20); // 10 paires max
    });
  });
});
