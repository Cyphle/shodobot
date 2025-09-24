# Tests Unitaires - ShodoBot Frontend

## Vue d'ensemble

Ce projet utilise **Vitest** et **React Testing Library** pour les tests unitaires et d'intégration.

## Structure des tests

```
src/
├── __tests__/                    # Tests d'intégration
│   └── App.test.tsx             # Tests de l'application complète
├── components/
│   └── __tests__/               # Tests des composants
│       ├── ChatMessage.test.tsx # Tests du composant ChatMessage
│       ├── ChatInput.test.tsx   # Tests du composant ChatInput
│       └── ChatContainer.test.tsx # Tests du composant ChatContainer
└── hooks/
    └── __tests__/               # Tests des hooks
        └── useChat.test.tsx     # Tests du hook useChat
```

## Commandes de test

```bash
# Exécuter tous les tests
npm run test:run

# Exécuter les tests en mode watch
npm run test

# Exécuter les tests avec interface graphique
npm run test:ui
```

## Couverture des tests

### Composants testés

1. **ChatMessage** (6 tests)
   - Rendu des messages utilisateur et assistant
   - Application des styles corrects
   - Gestion des timestamps
   - Gestion du contenu vide

2. **ChatInput** (13 tests)
   - Rendu de l'input et du bouton
   - Gestion des événements clavier (Enter, Shift+Enter)
   - Validation des messages vides
   - État désactivé pendant le chargement
   - Nettoyage de l'input après envoi

3. **ChatContainer** (12 tests)
   - Rendu de l'en-tête et des messages
   - Gestion des états de chargement et d'erreur
   - Désactivation de l'input pendant le chargement
   - Styles CSS corrects

### Hooks testés

1. **useChat** (9 tests)
   - Initialisation de l'état
   - Ajout de messages utilisateur
   - Validation des messages vides
   - Génération d'IDs uniques
   - Gestion des timestamps
   - Nettoyage des messages

### Tests d'intégration

1. **App** (10 tests)
   - Rendu de l'interface complète
   - Envoi de messages
   - Gestion de l'historique
   - États de chargement
   - Navigation au clavier

## Bonnes pratiques utilisées

- **Isolation des tests** : Chaque test est indépendant
- **Mocks appropriés** : Utilisation de mocks pour les composants enfants
- **Tests d'accessibilité** : Vérification des rôles et attributs ARIA
- **Tests de régression** : Couverture des cas d'usage principaux
- **Tests d'intégration** : Vérification du fonctionnement end-to-end

## Configuration

- **Vitest** : Framework de test rapide
- **React Testing Library** : Utilitaires de test pour React
- **jsdom** : Environnement DOM simulé
- **@testing-library/user-event** : Simulation des interactions utilisateur

## Exécution des tests

Les tests s'exécutent automatiquement lors des commits (si configuré) et peuvent être lancés manuellement avec les commandes npm ci-dessus.

**Total : 50 tests passent avec succès** ✅
