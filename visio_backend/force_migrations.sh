#!/usr/bin/env bash
# Script pour forcer les migrations
set -o errexit

echo "=========================================="
echo "🚀 DÉBUT DU BUILD VISIO BACKEND"
echo "=========================================="

echo ""
echo "📦 Installation des dépendances..."
pip install -r requirements.txt

echo ""
echo "=========================================="
echo "🔄 APPLICATION DES MIGRATIONS"
echo "=========================================="
python manage.py migrate --no-input --verbosity 2

echo ""
echo "📁 Création du dossier staticfiles..."
mkdir -p staticfiles

echo ""
echo "🗂️  Collecte des fichiers statiques..."
python manage.py collectstatic --no-input --verbosity 2

echo ""
echo "=========================================="
echo "✅ BUILD TERMINÉ AVEC SUCCÈS!"
echo "=========================================="
