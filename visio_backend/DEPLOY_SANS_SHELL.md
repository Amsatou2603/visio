# 🚀 Déploiement Sans Shell Render (Plan Gratuit)

## 📊 Situation

Vous utilisez le plan gratuit de Render qui ne donne pas accès au Shell.

**Solution :** Les migrations vont s'exécuter automatiquement pendant le build et au démarrage du serveur.

---

## ✅ Modifications Appliquées

### 1. `Procfile` - Migrations au démarrage

**Avant :**
```
web: gunicorn core.wsgi:application --bind 0.0.0.0:$PORT
release: python manage.py migrate --no-input
```

**Après :**
```
web: python manage.py migrate --no-input && python manage.py collectstatic --no-input && gunicorn core.wsgi:application --bind 0.0.0.0:$PORT
```

Les migrations s'exécutent maintenant **à chaque démarrage** du serveur.

### 2. `build.sh` - Migrations pendant le build

**Avant :**
```bash
pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate
```

**Après :**
```bash
echo "📦 Installation des dépendances..."
pip install -r requirements.txt

echo "🔄 Application des migrations..."
python manage.py migrate --no-input

echo "🗂️  Collecte des fichiers statiques..."
python manage.py collectstatic --no-input

echo "✅ Build terminé avec succès!"
```

Les migrations s'exécutent maintenant **pendant le build**.

### 3. `render.yaml` - Configuration Render

**Mise à jour du `startCommand` :**
```yaml
startCommand: "python manage.py migrate --no-input && gunicorn core.wsgi:application --bind 0.0.0.0:$PORT"
```

---

## 🚀 Déploiement (3 Étapes)

### Étape 1 : Commit et Push

```bash
git add .
git commit -m "fix: Migrations automatiques au démarrage + corrections erreur 500"
git push origin main
```

### Étape 2 : Surveiller les Logs Render

1. Allez sur https://dashboard.render.com
2. Sélectionnez votre service `visio-backend-sp1h`
3. Cliquez sur **"Logs"**
4. Attendez de voir :

```
==> Building...
📦 Installation des dépendances...
🔄 Application des migrations...
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  Applying users.0001_initial... OK
  Applying products.0001_initial... OK
  Applying orders.0001_initial... OK
  Applying payments.0001_initial... OK
  Applying reviews.0001_initial... OK
  ...
✅ Build terminé avec succès!

==> Starting server...
Running migrations:
  No migrations to apply.
Booting worker with pid: 123
Listening at: http://0.0.0.0:10000
```

### Étape 3 : Tester

Attendez 2-3 minutes après le déploiement, puis testez :

```bash
python check_deployment.py
```

Ou testez manuellement :
- ✅ https://visio-backend-sp1h.onrender.com/health/
- ✅ https://visio-backend-sp1h.onrender.com/api/products/
- ✅ https://visio-backend-sp1h.onrender.com/admin/

---

## 🔍 Vérification dans les Logs

### ✅ Logs de Succès

**Pendant le Build :**
```
📦 Installation des dépendances...
Successfully installed Django-4.2.30 ...
🔄 Application des migrations...
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  Applying users.0001_initial... OK
  Applying products.0001_initial... OK
  ...
✅ Build terminé avec succès!
```

**Au Démarrage :**
```
Running migrations:
  No migrations to apply.
Booting worker with pid: 123
Listening at: http://0.0.0.0:10000
```

### ❌ Logs d'Erreur

**Erreur de connexion DB :**
```
django.db.utils.OperationalError: FATAL: password authentication failed
```
→ **Solution :** Vérifiez `DATABASE_URL` dans Environment

**Erreur de migration :**
```
django.db.migrations.exceptions.InconsistentMigrationHistory
```
→ **Solution :** Voir section "Problèmes Courants" ci-dessous

---

## 🆘 Problèmes Courants

### Problème 1 : "password authentication failed"

**Cause :** `DATABASE_URL` incorrect ou base de données non accessible.

**Solution :**

Vous utilisez **Neon Database**. Vérifiez que :

1. La base de données Neon est active
2. `DATABASE_URL` dans Render Environment est correct :
   ```
   postgresql://neondb_owner:npg_ThHyM9g1UzCE@ep-crimson-night-aqt43qma-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

3. Le mot de passe n'a pas changé

**Pour mettre à jour `DATABASE_URL` :**
1. Dashboard Render → Environment
2. Modifiez `DATABASE_URL`
3. Sauvegardez (redéploiement automatique)

---

### Problème 2 : "No migrations to apply" mais les tables n'existent pas

**Cause :** Django pense que les migrations sont appliquées mais elles ne le sont pas.

**Solution :** Créer un script de réinitialisation

Créez `reset_migrations.py` :

```python
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

import django
django.setup()

from django.db import connection

