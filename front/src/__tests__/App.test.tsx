import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import App from '../App';

// Wrapper pour fournir le QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <ConfigProvider theme={{ token: { colorBgBase: '#000000' } }}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ConfigProvider>
  );
};

describe('App Integration', () => {
  it('renders the chat interface', () => {
    render(<App />, { wrapper: createWrapper() });

    expect(screen.getByText('ShodoBot')).toBeInTheDocument();
    expect(screen.getByText('Assistant IA Shodo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tapez votre message...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('displays welcome message initially', () => {
    render(<App />, { wrapper: createWrapper() });

    expect(screen.getByText('Bienvenue sur ShodoBot')).toBeInTheDocument();
  });

  it('allows user to send a message', async () => {
    const user = userEvent.setup();
    render(<App />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText('Tapez votre message...');
    const button = screen.getByRole('button');

    await user.type(input, 'Hello, how are you?');
    await user.click(button);

    // Vérifier que le message utilisateur apparaît
    expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();
  });

  it('shows loading state when sending message', async () => {
    const user = userEvent.setup();
    render(<App />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText('Tapez votre message...');
    const button = screen.getByRole('button');

    await user.type(input, 'Test message');
    await user.click(button);

    // Vérifier l'état de chargement
    expect(screen.getByText('ShodoBot réfléchit...')).toBeInTheDocument();
  });

  it('clears input after sending message', async () => {
    const user = userEvent.setup();
    render(<App />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText('Tapez votre message...');
    const button = screen.getByRole('button');

    await user.type(input, 'Test message');
    await user.click(button);

    expect(input).toHaveValue('');
  });

  it('handles Enter key to send message', async () => {
    const user = userEvent.setup();
    render(<App />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText('Tapez votre message...');

    await user.type(input, 'Test message');
    await user.keyboard('{Enter}');

    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('does not send empty message', async () => {
    const user = userEvent.setup();
    render(<App />, { wrapper: createWrapper() });

    const button = screen.getByRole('button');
    await user.click(button);

    // Le message de bienvenue devrait toujours être visible
    expect(screen.getByText('Bienvenue sur ShodoBot')).toBeInTheDocument();
  });

  it('disables input during loading', async () => {
    const user = userEvent.setup();
    render(<App />, { wrapper: createWrapper() });

    const input = screen.getByPlaceholderText('Tapez votre message...');
    const button = screen.getByRole('button');

    await user.type(input, 'Test message');
    await user.click(button);

    // Vérifier que l'input est désactivé pendant le chargement
    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
  });

  it('maintains message history', async () => {
    const user = userEvent.setup();
    render(<App />, { wrapper: createWrapper() });

    // Envoyer le premier message
    const input = screen.getByPlaceholderText('Tapez votre message...');
    await user.type(input, 'First message');
    await user.keyboard('{Enter}');

    // Attendre que le premier message soit traité
    await waitFor(() => {
      expect(screen.getByText('First message')).toBeInTheDocument();
    });

    // Attendre que le loading se termine
    await waitFor(() => {
      expect(screen.queryByText('ShodoBot réfléchit...')).not.toBeInTheDocument();
    });

    // Envoyer un deuxième message
    await user.type(input, 'Second message');
    await user.keyboard('{Enter}');

    // Vérifier que les deux messages sont présents
    expect(screen.getByText('First message')).toBeInTheDocument();
    expect(screen.getByText('Second message')).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    const { container } = render(<App />, { wrapper: createWrapper() });

    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveStyle('background: #000000');
  });
});
