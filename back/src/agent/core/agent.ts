import { ChatGroq } from '@langchain/groq';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { config } from '../../config/config';
import { HistoryManager } from './historyManager';
import { Message } from '../../types/chat';

// Instance globale de l'agent
let agent: ChatGroq | null = null;
let historyManager: HistoryManager | null = null;

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
 * Traite un message avec l'agent AI
 */
export async function processMessage(message: string): Promise<string> {
  try {
    const groqAgent = initializeAgent();
    const history = initializeHistoryManager();

    // Créer le message utilisateur
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      role: 'user',
      timestamp: new Date(),
    };

    // Ajouter le message à l'historique
    history.addMessage(userMessage);

    // Préparer les messages pour LangChain
    const messages = [
      new SystemMessage('Tu es ShodoBot, un assistant IA utile et amical. Tu réponds en français de manière concise et professionnelle.'),
      ...history.getFormattedHistory().map(msg => 
        msg.role === 'human' 
          ? new HumanMessage(msg.content)
          : new AIMessage(msg.content)
      )
    ];

    // Obtenir la réponse de l'agent
    const response = await groqAgent.invoke(messages);
    const aiResponse = response.content as string;

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
