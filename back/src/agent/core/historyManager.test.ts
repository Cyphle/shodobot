import { describe, it, expect, beforeEach } from '@jest/globals';
import { HistoryManager } from './historyManager';
import { Message } from '../../types/chat';

describe('HistoryManager', () => {
  let historyManager: HistoryManager;

  beforeEach(() => {
    historyManager = new HistoryManager(3); // Limite de 3 messages pour les tests
  });

  describe('addMessage', () => {
    it('should add a message to history', () => {
      const message: Message = {
        id: '1',
        content: 'Hello',
        role: 'user',
        timestamp: new Date()
      };

      historyManager.addMessage(message);
      expect(historyManager.getHistoryLength()).toBe(1);
      expect(historyManager.getHistory()).toContain(message);
    });

    it('should limit history size', () => {
      // Ajouter plus de messages que la limite
      for (let i = 0; i < 5; i++) {
        const message: Message = {
          id: i.toString(),
          content: `Message ${i}`,
          role: 'user',
          timestamp: new Date()
        };
        historyManager.addMessage(message);
      }

      const history = historyManager.getHistory();
      expect(history).toHaveLength(3); // Seulement les 3 derniers
      expect(history[0].content).toBe('Message 2');
      expect(history[1].content).toBe('Message 3');
      expect(history[2].content).toBe('Message 4');
    });
  });

  describe('getFormattedHistory', () => {
    it('should format history for LangChain', () => {
      const userMessage: Message = {
        id: '1',
        content: 'Hello',
        role: 'user',
        timestamp: new Date()
      };

      const assistantMessage: Message = {
        id: '2',
        content: 'Hi there!',
        role: 'assistant',
        timestamp: new Date()
      };

      historyManager.addMessage(userMessage);
      historyManager.addMessage(assistantMessage);

      const formatted = historyManager.getFormattedHistory();
      expect(formatted).toHaveLength(2);
      expect(formatted[0]).toEqual({
        role: 'human',
        content: 'Hello'
      });
      expect(formatted[1]).toEqual({
        role: 'assistant',
        content: 'Hi there!'
      });
    });
  });

  describe('clearHistory', () => {
    it('should clear all messages', () => {
      const message: Message = {
        id: '1',
        content: 'Hello',
        role: 'user',
        timestamp: new Date()
      };

      historyManager.addMessage(message);
      expect(historyManager.getHistoryLength()).toBe(1);

      historyManager.clearHistory();
      expect(historyManager.getHistoryLength()).toBe(0);
      expect(historyManager.getHistory()).toHaveLength(0);
    });
  });

  describe('getHistoryLength', () => {
    it('should return correct length', () => {
      expect(historyManager.getHistoryLength()).toBe(0);

      const message: Message = {
        id: '1',
        content: 'Hello',
        role: 'user',
        timestamp: new Date()
      };

      historyManager.addMessage(message);
      expect(historyManager.getHistoryLength()).toBe(1);
    });
  });
});
