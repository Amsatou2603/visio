#!/usr/bin/env python
"""
Script pour générer une SECRET_KEY Django sécurisée
Usage: python generate_secret_key.py
"""
from django.core.management.utils import get_random_secret_key

if __name__ == '__main__':
    secret_key = get_random_secret_key()
    print("\n" + "=" * 70)
    print("🔐 NOUVELLE SECRET_KEY GÉNÉRÉE")
    print("=" * 70)
    print("\nCopiez cette clé dans vos variables d'environnement Render:\n")
    print(f"SECRET_KEY={secret_key}")
    print("\n" + "=" * 70)
    print("⚠️  IMPORTANT: Ne partagez JAMAIS cette clé publiquement!")
    print("=" * 70 + "\n")
