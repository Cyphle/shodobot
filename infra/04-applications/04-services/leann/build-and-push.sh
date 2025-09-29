#!/bin/bash

# Script pour construire et pousser l'image Docker LEANN vers Scaleway Container Registry
# Usage: ./build-and-push.sh [tag]
# Exemple: ./build-and-push.sh v1.0.0

set -e

# Configuration
REGISTRY_ENDPOINT="rg.fr-par.scw.cloud"
NAMESPACE="shodobot"
IMAGE_NAME="leann-api"
DEFAULT_TAG="latest"

# Récupérer le tag depuis l'argument ou utiliser 'latest'
TAG=${1:-$DEFAULT_TAG}

# Construire le nom complet de l'image
FULL_IMAGE_NAME="${REGISTRY_ENDPOINT}/${NAMESPACE}/${IMAGE_NAME}:${TAG}"

echo "🚀 Construction et push de l'image LEANN..."
echo "📦 Image: ${FULL_IMAGE_NAME}"

# Vérifier que Docker est disponible
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé ou n'est pas dans le PATH"
    exit 1
fi

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "Dockerfile" ]; then
    echo "❌ Dockerfile non trouvé. Assurez-vous d'être dans le répertoire infra/04-applications/04-services/leann/"
    exit 1
fi

# Construire l'image Docker
echo "🔨 Construction de l'image Docker..."
docker build -t "${FULL_IMAGE_NAME}" .

# Vérifier que la construction a réussi
if [ $? -eq 0 ]; then
    echo "✅ Image construite avec succès: ${FULL_IMAGE_NAME}"
else
    echo "❌ Échec de la construction de l'image"
    exit 1
fi

# Tagger aussi comme 'latest' si ce n'est pas déjà le cas
if [ "$TAG" != "latest" ]; then
    LATEST_IMAGE_NAME="${REGISTRY_ENDPOINT}/${NAMESPACE}/${IMAGE_NAME}:latest"
    docker tag "${FULL_IMAGE_NAME}" "${LATEST_IMAGE_NAME}"
    echo "🏷️  Image taggée comme latest: ${LATEST_IMAGE_NAME}"
fi

# Pousser l'image vers la registry
echo "📤 Push de l'image vers Scaleway Container Registry..."

# Vérifier si l'utilisateur est connecté à la registry
if ! docker info | grep -q "Registry: ${REGISTRY_ENDPOINT}"; then
    echo "⚠️  Vous devez être connecté à la registry Scaleway:"
    echo "   docker login ${REGISTRY_ENDPOINT}"
    echo "   Utilisez vos credentials Scaleway (Access Key / Secret Key)"
    echo ""
    read -p "Voulez-vous continuer quand même ? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Push annulé"
        exit 1
    fi
fi

# Push de l'image
docker push "${FULL_IMAGE_NAME}"

if [ $? -eq 0 ]; then
    echo "✅ Image poussée avec succès: ${FULL_IMAGE_NAME}"
else
    echo "❌ Échec du push de l'image"
    exit 1
fi

# Push de l'image 'latest' si nécessaire
if [ "$TAG" != "latest" ]; then
    docker push "${LATEST_IMAGE_NAME}"
    if [ $? -eq 0 ]; then
        echo "✅ Image latest poussée avec succès: ${LATEST_IMAGE_NAME}"
    else
        echo "❌ Échec du push de l'image latest"
        exit 1
    fi
fi

echo ""
echo "🎉 Déploiement terminé avec succès !"
echo "📋 Résumé:"
echo "   - Image: ${FULL_IMAGE_NAME}"
if [ "$TAG" != "latest" ]; then
    echo "   - Latest: ${LATEST_IMAGE_NAME}"
fi
echo ""
echo "🚀 Pour déployer sur Kubernetes:"
echo "   kubectl apply -k infra/04-applications/04-services/leann/"
echo ""
echo "🔍 Pour vérifier le déploiement:"
echo "   kubectl get pods -n shodobot -l app=leann-api"
echo "   kubectl logs -n shodobot -l app=leann-api"
