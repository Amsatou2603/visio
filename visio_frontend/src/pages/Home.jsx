import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Truck, Headphones } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import api from '../services/api';
import { formatPrice } from '../utils/formatPrice';

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deckIndex, setDeckIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, categoriesRes] = await Promise.all([
          api.get('/products/featured/'),
          api.get('/products/categories/'),
        ]);
        setFeatured(featuredRes.data.results || featuredRes.data);
        setCategories(categoriesRes.data.results || categoriesRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Rotation automatique du deck toutes les 2s
  useEffect(() => {
    if (featured.length < 2) return;
    const interval = setInterval(() => {
      setDeckIndex(prev => (prev + 1) % Math.min(featured.length, 6));
    }, 2000);
    return () => clearInterval(interval);
  }, [featured.length]);

  // 3 cartes du deck en rotation
  const deckCount = Math.min(featured.length, 6);
  const getDeckProduct = (offset) => {
    if (featured.length === 0) return null;
    return featured[(deckIndex + offset) % featured.length];
  };

  const p0 = getDeckProduct(0);
  const p1 = getDeckProduct(1);
  const p2 = getDeckProduct(2);

  return (
    <>
      <SEOHead
        title="Visio — Marketplace Électronique Pan-Africaine"
        description="Achetez vos téléphones, tablettes et électronique au meilleur prix. Livraison partout en Afrique."
        url="/"
      />

      {/* HERO */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '80px 0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ maxWidth: 640 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 16px', borderRadius: 999,
              background: 'rgba(249,115,22,0.1)',
              border: '1px solid rgba(249,115,22,0.3)',
              marginBottom: 24,
              backdropFilter: 'blur(8px)',
            }}>
              <span style={{ fontSize: 11, fontFamily: 'Orbitron', color: 'var(--neon-orange)', fontWeight: 700, letterSpacing: 2 }}>
                🌍 MARKETPLACE PAN-AFRICAINE
              </span>
            </div>
            <h1 style={{
              fontFamily: 'Orbitron', fontWeight: 900, fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              lineHeight: 1.15, color: 'var(--text-primary)', marginBottom: 20,
            }}>
              La Tech <span style={{ color: 'var(--neon-orange)', textShadow: '0 0 20px var(--neon-orange-glow)' }}>Premium</span><br />
              de l'Afrique
            </h1>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', fontFamily: 'Rajdhani', lineHeight: 1.7, marginBottom: 36 }}>
              Téléphones, tablettes, accessoires — au meilleur prix, livrés partout en Afrique.
              Des vendeurs vérifiés, des produits authentiques.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link to="/catalogue" className="btn-primary" style={{ fontSize: 14, padding: '13px 28px' }}>
                Explorer le catalogue →
              </Link>
              <Link to="/partenaires" className="btn-secondary" style={{ fontSize: 14, padding: '13px 28px' }}>
                Nos vendeurs
              </Link>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 32, marginTop: 48, flexWrap: 'wrap' }}>
              {[
                { value: '500+', label: 'Produits' },
                { value: '50+', label: 'Vendeurs' },
                { value: '10k+', label: 'Clients' },
              ].map(stat => (
                <div key={stat.label}>
                  <p style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: 22, color: 'var(--neon-orange)', textShadow: '0 0 12px var(--neon-orange-glow)' }}>{stat.value}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'Rajdhani', fontWeight: 500 }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AVANTAGES */}
      <section style={{ padding: '40px 0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16,
          }}>
            {[
              { icon: <Truck style={{ width: 24, height: 24, color: 'var(--neon-orange)' }} />, title: 'Livraison rapide', sub: 'Partout en Afrique de l\'Ouest' },
              { icon: <Shield style={{ width: 24, height: 24, color: '#4ade80' }} />, title: 'Paiement sécurisé', sub: 'Wave, Orange Money, Free Money' },
              { icon: <Headphones style={{ width: 24, height: 24, color: '#818cf8' }} />, title: 'Support 7j/7', sub: 'Une équipe à votre écoute' },
            ].map(item => (
              <div key={item.title} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '18px 20px',
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                transition: 'all 0.3s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.3)'; e.currentTarget.style.boxShadow = '0 0 16px var(--neon-orange-glow)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <div>
                  <h3 style={{ fontFamily: 'Orbitron', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{item.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'Rajdhani' }}>{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATÉGORIES */}
      {categories.length > 0 && (
        <section style={{ padding: '60px 0' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
              <div>
                <h2 className="section-title">Catégories</h2>
                <p className="section-subtitle">Explorez par type de produit</p>
              </div>
              <Link to="/catalogue" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--neon-orange)', fontFamily: 'Rajdhani', fontWeight: 700, textDecoration: 'none', letterSpacing: 0.5 }}>
                Voir tout <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
              {categories.slice(0, 4).map((cat, i) => {
                const emojis = ['📱', '🎧', '💻', '⌚'];
                return (
                  <Link
                    key={cat.id}
                    to={`/catalogue?category=${cat.slug}`}
                    style={{
                      padding: '24px 16px', textAlign: 'center', textDecoration: 'none',
                      background: 'rgba(255,255,255,0.04)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 18,
                      transition: 'all 0.3s ease',
                      display: 'block',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.35)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.3), 0 0 16px var(--neon-orange-glow)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ fontSize: 36, marginBottom: 12 }}>{emojis[i] || '📦'}</div>
                    <h3 style={{ fontFamily: 'Orbitron', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: 0.5 }}>{cat.name}</h3>
                    {cat.description && (
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6, fontFamily: 'Rajdhani', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>{cat.description}</p>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* PRODUITS VEDETTES */}
      <section style={{ padding: '20px 0 60px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
            <div>
              <h2 className="section-title">Produits Vedettes</h2>
              <p className="section-subtitle">Survolez une carte pour découvrir</p>
            </div>
            <Link to="/catalogue" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--neon-orange)', fontFamily: 'Rajdhani', fontWeight: 700, textDecoration: 'none' }}>
              Voir tout <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
          </div>
          {loading ? (
            <Loader text="Chargement des produits..." />
          ) : featured.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: 16, fontFamily: 'Rajdhani' }}>Aucun produit vedette pour l'instant.</p>
              <Link to="/catalogue" className="btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>Voir le catalogue</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
              {featured.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* DECK SECTION — CSS2 avec rotation auto */}
      <section className="deck-section">
        <div className="deck-wrapper">
          {/* Texte */}
          <div className="deck-text" style={{ maxWidth: 440 }}>
            <h2>
              Les <span style={{ color: 'var(--neon-orange)', textShadow: '0 0 16px var(--neon-orange-glow)' }}>meilleures offres</span><br />
              du moment 🔥
            </h2>
            <p>
              Des téléphones reconditionnés, neufs et accessoires sélectionnés pour vous.
              Profitez de prix imbattables livrés directement chez vous en Afrique.
            </p>
            <div className="deck-text-badges">
              <span className="deck-badge">✅ Garantie incluse</span>
              <span className="deck-badge">🚚 Livraison rapide</span>
              <span className="deck-badge">💳 Mobile Money</span>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/catalogue" className="deck-cta">Explorer →</Link>
              <Link to="/register-seller" className="btn-secondary" style={{ fontSize: 13 }}>
                Devenir vendeur
              </Link>
            </div>

            {/* Indicateurs de carte active */}
            {featured.length > 1 && (
              <div style={{ display: 'flex', gap: 6, marginTop: 24 }}>
                {featured.slice(0, Math.min(featured.length, 6)).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setDeckIndex(i)}
                    style={{
                      width: i === deckIndex ? 24 : 8,
                      height: 8, borderRadius: 4,
                      background: i === deckIndex ? 'var(--neon-orange)' : 'rgba(255,255,255,0.2)',
                      border: 'none', cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: i === deckIndex ? '0 0 8px var(--neon-orange-glow)' : 'none',
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Deck de cartes animé */}
          <div className="deck" style={{ width: 220, height: 310 }}>
            {/* Carte arrière */}
            <div className="deck-card deck-card-back" style={{ zIndex: 0 }}>
              {p2?.primary_image
                ? <img src={p2.primary_image} alt="" />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56 }}>📱</div>
              }
              {p2 && (
                <div className="deck-card-overlay">
                  <p>{p2.name?.slice(0, 22)}{p2.name?.length > 22 ? '…' : ''}</p>
                </div>
              )}
            </div>

            {/* Carte milieu */}
            <div className="deck-card deck-card-mid" style={{ zIndex: 1 }}>
              {p1?.primary_image
                ? <img src={p1.primary_image} alt="" />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56 }}>📱</div>
              }
              {p1 && (
                <div className="deck-card-overlay">
                  <p>{p1.name?.slice(0, 22)}{p1.name?.length > 22 ? '…' : ''}</p>
                </div>
              )}
            </div>

            {/* Carte avant — cliquable */}
            <Link
              to={p0 ? `/products/${p0.slug}` : '/catalogue'}
              className="deck-card deck-card-front"
              style={{ zIndex: 2 }}
            >
              {p0?.primary_image
                ? <img src={p0.primary_image} alt={p0?.name} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, flexDirection: 'column', gap: 10 }}>
                    <span>📱</span>
                    <span style={{ color: 'var(--neon-orange)', fontSize: 13, fontFamily: 'Orbitron', fontWeight: 700 }}>Voir les offres</span>
                  </div>
              }
              {p0 && (
                <div className="deck-card-overlay">
                  <p>{p0.name?.slice(0, 22)}{p0.name?.length > 22 ? '…' : ''}</p>
                  <span style={{ color: 'var(--neon-orange)', fontFamily: 'Orbitron', fontWeight: 800, fontSize: 13, textShadow: '0 0 8px var(--neon-orange-glow)' }}>
                    {p0 ? formatPrice(p0.price, p0.currency) : ''}
                  </span>
                </div>
              )}
            </Link>
          </div>
        </div>
      </section>

      {/* CTA vendeur */}
      <section style={{ padding: '80px 0' }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div style={{
            padding: '60px 40px',
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(249,115,22,0.2)',
            borderRadius: 28,
            boxShadow: '0 0 40px rgba(249,115,22,0.08)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
            <h2 style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: 12 }}>
              Vous vendez des téléphones ?
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', fontFamily: 'Rajdhani', marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' }}>
              Rejoignez Visio et accédez à des milliers de clients partout en Afrique. Gérez vos produits, suivez vos ventes.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register-seller" className="btn-primary" style={{ fontSize: 14, padding: '13px 32px' }}>
                Devenir vendeur →
              </Link>
              <Link to="/partenaires" className="btn-secondary" style={{ fontSize: 14, padding: '13px 32px' }}>
                Voir nos partenaires
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;