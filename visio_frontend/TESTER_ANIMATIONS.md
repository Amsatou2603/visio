# 🎬 Comment Tester les Animations

## Démarrage Rapide

### 1. Lancer le serveur de développement

```bash
cd visio_frontend
npm start
```

Le site s'ouvrira sur `http://localhost:3000`

### 2. Observer le Curseur Personnalisé

**Sur desktop uniquement** (pas sur mobile/tactile) :

1. Déplacez votre souris sur la page
2. Vous devriez voir :
   - Un **anneau rouge** qui suit votre curseur avec un léger retard
   - Un **point rouge** au centre qui suit plus rapidement
   
3. Survolez un bouton ou un lien :
   - L'anneau s'agrandit (1.5x)
   - Un effet de glow apparaît
   - Un anneau orbital pulse autour

4. Testez sur différents éléments :
   - Boutons "Explorer le catalogue"
   - Liens de navigation
   - Cartes de produits
   - Inputs de formulaire

**Note :** Sur mobile/tactile, le curseur est automatiquement désactivé.

### 3. Tester les Animations de Scroll

#### Sur la page d'accueil (`/`)

**Scrollez lentement** et observez :

1. **Hero Section** (en haut)
   - Apparaît avec fade-up au chargement

2. **Avantages** (3 cartes)
   - S'animent de gauche à droite avec délai échelonné
   - Délai : 150ms entre chaque carte

3. **Catégories**
   - Apparaissent avec délai échelonné
   - Délai : 100ms entre chaque

4. **Produits Vedettes**
   - Grille animée avec délai échelonné
   - Délai : 80ms entre chaque produit

5. **Deck Section**
   - Zoom progressif (scale animation)

6. **CTA Vendeur** (en bas)
   - Rebond élastique (bounce animation)

#### Sur le Catalogue (`/catalogue`)

1. Scrollez vers le bas
2. Les produits apparaissent progressivement
3. Effet de cascade avec délai de 80ms entre chaque

#### Sur Partenaires (`/partenaires`)

1. Les cartes de vendeurs s'animent
2. Délai échelonné de 100ms

#### Sur une Page Produit

