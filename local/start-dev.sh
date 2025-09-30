#!/bin/bash

# Script pour démarrer le développement frontend + backend

echo "🚀 Démarrage de ShodoBot en mode développement"
echo ""

# Fonction pour nettoyer les processus à la sortie
cleanup() {
    echo ""
    echo "🛑 Arrêt des services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Capturer Ctrl+C pour nettoyer
trap cleanup SIGINT

# Démarrer le backend
echo "📡 Démarrage du backend (port 3001)..."
cd ../back && npm run dev &
BACKEND_PID=$!

# Attendre un peu que le backend démarre
sleep 3

# Démarrer le frontend
echo "🎨 Démarrage du frontend (port 5173)..."
cd ../front && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Services démarrés !"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3001"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter les services"

# Attendre que les processus se terminent
wait
