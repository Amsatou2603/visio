# 🔧 Troubleshooting - Erreurs 500 sur les Endpoints

## 🚨 Problème Actuel

Les endpoints suivants échouent avec une erreur 500 :
- ❌ `/api/auth/register/` - API Auth
- ❌ `/admin/` - Admin Django  
- ❌ `/api/products/` - API Products

Mais le health check fonctionne :
- ✅ `/health/` - Health Check

---

## 🔍 Causes Possibles

### 1. Variables d'Environnement Manquantes sur Render

**Symptôme:** Les endpoints qui nécessitent la base de données échouent.

**Solution:**

Vérifiez que ces variables sont définies sur Render :

```
DJANGO_ENV=production
SECRET_KEY=<votre-clé-générée>
PYTHON_VERSION=3.11.0
```

**Comment vérifier:**
1. Allez sur https://dashboard.render.com
2. Sélectionnez votre service `visio-backend-sp1h`
3. Cliquez sur **Environment**
4. Vérifiez que les 3 variables ci-dessus sont présentes

**Si elles manquent:**
1. Générez une SECRET_KEY : `python generate_secret_key.py`
2. Ajoutez les variables sur Render
3. Redéployez (automatique après sauvegarde)

---

### 2. Migrations Non Appliquées

**Symptôme:** Erreurs de type "no such table" ou "relation does not exist".

**Solution:**

Les migrations devraient s'exécuter automatiquement via le `Procfile`, mais vérifiez dans les logs Render :

**Cherchez dans les logs:**
```
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  Applying users.0001_initial... OK
  ...
```

**Si les migrations n'ont pas été appliquées:**

1. Allez dans le Shell Render (Dashboard → Shell)
2. Exécutez :
   ```bash
   python manage.py migrate --run-syncdb
   ```

---

### 3. Erreur d'Import dans products/views.py

**Symptôme:** ImportError pour `IsSellerOrAdmin`.

**Solution:** ✅ **DÉJÀ CORRIGÉ**

J'ai corrigé l'import dans `products/views.py` :
```python
# Avant (incorrect)
from users.permissions import IsSellerOrAdmin

# Après (correct)
from .permissions import IsSellerOrAdmin
```

---

### 4. Base de Données Non Connectée

**Symptôme:** Erreurs de connexion à PostgreSQL.

**Solution:**

Vérifiez que PostgreSQL est attaché à votre service Render :

1. Dashboard Render → Votre service
2. Vérifiez qu'il y a une section "PostgreSQL"
3. Si absent, ajoutez une base de données :
   - Cliquez sur "New +" → "PostgreSQL"
   - Connectez-la à votre service

**Note:** Render crée automatiquement la variable `DATABASE_URL`.

---

### 5. Cloudinary Non Configuré (Optionnel)

**Symptôme:** Erreurs lors de l'upload d'images.

**Solution:** ✅ **DÉJÀ CORRIGÉ**

Le code vérifie maintenant si Cloudinary est configuré avant de l'utiliser. Si les credentials ne sont pas fournis, il utilise le stockage local.

**Pour activer Cloudinary (optionnel):**
```
CLOUDINARY_CLOUD_NAME=<votre-cloud-name>
CLOUDINARY_API_KEY=<votre-api-key>
CLOUDINARY_API_SECRET=<votre-api-secret>
```

---

## 🛠️ Actions de Diagnostic

### Étape 1: Vérifier les Logs Render

1. Allez sur Dashboard Render → Logs
2. Cherchez les erreurs en rouge
3. Identifiez le type d'erreur :

**Types d'erreurs courants:**

| Erreur | Cause | Solution |
|--------|-------|----------|
| `ImproperlyConfigured` | Variable d'environnement manquante | Ajoutez la variable sur Render |
| `OperationalError` | Base de données non accessible | Vérifiez PostgreSQL |
| `ProgrammingError: relation does not exist` | Migrations non appliquées | Exécutez `migrate` |
| `ModuleNotFoundError` | Dépendance manquante | Vérifiez `requirements.txt` |
| `ImportError` | Import incorrect | Vérifiez les imports dans le code |

---

### Étape 2: Tester Localement

Avant de redéployer, testez localement en mode production :

```bash
# Test complet
python diagnose_errors.py

# Test de production
python test_production.py
```

Ces scripts vous diront exactement ce qui ne va pas.

---

### Étape 3: Vérifier les Endpoints Individuellement

Une fois déployé, testez chaque endpoint :

```bash
# Avec le script
python check_deployment.py

# Ou manuellement avec curl
curl https://visio-backend-sp1h.onrender.com/health/
curl https://visio-backend-sp1h.onrender.com/api/products/
curl https://visio-backend-sp1h.onrender.com/admin/
```

---

## 📋 Checklist de Résolution

Suivez cette checklist dans l'ordre :

