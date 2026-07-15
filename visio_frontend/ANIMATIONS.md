# Guide des Animations Visio

Ce document décrit le système d'animations implémenté dans Visio pour améliorer l'expérience utilisateur.

## 🎨 Curseur Personnalisé

### Fonctionnalités
- **Curseur spatial** avec anneau et point central
- **Animation fluide** avec effet de retard (smooth follow)
- **Effet hover** sur les éléments cliquables (liens, boutons, inputs)
- **Anneau orbital** qui apparaît au survol
- **Mix-blend-mode** pour s'adapter aux différents arrière-plans
- **Désactivation automatique** sur les appareils tactiles

### Utilisation
Le curseur est automatiquement activé dans `App.jsx`. Aucune configuration supplémentaire nécessaire.

```jsx
import CustomCursor from './components/CustomCursor';

// Dans App.jsx
<CustomCursor />
```

### Personnalisation
Pour modifier les couleurs ou le comportement, éditez `CustomCursor.css` :
- Couleur principale : `rgba(230, 57, 70, 0.8)` (rouge Visio)
- Taille de l'anneau : `36px`
- Taille du point : `6px`

## 📜 Animations de Scroll

### Hooks Disponibles

#### 1. `useScrollAnimation(options)`
Anime un élément unique lorsqu'il entre dans le viewport.

**Options :**
```javascript
{
  threshold: 0.1,              // % de l'élément visible pour déclencher
  rootMargin: '0px',           // Marge autour du viewport
  animationClass: 'scroll-reveal', // Classe CSS à appliquer
  once: true                   // Ne jouer qu'une seule fois
}
```

**Exemple :**
```jsx
const heroRef = useScrollAnimation({ 
  animationClass: 'scroll-reveal-fade-up' 
});

return <section ref={heroRef}>...</section>
```

#### 2. `useStaggerAnimation(options)`
Anime les enfants d'un conteneur avec un délai échelonné.

**Options :**
```javascript
{
  threshold: 0.1,              // % du conteneur visible
  staggerDelay: 100,           // Délai en ms entre chaque enfant
  animationClass: 'scroll-reveal-stagger'
}
```

**Exemple :**
```jsx
const cardsRef = useStaggerAnimation({ staggerDelay: 150 });

return (
  <div ref={cardsRef}>
    <div>Card 1</div> {/* Anime en premier */}
    <div>Card 2</div> {/* +150ms */}
    <div>Card 3</div> {/* +300ms */}
  </div>
);
```

#### 3. `useParallax(speed)`
Crée un effet parallax simple.

**Paramètres :**
- `speed`: Vitesse de décalage (0.5 = moitié de la vitesse de scroll)

**Exemple :**
```jsx
const parallaxRef = useParallax(0.3);

return <div ref={parallaxRef}>Élément avec parallax</div>
```

### Types d'Animations Disponibles

| Animation | Classe CSS | Description |
|-----------|-----------|-------------|
| Fade Up | `scroll-reveal-fade-up` | Apparition depuis le bas avec fondu |
| Fade | `scroll-reveal-fade` | Simple fondu |
| Scale | `scroll-reveal-scale` | Zoom depuis 80% |
| Slide Left | `scroll-reveal-slide-left` | Glisse depuis la gauche |
| Slide Right | `scroll-reveal-slide-right` | Glisse depuis la droite |
| Flip | `scroll-reveal-flip` | Rotation 3D |
| Blur | `scroll-reveal-blur` | Défloutage |
| Rotate | `scroll-reveal-rotate` | Rotation 2D |
| Bounce | `scroll-reveal-bounce` | Rebond élastique |

### Composant Wrapper `<ScrollReveal>`

Pour une utilisation plus simple :

```jsx
import { ScrollReveal } from './components/ScrollAnimations';

<ScrollReveal animation="fade-up" delay={200}>
  <h1>Mon titre animé</h1>
</ScrollReveal>
```

**Props :**
- `animation`: Type d'animation (voir tableau ci-dessus)
- `delay`: Délai avant l'animation (ms)
- `once`: Ne jouer qu'une fois (défaut: true)
- `className`: Classes CSS supplémentaires

## 🔄 Transitions de Pages

Les transitions entre pages sont gérées par `PageTransition.jsx` (déjà implémenté).

## ♿ Accessibilité

Le système respecte les préférences de mouvement réduit :

```css
@media (prefers-reduced-motion: reduce) {
  /* Toutes les animations sont réduites à 0.01ms */
}
```

Les utilisateurs qui ont activé "Réduire les mouvements" dans leur système ne verront aucune animation.

## 📱 Mobile/Tactile

- Le curseur personnalisé est **automatiquement désactivé** sur les appareils tactiles
- Les animations de scroll fonctionnent parfaitement sur mobile
- Optimisé pour les performances avec `will-change` et `transform`

## 🎯 Bonnes Pratiques

1. **N'abusez pas des animations** - Utilisez-les pour guider l'attention
2. **Gardez des durées courtes** - Max 0.8s pour la plupart des animations
3. **Utilisez `once: true`** - Pour éviter les re-renders inutiles
4. **Testez sur mobile** - Vérifiez les performances
5. **Respectez les préférences utilisateur** - Le système gère automatiquement `prefers-reduced-motion`

## 🚀 Performances

- Utilisation de `IntersectionObserver` (natif au navigateur)
- Animations CSS avec `transform` et `opacity` (GPU-accelerated)
- Pas de JavaScript dans la boucle d'animation
- Cleanup automatique des observers

## 🎨 Personnalisation

Pour créer votre propre animation :

1. Ajoutez le keyframe dans `index.css` :
```css
@keyframes myCustomAnimation {
  from {
    opacity: 0;
    transform: scale(0.5) rotate(45deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0);
  }
}

.scroll-reveal-custom {
  animation: myCustomAnimation 0.8s ease-out forwards;
}
```

2. Utilisez-la avec le hook :
```jsx
const ref = useScrollAnimation({ 
  animationClass: 'scroll-reveal-custom' 
});
```

## 📦 Dépendances

- React (hooks : `useEffect`, `useRef`, `useState`)
- Aucune librairie externe requise !

## 🐛 Débogage

Si les animations ne fonctionnent pas :

1. Vérifiez que l'élément a bien la ref attachée
2. Ouvrez DevTools > Elements et vérifiez que les classes sont ajoutées
3. Vérifiez la console pour les erreurs
4. Testez avec `threshold: 0` pour déclencher immédiatement
5. Désactivez `prefers-reduced-motion` dans votre système

## 📝 Exemples Complets

Voir `src/pages/Home.jsx` pour des exemples d'implémentation réels.
