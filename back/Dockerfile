# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de configuration des dépendances
COPY package.json yarn.lock ./

# Installer toutes les dépendances (dev + prod)
RUN yarn install --frozen-lockfile

# Copier le code source
COPY tsconfig.json ./
COPY src ./src

# Compiler TypeScript
RUN yarn build

# ---- Production Stage ----
FROM node:20-alpine AS prod

WORKDIR /app

# Copier seulement les fichiers nécessaires depuis l'étape de build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Créer un utilisateur non-root pour la sécurité
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Changer la propriété des fichiers
RUN chown -R appuser:appgroup /app

# Passer à l'utilisateur non-root
USER appuser

# Exposer le port
EXPOSE 3001

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3001

# Commande de démarrage
CMD ["node", "dist/app.js"]