import { config } from '../../../config/config';
import { LeannSearchResult, LeannSearchOptions, LeannAskOptions, LeannAPIResponse } from '../../../types/leann';

// Exports pour les tests
export type { LeannSearchResult, LeannSearchOptions, LeannAskOptions };

export class LeannSearchTool {
  private baseUrl: string;
  private isConnected = false;

  constructor() {
    this.baseUrl = config.leann.apiUrl;
    console.log('✅ LEANN Search Tool initialized');
  }

  /**
   * Vérifie la connexion à LEANN
   */
  private async checkConnection(): Promise<boolean> {
    if (this.isConnected) return true;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        this.isConnected = true;
        console.log('✅ LEANN connection established');
        return true;
      }
    } catch (error) {
      console.warn('⚠️ LEANN service not available:', error);
    }
    
    return false;
  }

  /**
   * Recherche dans les documents LEANN
   */
  public async searchAll(query: string, limit?: number): Promise<LeannSearchResult[]> {
    if (!config.leann.enabled) {
      console.log('LEANN integration is disabled.');
      return [];
    }

    const isConnected = await this.checkConnection();
    if (!isConnected) {
      console.log('LEANN service not available, skipping search.');
      return [];
    }

    try {
      const searchOptions: LeannSearchOptions = {
        query: query.trim(),
        limit: limit || 10,
        threshold: 0.7
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.leann.timeout);
      
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchOptions),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`LEANN API error: ${response.status}`);
      }

      const apiResponse = await response.json() as LeannAPIResponse;
      
      if (!apiResponse.success) {
        throw new Error(apiResponse.error || 'LEANN search failed');
      }

      // Transformer les résultats au format attendu
      const results: LeannSearchResult[] = (apiResponse.data || []).map((item: any, index: number) => ({
        id: item.id || `leann-${index}`,
        title: this.extractTitle(item),
        content: this.extractContent(item),
        url: item.url || this.generateUrl(item),
        score: item.score || 0.8,
        metadata: {
          file_path: item.file_path,
          file_type: item.file_type,
          page_number: item.page_number,
          ...item.metadata
        }
      }));

      console.log(`📊 LEANN search found ${results.length} results`);
      return results;

    } catch (error) {
      console.error('Error searching LEANN:', error);
      return [];
    }
  }

  /**
   * Pose une question aux documents LEANN et retourne le contexte pour le LLM
   */
  public async askQuestion(question: string): Promise<{ answer: string; context: string }> {
    if (!config.leann.enabled) {
      return { answer: 'LEANN integration is disabled.', context: '' };
    }

    const isConnected = await this.checkConnection();
    if (!isConnected) {
      return { answer: 'LEANN service not available.', context: '' };
    }

    try {
      const askOptions = {
        query: question.trim(),
        limit: 5
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(`${this.baseUrl}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(askOptions),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`LEANN API error: ${response.status}`);
      }

      const apiResponse = await response.json() as LeannAPIResponse;
      
      if (!apiResponse.success) {
        throw new Error(apiResponse.error || 'LEANN question failed');
      }

      return {
        answer: apiResponse.data?.answer || 'No answer found.',
        context: apiResponse.data?.context || ''
      };

    } catch (error) {
      console.error('Error asking LEANN:', error);
      return { 
        answer: 'Sorry, I encountered an error while searching the documents.', 
        context: '' 
      };
    }
  }

  /**
   * Extrait le titre d'un résultat LEANN
   */
  private extractTitle(item: any): string {
    if (item.title) return item.title;
    if (item.file_path) {
      const fileName = item.file_path.split('/').pop() || item.file_path;
      return fileName.replace(/\.[^/.]+$/, ''); // Remove extension
    }
    return 'Document';
  }

  /**
   * Extrait le contenu d'un résultat LEANN
   */
  private extractContent(item: any): string {
    if (item.content) return item.content;
    if (item.text) return item.text;
    if (item.snippet) return item.snippet;
    return 'No content available.';
  }

  /**
   * Génère une URL pour un résultat LEANN
   */
  private generateUrl(item: any): string {
    if (item.url) return item.url;
    if (item.file_path) {
      return `file://${item.file_path}`;
    }
    return '#';
  }

  /**
   * Vérifie si LEANN est prêt
   */
  public isReady(): boolean {
    return this.isConnected;
  }

  /**
   * Déconnecte de LEANN
   */
  public async disconnect(): Promise<void> {
    this.isConnected = false;
    console.log('🔌 LEANN Search Tool disconnected');
  }
}
