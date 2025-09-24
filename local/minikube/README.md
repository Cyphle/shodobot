# Déploiement ShodoBot sur Minikube

## Prérequis

- Minikube installé et démarré
- Docker installé
- kubectl configuré

## Déploiement

### 1. Démarrer Minikube
```bash
minikube start
```

### 2. Construire les images Docker
```bash
# Depuis la racine du projet
cd back
docker build -t shodobot-backend:latest .

cd ../front
docker build -t shodobot-frontend:latest .
```

### 3. Charger les images dans Minikube
```bash
minikube image load shodobot-backend:latest
minikube image load shodobot-frontend:latest
```

### 4. Déployer les ressources Kubernetes
```bash
cd local/minikube
kubectl apply -k .
```

### 5. Vérifier le déploiement
```bash
kubectl get pods
kubectl get services
kubectl get ingress
```

### 6. Accéder à l'application
```bash
# Obtenir l'URL du service
minikube service shodobot-frontend-service --url
```

## Commandes utiles

```bash
# Voir les logs
kubectl logs -l app=shodobot-backend
kubectl logs -l app=shodobot-frontend

# Redémarrer les déploiements
kubectl rollout restart deployment shodobot-backend
kubectl rollout restart deployment shodobot-frontend

# Supprimer le déploiement
kubectl delete -k .
```

## Architecture

- **Backend**: Port 3001, utilisateur non-root (1001)
- **Frontend**: Port 8080, utilisateur non-root (1001)
- **Ingress**: Route `/api/*` vers backend, `/` vers frontend
