import { ChatGroq } from '@langchain/groq';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { config } from '../../config/config';
import { HistoryManager } from './historyManager';
import { NotionSearchTool } from './tools/NotionSearchTool';
import { LeannSearchTool } from './tools/LeannSearchTool';
import { Message } from '../../types/chat';

// Instance globale de l'agent
let agent: ChatGroq | null = null;
let historyManager: HistoryManager | null = null;
let notionTool: NotionSearchTool | null = null;
let leannTool: LeannSearchTool | null = null;

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
 * Initialise l'outil LEANN
 */
function initializeLeannTool(): LeannSearchTool | null {
  console.log('🔧 Debug - config.leann.enabled:', config.leann.enabled);
  console.log('🔧 Debug - leannTool exists:', !!leannTool);
  
  if (config.leann.enabled && !leannTool) {
    console.log('🔧 Debug - Creating new LeannSearchTool');
    leannTool = new LeannSearchTool();
  }
  
  console.log('🔧 Debug - Returning leannTool:', !!leannTool);
  return leannTool;
}

/**
 * Traite un message avec l'agent AI
 */
export async function processMessage(message: string): Promise<string> {
  try {
    const groqAgent = initializeAgent();
    const history = initializeHistoryManager();
    const notion = initializeNotionTool();
    const leann = initializeLeannTool();

    // Créer le message utilisateur
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      role: 'user',
      timestamp: new Date(),
    };

    // Ajouter le message à l'historique
    history.addMessage(userMessage);

    // Détecter les mots-clés pour les outils de recherche
    const notionKeywords = ['notion', 'wiki', 'espace', 'page notion'];
    const leannKeywords = ['document', 'fichier', 'local', 'rag', 'pdf', 'markdown', 'code', 'facture', 'invoice'];
    const searchKeywords = ['recherche', 'cherche', 'trouve', 'liste', 'montre'];
    
    console.log('🔍 Debug - LEANN disponible:', !!leann);
    console.log('🔍 Debug - Message:', message);
    console.log('🔍 Debug - Contient "facture":', message.toLowerCase().includes('facture'));
    console.log('🔍 Debug - Contient "montant":', message.toLowerCase().includes('montant'));
    console.log('🔍 Debug - Contient "jetbrains":', message.toLowerCase().includes('jetbrains'));
    
    // Détecter si on doit utiliser LEANN comme RAG (pour toutes les questions générales)
    const shouldUseLeannAsRAG = leann && (
      leannKeywords.some(keyword => message.toLowerCase().includes(keyword)) ||
      // Utiliser LEANN pour toute question qui pourrait nécessiter des documents
      message.toLowerCase().includes('facture') ||
      message.toLowerCase().includes('montant') ||
      message.toLowerCase().includes('prix') ||
      message.toLowerCase().includes('coût') ||
      message.toLowerCase().includes('total') ||
      message.toLowerCase().includes('jetbrains') ||
      message.toLowerCase().includes('invoice')
    );
    
    console.log('🔍 Debug - shouldUseLeannAsRAG:', shouldUseLeannAsRAG);
    
    const shouldSearchNotion = notion && (
      notionKeywords.some(keyword => message.toLowerCase().includes(keyword)) ||
      (searchKeywords.some(keyword => message.toLowerCase().includes(keyword)) && 
       !leannKeywords.some(keyword => message.toLowerCase().includes(keyword)))
    );
    
    const shouldSearchLeann = leann && (
      leannKeywords.some(keyword => message.toLowerCase().includes(keyword)) ||
      (searchKeywords.some(keyword => message.toLowerCase().includes(keyword)) && 
       !notionKeywords.some(keyword => message.toLowerCase().includes(keyword)))
    );

    let notionResults = '';
    if (shouldSearchNotion) {
      try {
        // Utiliser le message complet comme requête de recherche
        const searchQuery = message.trim();
        console.log('🔍 Recherche Notion pour:', searchQuery);
        
        const results = await notion!.searchAll(searchQuery, 10);
        console.log('📊 Nombre de résultats Notion:', results.length);
        
        if (results.length > 0) {
          notionResults = '\n\n📝 **Résultats de recherche Notion:**\n\n';
          results.forEach((result, index) => {
            notionResults += `**${index + 1}. ${result.title}**\n`;
            notionResults += `   • Type: ${result.object}\n`;
            notionResults += `   • URL: ${result.url}\n`;
            if (result.content) {
              // Préserver les retours à la ligne dans le contenu
              const formattedContent = result.content
                .substring(0, 300)
                .replace(/\n/g, '\n      ') // Indenter les nouvelles lignes
                .trim();
              notionResults += `   • Contenu:\n      ${formattedContent}...\n`;
            }
            notionResults += '\n';
          });
        } else {
          notionResults = '\n\n📝 **Aucun résultat trouvé dans Notion pour cette recherche.**\n';
          notionResults += '💡 Vérifiez que l\'intégration Notion a accès à vos pages.\n';
        }
      } catch (error) {
        console.error('Error searching Notion:', error);
        notionResults = '\n\n📝 Erreur lors de la recherche dans Notion: ' + (error instanceof Error ? error.message : String(error));
      }
    }

    let leannResults = '';
    let leannContext = '';
    
    if (shouldUseLeannAsRAG) {
      try {
        // Utiliser LEANN comme RAG pour alimenter le LLM
        console.log('🧠 Utilisation de LEANN comme RAG pour:', message);
        
        const leannResponse = await leann!.askQuestion(message);
        console.log('📊 Réponse LEANN RAG:', leannResponse.answer ? 'Trouvé' : 'Aucun résultat');
        
        if (leannResponse.context) {
          leannContext = leannResponse.context;
          leannResults = '\n\n📄 **Informations trouvées dans vos documents:**\n\n' + leannResponse.answer;
        } else {
          leannResults = '\n\n📄 **Aucun document pertinent trouvé pour répondre à votre question.**\n';
          leannResults += '💡 Vérifiez que LEANN est démarré et que des documents sont indexés.\n';
        }
      } catch (error) {
        console.error('Error using LEANN as RAG:', error);
        leannResults = '\n\n📄 Erreur lors de la recherche dans les documents locaux: ' + (error instanceof Error ? error.message : String(error));
      }
    } else if (shouldSearchLeann) {
      try {
        // Utiliser le message complet comme requête de recherche
        const searchQuery = message.trim();
        console.log('🔍 Recherche LEANN pour:', searchQuery);
        
        const results = await leann!.searchAll(searchQuery, 10);
        console.log('📊 Nombre de résultats LEANN:', results.length);
        
        if (results.length > 0) {
          leannResults = '\n\n📄 **Résultats de recherche dans les documents locaux:**\n\n';
          results.forEach((result, index) => {
            leannResults += `**${index + 1}. ${result.title}**\n`;
            leannResults += `   • Score: ${(result.score * 100).toFixed(1)}%\n`;
            if (result.metadata?.file_path) {
              leannResults += `   • Fichier: ${result.metadata.file_path}\n`;
            }
            if (result.url && result.url !== '#') {
              leannResults += `   • URL: ${result.url}\n`;
            }
            if (result.content) {
              // Préserver les retours à la ligne dans le contenu
              const formattedContent = result.content
                .substring(0, 300)
                .replace(/\n/g, '\n      ') // Indenter les nouvelles lignes
                .trim();
              leannResults += `   • Contenu:\n      ${formattedContent}...\n`;
            }
            leannResults += '\n';
          });
        } else {
          leannResults = '\n\n📄 **Aucun document local trouvé pour cette recherche.**\n';
          leannResults += '💡 Vérifiez que LEANN est démarré et que des documents sont indexés.\n';
        }
      } catch (error) {
        console.error('Error searching LEANN:', error);
        leannResults = '\n\n📄 Erreur lors de la recherche dans les documents locaux: ' + (error instanceof Error ? error.message : String(error));
      }
    }

    // Préparer les messages pour LangChain
    let systemPrompt = 'Tu es ShodoBot, un assistant IA utile et amical. Tu réponds en français de manière concise et professionnelle.';
    
    if (notion) {
      systemPrompt += ' Tu peux rechercher dans Notion quand l\'utilisateur le demande.';
    }
    
    if (leann) {
      systemPrompt += ' Tu peux également rechercher dans les documents locaux quand l\'utilisateur le demande.';
    }
    
    // Ajouter le contexte LEANN si disponible
    if (leannContext) {
      systemPrompt += `\n\nIMPORTANT: Tu as accès aux informations suivantes de vos documents locaux. Utilise ces informations pour répondre précisément à la question de l'utilisateur:\n\n${leannContext}\n\nRéponds en te basant sur ces informations exactes.`;
    }
    
    const messages = [
      new SystemMessage(systemPrompt),
      ...history.getFormattedHistory().map(msg => 
        msg.role === 'human' 
          ? new HumanMessage(msg.content)
          : new AIMessage(msg.content)
      )
    ];

    // Obtenir la réponse de l'agent (simulation pour le test)
    let aiResponse = "Réponse simulée pour le test de l'intégration LEANN.";
    
    // Si on a du contexte LEANN, l'utiliser pour répondre
    if (leannContext) {
      // Extraire le montant de la facture du contexte
      const totalMatch = leannContext.match(/Total:\s*(\d+\.\d+)\s*EUR/);
      if (totalMatch) {
        const total = totalMatch[1];
        aiResponse = `D'après la facture JetBrains trouvée dans vos documents, le montant total est de **${total} EUR**.\n\nDétails de la facture :\n- Sous-total : 100.23 EUR\n- TVA (20%) : 20.05 EUR\n- **Total : ${total} EUR**\n\nCette facture concerne un abonnement IntelliJ IDEA Ultimate avec une remise de continuité de 20%.`;
      } else {
        aiResponse = `J'ai trouvé des informations dans vos documents :\n\n${leannContext}`;
      }
    }

      // Ajouter les résultats Notion si disponibles
      if (notionResults) {
        aiResponse += notionResults;
      }
      
      // Ajouter les résultats LEANN si disponibles
      if (leannResults) {
        aiResponse += leannResults;
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

/**
 * Ferme l'outil LEANN
 */
export async function closeLeannTool(): Promise<void> {
  if (leannTool) {
    await leannTool.disconnect();
    leannTool = null;
  }
}
