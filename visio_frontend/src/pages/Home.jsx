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
        const categoriesPromise = api.get('/products/categories/');
        const featuredPromise = api.get('/products/featured/?page_size=8');

        const [featuredRes, categoriesRes] = await Promise.all([featuredPromise, categoriesPromise]);

        let featuredData = featuredRes.data.results || featuredRes.data || [];
        if (!Array.isArray(featuredData)) featuredData = [];

        if (featuredData.length === 0) {
          const fallbackRes = await api.get('/products/', { params: { ordering: '-created_at', page_size: 8 } });
          featuredData = fallbackRes.data.results || fallbackRes.data || [];
        }

        setFeatured(featuredData);
        setCategories(categoriesRes.data.results || categoriesRes.data || []);
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
      <section style={{ position: 'relative', overflow: 'hidden', padding: '80px 0 60px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ maxWidth: 640 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 16px', borderRadius: 999,
              background: 'var(--primary-subtle)',
              border: '1px solid var(--border-red)',
              marginBottom: 24,
            }}>
              <span style={{ fontSize: 11, fontFamily: 'Syne, sans-serif', color: 'var(--primary)', fontWeight: 700, letterSpacing: 2 }}>
                🌍 MARKETPLACE PAN-AFRICAINE
              </span>
            </div>
            <h1 style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              lineHeight: 1.1, color: 'var(--text-primary)', marginBottom: 20,
            }}>
              La Tech{' '}
              <span style={{ color: 'var(--primary)' }}>Premium</span>
              <br />
              de l'Afrique
            </h1>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.7, marginBottom: 36 }}>
              Téléphones, tablettes, accessoires — au meilleur prix, livrés partout en Afrique.
              Des vendeurs vérifiés, des produits authentiques.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link to="/catalogue" className="btn-primary" style={{ fontSize: 14, padding: '13px 28px' }}>
                Explorer le catalogue <ArrowRight style={{ width: 16, height: 16 }} />
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
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 24, color: 'var(--primary)' }}>{stat.value}</p>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>{stat.label}</p>
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
              { icon: <Truck style={{ width: 22, height: 22, color: 'var(--primary)' }} />, title: 'Livraison rapide', sub: 'Partout en Afrique de l\'Ouest' },
              { icon: <Shield style={{ width: 22, height: 22, color: '#4ade80' }} />, title: 'Paiement sécurisé', sub: 'Wave, Orange Money, Free Money' },
              { icon: <Headphones style={{ width: 22, height: 22, color: '#818cf8' }} />, title: 'Support 7j/7', sub: 'Une équipe à votre écoute' },
            ].map(item => (
              <div key={item.title} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '18px 20px',
                background: 'var(--bg-card)',
                border: '1.5px solid var(--border)',
                borderRadius: 16,
                transition: 'all 0.3s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-red)'; e.currentTarget.style.boxShadow = 'var(--shadow-red)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: 'var(--primary-subtle)',
                  border: '1.5px solid var(--border-red)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <div>
                  <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{item.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>{item.sub}</p>
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
              <Link to="/catalogue" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--primary)', fontFamily: 'DM Sans, sans-serif', fontWeight: 700, textDecoration: 'none' }}>
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
                      background: 'var(--bg-card)',
                      border: '1.5px solid var(--border)',
                      borderRadius: 18,
                      transition: 'all 0.3s ease',
                      display: 'block',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-red)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-red)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ fontSize: 36, marginBottom: 12 }}>{emojis[i] || '📦'}</div>
                    <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: 0.5 }}>{cat.name}</h3>
                    {cat.description && (
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6, fontFamily: 'DM Sans, sans-serif', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>{cat.description}</p>
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
            <Link to="/catalogue" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--primary)', fontFamily: 'DM Sans, sans-serif', fontWeight: 700, textDecoration: 'none' }}>
              Voir tout <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
          </div>
          {loading ? (
            <Loader text="Chargement des produits..." />
          ) : featured.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: 16, fontFamily: 'DM Sans, sans-serif' }}>Aucun produit vedette pour l'instant.</p>
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

      {/* DECK SECTION */}
      <section className="deck-section">
        <div className="deck-wrapper">
          {/* Texte */}
          <div className="deck-text" style={{ maxWidth: 440 }}>
            <h2>
              Les <span style={{ color: 'var(--primary)' }}>meilleures offres</span><br />
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

            {featured.length > 1 && (
              <div style={{ display: 'flex', gap: 6, marginTop: 24 }}>
                {featured.slice(0, Math.min(featured.length, 6)).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setDeckIndex(i)}
                    style={{
                      width: i === deckIndex ? 24 : 8,
                      height: 8, borderRadius: 4,
                      background: i === deckIndex ? 'var(--primary)' : 'var(--border-strong)',
                      border: 'none', cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Deck de cartes animé */}
          <div className="deck" style={{ width: 220, height: 310 }}>
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

            <Link
              to={p0 ? `/products/${p0.slug}` : '/catalogue'}
              className="deck-card deck-card-front"
              style={{ zIndex: 2 }}
            >
              {p0?.primary_image
                ? <img src={p0.primary_image} alt={p0?.name} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, flexDirection: 'column', gap: 10 }}>
                  <span>📱</span>
                  <span style={{ color: 'var(--primary)', fontSize: 13, fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>Voir les offres</span>
                </div>
              }
              {p0 && (
                <div className="deck-card-overlay">
                  <p>{p0.name?.slice(0, 22)}{p0.name?.length > 22 ? '…' : ''}</p>
                  <span style={{ color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 13 }}>
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
            background: 'var(--bg-card)',
            border: '1.5px solid var(--border-red)',
            borderRadius: 28,
            boxShadow: 'var(--shadow-red)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: 12 }}>
              Vous vendez des téléphones ?
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' }}>
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
