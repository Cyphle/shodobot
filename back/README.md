# ShodoBot Backend

Backend API pour ShodoBot, un chatbot IA utilisant LangChain et Groq.

## 🚀 Fonctionnalités

- **Agent IA** : Utilise LangChain avec le modèle Groq `llama-3.2-3b-preview`
- **Historique de conversation** : Gestion en mémoire avec limite configurable
- **API REST** : Endpoint `/api/message` pour recevoir et traiter les messages
- **Sécurité** : Validation des messages, protection XSS, rate limiting
- **Tests complets** : 44 tests couvrant tous les composants

## 📋 Prérequis

- Node.js 18+
- Clé API Groq

## ⚙️ Configuration

1. **Copier le fichier de secrets** :
   ```bash
   cp .env.example .env
   ```

2. **Configurer votre clé API Groq** :
   ```bash
   # Dans le fichier .env
   GROQ_API_KEY=your_groq_api_key_here
   ```

3. **Configuration optionnelle** (valeurs par défaut) :
   ```bash
   # Variables d'environnement optionnelles
   NODE_ENV=development
   PORT=3001
   HOST=0.0.0.0
   AGENT_MODEL=llama-3.2-3b-preview
   AGENT_TEMPERATURE=0.7
   AGENT_MAX_TOKENS=1000
   AGENT_MAX_HISTORY_SIZE=10
   FRONTEND_URL=http://localhost:5173
   ```

4. **Installer les dépendances** :
   ```bash
   npm install
   ```

## 🏃‍♂️ Démarrage

### Développement
```bash
npm run dev
# Utilise ts-node pour exécuter directement les fichiers TypeScript
```

### Production
```bash
npm run build
npm start
```

## 🧪 Tests

```bash
# Tous les tests
npm test

# Tests en mode watch
npm run test:watch

# Couverture de code
npm run test:coverage
```

## 📁 Architecture

```
src/
├── agent/                    # Module agent IA
│   ├── api/                  # Routes API
│   │   └── messageRoute.ts   # Route /api/message
│   ├── middleware/           # Middleware de sécurité
│   │   └── validation.ts     # Validation des messages
│   ├── core/                 # Logique de l'agent
│   │   ├── agent.ts          # Agent IA principal
│   │   └── historyManager.ts # Gestionnaire d'historique
│   └── index.ts              # Module principal
├── config/                   # Configuration
│   └── config.ts            # Configuration avec convict
├── types/                    # Types TypeScript
│   └── chat.ts              # Types pour les messages
└── app.ts                   # Application Fastify (point d'entrée)
```

## 🔧 API Endpoints

### POST /api/message

Envoie un message à l'agent IA.

**Request** :
```json
{
  "message": "Bonjour, comment allez-vous ?"
}
```

**Response** :
```json
{
  "success": true,
  "message": "Bonjour ! Je vais bien, merci. Comment puis-je vous aider ?",
  "data": {
    "receivedMessage": "Bonjour, comment allez-vous ?",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

### GET /health

Vérification de l'état du serveur.

**Response** :
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🛡️ Sécurité

- **Validation des messages** : Vérification du type, longueur et contenu
- **Protection XSS** : Détection de contenu dangereux
- **Rate limiting** : Limitation des requêtes (100/min)
- **CORS** : Configuration pour le frontend
- **Helmet** : Headers de sécurité

## 📊 Gestion de l'historique

L'agent maintient un historique de conversation en mémoire :
- **Limite par défaut** : 10 paires de messages (20 messages total)
- **Format LangChain** : Conversion automatique pour l'IA
- **Persistance** : En mémoire uniquement (redémarrage = perte)

## 🐳 Docker

```bash
# Build
docker build -t shodobot-backend .

# Run
docker run -p 3001:3001 -e GROQ_API_KEY=your_key shodobot-backend
```

## 🚀 Déploiement Kubernetes

Voir le dossier `local/minikube/` pour les manifests Kubernetes.

## 🔍 Logs

Le serveur utilise Pino pour les logs avec formatage coloré en développement.

## 📝 Notes

- L'agent utilise le modèle `llama-3.2-3b-preview` de Groq
- L'historique est limité à 10 paires de messages pour éviter les coûts
- Les tests utilisent des mocks pour éviter les appels API réels