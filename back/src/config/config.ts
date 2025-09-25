import convict from 'convict';
import dotenv from 'dotenv';

// Charger les variables d'environnement depuis .env
dotenv.config();

// Schéma de configuration avec convict
const configSchema = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  server: {
    port: {
      doc: 'The port to bind.',
      format: 'port',
      default: 3001,
      env: 'PORT'
    },
    host: {
      doc: 'The host to bind.',
      format: String,
      default: '0.0.0.0',
      env: 'HOST'
    }
  },
  groq: {
    apiKey: {
      doc: 'Groq API key for AI agent',
      format: String,
      default: '',
      env: 'GROQ_API_KEY',
      sensitive: true
    },
    model: {
      doc: 'Groq model to use',
      format: String,
      default: 'llama-3.1-8b-instant',
      env: 'AGENT_MODEL'
    },
    temperature: {
      doc: 'Temperature for AI responses',
      format: Number,
      default: 0.7,
      env: 'AGENT_TEMPERATURE'
    },
    maxTokens: {
      doc: 'Maximum tokens for AI responses',
      format: 'int',
      default: 1000,
      env: 'AGENT_MAX_TOKENS'
    }
  },
  agent: {
    maxHistorySize: {
      doc: 'Maximum number of message pairs in conversation history',
      format: 'int',
      default: 10,
      env: 'AGENT_MAX_HISTORY_SIZE'
    }
  },
  frontend: {
    url: {
      doc: 'Frontend URL for CORS',
      format: String,
      default: 'http://localhost:5173',
      env: 'FRONTEND_URL'
    }
  },
  notion: {
    enabled: {
      doc: 'Enable Notion integration',
      format: Boolean,
      default: true,
      env: 'NOTION_ENABLED'
    },
    apiKey: {
      doc: 'Notion API key for personal workspace',
      format: String,
      default: '',
      env: 'NOTION_API_KEY',
      sensitive: true
    },
    databaseId: {
      doc: 'Notion database ID to search in (optional)',
      format: String,
      default: '',
      env: 'NOTION_DATABASE_ID'
    }
  },
  leann: {
    enabled: {
      doc: 'Enable LEANN integration',
      format: Boolean,
      default: true,
      env: 'LEANN_ENABLED'
    },
    apiUrl: {
      doc: 'LEANN API URL',
      format: String,
      default: 'http://localhost:8000',
      env: 'LEANN_API_URL'
    },
    indexName: {
      doc: 'LEANN index name',
      format: String,
      default: 'shodobot-docs',
      env: 'LEANN_INDEX_NAME'
    },
    timeout: {
      doc: 'LEANN API timeout in milliseconds',
      format: 'int',
      default: 10000,
      env: 'LEANN_TIMEOUT'
    }
  }
});

// Validation de la configuration
configSchema.validate({ allowed: 'strict' });

// Validation des secrets (seulement en production)
if (configSchema.get('env') !== 'test' && !configSchema.get('groq.apiKey')) {
  throw new Error('GROQ_API_KEY is required. Please set it in your .env file.');
}

// Validation de la clé API Notion si l'intégration est activée
if (configSchema.get('notion.enabled') && !configSchema.get('notion.apiKey')) {
  throw new Error('NOTION_API_KEY is required when Notion integration is enabled. Please set it in your .env file.');
}

export const config = configSchema.getProperties();
