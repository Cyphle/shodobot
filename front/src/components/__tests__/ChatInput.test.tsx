import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ChatInput from '../ChatInput';

describe('ChatInput', () => {
  const mockOnSendMessage = vi.fn();

  beforeEach(() => {
    mockOnSendMessage.mockClear();
  });

  it('renders input and button correctly', () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} />);
    
    expect(screen.getByPlaceholderText('Tapez votre message...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Envoyer' })).toBeInTheDocument();
  });

  it('updates input value when typing', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSendMessage={mockOnSendMessage} />);
    
    const input = screen.getByPlaceholderText('Tapez votre message...');
    await user.type(input, 'Hello world');
    
    expect(input).toHaveValue('Hello world');
  });

  it('calls onSendMessage when form is submitted', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSendMessage={mockOnSendMessage} />);
    
    const input = screen.getByPlaceholderText('Tapez votre message...');
    const button = screen.getByRole('button', { name: 'Envoyer' });
    
    await user.type(input, 'Test message');
    await user.click(button);
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Test message');
  });

  it('calls onSendMessage when Enter key is pressed', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSendMessage={mockOnSendMessage} />);
    
    const input = screen.getByPlaceholderText('Tapez votre message...');
    await user.type(input, 'Test message');
    await user.keyboard('{Enter}');
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Test message');
  });

  it('does not call onSendMessage when Shift+Enter is pressed', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSendMessage={mockOnSendMessage} />);
    
    const input = screen.getByPlaceholderText('Tapez votre message...');
    await user.type(input, 'Test message');
    
    // Simuler Shift+Enter
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
    
    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('clears input after sending message', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSendMessage={mockOnSendMessage} />);
    
    const input = screen.getByPlaceholderText('Tapez votre message...');
    await user.type(input, 'Test message');
    await user.keyboard('{Enter}');
    
    expect(input).toHaveValue('');
  });

  it('does not send empty message', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSendMessage={mockOnSendMessage} />);
    
    const input = screen.getByPlaceholderText('Tapez votre message...');
    const button = screen.getByRole('button', { name: 'Envoyer' });
    
    await user.click(button);
    await user.keyboard('{Enter}');
    
    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('does not send message with only whitespace', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSendMessage={mockOnSendMessage} />);
    
    const input = screen.getByPlaceholderText('Tapez votre message...');
    await user.type(input, '   ');
    await user.keyboard('{Enter}');
    
    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('trims whitespace from message before sending', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSendMessage={mockOnSendMessage} />);
    
    const input = screen.getByPlaceholderText('Tapez votre message...');
    await user.type(input, '  Test message  ');
    await user.keyboard('{Enter}');
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Test message');
  });

  it('disables input and button when disabled prop is true', () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} disabled={true} />);
    
    const input = screen.getByPlaceholderText('Tapez votre message...');
    const button = screen.getByRole('button', { name: 'Envoyer' });
    
    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
  });

  it('applies correct styling when disabled', () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} disabled={true} />);
    
    const input = screen.getByPlaceholderText('Tapez votre message...');
    const button = screen.getByRole('button', { name: 'Envoyer' });
    
    expect(input).toHaveClass('disabled:bg-gray-100', 'disabled:cursor-not-allowed');
    expect(button).toHaveClass('disabled:bg-gray-300', 'disabled:cursor-not-allowed');
  });

  it('button is disabled when input is empty', () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} />);
    
    const button = screen.getByRole('button', { name: 'Envoyer' });
    expect(button).toBeDisabled();
  });

  it('button is enabled when input has content', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSendMessage={mockOnSendMessage} />);
    
    const input = screen.getByPlaceholderText('Tapez votre message...');
    const button = screen.getByRole('button', { name: 'Envoyer' });
    
    await user.type(input, 'Test');
    
    expect(button).not.toBeDisabled();
  });
});
