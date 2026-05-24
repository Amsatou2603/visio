# Guide de Déploiement sur Render

## 🔧 Configuration des Variables d'Environnement sur Render

Allez dans votre service Render → **Environment** et ajoutez ces variables :

### Variables Obligatoires :

```
DJANGO_ENV=production
SECRET_KEY=votre-cle-secrete-tres-longue-et-aleatoire-minimum-50-caracteres
PYTHON_VERSION=3.11.0
```

### Variables Optionnelles (Cloudinary) :

```
CLOUDINARY_CLOUD_NAME=votre-cloud-name
CLOUDINARY_API_KEY=votre-api-key
CLOUDINARY_API_SECRET=votre-api-secret
```

### Variables pour CORS (Frontend) :

```
CORS_ALLOWED_ORIGINS=https://votre-frontend.vercel.app,https://votre-domaine.com
```

**Note:** Render crée automatiquement `DATABASE_URL` pour PostgreSQL.

---

## 🚀 Étapes de Déploiement

### 1. Vérifier les logs Render

Après le déploiement, consultez les logs dans l'onglet **Logs** de Render pour voir les erreurs exactes.

### 2. Commandes utiles

Pour forcer une nouvelle migration :
```bash
python manage.py migrate --run-syncdb
```

Pour créer un superuser en production :
```bash
python manage.py createsuperuser
```

### 3. Tester le déploiement

- Health check : `https://visio-backend-sp1h.onrender.com/health/`
- Admin : `https://visio-backend-sp1h.onrender.com/admin/`
- API : `https://visio-backend-sp1h.onrender.com/api/products/`

---

## 🐛 Résolution des Problèmes Courants

### Erreur 500 - Server Error

**Causes possibles :**

1. **Variables d'environnement manquantes**
   - Vérifiez que `DJANGO_ENV=production` est défini
   - Vérifiez que `SECRET_KEY` est défini

2. **Base de données non migrée**
   - Les migrations s'exécutent automatiquement via le `Procfile`
   - Vérifiez les logs pour voir si les migrations ont réussi

3. **Cloudinary mal configuré**
   - Si vous n'utilisez pas Cloudinary, ne définissez pas les variables
   - Le système utilisera le stockage local par défaut

4. **App 'sitemaps' manquante**
   - Corrigé : utilisation d'un sitemap simple au lieu du module Django

### Erreur de connexion à la base de données

- Render crée automatiquement `DATABASE_URL`
- Vérifiez que PostgreSQL est bien attaché à votre service

### Static files non trouvés

- Les fichiers statiques sont gérés par WhiteNoise
- `collectstatic` s'exécute automatiquement via `build.sh`

---

## 📊 Monitoring

### Voir les logs en temps réel

Dans Render Dashboard → Votre Service → **Logs**

### Logs importants à surveiller :

```
✅ "Booting worker with pid"  → Gunicorn a démarré
✅ "Applying migration"       → Migrations en cours
❌ "ModuleNotFoundError"      → Dépendance manquante
❌ "OperationalError"         → Problème de base de données
```

---

## 🔐 Sécurité

### Générer une SECRET_KEY sécurisée :

```python
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Checklist de sécurité :

- ✅ `DEBUG=False` en production
- ✅ `SECRET_KEY` unique et sécurisée
- ✅ `ALLOWED_HOSTS` configuré
- ✅ HTTPS activé (automatique sur Render)
- ✅ CORS configuré pour votre frontend uniquement

---

## 📝 Prochaines Étapes

1. Configurer les variables d'environnement sur Render
2. Redéployer le service
3. Vérifier les logs
4. Tester les endpoints
5. Créer un superuser pour accéder à l'admin

---

## 🆘 Besoin d'aide ?

Si l'erreur persiste :

1. Copiez les logs complets de Render
2. Vérifiez que toutes les variables d'environnement sont définies
3. Testez localement avec `DJANGO_ENV=production`