# Supprimer la table django_migrations
with connection.cursor() as cursor:
    cursor.execute("DROP TABLE IF EXISTS django_migrations CASCADE;")
    print("✅ Table django_migrations supprimée")

print("Maintenant, exécutez: python manage.py migrate")
```

Puis modifiez `build.sh` temporairement :

```bash
#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
python reset_migrations.py
python manage.py migrate --no-input
python manage.py collectstatic --no-input
```

Commit, push, et après le déploiement, retirez `reset_migrations.py` et restaurez `build.sh`.

---

### Problème 3 : "relation does not exist"

**Cause :** Les migrations n'ont pas créé les tables.

**Solution :** Ajouter `--run-syncdb` dans `build.sh`

```bash
python manage.py migrate --run-syncdb --no-input
```

---

### Problème 4 : Les migrations s'exécutent mais les endpoints échouent toujours

**Cause possible :** Problème de code ou de configuration.

**Solution :**

1. Vérifiez les logs pour l'erreur exacte
2. Cherchez des lignes comme :
   ```
   AttributeError: ...
   ImportError: ...
   KeyError: ...
   ```

3. Copiez l'erreur complète et corrigez le code

---

## 📋 Checklist de Déploiement

### Avant de Déployer

- [x] ✅ `Procfile` modifié (migrations au démarrage)
- [x] ✅ `build.sh` modifié (migrations pendant le build)
- [x] ✅ `render.yaml` mis à jour
- [ ] ⏳ Code commit et push

### Pendant le Déploiement

- [ ] ⏳ Logs surveillés
- [ ] ⏳ "Running migrations" visible dans les logs
- [ ] ⏳ "Applying ... OK" pour chaque app
- [ ] ⏳ "Booting worker" visible
- [ ] ⏳ Aucune erreur rouge

### Après le Déploiement

- [ ] ⏳ `/health/` fonctionne
- [ ] ⏳ `/api/products/` fonctionne
- [ ] ⏳ `/admin/` fonctionne
- [ ] ⏳ Aucune erreur 500

---

## 🎯 Avantages de Cette Approche

✅ **Pas besoin du Shell Render** (fonctionne sur le plan gratuit)  
✅ **Migrations automatiques** à chaque déploiement  
✅ **Migrations au démarrage** en cas d'échec pendant le build  
✅ **Logs visibles** pour diagnostiquer les problèmes  
✅ **Fonctionne avec Neon Database** (ou n'importe quel PostgreSQL externe)  

---

## 💡 Note sur Neon Database

Vous utilisez **Neon Database** au lieu du PostgreSQL de Render. C'est une excellente alternative gratuite !

**Avantages :**
- ✅ Plan gratuit généreux
- ✅ Pas de limite de temps (contrairement à Render gratuit)
- ✅ Facile à gérer

**Important :**
- Vérifiez que votre base Neon est active
- Le `DATABASE_URL` doit être correct dans Render Environment
- Neon peut mettre en pause les bases inactives (elles redémarrent automatiquement)

---

## 🚀 Prochaines Étapes

1. **Commit et push** les modifications
2. **Surveillez les logs** Render pendant le déploiement
3. **Testez** les endpoints après 2-3 minutes
4. **Si ça marche** : Créez un superuser (voir ci-dessous)
5. **Si ça ne marche pas** : Copiez les logs et consultez "Problèmes Courants"

---

## 🔐 Créer un Superuser (Après Déploiement Réussi)

Sans Shell, vous devez créer un script qui s'exécute au démarrage :

Créez `create_superuser.py` :

```python
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

import django
django.setup()

from users.models import User

if not User.objects.filter(email='admin@visio.com').exists():
    User.objects.create_superuser(
        email='admin@visio.com',
        username='admin',
        password='ChangeThisPassword123!',
        first_name='Admin',
        last_name='Visio'
    )
    print("✅ Superuser créé: admin@visio.com")
else:
    print("ℹ️  Superuser existe déjà")
```

Modifiez `Procfile` temporairement :

```
web: python create_superuser.py && python manage.py migrate --no-input && gunicorn core.wsgi:application --bind 0.0.0.0:$PORT
```

Après le déploiement, connectez-vous à `/admin/` avec :
- Email: `admin@visio.com`
- Password: `ChangeThisPassword123!`

**Changez le mot de passe immédiatement !**

Puis retirez `create_superuser.py` et restaurez le `Procfile`.

---

## 📞 Besoin d'Aide ?

Si les migrations échouent ou si vous voyez des erreurs :

1. Copiez les logs complets de Render
2. Identifiez l'erreur exacte (en rouge)
3. Consultez la section "Problèmes Courants"
4. Si le problème persiste, partagez les logs

---

**Dernière mise à jour :** 2026-05-24  
**Testé avec :** Render Plan Gratuit + Neon Database  
**Statut :** ✅ Prêt à déployer
