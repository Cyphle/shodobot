#!/bin/bash

# Script de démarrage pour LEANN
# Usage: ./start-leann.sh [build|search|ask|interactive]

set -e

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
INDEX_NAME="shodobot-docs"
DOCS_PATH="/app/documents"
CONFIG_PATH="/app/.leann/config.yaml"

echo -e "${BLUE}🚀 ShodoBot LEANN Service${NC}"
echo "================================"

# Fonction pour afficher les logs
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Vérifier que LEANN est installé
if ! command -v leann &> /dev/null; then
    log "Installation de LEANN..."
    pip install leann
fi

# Vérifier que les documents existent
if [ ! -d "$DOCS_PATH" ]; then
    error "Le dossier de documents n'existe pas: $DOCS_PATH"
    exit 1
fi

# Compter les documents
DOC_COUNT=$(find "$DOCS_PATH" -type f \( -name "*.pdf" -o -name "*.txt" -o -name "*.md" -o -name "*.docx" -o -name "*.pptx" -o -name "*.py" -o -name "*.js" -o -name "*.ts" -o -name "*.java" -o -name "*.cpp" -o -name "*.c" -o -name "*.cs" -o -name "*.go" -o -name "*.rs" -o -name "*.php" -o -name "*.rb" -o -name "*.swift" -o -name "*.kt" -o -name "*.scala" -o -name "*.r" -o -name "*.m" -o -name "*.sql" -o -name "*.html" -o -name "*.css" -o -name "*.xml" -o -name "*.json" -o -name "*.yaml" -o -name "*.yml" -o -name "*.toml" -o -name "*.ini" -o -name "*.cfg" -o -name "*.conf" \) | wc -l)

if [ "$DOC_COUNT" -eq 0 ]; then
    warn "Aucun document trouvé dans $DOCS_PATH"
    warn "Ajoutez des documents pour commencer l'indexation"
    exit 1
fi

log "Documents trouvés: $DOC_COUNT"

# Fonction pour construire l'index
build_index() {
    log "Construction de l'index LEANN..."
    log "Documents: $DOCS_PATH"
    log "Index: $INDEX_NAME"
    
    leann build "$INDEX_NAME" \
        --docs "$DOCS_PATH" \
        --backend hnsw \
        --embedding-model facebook/contriever \
        --graph-degree 32 \
        --complexity 64 \
        --compact \
        --recompute
    
    log "Index construit avec succès!"
}

# Fonction pour lister les index
list_indexes() {
    log "Liste des index LEANN:"
    leann list
}

# Fonction pour rechercher
search_docs() {
    local query="$1"
    if [ -z "$query" ]; then
        read -p "Entrez votre requête de recherche: " query
    fi
    
    log "Recherche: $query"
    leann search "$INDEX_NAME" "$query" --top-k 10
}

# Fonction pour poser une question
ask_question() {
    local question="$1"
    if [ -z "$question" ]; then
        read -p "Entrez votre question: " question
    fi
    
    log "Question: $question"
    leann ask "$INDEX_NAME" "$question" --llm ollama --model qwen3:8b --top-k 20
}

# Fonction pour le mode interactif
interactive_mode() {
    log "Mode interactif activé"
    log "Tapez 'exit' pour quitter"
    log "Commandes disponibles:"
    log "  search <query>  - Rechercher dans les documents"
    log "  ask <question>  - Poser une question"
    log "  list           - Lister les index"
    log "  rebuild        - Reconstruire l'index"
    log "  exit           - Quitter"
    echo
    
    while true; do
        read -p "leann> " cmd args
        
        case $cmd in
            search)
                search_docs "$args"
                ;;
            ask)
                ask_question "$args"
                ;;
            list)
                list_indexes
                ;;
            rebuild)
                build_index
                ;;
            exit|quit|q)
                log "Au revoir!"
                break
                ;;
            help|?)
                log "Commandes: search, ask, list, rebuild, exit"
                ;;
            "")
                continue
                ;;
            *)
                error "Commande inconnue: $cmd"
                ;;
        esac
        echo
    done
}

# Fonction principale
main() {
    local action="${1:-interactive}"
    
    case $action in
        build)
            build_index
            ;;
        search)
            search_docs "$2"
            ;;
        ask)
            ask_question "$2"
            ;;
        list)
            list_indexes
            ;;
        interactive)
            interactive_mode
            ;;
        *)
            echo "Usage: $0 [build|search|ask|list|interactive]"
            echo
            echo "Commandes:"
            echo "  build                    - Construire l'index"
            echo "  search <query>           - Rechercher dans les documents"
            echo "  ask <question>           - Poser une question"
            echo "  list                     - Lister les index"
            echo "  interactive              - Mode interactif (défaut)"
            exit 1
            ;;
    esac
}

# Exécuter la fonction principale
main "$@"