1. Allez sur un produit (cliquez sur n'importe quelle carte)
2. Observez :
   - Info produit glisse depuis la **gauche**
   - Images glissent depuis la **droite**
3. Scrollez vers "Produits similaires"
   - Animation échelonnée

### 4. Page de Démonstration (Optionnel)

Pour voir **TOUTES** les animations en un seul endroit :

1. Ajoutez la route dans `App.jsx` :

```jsx
import AnimationsDemo from './pages/AnimationsDemo';

// Dans <Routes>
<Route path="/animations-demo" element={<AnimationsDemo />} />
```

2. Accédez à `http://localhost:3000/animations-demo`

3. Scrollez pour voir chaque type d'animation :
   - Fade Up
   - Scale
   - Slide Left/Right
   - Flip
   - Blur
   - Rotate
   - Bounce
   - Stagger

## 🔍 Inspection Technique

### Vérifier que les animations fonctionnent

**Ouvrez les DevTools Chrome/Firefox :**

1. `F12` ou `Clic droit > Inspecter`

2. **Onglet Elements**
   - Scrollez sur la page
   - Inspectez un élément animé
   - Vous devriez voir les classes ajoutées :
     - `scroll-hidden` (avant animation)
     - `scroll-reveal-fade-up` (pendant/après)

3. **Onglet Console**
   - Aucune erreur ne devrait apparaître
   - Si erreurs, copiez-les pour debug

4. **Onglet Performance**
   - Enregistrez pendant le scroll
   - Vérifiez que FPS reste > 55fps
   - Les animations ne devraient pas ralentir la page

### Tester le Curseur dans DevTools

1. **Elements > custom-cursor**
   - Inspectez `.custom-cursor`
   - Devrait avoir `transform: translate(x, y)`
   
2. **Console**
   ```javascript
   // Vérifier que le curseur existe
   document.querySelector('.custom-cursor')
   document.querySelector('.custom-cursor-dot')
   ```

## 🧪 Tests de Compatibilité

### Test Mode Sombre

1. Cliquez sur l'icône theme toggle (lune/soleil)
2. Le curseur et animations doivent s'adapter
3. Couleurs doivent rester cohérentes

### Test Responsive

1. `F12` > Toggle device toolbar (Ctrl+Shift+M)
2. Testez différentes tailles :
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop (1920px)
3. Sur mobile (< 768px) :
   - Curseur ne devrait PAS apparaître
   - Animations fonctionnent normalement

### Test Prefers-Reduced-Motion

**Chrome/Edge :**
1. `F12` > `⋮` menu > More tools > Rendering
2. Cochez "Emulate CSS media feature prefers-reduced-motion"
3. Sélectionnez "prefers-reduced-motion: reduce"
4. Rechargez la page
5. **Les animations ne devraient plus se produire**

**Firefox :**
1. about:config
2. Chercher `ui.prefersReducedMotion`
3. Mettre à 1
4. Rechargez la page

## 🐛 Problèmes Courants

### Le curseur ne s'affiche pas

**Causes possibles :**

1. **Vous êtes sur mobile/tactile**
   - Normal, le curseur est désactivé
   
2. **Le curseur par défaut est visible**
   - Vérifiez dans CustomCursor.css que `body { cursor: none; }` est présent
   
3. **Erreur JavaScript**
   - Ouvrez la console (F12)
   - Vérifiez les erreurs

4. **Z-index trop bas**
   - Inspectez `.custom-cursor`
   - Devrait avoir `z-index: 99999`

### Les animations ne se déclenchent pas

**Causes possibles :**

1. **Prefers-reduced-motion actif**
   - Vérifiez dans DevTools > Rendering
   
2. **Threshold trop élevé**
   - L'élément doit être suffisamment visible
   
3. **Ref non attachée**
   - Vérifiez que `ref={animationRef}` est bien sur l'élément
   
4. **JavaScript désactivé**
   - Improbable mais vérifiez

5. **Élément trop haut dans la page**
   - Si l'élément est déjà visible au chargement
   - Normal, ajoutez `scroll-hidden` manuellement

### Performance dégradée

**Solutions :**

1. **Réduire le nombre d'animations simultanées**
   ```jsx
   // Au lieu de :
   const ref = useStaggerAnimation({ staggerDelay: 50 });
   
   // Essayez :
   const ref = useStaggerAnimation({ staggerDelay: 100 });
   ```

2. **Utiliser once: true**
   ```jsx
   const ref = useScrollAnimation({ once: true });
   ```

3. **Désactiver le curseur**
   ```jsx
   // Dans App.jsx, commentez :
   // <CustomCursor />
   ```

## 📊 Métriques de Performance

### FPS attendu
- Desktop : 60fps constant
- Mobile : > 55fps
- Pendant scroll : > 50fps

### Impact bundle
- +8KB gzipped
- Temps de chargement : +0.1s max

### Memory
- ~50KB additionnels
- Pas de memory leak (observers cleanup)

## ✅ Checklist de Test

Avant de valider, vérifiez :

- [ ] Curseur visible et fluide sur desktop
- [ ] Curseur invisible sur mobile
- [ ] Animations smooth au scroll
- [ ] Pas de saccades/lag
- [ ] Mode sombre fonctionne
- [ ] Responsive OK (320px → 4K)
- [ ] Prefers-reduced-motion respecté
- [ ] Aucune erreur console
- [ ] FPS > 50 pendant scroll
- [ ] Compatibilité Chrome/Firefox/Safari

## 🎯 Tests Avancés

### Test d'endurance

1. Scrollez de haut en bas 10 fois rapidement
2. Vérifiez que :
   - Pas de ralentissement
   - Pas de memory leak (DevTools > Memory)
   - Animations toujours fluides

### Test multi-onglets

1. Ouvrez 5 onglets avec le site
2. Scrollez sur chacun
3. Le curseur doit fonctionner sur tous

### Test après build production

```bash
npm run build
npx serve -s build
```

Testez sur `http://localhost:3000` (version optimisée)

## 📞 Support

Si vous rencontrez des problèmes :

1. Consultez `ANIMATIONS.md` pour la doc complète
2. Vérifiez la console pour erreurs
3. Testez sur `/animations-demo` pour isoler le problème
4. Comparez avec les exemples dans `AnimationsDemo.jsx`

## 🎨 Personnalisation

Pour modifier les animations pendant les tests :

### Changer la vitesse
Dans `index.css` :
```css
.scroll-reveal-fade-up {
  animation: scrollFadeUp 0.3s ease; /* Plus rapide */
}
```

### Changer la couleur du curseur
Dans `CustomCursor.css` :
```css
.cursor-ring {
  border: 2px solid blue; /* Votre couleur */
}
```

### Désactiver temporairement
Dans le composant :
```jsx
// Commentez la ligne :
// const ref = useScrollAnimation(...);

// Et attachez une ref normale :
const ref = useRef();
```

---

**Bon test ! 🚀**
