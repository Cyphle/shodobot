# ShodoBot

Agent IA sous forme de chatbot pour Shodo. Application de démonstration construite avec React et Fastify.

## 🚀 Démarrage rapide

### Installation
```bash
# Backend
cd back && npm install

# Frontend
cd front && npm install
```

### Développement (Frontend + Backend)
```bash
# Option 1: Script automatique
./start-dev.sh

# Option 2: Manuel (2 terminaux)
# Terminal 1 - Backend
cd back && npm run dev

# Terminal 2 - Frontend  
cd front && npm run dev
```

## 🛠️ Technologies

### Frontend
- **React 18** - Bibliothèque UI
- **TypeScript** - Langage de programmation
- **Vite** - Build tool
- **Ant Design** - Composants UI
- **TanStack Query** - Gestion d'état serveur
- **Vitest** - Tests unitaires

### Backend
- **Node.js** - Runtime JavaScript
- **TypeScript** - Langage de programmation
- **Fastify** - Framework web rapide
- **Jest** - Framework de tests

## 📁 Architecture

```
shodobot/
├── front/          # Frontend React
│   └── nginx.conf  # Configuration Nginx pour production
├── back/           # Backend Fastify
└── start-dev.sh    # Script de démarrage
```

## 🌐 Endpoints

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
  - `POST /api/message` - Envoi de messages
  - `GET /health` - État du serveur

## 🔧 Configuration

### Développement local
- Le frontend utilise un proxy Vite (`/api/*` → `http://localhost:3001`)
- Pas de CORS nécessaire en local grâce au proxy

### Production
- Nginx fera le proxy vers le service backend (port 8080)
- Configuration Nginx disponible dans `front/nginx.conf`
- Compatible avec Docker (port non-privilégié)

## 🧪 Tests

```bash
# Tests backend
cd back && npm test

# Tests frontend
cd front && npm test
```
