import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Store, Package, Star, Phone, ExternalLink, ArrowLeft } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatDate } from '../utils/formatPrice';

const SellerShop = () => {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');

  const isSelf = isAuthenticated && user?.role === 'seller' &&
    seller?.shop_slug === slug;

  useEffect(() => {
    const fetchShop = async () => {
      setLoading(true);
      try {
        const sellerRes = await api.get(`/auth/sellers/${slug}/`);
        setSeller(sellerRes.data);
        const productsRes = await api.get('/products/', {
          params: { seller_slug: slug }
        });
        setProducts(productsRes.data.results || productsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchShop();
  }, [slug]);

  if (loading) return <Loader text="Chargement de la boutique..." />;

  if (!seller) return (
    <div style={{ textAlign: 'center', padding: '80px 16px' }}>
      <Store style={{ width: 64, height: 64, opacity: 0.15, margin: '0 auto 20px' }} />
      <h2 style={{ fontFamily: 'Orbitron', fontSize: 18, color: 'var(--text-primary)', marginBottom: 10 }}>
        Boutique introuvable
      </h2>
      <Link to="/partenaires" className="btn-primary" style={{ display: 'inline-flex', marginTop: 16 }}>
        Voir tous les vendeurs
      </Link>
    </div>
  );

  return (
    <>
      <SEOHead
        title={`${seller.shop_name} — Visio`}
        description={seller.shop_description || `Boutique ${seller.shop_name} sur Visio`}
        url={`/boutique/${slug}`}
      />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px 48px' }}>

        {/* Retour */}
        <div style={{ padding: '24px 0 0' }}>
          <Link to="/partenaires" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            color: 'var(--text-secondary)', textDecoration: 'none',
            fontFamily: 'Rajdhani', fontSize: 14, fontWeight: 600,
            transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--neon-orange)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <ArrowLeft style={{ width: 16, height: 16 }} /> Tous les vendeurs
          </Link>
        </div>

        {/* Bannière boutique */}
        <div style={{
          marginTop: 20,
          height: 200,
          background: seller.shop_banner
            ? `url(${seller.shop_banner}) center/cover`
            : 'linear-gradient(135deg, rgba(249,115,22,0.3), rgba(150,50,250,0.25))',
          borderRadius: '20px 20px 0 0',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(10,10,20,0.8) 0%, transparent 60%)',
            borderRadius: '20px 20px 0 0',
          }} />

          {/* Bouton modifier si c'est sa boutique */}
          {isSelf && (
            <Link to="/seller-dashboard" style={{
              position: 'absolute', top: 16, right: 16,
              padding: '8px 16px', borderRadius: 10,
              background: 'rgba(249,115,22,0.2)',
              border: '1px solid rgba(249,115,22,0.4)',
              color: 'var(--neon-orange)',
              fontFamily: 'Orbitron', fontSize: 11, fontWeight: 700,
              textDecoration: 'none', backdropFilter: 'blur(8px)',
            }}>
              ✏️ Gérer ma boutique
            </Link>
          )}
        </div>

        {/* Infos boutique */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderTop: 'none',
          borderRadius: '0 0 20px 20px',
          padding: '0 28px 24px',
          marginBottom: 28,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, marginTop: -30, flexWrap: 'wrap' }}>
            {/* Logo */}
            <div style={{
              width: 80, height: 80, borderRadius: 18,
              background: seller.shop_logo
                ? `url(${seller.shop_logo}) center/cover`
                : 'linear-gradient(135deg, var(--neon-orange), hsl(22,95%,35%))',
              border: '3px solid rgba(255,255,255,0.1)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4), 0 0 16px var(--neon-orange-glow)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {!seller.shop_logo && <Store style={{ width: 36, height: 36, color: '#fff' }} />}
            </div>

            <div style={{ flex: 1, paddingTop: 36 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <h1 style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                  {seller.shop_name}
                </h1>
                {seller.is_featured && (
                  <span style={{
                    padding: '3px 12px', borderRadius: 999, fontSize: 10,
                    fontFamily: 'Orbitron', fontWeight: 700,
                    background: 'rgba(249,115,22,0.15)',
                    border: '1px solid rgba(249,115,22,0.4)',
                    color: 'var(--neon-orange)',
                  }}>⭐ VEDETTE</span>
                )}
              </div>

              {seller.category_focus && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                  <Package style={{ width: 13, height: 13, color: 'var(--neon-orange)' }} />
                  <span style={{ fontSize: 13, color: 'var(--neon-orange)', fontFamily: 'Rajdhani', fontWeight: 600 }}>
                    {seller.category_focus}
                  </span>
                </div>
              )}

              {seller.shop_description && (
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontFamily: 'Rajdhani', marginTop: 8, lineHeight: 1.6, maxWidth: 500 }}>
                  {seller.shop_description}
                </p>
              )}
            </div>

            {/* Actions contact */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', paddingTop: 8 }}>
              {seller.whatsapp && (
                
                <a href={`https://wa.me/${seller.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '9px 18px', borderRadius: 10, textDecoration: 'none',
                    background: 'rgba(37,211,102,0.12)',
                    border: '1px solid rgba(37,211,102,0.3)',
                    color: '#25d366',
                    fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 13,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 12px rgba(37,211,102,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                >
                  <Phone style={{ width: 15, height: 15 }} /> WhatsApp
                </a>
              )}
              {seller.website && (
                
                <a href={seller.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{ fontSize: 13, padding: '9px 18px', display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <ExternalLink style={{ width: 14, height: 14 }} /> Site web
                </a>
              )}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 28, marginTop: 24, flexWrap: 'wrap' }}>
            {[
              { value: products.length, label: 'Produits', color: 'var(--neon-orange)' },
              { value: seller.total_sales, label: 'Ventes', color: '#facc15' },
              { value: parseFloat(seller.rating) > 0 ? `${parseFloat(seller.rating).toFixed(1)}/5` : '—', label: 'Note', color: '#4ade80' },
              { value: formatDate(seller.created_at), label: 'Membre depuis', color: 'var(--text-secondary)' },
            ].map(({ value, label, color }) => (
              <div key={label}>
                <p style={{ fontFamily: 'Orbitron', fontSize: 16, fontWeight: 900, color }}>{value}</p>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Rajdhani', marginTop: 2 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[
            { id: 'products', label: `Produits (${products.length})` },
            { id: 'about', label: 'À propos' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '9px 20px', borderRadius: 10, cursor: 'pointer',
                fontFamily: 'Orbitron', fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                border: activeTab === tab.id ? '1px solid rgba(249,115,22,0.5)' : '1px solid rgba(255,255,255,0.08)',
                background: activeTab === tab.id ? 'rgba(249,115,22,0.12)' : 'rgba(255,255,255,0.04)',
                color: activeTab === tab.id ? 'var(--neon-orange)' : 'var(--text-secondary)',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenu tabs */}
        {activeTab === 'products' && (
          products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
              <Package style={{ width: 56, height: 56, opacity: 0.15, margin: '0 auto 16px' }} />
              <p style={{ fontFamily: 'Rajdhani', fontSize: 16 }}>
                {isSelf ? 'Vous n\'avez pas encore de produits.' : 'Aucun produit disponible.'}
              </p>
              {isSelf && (
                <Link to="/products/new" className="btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>
                  Ajouter mon premier produit
                </Link>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )
        )}

        {activeTab === 'about' && (
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20, padding: '28px',
            maxWidth: 600,
          }}>
            <h3 style={{ fontFamily: 'Orbitron', fontSize: 13, fontWeight: 700, color: 'var(--neon-orange)', marginBottom: 20, letterSpacing: 1 }}>
              À PROPOS DE LA BOUTIQUE
            </h3>
            {[
              { label: 'Nom', value: seller.shop_name },
              { label: 'Spécialité', value: seller.category_focus || '—' },
              { label: 'Description', value: seller.shop_description || '—' },
              { label: 'WhatsApp', value: seller.whatsapp || '—' },
              { label: 'Site web', value: seller.website || '—' },
              { label: 'Membre depuis', value: formatDate(seller.created_at) },
            ].map(({ label, value }) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
                gap: 20,
              }}>
                <span style={{ fontSize: 11, fontFamily: 'Orbitron', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: 0.5, flexShrink: 0 }}>{label}</span>
                <span style={{ fontSize: 14, color: 'var(--text-primary)', fontFamily: 'Rajdhani', fontWeight: 600, textAlign: 'right' }}>{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default SellerShop;