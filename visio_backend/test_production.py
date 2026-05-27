#!/usr/bin/env python
"""
Script de test pour simuler l'environnement de production localement
Usage: python test_production.py
"""
import os
import sys
import django

# Définir les variables d'environnement de production
os.environ.setdefault('DJANGO_ENV', 'production')
os.environ.setdefault('SECRET_KEY', 'test-secret-key-for-local-testing-only')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# Fallback local pour les tests lorsqu'aucun DATABASE_URL n'est fourni
if 'DATABASE_URL' not in os.environ:
    import os as _os
    os.environ['DATABASE_URL'] = f"sqlite:///{_os.path.join(_os.path.dirname(__file__), 'db.sqlite3')}"


def test_imports():
    """Test que tous les modules peuvent être importés"""
    print("🔍 Test des imports...")
    try:
        import core.settings
        print("✅ Settings importé avec succès")

        django.setup()

        import core.urls
        print("✅ URLs importé avec succès")

        import core.wsgi
        print("✅ WSGI importé avec succès")

        return True
    except Exception as e:
        print(f"❌ Erreur d'import: {e}")
        return False

def test_database():
    """Test la connexion à la base de données"""
    print("\n🔍 Test de la base de données...")
    try:
        django.setup()
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        print("✅ Connexion à la base de données OK")
        return True
    except Exception as e:
        print(f"❌ Erreur de base de données: {e}")
        return False

def test_apps():
    """Test que toutes les apps sont correctement configurées"""
    print("\n🔍 Test des applications Django...")
    try:
        from django.apps import apps
        installed_apps = apps.get_app_configs()
        print(f"✅ {len(installed_apps)} applications chargées:")
        for app in installed_apps:
            print(f"   - {app.name}")
        return True
    except Exception as e:
        print(f"❌ Erreur de chargement des apps: {e}")
        return False

def test_urls():
    """Test que les URLs sont correctement configurées"""
    print("\n🔍 Test des URLs...")
    try:
        from django.urls import get_resolver
        resolver = get_resolver()
        url_patterns = resolver.url_patterns
        print(f"✅ {len(url_patterns)} patterns d'URL configurés")
        return True
    except Exception as e:
        print(f"❌ Erreur de configuration des URLs: {e}")
        return False

def test_static_files():
    """Test la configuration des fichiers statiques"""
    print("\n🔍 Test des fichiers statiques...")
    try:
        from django.conf import settings
        print(f"   STATIC_URL: {settings.STATIC_URL}")
        print(f"   STATIC_ROOT: {settings.STATIC_ROOT}")
        print(f"   MEDIA_URL: {settings.MEDIA_URL}")
        print(f"   MEDIA_ROOT: {settings.MEDIA_ROOT}")
        print("✅ Configuration des fichiers statiques OK")
        return True
    except Exception as e:
        print(f"❌ Erreur de configuration des fichiers statiques: {e}")
        return False

def test_settings():
    """Affiche les paramètres importants"""
    print("\n🔍 Vérification des paramètres...")
    try:
        from django.conf import settings
        print(f"   DEBUG: {settings.DEBUG}")
        print(f"   DJANGO_ENV: {os.environ.get('DJANGO_ENV')}")
        print(f"   ALLOWED_HOSTS: {settings.ALLOWED_HOSTS}")
        print(f"   DATABASE: {settings.DATABASES['default']['ENGINE']}")
        
        # Vérifier Cloudinary
        if hasattr(settings, 'CLOUDINARY_STORAGE'):
            cloud_name = settings.CLOUDINARY_STORAGE.get('CLOUD_NAME')
            if cloud_name:
                print(f"   CLOUDINARY: Configuré ({cloud_name})")
            else:
                print("   CLOUDINARY: Non configuré (utilisation du stockage local)")
        
        print("✅ Paramètres vérifiés")
        return True
    except Exception as e:
        print(f"❌ Erreur de vérification des paramètres: {e}")
        return False

def main():
    print("=" * 60)
    print("🚀 TEST DE L'ENVIRONNEMENT DE PRODUCTION")
    print("=" * 60)
    
    results = []
    results.append(("Imports", test_imports()))
    results.append(("Settings", test_settings()))
    results.append(("Database", test_database()))
    results.append(("Apps", test_apps()))
    results.append(("URLs", test_urls()))
    results.append(("Static Files", test_static_files()))
    
    print("\n" + "=" * 60)
    print("📊 RÉSUMÉ DES TESTS")
    print("=" * 60)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{name:20} {status}")
    
    all_passed = all(result for _, result in results)
    
    print("\n" + "=" * 60)
    if all_passed:
        print("🎉 TOUS LES TESTS SONT PASSÉS!")
        print("Votre application devrait fonctionner en production.")
    else:
        print("⚠️  CERTAINS TESTS ONT ÉCHOUÉ")
        print("Corrigez les erreurs avant de déployer.")
    print("=" * 60)
    
    return 0 if all_passed else 1

if __name__ == '__main__':
    sys.exit(main())
