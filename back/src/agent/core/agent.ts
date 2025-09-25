import { ChatGroq } from '@langchain/groq';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { config } from '../../config/config';
import { HistoryManager } from './historyManager';
import { NotionSearchTool } from './tools/NotionSearchTool';
import { Message } from '../../types/chat';

// Instance globale de l'agent
let agent: ChatGroq | null = null;
let historyManager: HistoryManager | null = null;
let notionTool: NotionSearchTool | null = null;

/**
 * Initialise l'agent Groq
 */
function initializeAgent(): ChatGroq {
  if (!agent) {
    agent = new ChatGroq({
      apiKey: config.groq.apiKey,
      model: config.groq.model,
      temperature: config.groq.temperature,
      maxTokens: config.groq.maxTokens,
    });
  }
  return agent;
}

/**
 * Initialise le gestionnaire d'historique
 */
function initializeHistoryManager(): HistoryManager {
  if (!historyManager) {
    historyManager = new HistoryManager(config.agent.maxHistorySize);
  }
  return historyManager;
}

/**
 * Initialise l'outil Notion
 */
function initializeNotionTool(): NotionSearchTool | null {
  if (config.notion.enabled && !notionTool) {
    notionTool = new NotionSearchTool();
  }
  return notionTool;
}

/**
 * Traite un message avec l'agent AI
 */
export async function processMessage(message: string): Promise<string> {
  try {
    const groqAgent = initializeAgent();
    const history = initializeHistoryManager();
    const notion = initializeNotionTool();

    // Créer le message utilisateur
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      role: 'user',
      timestamp: new Date(),
    };

    // Ajouter le message à l'historique
    history.addMessage(userMessage);

    // Détecter si l'utilisateur demande une recherche Notion
    const notionKeywords = ['notion', 'recherche', 'cherche', 'trouve', 'document', 'page'];
    const shouldSearchNotion = notion && notionKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );

    let notionResults = '';
    if (shouldSearchNotion) {
      try {
        const searchQuery = message.replace(/notion|recherche|cherche|trouve|document|page/gi, '').trim();
        if (searchQuery) {
          const results = await notion!.searchAll(searchQuery, 5);
          if (results.length > 0) {
            notionResults = '\n\n📝 Résultats de recherche Notion:\n';
            results.forEach((result, index) => {
              notionResults += `${index + 1}. **${result.title}**\n`;
              notionResults += `   - Type: ${result.object}\n`;
              notionResults += `   - URL: ${result.url}\n`;
              if (result.content) {
                notionResults += `   - Contenu: ${result.content.substring(0, 200)}...\n`;
              }
              notionResults += '\n';
            });
          } else {
            notionResults = '\n\n📝 Aucun résultat trouvé dans Notion pour cette recherche.';
          }
        }
      } catch (error) {
        console.error('Error searching Notion:', error);
        notionResults = '\n\n📝 Erreur lors de la recherche dans Notion.';
      }
    }

    // Préparer les messages pour LangChain
    const systemPrompt = 'Tu es ShodoBot, un assistant IA utile et amical. Tu réponds en français de manière concise et professionnelle.' + 
      (notion ? ' Tu peux rechercher dans Notion quand l\'utilisateur le demande.' : '');
    
    const messages = [
      new SystemMessage(systemPrompt),
      ...history.getFormattedHistory().map(msg => 
        msg.role === 'human' 
          ? new HumanMessage(msg.content)
          : new AIMessage(msg.content)
      )
    ];

    // Obtenir la réponse de l'agent
    const response = await groqAgent.invoke(messages);
    let aiResponse = response.content as string;

    // Ajouter les résultats Notion si disponibles
    if (notionResults) {
      aiResponse += notionResults;
    }

    // Créer le message de l'assistant
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: aiResponse,
      role: 'assistant',
      timestamp: new Date(),
    };

    // Ajouter la réponse à l'historique
    history.addMessage(assistantMessage);

    return aiResponse;
  } catch (error) {
    console.error('Error processing message with AI agent:', error);
    return 'Désolé, je rencontre un problème technique. Pouvez-vous réessayer ?';
  }
}

/**
 * Efface l'historique de conversation
 */
export function clearHistory(): void {
  const history = initializeHistoryManager();
  history.clearHistory();
}

/**
 * Récupère l'historique de conversation
 */
export function getHistory(): Message[] {
  const history = initializeHistoryManager();
  return history.getHistory();
}

/**
 * Ferme l'outil Notion
 */
export async function closeNotionTool(): Promise<void> {
  if (notionTool) {
    await notionTool.disconnect();
    notionTool = null;
  }
}
