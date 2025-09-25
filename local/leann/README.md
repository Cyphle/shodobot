# LEANN - Base Vectorielle pour ShodoBot

Ce dossier contient l'infrastructure pour intégrer [LEANN](https://github.com/yichuan-w/LEANN) comme base vectorielle dans ShodoBot.

## 📁 Structure

```
local/leann/
├── docker-compose.yaml    # Configuration Docker Compose
├── leann-config.yaml      # Configuration LEANN
├── start-leann.sh         # Script de démarrage
└── README.md              # Ce fichier
```

## 🚀 Démarrage rapide

### 1. Ajouter des documents
Placez vos documents dans le dossier `rag/` à la racine du projet :
```bash
# Exemples de documents supportés
rag/
├── documents.pdf
├── notes.md
├── code.py
├── presentation.pptx
└── data.json
```

### 2. Démarrer les services
```bash
cd local/leann
docker-compose up -d
```

### 3. Utiliser LEANN
```bash
# Mode interactif
./start-leann.sh interactive

# Rechercher des documents
./start-leann.sh search "machine learning"

# Poser une question
./start-leann.sh ask "Comment fonctionne l'authentification ?"
```

## 🔧 Configuration

### Services Docker
- **leann** : Service principal LEANN (port 8000)
- **ollama** : Modèles LLM locaux (port 11434)
- **redis** : Cache des embeddings (port 6379)

### Volumes
- `../rag` : Documents à indexer (lecture seule)
- `leann_indexes` : Index vectoriels persistants
- `leann_config` : Configuration LEANN
- `ollama_data` : Modèles LLM téléchargés
- `redis_data` : Cache Redis

## 📊 Formats supportés

### Documents
- PDF, TXT, MD, DOCX, PPTX

### Code
- Python, JavaScript, TypeScript, Java, C++, C#, Go, Rust, PHP, Ruby, Swift, Kotlin, Scala, R, SQL

### Données
- HTML, CSS, XML, JSON, YAML, TOML, INI, CFG

## 🎯 Fonctionnalités

- **Indexation automatique** : Détection automatique des formats
- **Recherche sémantique** : Recherche par similarité vectorielle
- **Q&A** : Questions-réponses sur les documents
- **Cache intelligent** : Optimisation des performances
- **Mode interactif** : Interface en ligne de commande

## 🔍 Commandes disponibles

```bash
# Construire l'index
./start-leann.sh build

# Rechercher
./start-leann.sh search "votre requête"

# Poser une question
./start-leann.sh ask "votre question"

# Lister les index
./start-leann.sh list

# Mode interactif
./start-leann.sh interactive
```

## 📈 Avantages de LEANN

- **97% d'économie de stockage** par rapport aux bases vectorielles traditionnelles
- **Recherche rapide** avec recomputation sélective
- **100% privé** - tout fonctionne localement
- **Support multi-format** - documents et code
- **Intégration facile** avec les LLM locaux

## 🛠️ Développement

Pour intégrer LEANN dans ShodoBot :

1. **API REST** : LEANN expose une API sur le port 8000
2. **SDK Python** : Utiliser le client Python de LEANN
3. **Cache Redis** : Optimiser les performances avec Redis
4. **Ollama** : Modèles LLM locaux pour les réponses

## 📚 Documentation

- [LEANN GitHub](https://github.com/yichuan-w/LEANN)
- [Documentation officielle](https://github.com/yichuan-w/LEANN?tab=readme-ov-file)
- [API Reference](https://github.com/yichuan-w/LEANN#-detailed-features-)
