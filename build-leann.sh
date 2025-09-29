#!/bin/bash

# Script wrapper pour construire et pousser l'image LEANN
# Usage: ./build-leann.sh [tag]
# Exemple: ./build-leann.sh v1.0.0

set -e

# Aller dans le répertoire LEANN
cd "$(dirname "$0")/infra/04-applications/04-services/leann"

# Exécuter le script de build
./build-and-push.sh "$@"
