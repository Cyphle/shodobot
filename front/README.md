# ShodoBot Frontend

Interface utilisateur pour l'agent IA ShodoBot, construite avec React, Vite, TypeScript et TanStack Query.

## Technologies utilisées

- **React 18** - Bibliothèque UI
- **Vite** - Outil de build rapide
- **TypeScript** - Typage statique
- **TanStack Query** - Gestion d'état serveur
- **Tailwind CSS** - Framework CSS utilitaire

## Structure du projet

```
src/
├── components/          # Composants React
│   ├── ChatContainer.tsx    # Conteneur principal du chat
│   ├── ChatMessage.tsx      # Composant pour afficher un message
│   └── ChatInput.tsx        # Composant d'entrée de message
├── hooks/               # Hooks personnalisés
│   └── useChat.ts           # Hook pour la gestion du chat
├── types/               # Définitions TypeScript
│   └── chat.ts              # Types pour le chat
├── App.tsx              # Composant principal
├── main.tsx             # Point d'entrée de l'application
└── index.css            # Styles globaux avec Tailwind
```

## Installation et développement

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Build pour la production
npm run build

# Prévisualiser le build de production
npm run preview
```

## Fonctionnalités actuelles

- Interface de chat moderne et responsive
- Gestion d'état avec hooks personnalisés
- Simulation de réponses (en attente de l'intégration backend)
- Design avec Tailwind CSS
- TypeScript pour la sécurité des types

## Prochaines étapes

- Intégration avec l'API backend
- Authentification utilisateur
- Persistance des conversations
- Fonctionnalités avancées du chatbot