### Sur Render Dashboard

- [ ] **Variables d'environnement définies**
  - [ ] `DJANGO_ENV=production`
  - [ ] `SECRET_KEY=<votre-clé>`
  - [ ] `PYTHON_VERSION=3.11.0`

- [ ] **PostgreSQL attaché**
  - [ ] Base de données créée
  - [ ] Connectée au service
  - [ ] `DATABASE_URL` présent dans Environment

- [ ] **Déploiement réussi**
  - [ ] Build terminé sans erreur
  - [ ] "Booting worker with pid" dans les logs
  - [ ] Aucune erreur rouge dans les logs

### Tests

- [ ] **Health check fonctionne**
  - [ ] `/health/` retourne `{"status": "ok"}`

- [ ] **Admin accessible**
  - [ ] `/admin/` affiche la page de connexion

- [ ] **API fonctionne**
  - [ ] `/api/products/` retourne des données ou 200 OK
  - [ ] `/api/auth/register/` retourne les champs requis

---

## 🔍 Commandes de Diagnostic sur Render

Si vous avez accès au Shell Render :

```bash
# Vérifier les migrations
python manage.py showmigrations

# Appliquer les migrations
python manage.py migrate

# Vérifier la configuration
python manage.py check

# Collecter les fichiers statiques
python manage.py collectstatic --no-input

# Créer un superuser
python manage.py createsuperuser

# Tester la connexion DB
python manage.py dbshell
```

---

## 📊 Interpréter les Logs Render

### Logs de Succès (✅)

```
==> Building...
==> Installing dependencies...
==> Collecting static files...
==> Running migrations...
==> Starting server...
Booting worker with pid: 123
Listening at: http://0.0.0.0:10000
```

### Logs d'Erreur (❌)

**Erreur de variable manquante:**
```
django.core.exceptions.ImproperlyConfigured: 
The SECRET_KEY setting must not be empty.
```
→ **Solution:** Ajoutez `SECRET_KEY` dans Environment

**Erreur de base de données:**
```
django.db.utils.OperationalError: 
could not connect to server
```
→ **Solution:** Vérifiez que PostgreSQL est attaché

**Erreur de migration:**
```
django.db.utils.ProgrammingError: 
relation "users_user" does not exist
```
→ **Solution:** Exécutez `python manage.py migrate`

**Erreur d'import:**
```
ModuleNotFoundError: No module named 'cloudinary'
```
→ **Solution:** Vérifiez `requirements.txt`

---

## 🚀 Solution Rapide (Quick Fix)

Si vous voulez résoudre rapidement :

### 1. Générer SECRET_KEY
```bash
python generate_secret_key.py
```

### 2. Configurer Render
Ajoutez sur Render → Environment :
```
DJANGO_ENV=production
SECRET_KEY=<copiez-la-clé-générée>
PYTHON_VERSION=3.11.0
```

### 3. Forcer les Migrations
Dans Shell Render :
```bash
python manage.py migrate --run-syncdb
```

### 4. Redémarrer le Service
Dashboard Render → Manual Deploy → Deploy latest commit

### 5. Vérifier
```bash
python check_deployment.py
```

---

## 💡 Conseils Importants

1. **Logs = Votre Meilleur Ami**
   - Consultez TOUJOURS les logs Render en premier
   - Les erreurs y sont très explicites

2. **Testez Localement d'Abord**
   - Utilisez `diagnose_errors.py` avant de déployer
   - Ça vous fait gagner du temps

3. **Variables d'Environnement**
   - Vérifiez qu'elles sont TOUTES définies
   - Une seule variable manquante peut tout casser

4. **Migrations**
   - Elles doivent s'exécuter automatiquement
   - Si ce n'est pas le cas, exécutez-les manuellement

5. **Cold Start**
   - Le premier appel peut prendre 30-60 secondes
   - C'est normal sur Render (plan gratuit)

---

## 🆘 Si Rien Ne Fonctionne

1. **Copiez les logs complets de Render**
2. **Exécutez localement:**
   ```bash
   python diagnose_errors.py
   ```
3. **Vérifiez que vous avez bien:**
   - Commit et push les corrections
   - Configuré les 3 variables obligatoires
   - Attendu la fin du déploiement

4. **Essayez de redéployer:**
   - Dashboard → Manual Deploy
   - Attendez 2-3 minutes
   - Vérifiez les logs

---

## 📞 Ressources

- **Logs Render:** https://dashboard.render.com → Votre service → Logs
- **Guide complet:** Voir `DEPLOY_RENDER.md`
- **Plan d'action:** Voir `ACTION_PLAN.md`
- **Diagnostic local:** `python diagnose_errors.py`

---

**Dernière mise à jour:** 2026-05-24  
**Statut:** Corrections appliquées, en attente de configuration Render
