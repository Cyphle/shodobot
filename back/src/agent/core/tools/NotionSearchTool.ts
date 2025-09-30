import { Client } from '@notionhq/client';
import { config } from '../../../config/config';

export interface NotionSearchOptions {
  query: string;
  limit?: number;
  filter?: any; // Notion filter object
}

export interface NotionSearchResult {
  id: string;
  title: string;
  url: string;
  content?: string;
  lastEditedTime: string;
  object: 'page' | 'database';
}

export class NotionSearchTool {
  private client: Client | null = null;

  constructor() {
    if (config.notion.enabled && config.notion.apiKey) {
      this.client = new Client({
        auth: config.notion.apiKey,
      });
      console.log('✅ Notion API client initialized');
    }
  }

  /**
   * Déconnecte le client Notion (pas nécessaire avec l'API officielle).
   */
  public async disconnect(): Promise<void> {
    this.client = null;
    console.log('🔌 Notion API client disconnected');
  }

  /**
   * Recherche dans l'espace de travail Notion.
   * @param query La chaîne de recherche.
   * @param limit Le nombre maximum de résultats à retourner.
   * @param filter Un objet de filtre Notion optionnel.
   * @returns Une promesse qui résout en un tableau de NotionSearchResult.
   */
  public async searchAll(query: string, limit?: number, filter?: any): Promise<NotionSearchResult[]> {
    if (!config.notion.enabled || !this.client) {
      console.log('Notion integration is disabled or not configured.');
      return [];
    }

    try {
      // Recherche dans toutes les pages et bases de données
      const searchResponse = await this.client.search({
        query: query,
        page_size: limit || 10,
        filter: filter || {
          property: 'object',
          value: 'page'
        }
      });

      const results: NotionSearchResult[] = [];

      for (const page of searchResponse.results) {
        if ('properties' in page) {
          // C'est une page
          const title = this.extractTitle(page);
          const url = this.getPageUrl(page.id);
          
          // Récupérer le contenu de la page
          let content = '';
          try {
            const blocks = await this.client.blocks.children.list({
              block_id: page.id,
              page_size: 5 // Limiter pour éviter trop de contenu
            });
            content = this.extractTextFromBlocks(blocks.results);
          } catch (error) {
            console.warn('Could not fetch page content:', error);
          }

          results.push({
            id: page.id,
            title: title,
            url: url,
            content: content,
            lastEditedTime: (page as any).last_edited_time || new Date().toISOString(),
            object: 'page'
          });
        } else if ('title' in page) {
          // C'est une base de données
          results.push({
            id: page.id,
            title: this.extractDatabaseTitle(page),
            url: this.getDatabaseUrl(page.id),
            lastEditedTime: (page as any).last_edited_time || new Date().toISOString(),
            object: 'database'
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error searching Notion:', error);
      throw new Error('Failed to search Notion workspace');
    }
  }

  /**
   * Extrait le titre d'une page Notion.
   */
  private extractTitle(page: any): string {
    const properties = page.properties;
    
    // Chercher dans les propriétés de titre communes
    for (const [key, value] of Object.entries(properties)) {
      if (value && typeof value === 'object' && 'title' in value) {
        const titleArray = (value as any).title;
        if (Array.isArray(titleArray) && titleArray.length > 0) {
          return titleArray.map((item: any) => item.plain_text || '').join('');
        }
      }
    }
    
    return 'Sans titre';
  }

  /**
   * Extrait le titre d'une base de données Notion.
   */
  private extractDatabaseTitle(database: any): string {
    if (database.title && Array.isArray(database.title)) {
      return database.title.map((item: any) => item.plain_text || '').join('');
    }
    return 'Base de données';
  }

  /**
   * Extrait le texte des blocs Notion.
   */
  private extractTextFromBlocks(blocks: any[]): string {
    return blocks
      .map(block => {
        if (block.type === 'paragraph' && block.paragraph?.rich_text) {
          return block.paragraph.rich_text
            .map((text: any) => text.plain_text || '')
            .join('');
        } else if (block.type === 'heading_1' && block.heading_1?.rich_text) {
          return '\n# ' + block.heading_1.rich_text
            .map((text: any) => text.plain_text || '')
            .join('') + '\n';
        } else if (block.type === 'heading_2' && block.heading_2?.rich_text) {
          return '\n## ' + block.heading_2.rich_text
            .map((text: any) => text.plain_text || '')
            .join('') + '\n';
        } else if (block.type === 'heading_3' && block.heading_3?.rich_text) {
          return '\n### ' + block.heading_3.rich_text
            .map((text: any) => text.plain_text || '')
            .join('') + '\n';
        } else if (block.type === 'bulleted_list_item' && block.bulleted_list_item?.rich_text) {
          return '\n• ' + block.bulleted_list_item.rich_text
            .map((text: any) => text.plain_text || '')
            .join('');
        } else if (block.type === 'numbered_list_item' && block.numbered_list_item?.rich_text) {
          return '\n1. ' + block.numbered_list_item.rich_text
            .map((text: any) => text.plain_text || '')
            .join('');
        }
        return '';
      })
      .filter(text => text.length > 0)
      .join('')
      .substring(0, 800); // Augmenter la limite pour plus de contenu
  }

  /**
   * Génère l'URL d'une page Notion.
   */
  private getPageUrl(pageId: string): string {
    return `https://notion.so/${pageId.replace(/-/g, '')}`;
  }

  /**
   * Génère l'URL d'une base de données Notion.
   */
  private getDatabaseUrl(databaseId: string): string {
    return `https://notion.so/${databaseId.replace(/-/g, '')}`;
  }
}