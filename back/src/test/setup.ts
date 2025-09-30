// Configuration des tests
process.env.NODE_ENV = 'test';
process.env.GROQ_API_KEY = 'test-api-key';
process.env.AGENT_MODEL = 'llama-3.2-3b-preview';
process.env.AGENT_TEMPERATURE = '0.7';
process.env.AGENT_MAX_TOKENS = '1000';
process.env.AGENT_MAX_HISTORY_SIZE = '10';
process.env.FRONTEND_URL = 'http://localhost:5173';
