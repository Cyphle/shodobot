# ShodoBot Backend

Backend API pour ShodoBot, construit avec Node.js, TypeScript et Fastify.

## 🚀 Démarrage rapide

### Installation
```bash
npm install
```

### Développement
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Tests
```bash
npm test
npm run test:watch
npm run test:coverage
```

## 📡 Endpoints

### POST /api/message
Endpoint principal pour recevoir les messages du frontend.

**Request:**
```json
{
  "message": "Hello, how are you?"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ok I received your message",
  "data": {
    "receivedMessage": "Hello, how are you?",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

### GET /health
Vérification de l'état du serveur.

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🛠️ Technologies

- **Node.js** - Runtime JavaScript
- **TypeScript** - Langage de programmation
- **Fastify** - Framework web rapide et efficace
- **Jest** - Framework de tests
- **@fastify/cors** - Gestion des requêtes cross-origin
- **@fastify/helmet** - Sécurité HTTP
- **@fastify/rate-limit** - Limitation du taux de requêtes

## 📁 Structure

```
src/
├── types/          # Types TypeScript
├── app.ts          # Configuration de l'application Fastify (plugin)
├── server.ts       # Point d'entrée du serveur
└── *.test.ts       # Tests unitaires et d'intégration
```
