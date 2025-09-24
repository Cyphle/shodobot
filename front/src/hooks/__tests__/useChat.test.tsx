import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useChat } from '../useChat';

describe('useChat', () => {
  it('initializes with empty state', () => {
    const { result } = renderHook(() => useChat());

    expect(result.current.messages).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('adds user message when sendMessage is called', () => {
    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.sendMessage('Hello world');
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]).toMatchObject({
      content: 'Hello world',
      role: 'user',
    });
    expect(result.current.isLoading).toBe(true);
  });

  it('does not send empty message', () => {
    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.sendMessage('');
    });

    expect(result.current.messages).toHaveLength(0);
    expect(result.current.isLoading).toBe(false);
  });

  it('does not send message with only whitespace', () => {
    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.sendMessage('   ');
    });

    expect(result.current.messages).toHaveLength(0);
    expect(result.current.isLoading).toBe(false);
  });

  it('generates unique message IDs', () => {
    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.sendMessage('Message 1');
    });

    // Attendre un peu pour s'assurer que les timestamps sont différents
    act(() => {
      // Simuler un petit délai
      const now = Date.now();
      while (Date.now() - now < 1) {
        // Attendre 1ms
      }
    });

    act(() => {
      result.current.sendMessage('Message 2');
    });

    const messageIds = result.current.messages.map(msg => msg.id);
    expect(new Set(messageIds).size).toBe(messageIds.length);
  });

  it('sets correct timestamps for messages', () => {
    const { result } = renderHook(() => useChat());
    const beforeTime = new Date();

    act(() => {
      result.current.sendMessage('Hello world');
    });

    const afterTime = new Date();
    const messageTime = result.current.messages[0].timestamp;

    expect(messageTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
    expect(messageTime.getTime()).toBeLessThanOrEqual(afterTime.getTime());
  });

  it('clears messages when clearMessages is called', () => {
    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.sendMessage('Hello world');
    });

    expect(result.current.messages).toHaveLength(1);

    act(() => {
      result.current.clearMessages();
    });

    expect(result.current.messages).toHaveLength(0);
    expect(result.current.error).toBe(null);
  });

  it('handles multiple messages correctly', () => {
    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.sendMessage('First message');
    });

    act(() => {
      result.current.sendMessage('Second message');
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0].content).toBe('First message');
    expect(result.current.messages[1].content).toBe('Second message');
  });

  it('maintains loading state during operation', () => {
    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.sendMessage('Hello world');
    });

    expect(result.current.isLoading).toBe(true);
  });
});