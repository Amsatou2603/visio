# 🔧 Configuration Manuelle sur Render Dashboard

## 🚨 Problème

Le build réussit mais les migrations ne s'exécutent pas dans les logs.

**Cause probable :** Render n'utilise pas `render.yaml` ou `build.sh`. Il utilise la configuration du Dashboard.

---

## ✅ SOLUTION : Configurer Manuellement sur le Dashboard

### Étape 1 : Aller sur Render Dashboard

1. Allez sur https://dashboard.render.com
2. Cliquez sur votre service **visio-backend-sp1h**
3. Cliquez sur **"Settings"** (dans le menu de gauche)

---

### Étape 2 : Mettre à Jour le Build Command

Cherchez la section **"Build & Deploy"**

**Build Command :**
```bash
pip install -r requirements.txt && python manage.py migrate --no-input --verbosity 2 && python manage.py collectstatic --no-input
```

**Copiez-collez exactement cette commande !**

---

### Étape 3 : Mettre à Jour le Start Command

Dans la même section **"Build & Deploy"**

**Start Command :**
```bash
python manage.py migrate --no-input && gunicorn core.wsgi:application --bind 0.0.0.0:$PORT --log-level info
```

**Copiez-collez exactement cette commande !**

---

### Étape 4 : Vérifier le Root Directory

Dans la section **"Build & Deploy"**

**Root Directory :**
```
visio_backend
```

Si c'est vide ou différent, mettez `visio_backend`.

---

### Étape 5 : Sauvegarder

1. Cliquez sur **"Save Changes"** en bas de la page
2. Render va automatiquement redéployer

---

### Étape 6 : Surveiller les Logs

1. Cliquez sur **"Logs"** (dans le menu de gauche)
2. Attendez de voir :

```
==> Building...
Collecting Django==4.2.30
...
Successfully installed ...

Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  Applying users.0001_initial... OK
  Applying products.0001_initial... OK
  Applying orders.0001_initial... OK
  Applying payments.0001_initial... OK
  Applying reviews.0001_initial... OK
  ...

Collecting static files...
...

==> Build successful!

==> Starting service...
Running migrations:
  No migrations to apply.
Booting worker with pid: 123
Listening at: http://0.0.0.0:10000
```

---

## 🎯 Résumé des Commandes

### Build Command (pendant le build)
```bash
pip install -r requirements.txt && python manage.py migrate --no-input --verbosity 2 && python manage.py collectstatic --no-input
```

### Start Command (au démarrage)
```bash
python manage.py migrate --no-input && gunicorn core.wsgi:application --bind 0.0.0.0:$PORT --log-level info
```

### Root Directory
```
visio_backend
```

---

## 🔍 Vérification

Après le redéploiement, vérifiez dans les logs :

### ✅ Ce que vous DEVEZ voir :

**Pendant le Build :**
```
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  ...
```

**Au Démarrage :**
```
Running migrations:
  No migrations to apply.
Booting worker with pid: 123
```

### ❌ Si vous ne voyez toujours pas les migrations :

**Problème 1 : Erreur de connexion DB**
```
django.db.utils.OperationalError: could not connect to server
```

**Solution :**
1. Vérifiez que `DATABASE_URL` est correct dans Environment
2. Testez la connexion à Neon Database

**Problème 2 : Migrations silencieuses**

Parfois les migrations s'exécutent mais sans affichage. Vérifiez en testant :
```
https://visio-backend-sp1h.onrender.com/api/products/
```

Si ça fonctionne (pas d'erreur 500), les migrations ont réussi !

---

## 🆘 Si Ça Ne Marche Toujours Pas

### Option 1 : Forcer un Clear Build Cache

1. Dashboard → Settings
2. Cherchez **"Clear build cache & deploy"**
3. Cliquez dessus
4. Attendez le redéploiement complet

### Option 2 : Vérifier la Base de Données Neon

1. Allez sur https://console.neon.tech
2. Vérifiez que votre base de données est **Active**
3. Si elle est en pause, elle redémarrera automatiquement
4. Copiez le **Connection String** et vérifiez qu'il correspond à `DATABASE_URL` sur Render

### Option 3 : Créer un Nouveau Service

Si rien ne fonctionne, créez un nouveau service Render :

1. Dashboard Render → **New +** → **Web Service**
2. Connectez votre repo GitHub
3. Configurez :
   - **Name :** visio-backend-v2
   - **Root Directory :** visio_backend
   - **Build Command :** (copiez la commande ci-dessus)
   - **Start Command :** (copiez la commande ci-dessus)
4. Ajoutez les variables d'environnement
5. Déployez

---

## 📋 Checklist de Configuration

### Settings → Build & Deploy

- [ ] **Root Directory :** `visio_backend`
- [ ] **Build Command :** Contient `python manage.py migrate`
- [ ] **Start Command :** Contient `python manage.py migrate`
- [ ] **Auto-Deploy :** Activé (Yes)

### Settings → Environment

- [ ] `DJANGO_ENV=production`
- [ ] `SECRET_KEY=<votre-clé>`
- [ ] `DATABASE_URL=postgresql://...` (Neon Database)
- [ ] `PYTHON_VERSION=3.11.0`
- [ ] `ALLOWED_HOSTS=visio-backend-sp1h.onrender.com`
- [ ] `CORS_ALLOWED_ORIGINS=https://visio-ten.vercel.app`

### Logs

- [ ] "Running migrations" visible pendant le build
- [ ] "Applying ... OK" pour chaque app
- [ ] "Booting worker" visible au démarrage
- [ ] Aucune erreur rouge

---

## 💡 Pourquoi Configurer Manuellement ?

**Render peut ignorer `render.yaml` si :**
1. Le service a été créé manuellement (pas via "Infrastructure as Code")
2. Des modifications ont été faites dans le Dashboard
3. Le fichier `render.yaml` n'est pas à la racine du repo

**La configuration manuelle via le Dashboard est plus fiable !**

---

## 🎯 Prochaines Étapes

1. **Configurez** les commandes dans le Dashboard (étapes ci-dessus)
2. **Sauvegardez** et attendez le redéploiement
3. **Surveillez** les logs pour voir les migrations
4. **Testez** les endpoints après 2-3 minutes

---

## 📞 Besoin d'Aide ?

Si après avoir configuré manuellement les commandes, vous ne voyez toujours pas les migrations :

1. Copiez les logs complets de Render
2. Vérifiez que `DATABASE_URL` est correct
3. Testez la connexion à Neon Database
4. Essayez "Clear build cache & deploy"

---

**Dernière mise à jour :** 2026-05-24  
**Méthode :** Configuration manuelle via Dashboard  
**Statut :** ✅ Solution la plus fiable
