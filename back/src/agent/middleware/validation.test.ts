import { describe, it, expect } from '@jest/globals';
import { validateMessage } from './validation';

describe('validateMessage', () => {
  it('should validate a correct message', () => {
    const result = validateMessage('Hello, this is a test message');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should reject null message', () => {
    const result = validateMessage(null);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Message is required');
  });

  it('should reject undefined message', () => {
    const result = validateMessage(undefined);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Message is required');
  });

  it('should reject non-string message', () => {
    const result = validateMessage(123);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Message must be a string');
  });

  it('should reject empty string', () => {
    const result = validateMessage('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Message cannot be empty');
  });

  it('should reject whitespace-only string', () => {
    const result = validateMessage('   ');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Message cannot be empty');
  });

  it('should reject message too long', () => {
    const longMessage = 'a'.repeat(10001);
    const result = validateMessage(longMessage);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Message too long (max 10000 characters)');
  });

  it('should reject message with script tag', () => {
    const result = validateMessage('Hello <script>alert("xss")</script>');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Message contains potentially dangerous content');
  });

  it('should reject message with javascript protocol', () => {
    const result = validateMessage('javascript:alert("xss")');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Message contains potentially dangerous content');
  });

  it('should reject message with event handler', () => {
    const result = validateMessage('Hello onclick="alert(\'xss\')"');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('Message contains potentially dangerous content');
  });

  it('should accept message with HTML entities', () => {
    const result = validateMessage('Hello &lt;world&gt;');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should accept message with special characters', () => {
    const result = validateMessage('Hello @#$%^&*()_+-=[]{}|;:,.<>?');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });
});
