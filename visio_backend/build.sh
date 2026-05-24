#!/usr/bin/env bash
set -o errexit

echo "📦 Installation des dépendances..."
pip install -r requirements.txt

echo "📁 Création du dossier staticfiles..."
mkdir -p staticfiles

echo "🗂️  Collecte des fichiers statiques..."
python manage.py collectstatic --no-input

echo "🔄 Application des migrations..."
python manage.py migrate --no-input

echo "✅ Build terminé avec succès!"