# 📦 Charger les Données Initiales en Production

## 📊 Problème

Votre base de données PostgreSQL en production est vide :
- ❌ Pas de produits
- ❌ Pas de catégories
- ❌ Pas de marques
- ❌ Pas d'utilisateurs admin

Mais vous avez des données dans votre base SQLite locale et des fixtures.

---

## ✅ SOLUTION : Charger Automatiquement les Données

J'ai créé un script `load_initial_data.py` qui :
1. ✅ Crée le superuser admin
2. ✅ Charge les fixtures (catégories, marques, produits)
3. ✅ S'exécute automatiquement au démarrage

---

## 🚀 Déploiement (3 Étapes)

### Étape 1 : Mettre à Jour le Start Command sur Render

1. Allez sur https://dashboard.render.com
2. Cliquez sur **visio-backend-sp1h**
3. Cliquez sur **Settings**
4. Cherchez **"Start Command"**
5. Remplacez par :

```bash
python load_initial_data.py && python manage.py migrate --no-input && gunicorn core.wsgi:application --bind 0.0.0.0:$PORT --log-level info
```

6. Cliquez sur **"Save Changes"**

### Étape 2 : Commit et Push

```bash
git add .
git commit -m "feat: Chargement automatique des données initiales"
git push origin main
```

### Étape 3 : Surveiller les Logs

Après le redéploiement, vous devriez voir :

```
======================================================================
🚀 INITIALISATION DE LA BASE DE DONNÉES
======================================================================

👤 Création du superuser...
✅ Superuser créé: admin@visio.com
   Password: Admin123!Visio
   ⚠️  CHANGEZ CE MOT DE PASSE IMMÉDIATEMENT!

📦 Chargement des fixtures...
📦 Chargement des données initiales...
   Chargement: products/fixtures/initial_data.json...
   ✅ products/fixtures/initial_data.json chargé
   Chargement: products/fixtures/products.json...
   ✅ products/fixtures/products.json chargé

📊 Données chargées:
   - Catégories: 15
   - Marques: 10
   - Produits: 50

======================================================================
✅ INITIALISATION TERMINÉE
======================================================================
```

---

## 🔍 Vérification

### 1. Connexion Admin

1. Allez sur : https://visio-backend-sp1h.onrender.com/admin/
2. Connectez-vous avec :
   - **Email :** `admin@visio.com`
   - **Password :** `Admin123!Visio`
3. **Changez le mot de passe immédiatement**

### 2. Vérifier les Produits

1. Dans l'admin, allez dans **Products** → **Products**
2. Vous devriez voir tous vos produits

Ou testez l'API :
```
https://visio-backend-sp1h.onrender.com/api/products/
```

### 3. Vérifier les Catégories

```
https://visio-backend-sp1h.onrender.com/api/products/categories/
```

---

## 📦 Que Contiennent les Fixtures ?

### `initial_data.json`
- Catégories (Smartphones, Tablettes, Accessoires, etc.)
- Marques (Apple, Samsung, Infinix, etc.)
- Utilisateurs de test (vendeurs)

### `products.json`
- Produits avec images
- Prix, descriptions, stocks
- Relations avec catégories et marques

---

## 🔄 Si Vous Voulez Réinitialiser les Données

### Option 1 : Supprimer et Recharger

Si vous voulez supprimer toutes les données et les recharger :

1. **Créez un script de réinitialisation** `reset_data.py` :

```python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from products.models import Product, Category, Brand
from users.models import User

# Supprimer toutes les données
print("🗑️  Suppression des données...")
Product.objects.all().delete()
Category.objects.all().delete()
Brand.objects.all().delete()
User.objects.filter(is_superuser=False).delete()

print("✅ Données supprimées")
print("Maintenant, exécutez: python load_initial_data.py")
```

2. **Modifiez temporairement le Start Command** :
```bash
python reset_data.py && python load_initial_data.py && python manage.py migrate --no-input && gunicorn core.wsgi:application --bind 0.0.0.0:$PORT
```

3. **Après le redéploiement, restaurez le Start Command normal**

### Option 2 : Ajouter Plus de Données

Si vous voulez ajouter plus de produits sans supprimer les existants :

1. **Créez de nouvelles fixtures** dans `products/fixtures/`
2. **Ajoutez-les dans `load_initial_data.py`** :

```python
fixtures = [
    'products/fixtures/initial_data.json',
    'products/fixtures/products.json',
    'products/fixtures/more_products.json',  # ← Nouvelle fixture
]
```

