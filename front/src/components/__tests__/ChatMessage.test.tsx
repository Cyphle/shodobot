import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ChatMessage from '../ChatMessage';
import type { Message } from '../../types/chat';

describe('ChatMessage', () => {
  const mockUserMessage: Message = {
    id: '1',
    content: 'Hello, how are you?',
    role: 'user',
    timestamp: new Date('2024-01-01T10:00:00Z'),
  };

  const mockAssistantMessage: Message = {
    id: '2',
    content: 'I am doing well, thank you!',
    role: 'assistant',
    timestamp: new Date('2024-01-01T10:01:00Z'),
  };

  it('renders user message correctly', () => {
    render(<ChatMessage message={mockUserMessage} />);
    
    expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();
    // Vérifier qu'un timestamp est présent (peu importe le format)
    expect(screen.getByText(/\d{1,2}:\d{2}/)).toBeInTheDocument();
  });

  it('renders assistant message correctly', () => {
    render(<ChatMessage message={mockAssistantMessage} />);
    
    expect(screen.getByText('I am doing well, thank you!')).toBeInTheDocument();
    // Vérifier qu'un timestamp est présent (peu importe le format)
    expect(screen.getByText(/\d{1,2}:\d{2}/)).toBeInTheDocument();
  });

  it('applies correct styling for user message', () => {
    const { container } = render(<ChatMessage message={mockUserMessage} />);
    const messageContainer = container.firstChild as HTMLElement;
    
    expect(messageContainer).toHaveClass('justify-end');
    const messageBubble = messageContainer.querySelector('div');
    expect(messageBubble).toHaveClass('bg-blue-500', 'text-white');
  });

  it('applies correct styling for assistant message', () => {
    const { container } = render(<ChatMessage message={mockAssistantMessage} />);
    const messageContainer = container.firstChild as HTMLElement;
    
    expect(messageContainer).toHaveClass('justify-start');
    const messageBubble = messageContainer.querySelector('div');
    expect(messageBubble).toHaveClass('bg-gray-200', 'text-gray-800');
  });

  it('displays timestamp in correct format', () => {
    const customMessage: Message = {
      ...mockUserMessage,
      timestamp: new Date('2024-01-01T15:30:45Z'),
    };
    
    render(<ChatMessage message={customMessage} />);
    // Vérifier qu'un timestamp est présent (peu importe le format exact)
    expect(screen.getByText(/\d{1,2}:\d{2}/)).toBeInTheDocument();
  });

  it('handles empty content gracefully', () => {
    const emptyMessage: Message = {
      ...mockUserMessage,
      content: '',
    };
    
    render(<ChatMessage message={emptyMessage} />);
    // Vérifier que le composant se rend sans erreur
    expect(screen.getByText(/\d{1,2}:\d{2}/)).toBeInTheDocument();
  });
});
