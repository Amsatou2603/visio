#!/usr/bin/env python
"""
Script de diagnostic pour vérifier la configuration Paytech et les erreurs
Usage: python debug_config.py
"""
import os
import django
from django.conf import settings

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

def check_paytech_config():
    """Vérifie la configuration Paytech"""
    print("\n" + "="*70)
    print("🔍 CONFIGURATION PAYTECH")
    print("="*70)
    
    paytech_config = {
        'PAYTECH_API_URL': getattr(settings, 'PAYTECH_API_URL', 'NON DÉFINI'),
        'PAYTECH_API_KEY': getattr(settings, 'PAYTECH_API_KEY', 'NON DÉFINI'),
        'PAYTECH_API_SECRET': getattr(settings, 'PAYTECH_API_SECRET', 'NON DÉFINI'),
        'PAYTECH_ENV': getattr(settings, 'PAYTECH_ENV', 'NON DÉFINI'),
        'FRONTEND_URL': getattr(settings, 'FRONTEND_URL', 'NON DÉFINI'),
        'BACKEND_URL': getattr(settings, 'BACKEND_URL', 'NON DÉFINI'),
    }
    
    for key, value in paytech_config.items():
        status = "✅" if value != 'NON DÉFINI' and value != '' else "❌"
        # Masquer les clés secrètes
        if 'SECRET' in key or 'KEY' in key:
            display_value = value[:8] + "..." if len(value) > 8 else value
        else:
            display_value = value
        print(f"{status} {key:20} → {display_value}")
    
    # Vérifier que les URLs sont correctes
    if hasattr(settings, 'PAYTECH_API_URL'):
        api_url = settings.PAYTECH_API_URL.rstrip('/')
        if 'sandbox' in api_url or 'test' in api_url:
            print("ℹ️  Mode SANDBOX détecté")
        elif 'paytech.sn' in api_url:
            print("🚀 Mode PRODUCTION détecté")
    
    return all(v not in ['NON DÉFINI', ''] for v in paytech_config.values())

def check_cors_config():
    """Vérifie la configuration CORS"""
    print("\n" + "="*70)
    print("🔍 CONFIGURATION CORS")
    print("="*70)
    
    cors_origins = getattr(settings, 'CORS_ALLOWED_ORIGINS', [])
    cors_allow_all = getattr(settings, 'CORS_ALLOW_ALL_ORIGINS', False)
    
    print(f"CORS_ALLOW_ALL_ORIGINS: {cors_allow_all}")
    print(f"CORS_ALLOWED_ORIGINS:")
    for origin in cors_origins:
        print(f"  - {origin}")
    
    # Recommandations
    if cors_allow_all:
        print("⚠️  CORS_ALLOW_ALL_ORIGINS=True (OK pour développement, risqué en production)")
    
    expected_origins = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ]
    
    missing_origins = [o for o in expected_origins if o not in cors_origins and not cors_allow_all]
    if missing_origins:
        print("❌ Origins manquantes pour le développement:")
        for origin in missing_origins:
            print(f"   - {origin}")

def check_database_connection():
    """Vérifie la connexion à la base de données"""
    print("\n" + "="*70)
    print("🔍 CONNEXION BASE DE DONNÉES")
    print("="*70)
    
    try:
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM auth_user")
            user_count = cursor.fetchone()[0]
        
        print(f"✅ Connexion DB: OK")
        print(f"   Utilisateurs: {user_count}")
        
        # Vérifier les tables principales
        tables_to_check = [
            ('products_product', 'Produits'),
            ('orders_order', 'Commandes'),
            ('payments_payment', 'Paiements'),
            ('users_user', 'Utilisateurs'),
        ]
        
        for table, description in tables_to_check:
            try:
                with connection.cursor() as cursor:
                    cursor.execute(f"SELECT COUNT(*) FROM {table}")
                    count = cursor.fetchone()[0]
                print(f"   {description}: {count}")
            except Exception as e:
                print(f"❌ {description}: Erreur - {e}")
        
        return True
    except Exception as e:
        print(f"❌ Erreur de connexion DB: {e}")
        return False

def check_api_endpoints():
    """Teste les endpoints critiques"""
    print("\n" + "="*70)
    print("🔍 ENDPOINTS API")
    print("="*70)
    
    try:
        from django.test import Client
        client = Client()
        
        endpoints_to_test = [
            ('/', 'Health Check'),
            ('/health/', 'Health API'),
            ('/api/products/', 'Produits API'),
            ('/api/auth/login/', 'Login API (POST)'),
        ]
        
        for endpoint, description in endpoints_to_test:
            try:
                if 'login' in endpoint:
                    # Test POST pour login
                    response = client.post(endpoint, {'email': 'test@test.com', 'password': 'test'})
                else:
                    response = client.get(endpoint)
                
                status = "✅" if response.status_code in [200, 201, 400, 401] else "❌"
                print(f"{status} {description:20} → HTTP {response.status_code}")
            except Exception as e:
                print(f"❌ {description:20} → Erreur: {e}")
        
        return True
    except Exception as e:
        print(f"❌ Erreur test endpoints: {e}")
        return False

def main():
    print("╔" + "="*68 + "╗")
    print("║" + " "*20 + "DIAGNOSTIC CONFIGURATION" + " "*25 + "║")
    print("╚" + "="*68 + "╝")
    
    results = []
    results.append(("Paytech", check_paytech_config()))
    check_cors_config()
    results.append(("Database", check_database_connection()))
    results.append(("API Endpoints", check_api_endpoints()))
    
    # Résumé
    print("\n" + "="*70)
    print("📊 RÉSUMÉ")
    print("="*70)
    
    all_ok = True
    for name, status in results:
        emoji = "✅" if status else "❌"
        print(f"{emoji} {name}")
        if not status:
            all_ok = False
    
    print("\n" + "="*70)
    if all_ok:
        print("🎉 CONFIGURATION CORRECTE")
        print("\nSi le problème persiste, vérifiez:")
        print("1. Console du navigateur (F12)")
        print("2. Authentification côté frontend")
        print("3. Logs du serveur Django")
    else:
        print("⚠️  PROBLÈMES DÉTECTÉS")
        print("\nCorrigez les erreurs ci-dessus avant de continuer.")
    
    print("="*70)

if __name__ == '__main__':
    main()