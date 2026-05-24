# 🔐 Créer un Superuser en Production

## 📊 Problème

Vous essayez de vous connecter à `/admin/` mais ça ne marche pas.

**Cause :** Aucun utilisateur n'existe dans la base de données PostgreSQL de production.

---

## ✅ SOLUTION : Créer Automatiquement un Superuser

### Méthode 1 : Via le Dashboard Render (Recommandé)

#### Étape 1 : Mettre à Jour le Start Command

1. Allez sur https://dashboard.render.com
2. Cliquez sur **visio-backend-sp1h**
3. Cliquez sur **Settings**
4. Cherchez **"Start Command"**
5. Remplacez par :

```bash
python create_superuser.py && python manage.py migrate --no-input && gunicorn core.wsgi:application --bind 0.0.0.0:$PORT --log-level info
```

6. Cliquez sur **"Save Changes"**

#### Étape 2 : Commit et Push

```bash
git add .
git commit -m "feat: Création automatique du superuser au démarrage"
git push origin main
```

#### Étape 3 : Surveiller les Logs

Après le redéploiement, dans les logs vous devriez voir :

```
✅ Superuser créé avec succès!
   Email: admin@visio.com
   Password: Admin123!Visio
   ⚠️  CHANGEZ CE MOT DE PASSE IMMÉDIATEMENT!
```

Ou si le superuser existe déjà :

```
ℹ️  Un superuser existe déjà
```

#### Étape 4 : Se Connecter

1. Allez sur : https://visio-backend-sp1h.onrender.com/admin/
2. Connectez-vous avec :
   - **Email :** `admin@visio.com`
   - **Password :** `Admin123!Visio`

#### Étape 5 : CHANGER LE MOT DE PASSE IMMÉDIATEMENT

1. Une fois connecté, cliquez sur votre nom en haut à droite
2. Cliquez sur **"Change password"**
3. Changez le mot de passe
4. Sauvegardez

---

## 🔒 Sécurité Importante

### ⚠️ CHANGEZ LE MOT DE PASSE PAR DÉFAUT

Le mot de passe `Admin123!Visio` est **temporaire** et **visible dans le code**.

**Après la première connexion :**
1. Changez-le immédiatement dans l'admin Django
2. Ou supprimez le script `create_superuser.py` après utilisation

### 🔐 Mot de Passe Sécurisé

Utilisez un mot de passe fort :
- Au moins 12 caractères
- Majuscules et minuscules
- Chiffres et caractères spéciaux
- Exemple : `V!s10@Adm1n2024$ecure`

---

## 🎯 Méthode 2 : Créer un Superuser Personnalisé

Si vous voulez un email/mot de passe différent, modifiez `create_superuser.py` :

```python
User.objects.create_superuser(
    email='votre-email@example.com',      # ← Changez ici
    username='votre_username',             # ← Changez ici
    password='VotreMotDePasseSecurise',    # ← Changez ici
    first_name='Votre',
    last_name='Nom',
    role='admin'
)
```

Puis commit et push.

---

## 🧹 Après la Création du Superuser

### Option A : Garder le Script (Recommandé)

Le script vérifie si un superuser existe avant d'en créer un. Il est donc **sûr** de le garder.

**Avantages :**
- Si vous réinitialisez la base de données, le superuser sera recréé automatiquement
- Utile pour les environnements de staging/test

### Option B : Supprimer le Script

Si vous préférez supprimer le script après utilisation :

1. **Supprimez `create_superuser.py`**
2. **Modifiez le Start Command sur Render :**
   ```bash
   python manage.py migrate --no-input && gunicorn core.wsgi:application --bind 0.0.0.0:$PORT --log-level info
   ```
3. **Commit et push**

---

## 🆘 Problèmes Courants

### Problème 1 : "Un superuser existe déjà" mais je ne peux pas me connecter

**Cause :** Le superuser existe mais avec un autre email/mot de passe.

**Solution :**

Modifiez `create_superuser.py` pour réinitialiser le mot de passe :

```python
def create_superuser():
    admin_email = 'admin@visio.com'
    
    # Réinitialiser le mot de passe si l'utilisateur existe
    try:
        user = User.objects.get(email=admin_email)
        user.set_password('Admin123!Visio')
        user.is_superuser = True
        user.is_staff = True
        user.save()
        print(f"✅ Mot de passe réinitialisé pour {admin_email}")
    except User.DoesNotExist:
        # Créer le superuser
        User.objects.create_superuser(
            email=admin_email,
            username='admin',
            password='Admin123!Visio',
            first_name='Admin',
            last_name='Visio',
            role='admin'
        )
        print(f"✅ Superuser créé: {admin_email}")
```

### Problème 2 : Erreur "UNIQUE constraint failed"

**Cause :** Un utilisateur avec cet email existe déjà.

**Solution :** Changez l'email dans `create_superuser.py` ou utilisez la solution du Problème 1.

### Problème 3 : Le script ne s'exécute pas

**Cause :** Le Start Command n'a pas été mis à jour sur Render Dashboard.

**Solution :** Vérifiez que le Start Command contient `python create_superuser.py`.

---

## 📋 Checklist

### Configuration

- [ ] `create_superuser.py` créé
- [ ] Start Command mis à jour sur Render Dashboard
- [ ] Code commit et push
- [ ] Redéploiement terminé

### Logs

- [ ] "Superuser créé avec succès" visible dans les logs
- [ ] Ou "Un superuser existe déjà"
- [ ] Aucune erreur

### Connexion

- [ ] `/admin/` accessible
- [ ] Connexion réussie avec admin@visio.com
- [ ] Mot de passe changé immédiatement

---

## 💡 Astuce : Créer Plusieurs Utilisateurs

Vous pouvez modifier le script pour créer plusieurs utilisateurs :

```python
def create_users():
    users = [
        {
            'email': 'admin@visio.com',
            'username': 'admin',
            'password': 'Admin123!',
            'is_superuser': True,
            'role': 'admin'
        },
        {
            'email': 'vendeur@visio.com',
            'username': 'vendeur',
            'password': 'Vendeur123!',
            'is_superuser': False,
            'role': 'seller'
        },
    ]
    
    for user_data in users:
        if not User.objects.filter(email=user_data['email']).exists():
            if user_data['is_superuser']:
                User.objects.create_superuser(**user_data)
            else:
                User.objects.create_user(**user_data)
            print(f"✅ Utilisateur créé: {user_data['email']}")
```

---

## 🎯 Résumé

1. **Mettez à jour le Start Command** sur Render Dashboard
2. **Commit et push** le code
3. **Surveillez les logs** pour voir la création du superuser
4. **Connectez-vous** à `/admin/` avec `admin@visio.com`
5. **Changez le mot de passe** immédiatement

---

**Dernière mise à jour :** 2026-05-24  
**Sécurité :** ⚠️ Changez le mot de passe par défaut !  
**Statut :** ✅ Prêt à déployer
