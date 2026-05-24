# 🚨 SOLUTION IMMÉDIATE - Erreur 500 sur /api/products/

## 📊 Situation Actuelle

✅ `/health/` fonctionne → Le serveur tourne  
❌ `/api/products/` erreur 500 → Les tables DB n'existent pas  
❌ `/admin/` erreur 500 → Les tables DB n'existent pas  

**Diagnostic : Les migrations n'ont pas été appliquées sur PostgreSQL Render**

---

## 🔧 SOLUTION RAPIDE (5 minutes)

### Étape 1 : Consulter les Logs Render

1. Allez sur https://dashboard.render.com
2. Sélectionnez votre service `visio-backend-sp1h`
3. Cliquez sur **"Logs"**
4. Cherchez ces lignes :

**Si vous voyez ça (BIEN) :**
```
==> Running release command: python manage.py migrate --no-input
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  Applying users.0001_initial... OK
  ...
```

**Si vous voyez ça (PROBLÈME) :**
```
django.db.utils.OperationalError: FATAL: password authentication failed
```
ou
```
No migrations to apply.
```
ou rien du tout concernant les migrations.

---

### Étape 2 : Forcer les Migrations Manuellement

1. **Ouvrez le Shell Render**
   - Dashboard → Votre service → **"Shell"** (dans le menu)
   - Attendez que le terminal s'ouvre (30 secondes)

2. **Exécutez ces commandes :**

```bash
# 1. Vérifier la connexion à la base de données
python manage.py check --database default

# 2. Voir l'état des migrations
python manage.py showmigrations

# 3. Appliquer TOUTES les migrations
python manage.py migrate --run-syncdb

# 4. Vérifier que ça a marché
python manage.py showmigrations
```

**Résultat attendu :**
```
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  Applying users.0001_initial... OK
  Applying products.0001_initial... OK
  Applying orders.0001_initial... OK
  Applying payments.0001_initial... OK
  Applying reviews.0001_initial... OK
  ...
```

3. **Fermez le Shell**

---

### Étape 3 : Redémarrer le Service

Après avoir appliqué les migrations :

1. Retournez à la page principale du service
2. Cliquez sur **"Manual Deploy"**
3. Sélectionnez **"Clear build cache & deploy"**
4. Attendez 2-3 minutes

---

### Étape 4 : Tester

```bash
python check_deployment.py
```

Ou testez manuellement :
- https://visio-backend-sp1h.onrender.com/health/ → `{"status": "ok"}`
- https://visio-backend-sp1h.onrender.com/api/products/ → Liste des produits (ou `[]`)
- https://visio-backend-sp1h.onrender.com/admin/ → Page de connexion Django

---

## 🔍 Si les Migrations Échouent

### Erreur : "password authentication failed"

**Cause :** PostgreSQL n'est pas correctement attaché.

**Solution :**
1. Dashboard Render → Votre service
2. Vérifiez qu'il y a une section **"PostgreSQL"**
3. Si absente :
   - Cliquez sur **"New +"** → **"PostgreSQL"**
   - Créez une base de données
   - Attachez-la à votre service web
   - Redéployez

### Erreur : "relation does not exist"

**Cause :** Les migrations n'ont pas créé les tables.

**Solution :**
```bash
python manage.py migrate --run-syncdb --fake-initial
```

### Erreur : "No migrations to apply" mais les tables n'existent pas

**Cause :** Django pense que les migrations sont appliquées mais elles ne le sont pas.

**Solution :**
```bash
# Réinitialiser l'historique des migrations
python manage.py migrate --fake users zero
python manage.py migrate --fake products zero
python manage.py migrate --fake orders zero
python manage.py migrate --fake payments zero
python manage.py migrate --fake reviews zero

# Réappliquer toutes les migrations
python manage.py migrate --run-syncdb
```

---

## 📋 Checklist de Vérification

Avant de continuer, vérifiez :

### Sur Render Dashboard → Environment

- [ ] `DJANGO_ENV=production` est défini
- [ ] `SECRET_KEY=<votre-clé>` est défini
- [ ] `PYTHON_VERSION=3.11.0` est défini
- [ ] `DATABASE_URL` existe (créé automatiquement par PostgreSQL)

### Sur Render Dashboard → PostgreSQL

- [ ] Une base de données PostgreSQL est créée
- [ ] Elle est attachée à votre service web
- [ ] Le statut est "Available"

### Dans les Logs

- [ ] Vous voyez "Running migrations..."
- [ ] Vous voyez "Applying ... OK" pour chaque app
- [ ] Vous voyez "Booting worker with pid"
- [ ] Aucune erreur rouge

---

## 🎯 Commandes Utiles dans le Shell Render

```bash
# Vérifier la configuration
python manage.py check

# Voir les variables d'environnement
env | grep DJANGO
env | grep DATABASE

# Lister les tables de la base de données
python manage.py dbshell
\dt
\q

# Créer un superuser (après migrations)
python manage.py createsuperuser

# Collecter les fichiers statiques
python manage.py collectstatic --no-input
```

---

## 💡 Pourquoi le Health Check Fonctionne mais pas l'API ?

Le health check (`/health/`) est une simple fonction qui retourne du JSON :

```python
def health_check(request):
    return JsonResponse({'status': 'ok', 'service': 'visio-backend'})
```

Elle ne touche **PAS** à la base de données.

Mais `/api/products/` doit :
1. Se connecter à PostgreSQL
2. Lire la table `products_product`
3. Retourner les données

Si la table n'existe pas → **Erreur 500**

---

## 🚀 Résumé en 3 Étapes

1. **Ouvrez le Shell Render**
2. **Exécutez :** `python manage.py migrate --run-syncdb`
3. **Testez :** `python check_deployment.py`

C'est tout ! 🎉

---

## 🆘 Si Ça Ne Marche Toujours Pas

Copiez les logs complets de Render et les erreurs du Shell, et je pourrai vous aider davantage.

**Commandes pour obtenir les logs :**

```bash
# Dans le Shell Render
python manage.py migrate --run-syncdb --verbosity 3
```

Copiez toute la sortie.

---

**Dernière mise à jour :** 2026-05-24  
**Temps estimé :** 5 minutes  
**Difficulté :** Facile
