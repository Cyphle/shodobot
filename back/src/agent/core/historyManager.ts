import { Message } from '../../types/chat';

export class HistoryManager {
  private history: Message[] = [];
  private maxSize: number;

  constructor(maxSize: number = 10) {
    this.maxSize = maxSize;
  }

  /**
   * Ajoute un message à l'historique
   */
  addMessage(message: Message): void {
    this.history.push(message);
    
    // Garder seulement les derniers messages
    if (this.history.length > this.maxSize) {
      this.history = this.history.slice(-this.maxSize);
    }
  }

  /**
   * Récupère l'historique des messages
   */
  getHistory(): Message[] {
    return [...this.history];
  }

  /**
   * Récupère l'historique formaté pour LangChain
   */
  getFormattedHistory(): Array<{ role: string; content: string }> {
    return this.history.map(msg => ({
      role: msg.role === 'user' ? 'human' : 'assistant',
      content: msg.content
    }));
  }

  /**
   * Efface l'historique
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * Récupère le nombre de messages dans l'historique
   */
  getHistoryLength(): number {
    return this.history.length;
  }
}
