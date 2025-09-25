import { describe, it, expect, beforeEach } from '@jest/globals';
import { NotionSearchTool } from './NotionSearchTool';

// Mock du SDK Notion officiel
jest.mock('@notionhq/client', () => ({
  Client: jest.fn().mockImplementation(() => ({
    search: jest.fn().mockResolvedValue({
      results: [
        {
          id: 'test-page-1',
          properties: {
            title: {
              title: [{ plain_text: 'Test Page 1' }]
            }
          },
          last_edited_time: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 'test-db-1',
          title: [{ plain_text: 'Test Database 1' }],
          last_edited_time: '2024-01-01T00:00:00.000Z'
        }
      ]
    }),
    blocks: {
      children: {
        list: jest.fn().mockResolvedValue({
          results: [
            {
              type: 'paragraph',
              paragraph: {
                rich_text: [{ plain_text: 'This is test content for page 1' }]
              }
            }
          ]
        })
      }
    }
  }))
}));

describe('NotionSearchTool', () => {
  let notionTool: NotionSearchTool;

  beforeEach(() => {
    // Réinitialiser le mock de la configuration pour chaque test
    jest.resetModules();
    jest.doMock('../../../config/config', () => ({
      config: {
        notion: {
          enabled: true,
          apiKey: 'test-notion-api-key'
        }
      }
    }));
    const { NotionSearchTool: MockedNotionSearchTool } = require('./NotionSearchTool');
    notionTool = new MockedNotionSearchTool();
  });

  it('should search and return results', async () => {
    const results = await notionTool.searchAll('test query', 5);
    
    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({
      id: 'test-page-1',
      title: 'Test Page 1',
      url: 'https://notion.so/testpage1',
      content: 'This is test content for page 1',
      lastEditedTime: '2024-01-01T00:00:00.000Z',
      object: 'page'
    });
    expect(results[1]).toEqual({
      id: 'test-db-1',
      title: 'Test Database 1',
      url: 'https://notion.so/testdb1',
      lastEditedTime: '2024-01-01T00:00:00.000Z',
      object: 'database'
    });
  });

  it('should return empty array when Notion is disabled', async () => {
    jest.resetModules();
    jest.doMock('../../../config/config', () => ({
      config: {
        notion: {
          enabled: false,
          apiKey: 'test-notion-api-key'
        }
      }
    }));
    const { NotionSearchTool: MockedNotionSearchTool } = require('./NotionSearchTool');
    const disabledNotionTool = new MockedNotionSearchTool();
    
    const results = await disabledNotionTool.searchAll('test query');
    expect(results).toEqual([]);
  });

  it('should handle search errors gracefully', async () => {
    jest.resetModules();
    jest.doMock('@notionhq/client', () => ({
      Client: jest.fn().mockImplementation(() => ({
        search: jest.fn().mockRejectedValue(new Error('Notion API Error'))
      }))
    }));
    jest.doMock('../../../config/config', () => ({
      config: {
        notion: {
          enabled: true,
          apiKey: 'test-notion-api-key'
        }
      }
    }));
    const { NotionSearchTool: MockedNotionSearchTool } = require('./NotionSearchTool');
    const errorNotionTool = new MockedNotionSearchTool();

    await expect(errorNotionTool.searchAll('error query')).rejects.toThrow('Failed to search Notion workspace');
  });

  it('should disconnect properly', async () => {
    await notionTool.disconnect();
    expect(notionTool['client']).toBeNull();
  });
});