import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Store, Package, Star, ArrowLeft } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Loader from '../components/Loader';
import { useScrollAnimation, useStaggerAnimation } from '../components/ScrollAnimations';
import api from '../services/api';

const Partenaires = () => {
  const navigate = useNavigate();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Animation refs
  const headerRef = useScrollAnimation({ animationClass: 'scroll-reveal-fade-up' });
  const sellersGridRef = useStaggerAnimation({ staggerDelay: 100 });

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const res = await api.get('/auth/sellers/');
        setSellers(res.data.results || res.data);
      } catch (err) {
        console.error(err);
        // Si pas encore de vendeurs approuvés, afficher quand même la page
        setSellers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSellers();
  }, []);

  const filtered = sellers.filter(s =>
    s.shop_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.category_focus?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <SEOHead
        title="Nos Partenaires — Vendeurs Visio"
        description="Découvrez tous nos vendeurs partenaires vérifiés sur Visio."
        url="/partenaires"
      />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 16px' }}>

        <button
          onClick={() => navigate(-1)}
          className="btn-secondary mb-6"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <ArrowLeft style={{ width: 16, height: 16 }} /> Retour
        </button>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 18px', borderRadius: 999,
            background: 'rgba(249,115,22,0.1)',
            border: '1px solid rgba(249,115,22,0.25)',
            marginBottom: 20, backdropFilter: 'blur(8px)',
          }}>
            <span style={{ fontSize: 11, fontFamily: 'Orbitron', color: 'var(--neon-orange)', fontWeight: 700, letterSpacing: 2 }}>
              🤝 VENDEURS VÉRIFIÉS
            </span>
          </div>
          <h1 style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: 'var(--text-primary)', marginBottom: 16 }}>
            Nos <span style={{ color: 'var(--neon-orange)', textShadow: '0 0 20px var(--neon-orange-glow)' }}>Partenaires</span>
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', fontFamily: 'Rajdhani', maxWidth: 500, margin: '0 auto 32px', lineHeight: 1.7 }}>
            Tous nos vendeurs sont vérifiés par notre équipe. Achetez en toute confiance.
          </p>

          {/* Recherche */}
          <div style={{ maxWidth: 400, margin: '0 auto', position: 'relative' }}>
            <Search style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: 'var(--text-secondary)' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un vendeur..."
              className="input-field"
              style={{ paddingLeft: 48, borderRadius: 999, fontSize: 14 }}
            />
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginBottom: 48, flexWrap: 'wrap' }}>
          {[
            { value: sellers.length || '50+', label: 'Vendeurs actifs', icon: Store },
            { value: '500+', label: 'Produits listés', icon: Package },
            { value: '4.8/5', label: 'Note moyenne', icon: Star },
          ].map(({ value, label, icon: Icon }) => (
            <div key={label} style={{
              padding: '16px 28px', borderRadius: 16, textAlign: 'center',
              background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.08)',
              minWidth: 150,
            }}>
              <Icon style={{ width: 20, height: 20, color: 'var(--neon-orange)', margin: '0 auto 8px' }} />
              <p style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: 20, color: 'var(--neon-orange)', textShadow: '0 0 10px var(--neon-orange-glow)' }}>{value}</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Rajdhani', marginTop: 2 }}>{label}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <Loader text="Chargement des partenaires..." />
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            {sellers.length === 0 ? (
              <div>
                <Store style={{ width: 64, height: 64, opacity: 0.15, margin: '0 auto 20px' }} />
                <h2 style={{ fontFamily: 'Orbitron', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
                  Pas encore de vendeurs approuvés
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontFamily: 'Rajdhani', fontSize: 15, marginBottom: 24 }}>
                  Soyez le premier à rejoindre la marketplace !
                </p>
                <Link to="/register-seller" className="btn-primary" style={{ fontSize: 14, padding: '13px 28px' }}>
                  Devenir vendeur →
                </Link>
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontFamily: 'Rajdhani', fontSize: 16 }}>
                Aucun vendeur ne correspond à votre recherche.
              </p>
            )}
          </div>
        ) : (
          <div ref={sellersGridRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {filtered.map(seller => (
              <div key={seller.id} style={{
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 22,
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.3)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.4), 0 0 20px var(--neon-orange-glow)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'; }}
              >
                {/* Banner */}
                <div style={{
                  height: 100,
                  background: seller.shop_banner
                    ? `url(${seller.shop_banner}) center/cover`
                    : 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(150,50,250,0.2))',
                  position: 'relative',
                }}>
                  {/* Logo */}
                  <div style={{
                    position: 'absolute', bottom: -24, left: 20,
                    width: 48, height: 48, borderRadius: 14,
                    background: seller.shop_logo ? `url(${seller.shop_logo}) center/cover` : 'linear-gradient(135deg, var(--neon-orange), hsl(22,95%,35%))',
                    border: '2px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.4), 0 0 12px var(--neon-orange-glow)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {!seller.shop_logo && <Store style={{ width: 22, height: 22, color: '#fff' }} />}
                  </div>

                  {/* Featured badge */}
                  {seller.is_featured && (
                    <div style={{
                      position: 'absolute', top: 10, right: 12,
                      padding: '3px 10px', borderRadius: 999,
                      background: 'rgba(249,115,22,0.2)', border: '1px solid rgba(249,115,22,0.4)',
                      fontSize: 10, fontFamily: 'Orbitron', fontWeight: 700, color: 'var(--neon-orange)',
                      backdropFilter: 'blur(8px)',
                    }}>
                      ⭐ VEDETTE
                    </div>
                  )}
                </div>

                {/* Content */}
                <div style={{ padding: '32px 20px 20px' }}>
                  <h3 style={{ fontFamily: 'Orbitron', fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {seller.shop_name}
                  </h3>

                  {seller.category_focus && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <Package style={{ width: 12, height: 12, color: 'var(--neon-orange)' }} />
                      <span style={{ fontSize: 12, color: 'var(--neon-orange)', fontFamily: 'Rajdhani', fontWeight: 600 }}>
                        {seller.category_focus}
                      </span>
                    </div>
                  )}

                  {seller.shop_description && (
                    <p style={{
                      fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'Rajdhani',
                      lineHeight: 1.5, marginBottom: 16,
                      overflow: 'hidden', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>
                      {seller.shop_description}
                    </p>
                  )}

                  {/* Stats */}
                  <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontFamily: 'Orbitron', fontSize: 14, fontWeight: 900, color: 'var(--neon-orange)' }}>{seller.products_count}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'Rajdhani' }}>Produits</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontFamily: 'Orbitron', fontSize: 14, fontWeight: 900, color: '#facc15' }}>{seller.total_sales}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'Rajdhani' }}>Ventes</p>
                    </div>
                    {parseFloat(seller.rating) > 0 && (
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontFamily: 'Orbitron', fontSize: 14, fontWeight: 900, color: '#4ade80' }}>{parseFloat(seller.rating).toFixed(1)}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'Rajdhani' }}>Note</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link
                      to={`/boutique/${seller.shop_slug}`}
                      className="btn-primary"
                      style={{ flex: 1, justifyContent: 'center', fontSize: 12, padding: '9px 0' }}
                    >
                      Voir la boutique →
                    </Link>
                    {seller.whatsapp && (
                      <a
                        href={`https://wa.me/${seller.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary"
                        style={{ padding: '9px 12px', fontSize: 13 }}
                      >
                        WA
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA rejoindre */}
        <div style={{
          marginTop: 60, padding: '48px 32px', textAlign: 'center',
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(249,115,22,0.15)',
          borderRadius: 24,
          boxShadow: '0 0 40px rgba(249,115,22,0.05)',
        }}>
          <h2 style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: 12 }}>
            Rejoignez notre réseau 🚀
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontFamily: 'Rajdhani', fontSize: 15, marginBottom: 28 }}>
            Devenez partenaire Visio et accédez à des milliers de clients en Afrique.
          </p>
          <Link to="/register-seller" className="btn-primary" style={{ fontSize: 14, padding: '13px 32px' }}>
            Créer ma boutique →
          </Link>
        </div>
      </div>
    </>
  );
};

export default Partenaires;