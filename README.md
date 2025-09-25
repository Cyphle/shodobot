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
├── front/              # Frontend React
│   └── nginx.conf      # Configuration Nginx pour production
├── back/               # Backend Fastify
│   ├── src/
│   │   ├── agent/      # Module agent IA
│   │   │   ├── core/   # Logique de l'agent
│   │   │   │   └── tools/  # Outils (Notion, LEANN)
│   │   │   ├── api/    # Routes API
│   │   │   └── middleware/  # Middleware de sécurité
│   │   └── config/     # Configuration
│   └── .env            # Variables d'environnement
├── rag/                # Documents pour LEANN
├── local/              # Infrastructure locale
│   └── leann/          # Configuration LEANN
│       ├── docker-compose.yaml
│       ├── leann-config.yaml
│       └── start-leann.sh
└── README.md
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

## 📝 Configuration des outils de recherche

ShodoBot peut rechercher dans vos pages Notion personnelles et dans vos documents locaux via LEANN. Voici comment configurer les intégrations :

## 🔍 Configuration Notion

ShodoBot peut rechercher dans vos pages Notion personnelles. Voici comment configurer l'intégration :

### 1. Créer une intégration Notion

1. **Allez sur [Notion Integrations](https://www.notion.so/my-integrations)**
2. **Cliquez sur "New integration"**
3. **Configurez l'intégration :**
   - **Name** : `ShodoBot` (ou le nom de votre choix)
   - **Workspace** : Sélectionnez votre workspace
   - **Type** : Internal
4. **Cliquez sur "Submit"**
5. **Copiez la clé API** (commence par `secret_`)

### 2. Partager vos pages avec l'intégration

**Option A : Partager toutes les pages**
1. Dans votre intégration, cliquez sur "..." → "Manage"
2. Dans "Connected pages", cliquez sur "Add pages"
3. Sélectionnez "All pages" ou ajoutez manuellement vos pages

**Option B : Partager page par page**
1. Ouvrez chaque page de votre workspace
2. Cliquez sur "Share" (en haut à droite)
3. Ajoutez l'intégration "ShodoBot"

### 3. Configurer ShodoBot

1. **Créez le fichier `.env` dans le dossier `back/` :**
   ```bash
   cd back
   cp .env.example .env
   ```

2. **Ajoutez votre clé API Notion :**
   ```bash
   # Dans back/.env
   GROQ_API_KEY=your_groq_api_key_here
   NOTION_API_KEY=secret_your_notion_api_key_here
   NOTION_DATABASE_ID=your_database_id_here  # Optionnel
   ```

3. **Redémarrez le serveur :**
   ```bash
   cd back && npm run dev
   ```

### 4. Tester l'intégration

Une fois configuré, testez dans le chat :
- `"recherche notion wiki"`
- `"liste les pages Notion"`
- `"trouve les documents sur mon projet"`

## 📄 Configuration LEANN (Base de données vectorielle)

ShodoBot peut rechercher dans vos documents locaux (PDF, Markdown, code, etc.) via LEANN. Voici comment configurer :

### 1. Démarrer LEANN

```bash
cd local/leann
./start-leann.sh up
```

### 2. Ajouter vos documents

Placez vos documents dans le dossier `rag/` :

```bash
# Exemple de structure
rag/
├── documents/
│   ├── mon_document.pdf
│   ├── notes.md
│   └── code/
│       └── mon_projet.py
```

### 3. Indexer les documents

```bash
./start-leann.sh build my_docs_index
```

### 4. Tester la recherche

```bash
# Recherche interactive
./start-leann.sh interactive my_docs_index

# Recherche simple
./start-leann.sh search my_docs_index "machine learning"

# Poser une question
./start-leann.sh ask my_docs_index "Qu'est-ce que ce document explique ?"
```

### 5. Utiliser dans le chat

Une fois LEANN démarré et indexé, testez dans le chat :

- "recherche document local"
- "trouve les fichiers sur python"
- "cherche dans mes documents"

### 🔍 Formats supportés

**Notion :**
- **Pages** : Titre, contenu, propriétés
- **Bases de données** : Entrées et propriétés
- **Blocs** : Titres, listes, code, citations
- **Contenu riche** : Texte formaté, liens, images

**LEANN (Documents locaux) :**
- **PDF** : Documents, rapports, articles
- **Markdown** : Notes, documentation
- **Code** : Python, TypeScript, JavaScript, etc.
- **Office** : Word, PowerPoint, Excel
- **Texte** : TXT, RTF

### ⚠️ Permissions requises

L'intégration doit avoir accès aux pages pour que la recherche fonctionne. Si vous voyez "Aucun résultat trouvé", vérifiez que :
1. La clé API est correcte
2. L'intégration a accès aux pages
3. Les pages contiennent du contenu textuel

## 🗄️ Base Vectorielle LEANN

ShodoBot peut également rechercher dans vos documents locaux grâce à [LEANN](https://github.com/yichuan-w/LEANN), une base vectorielle ultra-efficace.

### Configuration LEANN

1. **Placez vos documents dans le dossier `rag/` :**
   ```bash
   # Formats supportés
   rag/
   ├── documents.pdf
   ├── notes.md
   ├── code.py
   ├── presentation.pptx
   └── data.json
   ```

2. **Démarrez les services LEANN :**
   ```bash
   cd local/leann
   docker-compose up -d
   ```

3. **Utilisez LEANN :**
   ```bash
   # Mode interactif
   ./start-leann.sh interactive
   
   # Rechercher
   ./start-leann.sh search "machine learning"
   
   # Poser une question
   ./start-leann.sh ask "Comment fonctionne l'authentification ?"
   ```

### Avantages de LEANN

- **97% d'économie de stockage** par rapport aux bases vectorielles traditionnelles
- **Recherche rapide** avec recomputation sélective
- **100% privé** - tout fonctionne localement
- **Support multi-format** - documents et code

Voir [local/leann/README.md](local/leann/README.md) pour plus de détails.

## 🧪 Tests

```bash
# Tests backend
cd back && npm test

# Tests frontend
cd front && npm test
```
