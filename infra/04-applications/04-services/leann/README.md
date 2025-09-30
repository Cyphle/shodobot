# LEANN Service - ShodoBot

Ce dossier contient les ressources Kubernetes pour déployer le service LEANN (RAG - Retrieval-Augmented Generation) sur Scaleway Kapsule.

## Architecture

LEANN est composé de deux services principaux :

1. **Qdrant** : Base de données vectorielle pour stocker les embeddings des documents
2. **LEANN API** : Service FastAPI qui traite les documents et expose les endpoints de recherche

## Fichiers

### Configuration
- `01-configmap.yaml` : Configuration des variables d'environnement
- `02-pvc-qdrant.yaml` : Stockage persistant pour les données Qdrant (10Gi)
- `03-pvc-documents.yaml` : Stockage persistant pour les documents RAG (5Gi)

### Qdrant (Base de données vectorielle)
- `04-qdrant-deployment.yaml` : Déploiement du service Qdrant
- `05-qdrant-service.yaml` : Service ClusterIP pour Qdrant

### LEANN API
- `06-leann-deployment.yaml` : Déploiement du service LEANN API
- `07-leann-service.yaml` : Service ClusterIP pour LEANN API

### Docker
- `Dockerfile` : Image Docker multi-stage pour LEANN API
- `requirements.txt` : Dépendances Python
- `leann_api.py` : Code source de l'API FastAPI

## Déploiement

### 1. Construire l'image Docker

#### Option A : Script automatique (recommandé)
```bash
# Depuis la racine du projet
./build-leann.sh [tag]
# Exemple: ./build-leann.sh v1.0.0
```

#### Option B : Manuel
```bash
# Depuis le dossier infra/04-applications/04-services/leann
./build-and-push.sh [tag]
# Ou manuellement:
docker build -t rg.fr-par.scw.cloud/shodobot/leann-api:latest .
docker push rg.fr-par.scw.cloud/shodobot/leann-api:latest
```

### 2. Déployer sur Kubernetes

```bash
# Appliquer toutes les ressources dans l'ordre
kubectl apply -f 01-configmap.yaml
kubectl apply -f 02-pvc-qdrant.yaml
kubectl apply -f 03-pvc-documents.yaml
kubectl apply -f 04-qdrant-deployment.yaml
kubectl apply -f 05-qdrant-service.yaml
kubectl apply -f 06-leann-deployment.yaml
kubectl apply -f 07-leann-service.yaml
```

### 3. Vérifier le déploiement

```bash
# Vérifier les pods
kubectl get pods -n shodobot -l app=qdrant
kubectl get pods -n shodobot -l app=leann-api

# Vérifier les services
kubectl get svc -n shodobot

# Vérifier les logs
kubectl logs -n shodobot -l app=leann-api
```

## Configuration

### Variables d'environnement

- `QDRANT_HOST` : Hostname du service Qdrant (qdrant)
- `QDRANT_PORT` : Port du service Qdrant (6333)
- `LEANN_DATA_DIR` : Répertoire des données LEANN (/app/data)
- `DOCUMENTS_DIR` : Répertoire des documents à indexer (/app/documents)
- `COLLECTION_NAME` : Nom de la collection Qdrant (shodobot-docs)

### Stockage

- **Qdrant** : 10Gi de stockage persistant (ReadWriteOnce)
- **Documents** : 5Gi de stockage persistant (ReadWriteMany) pour partager les documents

## Endpoints API

- `GET /health` : Health check
- `POST /search` : Recherche dans les documents
- `POST /ask` : Question-Réponse avec contexte pour le LLM

## Intégration avec ShodoBot

Le service LEANN est utilisé par le backend ShodoBot pour :
1. Indexer automatiquement les documents du dossier RAG
2. Fournir des réponses contextuelles basées sur les documents
3. Alimenter le LLM avec des informations pertinentes

## Monitoring

- Health checks configurés pour les deux services
- Probes de liveness, readiness et startup
- Ressources limitées pour éviter la surconsommation
