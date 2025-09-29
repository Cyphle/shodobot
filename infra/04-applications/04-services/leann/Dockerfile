# ---- Build Stage ----
FROM python:3.11-slim AS builder

WORKDIR /app

# Installer les dépendances système nécessaires
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copier le fichier requirements
COPY requirements.txt .

# Installer les dépendances Python
RUN pip install --no-cache-dir --user -r requirements.txt

# ---- Production Stage ----
FROM python:3.11-slim AS prod

WORKDIR /app

# Installer curl pour les health checks
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copier les dépendances Python depuis l'étape de build
COPY --from=builder /root/.local /root/.local

# Copier le code source
COPY leann_api.py .

# Créer un utilisateur non-root pour la sécurité
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Créer les dossiers nécessaires
RUN mkdir -p /app/documents /app/data && \
    chown -R appuser:appgroup /app

# Passer à l'utilisateur non-root
USER appuser

# Exposer le port
EXPOSE 8000

# Variables d'environnement par défaut
ENV PYTHONUNBUFFERED=1
ENV QDRANT_HOST=qdrant
ENV QDRANT_PORT=6333
ENV LEANN_DATA_DIR=/app/data
ENV DOCUMENTS_DIR=/app/documents

# Commande de démarrage
CMD ["python", "leann_api.py"]
