Visio Mobile (Flutter)

Ce répertoire contient un squelette d'application mobile Flutter.

Pré-requis:
- Flutter SDK installé (https://flutter.dev)

Installation rapide:

1. Copier les icônes du frontend dans `visio_mobile/assets/images/` :
   - `../visio_frontend/public/logo192.png` -> `assets/images/logo192.png`
   - `../visio_frontend/public/logo512.png` -> `assets/images/logo512.png`
   - `../visio_frontend/public/og-image.png` -> `assets/images/og-image.png`

2. Installer les dépendances et lancer l'app:

```bash
cd visio_mobile
flutter pub get
flutter run
```

Configuration API:
- Le client utilise par défaut `http://127.0.0.1:8000/api`.
- Pour changer l'URL à la compilation:

```bash
flutter run --dart-define=VISIO_API_URL=https://visio-backend-sp1h.onrender.com/api
```

Prochaines étapes recommandées:
- Ajouter l'authentification (JWT) et stockage local des tokens.
- Implémenter les écrans produit/checkout complets.
- Ajouter icônes et splash screen natif pour Android/iOS.
