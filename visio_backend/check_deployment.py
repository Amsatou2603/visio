#!/usr/bin/env python
"""
Script pour vérifier rapidement si le déploiement Render fonctionne
Usage: python check_deployment.py
"""
import requests
import sys

BASE_URL = "https://visio-backend-sp1h.onrender.com"

def check_endpoint(url, name, expected_status=200):
    """Vérifie un endpoint et retourne le résultat"""
    try:
        print(f"\n🔍 Test de {name}...")
        print(f"   URL: {url}")
        
        response = requests.get(url, timeout=10)
        
        if response.status_code == expected_status:
            print(f"   ✅ Status: {response.status_code} OK")
            try:
                data = response.json()
                print(f"   📄 Réponse: {data}")
            except:
                print(f"   📄 Réponse: {response.text[:100]}...")
            return True
        else:
            print(f"   ❌ Status: {response.status_code} (attendu: {expected_status})")
            print(f"   📄 Réponse: {response.text[:200]}")
            return False
            
    except requests.exceptions.Timeout:
        print(f"   ⏱️  TIMEOUT - Le serveur met trop de temps à répondre")
        print(f"   💡 Render peut être en train de démarrer (cold start)")
        return False
    except requests.exceptions.ConnectionError:
        print(f"   ❌ ERREUR DE CONNEXION - Impossible de joindre le serveur")
        return False
    except Exception as e:
        print(f"   ❌ ERREUR: {e}")
        return False

def main():
    print("=" * 70)
    print("🚀 VÉRIFICATION DU DÉPLOIEMENT RENDER")
    print("=" * 70)
    print(f"\nServeur: {BASE_URL}")
    print("\n⚠️  Note: Le premier appel peut prendre 30-60 secondes (cold start)")
    
    results = []
    
    # Test 1: Health Check
    results.append(check_endpoint(
        f"{BASE_URL}/health/",
        "Health Check",
        200
    ))
    
    # Test 2: Admin
    results.append(check_endpoint(
        f"{BASE_URL}/admin/",
        "Admin Django",
        200
    ))
    
    # Test 3: API Products
    results.append(check_endpoint(
        f"{BASE_URL}/api/products/",
        "API Produits",
        200
    ))
    
    # Test 4: API Auth
    results.append(check_endpoint(
        f"{BASE_URL}/api/auth/register/",
        "API Auth (Register)",
        200
    ))
    
    # Test 5: Sitemap
    results.append(check_endpoint(
        f"{BASE_URL}/sitemap.xml",
        "Sitemap XML",
        200
    ))
    
    # Résumé
    print("\n" + "=" * 70)
    print("📊 RÉSUMÉ")
    print("=" * 70)
    
    passed = sum(results)
    total = len(results)
    
    print(f"\nTests réussis: {passed}/{total}")
    
    if passed == total:
        print("\n🎉 TOUS LES TESTS SONT PASSÉS!")
        print("✅ Votre backend fonctionne correctement sur Render.")
    elif passed > 0:
        print("\n⚠️  CERTAINS TESTS ONT ÉCHOUÉ")
        print("Consultez les logs Render pour plus de détails.")
    else:
        print("\n❌ TOUS LES TESTS ONT ÉCHOUÉ")
        print("\nActions recommandées:")
        print("1. Vérifiez que le service est démarré sur Render")
        print("2. Consultez les logs Render (Dashboard → Logs)")
        print("3. Vérifiez les variables d'environnement")
        print("4. Attendez 1-2 minutes si c'est un cold start")
    
    print("\n" + "=" * 70)
    print("💡 CONSEILS")
    print("=" * 70)
    print("\n- Logs Render: https://dashboard.render.com")
    print("- Guide de déploiement: Voir DEPLOY_RENDER.md")
    print("- Plan d'action: Voir ACTION_PLAN.md")
    print("\n" + "=" * 70 + "\n")
    
    return 0 if passed == total else 1

if __name__ == '__main__':
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrompu par l'utilisateur")
        sys.exit(1)
