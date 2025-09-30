import { describe, it, expect, beforeEach } from '@jest/globals';
import { LeannSearchTool } from './LeannSearchTool';

// Mock de fetch
global.fetch = jest.fn();

describe('LeannSearchTool', () => {
  let leannTool: LeannSearchTool;

  beforeEach(() => {
    // Réinitialiser le mock de la configuration pour chaque test
    jest.resetModules();
    jest.doMock('../../../config/config', () => ({
      config: {
        leann: {
          enabled: true,
          apiUrl: 'http://localhost:8000',
          indexName: 'shodobot-docs',
          timeout: 10000
        }
      }
    }));
    const { LeannSearchTool: MockedLeannSearchTool } = require('./LeannSearchTool');
    leannTool = new MockedLeannSearchTool();
    jest.clearAllMocks();
  });

  it('should search and return results', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        data: [
          {
            id: 'doc-1',
            title: 'Test Document',
            content: 'This is test content',
            score: 0.95,
            metadata: {
              file_path: '/app/documents/test.md',
              file_type: 'markdown'
            }
          }
        ]
      })
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const results = await leannTool.searchAll('test query', 5);
    
    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({
      id: 'doc-1',
      title: 'Test Document',
      content: 'This is test content',
      url: '#',
      score: 0.95,
      metadata: {
        file_path: '/app/documents/test.md',
        file_type: 'markdown'
      }
    });
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/search',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'test query',
          limit: 5,
          threshold: 0.7
        })
      })
    );
  });

  it('should ask question and return answer', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        data: {
          answer: 'This is the answer to your question.'
        }
      })
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const answer = await leannTool.askQuestion('What is machine learning?');
    
    expect(answer).toBe('This is the answer to your question.');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/ask',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: 'What is machine learning?',
          context_limit: 5,
          temperature: 0.7
        })
      })
    );
  });

  it('should return empty array when LEANN is disabled', async () => {
    jest.resetModules();
    jest.doMock('../../../config/config', () => ({
      config: {
        leann: {
          enabled: false,
          apiUrl: 'http://localhost:8000',
          indexName: 'shodobot-docs',
          timeout: 10000
        }
      }
    }));
    const { LeannSearchTool: MockedLeannSearchTool } = require('./LeannSearchTool');
    const disabledLeannTool = new MockedLeannSearchTool();
    
    const results = await disabledLeannTool.searchAll('test query');
    expect(results).toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should handle search errors gracefully', async () => {
    const mockResponse = {
      ok: false,
      status: 500
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const results = await leannTool.searchAll('error query');
    expect(results).toEqual([]);
  });

  it('should handle API errors', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: false,
        error: 'LEANN API error'
      })
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const results = await leannTool.searchAll('error query');
    expect(results).toEqual([]);
  });

  it('should handle ask question errors', async () => {
    // Mock checkConnection to return false to simulate service unavailable
    jest.spyOn(leannTool as any, 'checkConnection').mockResolvedValue(false);

    const answer = await leannTool.askQuestion('error question');
    expect(answer).toBe('LEANN service not available.');
  });

  it('should disconnect properly', async () => {
    await leannTool.disconnect();
    expect(leannTool.isReady()).toBe(false);
  });
});
