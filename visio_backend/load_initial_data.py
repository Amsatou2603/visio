#!/usr/bin/env python
"""
Script pour charger les données initiales en production
- Crée le superuser
- Charge les fixtures (catégories, marques, produits)
- S'exécute automatiquement au démarrage
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.core.management import call_command
from users.models import User

def create_superuser():
    """Crée un superuser si aucun n'existe"""
    admin_email = 'admin@visio.com'
    
    if User.objects.filter(is_superuser=True).exists():
        print("ℹ️  Un superuser existe déjà")
        return
    
    if User.objects.filter(email=admin_email).exists():
        print(f"ℹ️  L'utilisateur {admin_email} existe déjà")
        return
    
    try:
        User.objects.create_superuser(
            email=admin_email,
            username='admin',
            password='Admin123!Visio',
            first_name='Admin',
            last_name='Visio',
            role='admin'
        )
        print(f"✅ Superuser créé: {admin_email}")
        print(f"   Password: Admin123!Visio")
        print(f"   ⚠️  CHANGEZ CE MOT DE PASSE IMMÉDIATEMENT!")
    except Exception as e:
        print(f"❌ Erreur création superuser: {e}")

def load_fixtures():
    """Charge les fixtures si la base est vide"""
    from products.models import Product, Category, Brand
    
    # Vérifier si des données existent déjà
    if Product.objects.exists() or Category.objects.exists():
        print("ℹ️  Des données existent déjà, fixtures ignorées")
        return
    
    print("\n📦 Chargement des données initiales...")
    
    # Charger les fixtures
    fixtures = [
        'products/fixtures/initial_data.json',
        'products/fixtures/products.json',
    ]
    
    for fixture in fixtures:
        fixture_path = os.path.join(os.path.dirname(__file__), fixture)
        if os.path.exists(fixture_path):
            try:
                print(f"   Chargement: {fixture}...")
                call_command('loaddata', fixture, verbosity=0)
                print(f"   ✅ {fixture} chargé")
            except Exception as e:
                print(f"   ⚠️  Erreur avec {fixture}: {e}")
        else:
            print(f"   ⚠️  Fixture introuvable: {fixture}")
    
    # Afficher les statistiques
    print(f"\n📊 Données chargées:")
    print(f"   - Catégories: {Category.objects.count()}")
    print(f"   - Marques: {Brand.objects.count()}")
    print(f"   - Produits: {Product.objects.count()}")

def main():
    print("="*70)
    print("🚀 INITIALISATION DE LA BASE DE DONNÉES")
    print("="*70)
    
    # Créer le superuser
    print("\n👤 Création du superuser...")
    create_superuser()
    
    # Charger les fixtures
    print("\n📦 Chargement des fixtures...")
    load_fixtures()
    
    print("\n" + "="*70)
    print("✅ INITIALISATION TERMINÉE")
    print("="*70)
    print("\n💡 Prochaines étapes:")
    print("   1. Connectez-vous à /admin/ avec admin@visio.com")
    print("   2. Changez le mot de passe immédiatement")
    print("   3. Vérifiez que les produits sont visibles sur /api/products/")
    print("="*70 + "\n")

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f"\n❌ ERREUR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
