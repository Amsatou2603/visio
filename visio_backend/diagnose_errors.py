#!/usr/bin/env python
"""
Script de diagnostic détaillé pour identifier les problèmes
Usage: python diagnose_errors.py
"""
import os
import sys
import django

# Configuration de l'environnement
os.environ.setdefault('DJANGO_ENV', 'production')
os.environ.setdefault('SECRET_KEY', 'test-secret-key-for-diagnosis')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

def test_imports():
    """Test tous les imports critiques"""
    print("\n" + "="*70)
    print("🔍 TEST DES IMPORTS")
    print("="*70)
    
    errors = []
    
    # Test imports de base
    modules = [
        ('core.settings', 'Settings Django'),
        ('core.urls', 'URLs principales'),
        ('core.wsgi', 'WSGI'),
        ('users.models', 'Modèles Users'),
        ('users.views', 'Views Users'),
        ('users.serializers', 'Serializers Users'),
        ('products.models', 'Modèles Products'),
        ('products.views', 'Views Products'),
        ('products.serializers', 'Serializers Products'),
        ('reviews.models', 'Modèles Reviews'),
        ('reviews.views', 'Views Reviews'),
        ('orders.models', 'Modèles Orders'),
        ('payments.models', 'Modèles Payments'),
    ]
    
    for module_name, description in modules:
        try:
            __import__(module_name)
            print(f"✅ {description:30} → OK")
        except Exception as e:
            error_msg = f"❌ {description:30} → ERREUR: {str(e)}"
            print(error_msg)
            errors.append((description, str(e)))
    
    return len(errors) == 0, errors

def test_database():
    """Test la connexion à la base de données"""
    print("\n" + "="*70)
    print("🔍 TEST DE LA BASE DE DONNÉES")
    print("="*70)
    
    try:
        django.setup()
        from django.db import connection
        from django.conf import settings
        
        print(f"Engine: {settings.DATABASES['default']['ENGINE']}")
        
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
        
        print("✅ Connexion à la base de données: OK")
        return True, None
    except Exception as e:
        print(f"❌ Connexion à la base de données: ERREUR")
        print(f"   Détails: {str(e)}")
        return False, str(e)

def test_migrations():
    """Vérifie l'état des migrations"""
    print("\n" + "="*70)
    print("🔍 TEST DES MIGRATIONS")
    print("="*70)
    
    try:
        from django.core.management import call_command
        from io import StringIO
        
        out = StringIO()
        call_command('showmigrations', '--list', stdout=out)
        output = out.getvalue()
        
        # Compter les migrations non appliquées
        unapplied = output.count('[ ]')
        applied = output.count('[X]')
        
        print(f"Migrations appliquées: {applied}")
        print(f"Migrations non appliquées: {unapplied}")
        
        if unapplied > 0:
            print("\n⚠️  ATTENTION: Des migrations ne sont pas appliquées!")
            print("Exécutez: python manage.py migrate")
            return False, f"{unapplied} migrations non appliquées"
        else:
            print("✅ Toutes les migrations sont appliquées")
            return True, None
            
    except Exception as e:
        print(f"❌ Erreur lors de la vérification des migrations: {str(e)}")
        return False, str(e)

def test_urls():
    """Test la configuration des URLs"""
    print("\n" + "="*70)
    print("🔍 TEST DES URLs")
    print("="*70)
    
    try:
        from django.urls import get_resolver
        from django.urls.exceptions import NoReverseMatch
        
        resolver = get_resolver()
        
        # URLs à tester
        test_urls = [
            ('health', 'Health Check'),
            ('admin:index', 'Admin Django'),
            ('register', 'API Register'),
            ('login', 'API Login'),
            ('product-list', 'API Products List'),
        ]
        
        errors = []
        for url_name, description in test_urls:
            try:
                from django.urls import reverse
                path = reverse(url_name)
                print(f"✅ {description:25} → {path}")
            except NoReverseMatch:
                error_msg = f"❌ {description:25} → URL non trouvée"
                print(error_msg)
                errors.append((description, "URL non trouvée"))
            except Exception as e:
                error_msg = f"❌ {description:25} → {str(e)}"
                print(error_msg)
                errors.append((description, str(e)))
        
        return len(errors) == 0, errors
        
    except Exception as e:
        print(f"❌ Erreur lors du test des URLs: {str(e)}")
        return False, str(e)