---

## 🖼️ Gestion des Images

### Problème : Les Images Locales

Les fixtures contiennent des chemins vers des images locales (`media/products/...`).

En production, vous avez 2 options :

### Option 1 : Utiliser Cloudinary (Recommandé)

1. **Configurez Cloudinary sur Render** :
   ```
   CLOUDINARY_CLOUD_NAME=drt6c8efi
   CLOUDINARY_API_KEY=853275685212226
   CLOUDINARY_API_SECRET=ThoYi2ke_9uYDF-DbCYaDL9uKmY
   ```

2. **Uploadez les images** :
   ```bash
   python upload_media.py
   ```

3. **Les images seront servies depuis Cloudinary**

### Option 2 : Utiliser des URLs Externes

Modifiez les fixtures pour utiliser des URLs d'images hébergées ailleurs :

```json
{
  "model": "products.productimage",
  "fields": {
    "image": "https://example.com/images/product1.jpg"
  }
}
```

---

## 🆘 Problèmes Courants

### Problème 1 : "Fixture introuvable"

**Erreur :**
```
⚠️  Fixture introuvable: products/fixtures/initial_data.json
```

**Cause :** Les fixtures ne sont pas dans le bon dossier.

**Solution :**
1. Vérifiez que les fixtures existent dans `products/fixtures/`
2. Vérifiez que le dossier `fixtures` est commit dans Git
3. Vérifiez le `.gitignore` pour s'assurer qu'il n'ignore pas les fixtures

### Problème 2 : "IntegrityError: UNIQUE constraint failed"

**Erreur :**
```
IntegrityError: duplicate key value violates unique constraint
```

**Cause :** Les données existent déjà dans la base.

**Solution :** Le script vérifie déjà si des données existent. Si l'erreur persiste :
1. Supprimez les données existantes (voir "Option 1 : Supprimer et Recharger")
2. Ou modifiez les fixtures pour éviter les doublons

### Problème 3 : "Des données existent déjà"

**Message :**
```
ℹ️  Des données existent déjà, fixtures ignorées
```

**Cause :** C'est normal ! Le script ne recharge pas les fixtures si des données existent déjà.

**Solution :** Si vous voulez forcer le rechargement, utilisez l'Option 1 de réinitialisation.

### Problème 4 : Images Manquantes

**Cause :** Les images sont dans `media/` local mais pas en production.

**Solution :**
1. Configurez Cloudinary (voir "Option 1 : Utiliser Cloudinary")
2. Uploadez les images avec `python upload_media.py`
3. Ou utilisez des URLs externes dans les fixtures

---

## 📋 Checklist

### Configuration

- [ ] `load_initial_data.py` créé
- [ ] Start Command mis à jour sur Render
- [ ] Fixtures existent dans `products/fixtures/`
- [ ] Code commit et push
- [ ] Redéploiement terminé

### Logs

- [ ] "Superuser créé" visible
- [ ] "Fixtures chargées" visible
- [ ] Statistiques affichées (catégories, marques, produits)
- [ ] Aucune erreur

### Vérification

- [ ] Connexion admin réussie
- [ ] Produits visibles dans l'admin
- [ ] API `/api/products/` retourne des produits
- [ ] Images visibles (si Cloudinary configuré)

---

## 💡 Astuce : Exporter Vos Données Locales

Si vous voulez exporter vos données SQLite locales actuelles :

```bash
# Exporter toutes les données
python manage.py dumpdata products.Category products.Brand products.Product products.ProductImage --indent 2 > products/fixtures/my_data.json

# Exporter seulement les produits
python manage.py dumpdata products.Product products.ProductImage --indent 2 > products/fixtures/products_only.json

# Exporter les utilisateurs (sans mots de passe)
python manage.py dumpdata users.User --natural-foreign --natural-primary --indent 2 > users/fixtures/users.json
```

Puis ajoutez ces fixtures dans `load_initial_data.py`.

---

## 🎯 Résumé

1. **Mettez à jour le Start Command** sur Render Dashboard
2. **Commit et push** le code
3. **Surveillez les logs** pour voir le chargement des données
4. **Connectez-vous** à `/admin/` et vérifiez les produits
5. **Configurez Cloudinary** pour les images (optionnel)

---

**Dernière mise à jour :** 2026-05-24  
**Données :** Superuser + Fixtures automatiques  
**Statut :** ✅ Prêt à déployer
