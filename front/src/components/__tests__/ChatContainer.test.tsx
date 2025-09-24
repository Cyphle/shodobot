import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigProvider } from 'antd';
import ChatContainer from '../ChatContainer';
import type { Message } from '../../types/chat';

// Wrapper pour Ant Design
const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => (
    <ConfigProvider theme={{ token: { colorBgBase: '#000000' } }}>
      {children}
    </ConfigProvider>
  );
};

describe('ChatContainer', () => {
  const mockOnSendMessage = vi.fn();
  const mockMessages: Message[] = [
    { id: '1', content: 'Hello', role: 'user', timestamp: new Date() },
    { id: '2', content: 'Hi there!', role: 'assistant', timestamp: new Date() },
  ];

  beforeEach(() => {
    mockOnSendMessage.mockClear();
    // Mock scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it('renders welcome message when no messages', () => {
    render(
      <ChatContainer
        messages={[]}
        onSendMessage={mockOnSendMessage}
        isLoading={false}
        error={null}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Bienvenue sur ShodoBot')).toBeInTheDocument();
    expect(screen.getByText('Comment puis-je vous aider aujourd\'hui ?')).toBeInTheDocument();
  });

  it('renders messages correctly', () => {
    render(
      <ChatContainer
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
        isLoading={false}
        error={null}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });

  it('renders loading indicator when isLoading is true', () => {
    const mockMessages: Message[] = [
      { id: '1', content: 'Hello', role: 'user', timestamp: new Date() },
    ];
    
    render(
      <ChatContainer
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
        isLoading={true}
        error={null}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('ShodoBot réfléchit...')).toBeInTheDocument();
  });

  it('renders error message when error is provided', () => {
    const errorMessage = 'Something went wrong';
    const mockMessages: Message[] = [
      { id: '1', content: 'Hello', role: 'user', timestamp: new Date() },
    ];
    
    render(
      <ChatContainer
        messages={mockMessages}
        onSendMessage={mockOnSendMessage}
        isLoading={false}
        error={errorMessage}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(`Erreur: ${errorMessage}`)).toBeInTheDocument();
  });

  it('sends message when form is submitted', async () => {
    const user = userEvent.setup();
    render(
      <ChatContainer
        messages={[]}
        onSendMessage={mockOnSendMessage}
        isLoading={false}
        error={null}
      />,
      { wrapper: createWrapper() }
    );

    const input = screen.getByPlaceholderText('Tapez votre message...');
    const button = screen.getByRole('button');

    await user.type(input, 'Test message');
    await user.click(button);

    expect(mockOnSendMessage).toHaveBeenCalledWith('Test message');
  });

  it('sends message when Enter key is pressed', async () => {
    const user = userEvent.setup();
    render(
      <ChatContainer
        messages={[]}
        onSendMessage={mockOnSendMessage}
        isLoading={false}
        error={null}
      />,
      { wrapper: createWrapper() }
    );

    const input = screen.getByPlaceholderText('Tapez votre message...');

    await user.type(input, 'Test message');
    await user.keyboard('{Enter}');

    expect(mockOnSendMessage).toHaveBeenCalledWith('Test message');
  });

  it('clears input after sending message', async () => {
    const user = userEvent.setup();
    render(
      <ChatContainer
        messages={[]}
        onSendMessage={mockOnSendMessage}
        isLoading={false}
        error={null}
      />,
      { wrapper: createWrapper() }
    );

    const input = screen.getByPlaceholderText('Tapez votre message...');
    const button = screen.getByRole('button');

    await user.type(input, 'Test message');
    await user.click(button);

    expect(input).toHaveValue('');
  });

  it('does not send empty message', async () => {
    const user = userEvent.setup();
    render(
      <ChatContainer
        messages={[]}
        onSendMessage={mockOnSendMessage}
        isLoading={false}
        error={null}
      />,
      { wrapper: createWrapper() }
    );

    const button = screen.getByRole('button');

    await user.click(button);
    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('disables input when loading', () => {
    render(
      <ChatContainer
        messages={[]}
        onSendMessage={mockOnSendMessage}
        isLoading={true}
        error={null}
      />,
      { wrapper: createWrapper() }
    );

    const input = screen.getByPlaceholderText('Tapez votre message...');
    const button = screen.getByRole('button');

    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
  });
});
