#!/usr/bin/env python
"""
Script pour vérifier l'état de la base de données sur Render
À exécuter dans le Shell Render
Usage: python check_render_db.py
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.db import connection
from django.core.management import call_command
from io import StringIO

def check_database_connection():
    """Vérifie la connexion à la base de données"""
    print("="*70)
    print("🔍 TEST DE CONNEXION À LA BASE DE DONNÉES")
    print("="*70)
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            version = cursor.fetchone()[0]
            print(f"✅ Connexion réussie!")
            print(f"   PostgreSQL version: {version}")
            return True
    except Exception as e:
        print(f"❌ Erreur de connexion: {e}")
        return False

def check_tables():
    """Vérifie quelles tables existent"""
    print("\n" + "="*70)
    print("🔍 VÉRIFICATION DES TABLES")
    print("="*70)
    
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name;
            """)
            tables = cursor.fetchall()
            
            if tables:
                print(f"✅ {len(tables)} tables trouvées:")
                for table in tables:
                    print(f"   - {table[0]}")
                return True
            else:
                print("❌ Aucune table trouvée!")
                print("   Les migrations n'ont probablement pas été appliquées.")
                return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def check_migrations():
    """Vérifie l'état des migrations"""
    print("\n" + "="*70)
    print("🔍 ÉTAT DES MIGRATIONS")
    print("="*70)
    
    try:
        out = StringIO()
        call_command('showmigrations', '--list', stdout=out)
        output = out.getvalue()
        
        lines = output.strip().split('\n')
        applied = output.count('[X]')
        unapplied = output.count('[ ]')
        
        print(f"Migrations appliquées: {applied}")
        print(f"Migrations non appliquées: {unapplied}")
        
        if unapplied > 0:
            print("\n⚠️  MIGRATIONS NON APPLIQUÉES:")
            for line in lines:
                if '[ ]' in line:
                    print(f"   {line}")
            return False
        else:
            print("✅ Toutes les migrations sont appliquées")
            return True
            
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def check_models():
    """Vérifie que les modèles peuvent accéder à la DB"""
    print("\n" + "="*70)
    print("🔍 TEST DES MODÈLES")
    print("="*70)
    
    models_to_check = [
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
    for app_label, model_name in models_to_check:
        try:
            from django.apps import apps
            model = apps.get_model(app_label, model_name)
            count = model.objects.count()
            print(f"✅ {app_label}.{model_name:20} → {count} objets")
        except Exception as e:
            error_msg = str(e)[:60]
            print(f"❌ {app_label}.{model_name:20} → {error_msg}")
            errors.append((f"{app_label}.{model_name}", str(e)))
    
    return len(errors) == 0

def check_environment():
    """Vérifie les variables d'environnement"""
    print("\n" + "="*70)
    print("🔍 VARIABLES D'ENVIRONNEMENT")
    print("="*70)
    
    vars_to_check = [
        'DJANGO_ENV',
        'SECRET_KEY',
        'DATABASE_URL',
        'PYTHON_VERSION',
    ]
    
    all_present = True
    for var in vars_to_check:
        value = os.environ.get(var)
        if value:
            # Masquer les valeurs sensibles
            if var in ['SECRET_KEY', 'DATABASE_URL']:
                display_value = value[:10] + '...' + value[-10:] if len(value) > 20 else '***'
            else:
                display_value = value
            print(f"✅ {var:20} = {display_value}")
        else:
            print(f"❌ {var:20} = NON DÉFINI")
            all_present = False
    
    return all_present

def main():
    print("╔" + "="*68 + "╗")
    print("║" + " "*15 + "DIAGNOSTIC BASE DE DONNÉES RENDER" + " "*20 + "║")
    print("╚" + "="*68 + "╝")
    
    results = []
    
    # Tests
    results.append(("Variables d'environnement", check_environment()))
    results.append(("Connexion DB", check_database_connection()))
    results.append(("Tables", check_tables()))
    results.append(("Migrations", check_migrations()))
    results.append(("Modèles", check_models()))
    
    # Résumé
    print("\n" + "="*70)
    print("📊 RÉSUMÉ")
    print("="*70)
    
    for name, passed in results:
        status = "✅ OK" if passed else "❌ ÉCHEC"
        print(f"{name:30} {status}")
    
    all_passed = all(passed for _, passed in results)
    
    print("\n" + "="*70)
    if all_passed:
        print("🎉 TOUT FONCTIONNE!")
        print("\nVotre base de données est correctement configurée.")
        print("Les endpoints API devraient maintenant fonctionner.")
    else:
        print("⚠️  PROBLÈMES DÉTECTÉS")
        print("\nActions recommandées:")
        
        if not results[0][1]:  # Variables d'environnement
            print("1. Configurez les variables d'environnement manquantes")
        
        if not results[1][1]:  # Connexion
            print("2. Vérifiez que PostgreSQL est attaché au service")
        
        if not results[2][1] or not results[3][1]:  # Tables ou Migrations
            print("3. Exécutez: python manage.py migrate --run-syncdb")
        
        if not results[4][1]:  # Modèles
            print("4. Vérifiez les erreurs ci-dessus et corrigez-les")
    
    print("="*70 + "\n")
    
    return 0 if all_passed else 1

if __name__ == '__main__':
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n\n⚠️  Diagnostic interrompu")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ ERREUR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