def test_models():
    """Test que tous les modèles sont accessibles"""
    print("\n" + "="*70)
    print("🔍 TEST DES MODÈLES")
    print("="*70)
    
    try:
        from django.apps import apps
        
        models_to_test = [
            ('users', 'User'),
            ('users', 'SellerProfile'),
            ('products', 'Product'),
            ('products', 'Category'),
            ('products', 'Brand'),
            ('reviews', 'Review'),
            ('orders', 'Order'),
            ('payments', 'Payment'),
        ]
        
        errors = []
        for app_label, model_name in models_to_test:
            try:
                model = apps.get_model(app_label, model_name)
                count = model.objects.count()
                print(f"✅ {app_label}.{model_name:20} → {count} objets")
            except Exception as e:
                error_msg = f"❌ {app_label}.{model_name:20} → {str(e)}"
                print(error_msg)
                errors.append((f"{app_label}.{model_name}", str(e)))
        
        return len(errors) == 0, errors
        
    except Exception as e:
        print(f"❌ Erreur lors du test des modèles: {str(e)}")
        return False, str(e)

def test_admin():
    """Test que l'admin est correctement configuré"""
    print("\n" + "="*70)
    print("🔍 TEST DE L'ADMIN DJANGO")
    print("="*70)
    
    try:
        from django.contrib import admin
        from django.apps import apps
        
        registered_models = admin.site._registry
        print(f"Modèles enregistrés dans l'admin: {len(registered_models)}")
        
        for model in registered_models:
            app_label = model._meta.app_label
            model_name = model._meta.model_name
            print(f"   - {app_label}.{model_name}")
        
        print("✅ Admin Django configuré")
        return True, None
        
    except Exception as e:
        print(f"❌ Erreur admin: {str(e)}")
        return False, str(e)

def test_rest_framework():
    """Test la configuration de Django REST Framework"""
    print("\n" + "="*70)
    print("🔍 TEST DE DJANGO REST FRAMEWORK")
    print("="*70)
    
    try:
        from django.conf import settings
        
        if hasattr(settings, 'REST_FRAMEWORK'):
            print("✅ REST_FRAMEWORK configuré")
            
            config = settings.REST_FRAMEWORK
            print(f"   Authentication: {config.get('DEFAULT_AUTHENTICATION_CLASSES')}")
            print(f"   Permissions: {config.get('DEFAULT_PERMISSION_CLASSES')}")
            print(f"   Pagination: {config.get('DEFAULT_PAGINATION_CLASS')}")
            print(f"   Page size: {config.get('PAGE_SIZE')}")
            
            return True, None
        else:
            print("❌ REST_FRAMEWORK non configuré")
            return False, "REST_FRAMEWORK non configuré"
            
    except Exception as e:
        print(f"❌ Erreur REST Framework: {str(e)}")
        return False, str(e)

def main():
    print("╔" + "="*68 + "╗")
    print("║" + " "*15 + "DIAGNOSTIC COMPLET DU BACKEND" + " "*24 + "║")
    print("╚" + "="*68 + "╝")
    
    results = []
    
    # Exécuter tous les tests
    results.append(("Imports", *test_imports()))
    results.append(("Database", *test_database()))
    results.append(("Migrations", *test_migrations()))
    results.append(("URLs", *test_urls()))
    results.append(("Modèles", *test_models()))
    results.append(("Admin", *test_admin()))
    results.append(("REST Framework", *test_rest_framework()))
    
    # Résumé
    print("\n" + "="*70)
    print("📊 RÉSUMÉ DU DIAGNOSTIC")
    print("="*70)
    
    all_passed = True
    for name, passed, error in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{name:20} {status}")
        if not passed and error:
            all_passed = False
            if isinstance(error, list):
                for err_name, err_msg in error[:3]:  # Afficher max 3 erreurs
                    print(f"   → {err_name}: {err_msg[:60]}")
            else:
                print(f"   → {str(error)[:80]}")
    
    print("\n" + "="*70)
    if all_passed:
        print("🎉 TOUS LES TESTS SONT PASSÉS!")
        print("\nVotre application devrait fonctionner correctement.")
        print("\nProchaines étapes:")
        print("1. Configurez les variables d'environnement sur Render")
        print("2. Déployez sur Render")
        print("3. Vérifiez les logs Render")
    else:
        print("⚠️  CERTAINS TESTS ONT ÉCHOUÉ")
        print("\nCorrigez les erreurs ci-dessus avant de déployer.")
        print("\nActions recommandées:")
        print("1. Vérifiez les imports manquants")
        print("2. Exécutez: python manage.py migrate")
        print("3. Vérifiez la configuration dans settings.py")
    print("="*70 + "\n")
    
    return 0 if all_passed else 1

if __name__ == '__main__':
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n\n⚠️  Diagnostic interrompu")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ ERREUR FATALE: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
