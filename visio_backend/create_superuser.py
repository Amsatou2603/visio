#!/usr/bin/env python
"""
Script pour créer automatiquement un superuser en production
S'exécute au démarrage du serveur
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User

def create_superuser():
    """Crée un superuser si aucun n'existe"""
    
    # Vérifier si un superuser existe déjà
    if User.objects.filter(is_superuser=True).exists():
        print("ℹ️  Un superuser existe déjà")
        return
    
    # Vérifier si l'utilisateur admin existe
    admin_email = 'admin@visio.com'
    if User.objects.filter(email=admin_email).exists():
        print(f"ℹ️  L'utilisateur {admin_email} existe déjà")
        return
    
    # Créer le superuser
    try:
        User.objects.create_superuser(
            email=admin_email,
            username='admin',
            password='Admin123!Visio',  # CHANGEZ CE MOT DE PASSE APRÈS LA PREMIÈRE CONNEXION
            first_name='Admin',
            last_name='Visio',
            role='admin'
        )
        print(f"✅ Superuser créé avec succès!")
        print(f"   Email: {admin_email}")
        print(f"   Password: Admin123!Visio")
        print(f"   ⚠️  CHANGEZ CE MOT DE PASSE IMMÉDIATEMENT APRÈS LA PREMIÈRE CONNEXION!")
    except Exception as e:
        print(f"❌ Erreur lors de la création du superuser: {e}")

if __name__ == '__main__':
    create_superuser()
