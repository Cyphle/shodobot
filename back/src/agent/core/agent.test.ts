import { describe, it, expect } from '@jest/globals';
import { processMessage } from './agent';

describe('processMessage', () => {
  it('should process a simple message', async () => {
    const message = 'Hello, how are you?';
    const result = await processMessage(message);
    expect(result).toBe(`Ok I received your message: "${message}"`);
  });

  it('should process an empty message', async () => {
    const message = '';
    const result = await processMessage(message);
    expect(result).toBe(`Ok I received your message: "${message}"`);
  });

  it('should process a message with special characters', async () => {
    const message = 'Hello @#$%^&*()_+-=[]{}|;:,.<>?';
    const result = await processMessage(message);
    expect(result).toBe(`Ok I received your message: "${message}"`);
  });

  it('should process a long message', async () => {
    const message = 'a'.repeat(1000);
    const result = await processMessage(message);
    expect(result).toBe(`Ok I received your message: "${message}"`);
  });

  it('should process a message with newlines', async () => {
    const message = 'Hello\nWorld\nHow are you?';
    const result = await processMessage(message);
    expect(result).toBe(`Ok I received your message: "${message}"`);
  });
});
