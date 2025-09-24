import { useState, useCallback } from 'react';
import type { Message } from '../types/chat';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMessage = useCallback((content: string, role: 'user' | 'assistant') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      role,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    addMessage(content, 'user');
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call
      // For now, simulate a response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = `Je reçois votre message: "${content}". Pour l'instant, je suis en mode simulation. L'intégration avec l'API backend sera ajoutée prochainement !`;
      addMessage(response, 'assistant');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  }, [addMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
};
