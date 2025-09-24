import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ChatContainer from '../ChatContainer';
import type { Message } from '../../types/chat';

// Mock des composants enfants pour isoler les tests
vi.mock('../ChatMessage', () => ({
  default: ({ message }: { message: Message }) => (
    <div data-testid={`message-${message.id}`}>
      {message.content} ({message.role})
    </div>
  ),
}));

vi.mock('../ChatInput', () => ({
  default: ({ onSendMessage, disabled }: { onSendMessage: (msg: string) => void; disabled?: boolean }) => (
    <div data-testid="chat-input">
      <input
        data-testid="message-input"
        placeholder="Tapez votre message..."
        disabled={disabled}
      />
      <button
        data-testid="send-button"
        onClick={() => onSendMessage('test message')}
        disabled={disabled}
      >
        Envoyer
      </button>
    </div>
  ),
}));

describe('ChatContainer', () => {
  const mockOnSendMessage = vi.fn();
  const mockMessages: Message[] = [
    {
      id: '1',
      content: 'Hello',
      role: 'user',
      timestamp: new Date('2024-01-01T10:00:00Z'),
    },
    {
      id: '2',
      content: 'Hi there!',
      role: 'assistant',
      timestamp: new Date('2024-01-01T10:01:00Z'),
    },
  ];

  beforeEach(() => {
    mockOnSendMessage.mockClear();
  });

  it('renders header correctly', () => {
    render(
      <ChatContainer
        messages={[]}
        onSendMessage={mockOnSendMessage}
        isLoading={false}
        error={null}
      />
    );

    expect(screen.getByText('ShodoBot - Assistant IA')).toBeInTheDocument();
    expect(screen.getByText('Posez-moi vos questions !')).toBeInTheDocument();
  });

  it('renders welcome message when no messages', () => {
    render(
      <ChatContainer
        messages={[]}
        onSendMessage={mockOnSendMessage}
        isLoading={false}
        error={null}
      />
    );

    expect(screen.getByText('Bienvenue ! Comment puis-je vous aider aujourd\'hui ?')).toBeInTheDocument();
  });

  it('renders messages correctly', () => {
    render(
      <ChatContainer
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
        isLoading={false}
        error={null}
      />
    );

    expect(screen.getByTestId('message-1')).toBeInTheDocument();
    expect(screen.getByTestId('message-2')).toBeInTheDocument();
    expect(screen.getByText('Hello (user)')).toBeInTheDocument();
    expect(screen.getByText('Hi there! (assistant)')).toBeInTheDocument();
  });

  it('renders loading indicator when isLoading is true', () => {
    render(
      <ChatContainer
        messages={[]}
        onSendMessage={mockOnSendMessage}
        isLoading={true}
        error={null}
      />
    );

    expect(screen.getByText('ShodoBot réfléchit...')).toBeInTheDocument();
    expect(screen.getByTestId('chat-input')).toBeInTheDocument();
  });

  it('renders error message when error is provided', () => {
    const errorMessage = 'Something went wrong';
    render(
      <ChatContainer
        messages={[]}
        onSendMessage={mockOnSendMessage}
        isLoading={false}
        error={errorMessage}
      />
    );

    expect(screen.getByText(`Erreur: ${errorMessage}`)).toBeInTheDocument();
  });

  it('disables input when loading', () => {
    render(
      <ChatContainer
        messages={[]}
        onSendMessage={mockOnSendMessage}
        isLoading={true}
        error={null}
      />
    );

    const input = screen.getByTestId('message-input');
    const button = screen.getByTestId('send-button');
    
    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
  });

  it('enables input when not loading', () => {
    render(
      <ChatContainer
        messages={[]}
        onSendMessage={mockOnSendMessage}
        isLoading={false}
        error={null}
      />
    );

    const input = screen.getByTestId('message-input');
    const button = screen.getByTestId('send-button');
    
    expect(input).not.toBeDisabled();
    expect(button).not.toBeDisabled();
  });

  it('calls onSendMessage when send button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ChatContainer
        messages={[]}
        onSendMessage={mockOnSendMessage}
        isLoading={false}
        error={null}
      />
    );

    const button = screen.getByTestId('send-button');
    await user.click(button);

    expect(mockOnSendMessage).toHaveBeenCalledWith('test message');
  });

  it('applies correct CSS classes for layout', () => {
    const { container } = render(
      <ChatContainer
        messages={[]}
        onSendMessage={mockOnSendMessage}
        isLoading={false}
        error={null}
      />
    );

    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass('flex', 'flex-col', 'h-screen', 'max-w-4xl', 'mx-auto', 'bg-white', 'shadow-lg');
  });

  it('renders header with correct styling', () => {
    render(
      <ChatContainer
        messages={[]}
        onSendMessage={mockOnSendMessage}
        isLoading={false}
        error={null}
      />
    );

    const header = screen.getByText('ShodoBot - Assistant IA').closest('div');
    expect(header).toHaveClass('bg-blue-600', 'text-white', 'p-4', 'rounded-t-lg');
  });

  it('renders messages area with correct styling', () => {
    const { container } = render(
      <ChatContainer
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
        isLoading={false}
        error={null}
      />
    );

    const messagesArea = container.querySelector('.flex-1.overflow-y-auto.p-4.space-y-4');
    expect(messagesArea).toBeInTheDocument();
  });

  it('renders input area with correct styling', () => {
    const { container } = render(
      <ChatContainer
        messages={[]}
        onSendMessage={mockOnSendMessage}
        isLoading={false}
        error={null}
      />
    );

    // Vérifier que le composant ChatInput est présent (qui contient le formulaire)
    const inputArea = container.querySelector('[data-testid="chat-input"]');
    expect(inputArea).toBeInTheDocument();
  });
});
