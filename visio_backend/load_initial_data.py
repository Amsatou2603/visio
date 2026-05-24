#!/usr/bin/env python
"""
Script pour charger les données initiales en production
- Crée le superuser
- Crée les utilisateurs vendeurs
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

def create_sellers():
    """Crée les utilisateurs vendeurs nécessaires pour les fixtures"""
    sellers = [
        {
            'id': 5,
            'email': 'vendeur@visio.com',
            'username': 'vendeur',
            'password': 'Vendeur123!',
            'first_name': 'Boutique',
            'last_name': 'Visio',
            'role': 'seller'
        },
    ]
    
    for seller_data in sellers:
        seller_id = seller_data.pop('id')
        email = seller_data['email']
        
        # Vérifier si l'utilisateur existe déjà
        if User.objects.filter(email=email).exists():
            print(f"ℹ️  Vendeur {email} existe déjà")
            continue
        
        # Vérifier si un utilisateur avec cet ID existe
        if User.objects.filter(id=seller_id).exists():
            print(f"ℹ️  Un utilisateur avec l'ID {seller_id} existe déjà")
            continue
        
        try:
            # Créer l'utilisateur avec un ID spécifique
            user = User(**seller_data)
            user.id = seller_id
            user.set_password(seller_data['password'])
            user.save()
            print(f"✅ Vendeur créé: {email} (ID: {seller_id})")
        except Exception as e:
            print(f"❌ Erreur création vendeur {email}: {e}")

def load_fixtures():
    """Charge les fixtures si la base est vide"""
    from products.models import Product, Category, Brand
    
    # Vérifier si des produits existent déjà
    if Product.objects.exists():
        print("ℹ️  Des produits existent déjà, fixtures produits ignorées")
        # Charger quand même les catégories et marques si elles n'existent pas
        if not Category.objects.exists():
            try:
                print("   Chargement: products/fixtures/initial_data.json...")
                call_command('loaddata', 'products/fixtures/initial_data.json', verbosity=0)
                print("   ✅ Catégories et marques chargées")
            except Exception as e:
                print(f"   ⚠️  Erreur: {e}")
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
                # Afficher plus de détails sur l'erreur
                import traceback
                traceback.print_exc()
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
    
    # Créer les vendeurs
    print("\n👥 Création des vendeurs...")
    create_sellers()
    
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
