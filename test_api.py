#!/usr/bin/env python3
"""
Script de test pour identifier l'erreur dans le processus de commande
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"

def test_endpoint(url, method="GET", data=None, headers=None):
    """Teste un endpoint et affiche les résultats"""
    try:
        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers)
        
        print(f"\n{'='*60}")
        print(f"🔍 TEST: {method} {url}")
        print(f"Status: {response.status_code}")
        
        if response.status_code in [200, 201]:
            print("✅ SUCCESS")
            try:
                result = response.json()
                print(f"Response: {json.dumps(result, indent=2, ensure_ascii=False)[:500]}...")
                return True, response
            except:
                print(f"Response: {response.text[:500]}...")
                return True, response
        else:
            print("❌ ERROR")
            print(f"Response: {response.text[:1000]}")
        
        return response.status_code in [200, 201], response
    except Exception as e:
        print(f"\n❌ EXCEPTION: {e}")
        return False, None

def main():
    print("╔══════════════════════════════════════════════════════════════╗")
    print("║              TEST DU PROCESSUS DE COMMANDE                   ║")
    print("╚══════════════════════════════════════════════════════════════╝")
    
    # Test 1: Health check
    test_endpoint("http://127.0.0.1:8000/health/")
    
    # Test 2: Liste des produits
    test_endpoint(f"{BASE_URL}/products/")
    
    # Test 3: Inscription d'un utilisateur test
    user_data = {
        "first_name": "Test",
        "last_name": "User",
        "email": "test2@example.com",
        "username": "testuser2",
        "password": "testpass123",
        "password2": "testpass123",
        "phone": "221700000000"
    }
    success, response = test_endpoint(f"{BASE_URL}/auth/register/", "POST", user_data)
    
    access_token = None
    if success and response:
        try:
            result = response.json()
            access_token = result.get('access')
            print(f"🔑 Token obtenu: {access_token[:50]}...")
        except:
            pass
    
    # Si pas de token, essayons de nous connecter
    if not access_token:
        print("\n🔐 Tentative de connexion...")
        login_data = {
            "email": "test2@example.com",
            "password": "testpass123"
        }
        success, response = test_endpoint(f"{BASE_URL}/auth/login/", "POST", login_data)
        if success and response:
            try:
                result = response.json()
                access_token = result.get('access')
                print(f"🔑 Token de connexion obtenu: {access_token[:50]}...")
            except:
                pass
    
    if access_token:
        headers = {"Authorization": f"Bearer {access_token}"}
        
        # Test 4: Créer une commande test
        order_data = {
            "shipping_name": "Test User",
            "shipping_phone": "221700000000",
            "shipping_address": "123 Test Street",
            "shipping_city": "Dakar",
            "shipping_country": "Sénégal",
            "notes": "Test order",
            "items": [
                {"product_id": 1, "quantity": 1}
            ]
        }
        
        print(f"\n🛒 Test création de commande...")
        success, response = test_endpoint(f"{BASE_URL}/orders/", "POST", order_data, headers)
        
        order_id = None
        if success and response:
            try:
                result = response.json()
                order_id = result.get('id')
                print(f"📦 Commande créée ID: {order_id}")
            except:
                pass
        
        # Test 5: Initier un paiement
        if order_id:
            payment_data = {
                "order_id": order_id,
                "method": "wave",
                "phone_number": "221700000000"
            }
            
            print(f"\n💳 Test initiation paiement...")
            success, response = test_endpoint(f"{BASE_URL}/payments/initiate/", "POST", payment_data, headers)
        else:
            print("\n❌ Pas de commande créée, impossible de tester le paiement")
    else:
        print("\n❌ Pas de token d'authentification, impossible de tester les commandes")
    
    print(f"\n{'='*60}")
    print("✅ TESTS TERMINÉS")
    print("Vérifiez les erreurs ci-dessus pour identifier le problème")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()