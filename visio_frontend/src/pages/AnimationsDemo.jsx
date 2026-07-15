import React from 'react';
import { useScrollAnimation, useStaggerAnimation, ScrollReveal } from '../components/ScrollAnimations';

/**
 * Page de démo pour toutes les animations disponibles
 * Cette page peut être utilisée pour tester et visualiser toutes les animations
 */
const AnimationsDemo = () => {
  const fadeUpRef = useScrollAnimation({ animationClass: 'scroll-reveal-fade-up' });
  const scaleRef = useScrollAnimation({ animationClass: 'scroll-reveal-scale' });
  const slideLeftRef = useScrollAnimation({ animationClass: 'scroll-reveal-slide-left' });
  const slideRightRef = useScrollAnimation({ animationClass: 'scroll-reveal-slide-right' });
  const flipRef = useScrollAnimation({ animationClass: 'scroll-reveal-flip' });
  const blurRef = useScrollAnimation({ animationClass: 'scroll-reveal-blur' });
  const rotateRef = useScrollAnimation({ animationClass: 'scroll-reveal-rotate' });
  const bounceRef = useScrollAnimation({ animationClass: 'scroll-reveal-bounce' });
  
  const staggerRef = useStaggerAnimation({ staggerDelay: 100 });

  const DemoCard = ({ title, description, children }) => (
    <div style={{
      padding: '32px',
      background: 'var(--bg-card)',
      border: '1.5px solid var(--border)',
      borderRadius: 20,
      marginBottom: '40px'
    }}>
      <h3 style={{ 
        fontFamily: 'Syne, sans-serif', 
        fontSize: '1.2rem', 
        marginBottom: 8,
        color: 'var(--text-primary)'
      }}>
        {title}
      </h3>
      <p style={{ 
        fontSize: 14, 
        color: 'var(--text-secondary)', 
        marginBottom: 24 
      }}>
        {description}
      </p>
      {children}
    </div>
  );

  return (
    <div style={{ padding: '80px 0' }}>
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <h1 style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 900,
            color: 'var(--text-primary)',
            marginBottom: 16
          }}>
            Démo des Animations
          </h1>
          <p style={{
            fontSize: 16,
            color: 'var(--text-secondary)',
            maxWidth: 600,
            margin: '0 auto'
          }}>
            Scrollez pour voir toutes les animations en action. 
            Le curseur personnalisé est également actif sur cette page.
          </p>
        </div>

        {/* Curseur personnalisé */}
        <DemoCard
          title="🖱️ Curseur Personnalisé"
          description="Un curseur spatial avec anneau et point central. Survole les éléments interactifs pour voir l'effet."
        >
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn-primary">Survole-moi</button>
            <button className="btn-secondary">Ou moi</button>
            <a href="#demo" style={{ 
              color: 'var(--primary)', 
              textDecoration: 'underline',
              fontFamily: 'DM Sans, sans-serif'
            }}>
              Ou ce lien
            </a>
          </div>
        </DemoCard>

        {/* Fade Up */}
        <DemoCard
          title="⬆️ Fade Up"
          description="L'animation la plus commune - apparition depuis le bas avec fondu"
        >
          <div ref={fadeUpRef} style={{
            padding: 24,
            background: 'var(--primary-subtle)',
            border: '1px solid var(--border-red)',
            borderRadius: 16,
            textAlign: 'center'
          }}>
            <p style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Je glisse vers le haut ! ⬆️
            </p>
          </div>
        </DemoCard>

        {/* Scale */}
        <DemoCard
          title="🔍 Scale"
          description="Zoom progressif depuis 80%"
        >
          <div ref={scaleRef} style={{
            padding: 24,
            background: 'var(--primary-subtle)',
            border: '1px solid var(--border-red)',
            borderRadius: 16,
            textAlign: 'center'
          }}>
            <p style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Je grossis ! 🔍
            </p>
          </div>
        </DemoCard>

        {/* Slide Left */}
        <DemoCard
          title="⬅️ Slide Left"
          description="Glisse depuis la gauche"
        >
          <div ref={slideLeftRef} style={{
            padding: 24,
            background: 'var(--primary-subtle)',
            border: '1px solid var(--border-red)',
            borderRadius: 16,
            textAlign: 'center'
          }}>
            <p style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Je viens de la gauche ! ⬅️
            </p>
          </div>
        </DemoCard>

        {/* Slide Right */}
        <DemoCard
          title="➡️ Slide Right"
          description="Glisse depuis la droite"
        >
          <div ref={slideRightRef} style={{
            padding: 24,
            background: 'var(--primary-subtle)',
            border: '1px solid var(--border-red)',
            borderRadius: 16,
            textAlign: 'center'
          }}>
            <p style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Je viens de la droite ! ➡️
            </p>
          </div>
        </DemoCard>

        {/* Flip */}
        <DemoCard
          title="🔄 Flip"
          description="Rotation 3D perspective"
        >
          <div ref={flipRef} style={{
            padding: 24,
            background: 'var(--primary-subtle)',
            border: '1px solid var(--border-red)',
            borderRadius: 16,
            textAlign: 'center'
          }}>
            <p style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Je tourne ! 🔄
            </p>
          </div>
        </DemoCard>

        {/* Blur */}
        <DemoCard
          title="🌫️ Blur"
          description="Défloutage progressif"
        >
          <div ref={blurRef} style={{
            padding: 24,
            background: 'var(--primary-subtle)',
            border: '1px solid var(--border-red)',
            borderRadius: 16,
            textAlign: 'center'
          }}>
            <p style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Je me défloute ! 🌫️
            </p>
          </div>
        </DemoCard>

        {/* Rotate */}
        <DemoCard
          title="↩️ Rotate"
          description="Rotation 2D avec scale"
        >
          <div ref={rotateRef} style={{
            padding: 24,
            background: 'var(--primary-subtle)',
            border: '1px solid var(--border-red)',
            borderRadius: 16,
            textAlign: 'center'
          }}>
            <p style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Je pivote ! ↩️
            </p>
          </div>
        </DemoCard>

        {/* Bounce */}
        <DemoCard
          title="🎾 Bounce"
          description="Rebond élastique"
        >
          <div ref={bounceRef} style={{
            padding: 24,
            background: 'var(--primary-subtle)',
            border: '1px solid var(--border-red)',
            borderRadius: 16,
            textAlign: 'center'
          }}>
            <p style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Je rebondis ! 🎾
            </p>
          </div>
        </DemoCard>

        {/* Stagger */}
        <DemoCard
          title="🎬 Stagger (Échelonné)"
          description="Les enfants s'animent avec un délai entre chacun"
        >
          <div ref={staggerRef} style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 12
          }}>
            {[1, 2, 3, 4, 5, 6].map(num => (
              <div key={num} style={{
                padding: 20,
                background: 'var(--primary-subtle)',
                border: '1px solid var(--border-red)',
                borderRadius: 12,
                textAlign: 'center',
                color: 'var(--primary)',
                fontWeight: 600
              }}>
                #{num}
              </div>
            ))}
          </div>
        </DemoCard>

        {/* ScrollReveal Component */}
        <DemoCard
          title="🎁 Composant ScrollReveal"
          description="Utilisation du composant wrapper pour une syntaxe plus simple"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <ScrollReveal animation="fade-up" delay={0}>
              <div style={{
                padding: 16,
                background: 'var(--primary-subtle)',
                border: '1px solid var(--border-red)',
                borderRadius: 12,
                textAlign: 'center',
                color: 'var(--primary)'
              }}>
                Premier élément (délai: 0ms)
              </div>
            </ScrollReveal>
            
            <ScrollReveal animation="fade-up" delay={100}>
              <div style={{
                padding: 16,
                background: 'var(--primary-subtle)',
                border: '1px solid var(--border-red)',
                borderRadius: 12,
                textAlign: 'center',
                color: 'var(--primary)'
              }}>
                Deuxième élément (délai: 100ms)
              </div>
            </ScrollReveal>
            
            <ScrollReveal animation="fade-up" delay={200}>
              <div style={{
                padding: 16,
                background: 'var(--primary-subtle)',
                border: '1px solid var(--border-red)',
                borderRadius: 12,
                textAlign: 'center',
                color: 'var(--primary)'
              }}>
                Troisième élément (délai: 200ms)
              </div>
            </ScrollReveal>
          </div>
        </DemoCard>

        {/* Footer */}
        <div style={{
          marginTop: 80,
          padding: 40,
          background: 'var(--bg-card)',
          border: '1.5px solid var(--border-red)',
          borderRadius: 20,
          textAlign: 'center'
        }}>
          <h3 style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '1.5rem',
            marginBottom: 12,
            color: 'var(--text-primary)'
          }}>
            ✨ Animations Visio
          </h3>
          <p style={{
            fontSize: 14,
            color: 'var(--text-secondary)',
            marginBottom: 24
          }}>
            Toutes les animations respectent les préférences de mouvement réduit
            et sont optimisées pour les performances.
          </p>
          <div style={{ 
            display: 'inline-flex', 
            gap: 8,
            padding: '8px 16px',
            background: 'var(--primary-subtle)',
            borderRadius: 12,
            fontSize: 13,
            fontFamily: 'DM Sans, sans-serif'
          }}>
            <span>🚀 GPU-accelerated</span>
            <span>•</span>
            <span>♿ Accessible</span>
            <span>•</span>
            <span>📱 Mobile-friendly</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimationsDemo;
