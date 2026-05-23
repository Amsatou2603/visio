import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package, TrendingUp, ShoppingBag, DollarSign,
  Plus, Edit, Trash2, Eye, Star, AlertCircle
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatPrice, formatDate } from '../utils/formatPrice';

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div style={{
    padding: '20px 24px',
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 18,
    transition: 'all 0.3s',
  }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}40`; e.currentTarget.style.boxShadow = `0 0 20px ${color}20`; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}15`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon style={{ width: 20, height: 20, color }} />
      </div>
      <span style={{ fontSize: 12, fontFamily: 'Orbitron', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: 0.5 }}>{label}</span>
    </div>
    <p style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: 22, color, textShadow: `0 0 10px ${color}60` }}>{value}</p>
    {sub && <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Rajdhani', marginTop: 4 }}>{sub}</p>}
  </div>
);

const SellerDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [sellerProfile, setSellerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (user?.role !== 'seller' && !user?.is_staff) { navigate('/dashboard'); return; }
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, productsRes, ordersRes, profileRes] = await Promise.all([
        api.get('/auth/seller/stats/'),
        api.get('/products/my_products/'),
        api.get('/orders/'),
        api.get('/auth/seller/profile/'),
      ]);
      setStats(statsRes.data);
      setProducts(productsRes.data.results || productsRes.data);
      setOrders(ordersRes.data.results || ordersRes.data);
      setSellerProfile(profileRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await api.delete(`/products/${productId}/`);
      setProducts(prev => prev.filter(p => p.id !== productId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleActive = async (product) => {
    try {
      const res = await api.patch(`/products/${product.slug}/`, { is_active: !product.is_active });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_active: res.data.is_active } : p));
    } catch (err) {
      console.error(err);
    }
  };

  const STATUS_COLORS = {
    pending: '#facc15', confirmed: '#60a5fa', processing: '#a78bfa',
    shipped: '#34d399', delivered: '#4ade80', cancelled: '#f87171',
  };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
    { id: 'products', label: 'Mes produits', icon: Package },
    { id: 'orders', label: 'Commandes', icon: ShoppingBag },
    { id: 'profile', label: 'Ma boutique', icon: Star },
  ];

  if (loading) return <Loader text="Chargement du tableau de bord..." />;

  const isApproved = sellerProfile?.status === 'approved';

  return (
    <>
      <SEOHead title="Tableau de bord Vendeur" url="/seller-dashboard" />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px' }}>

        {/* Header */}
        <div style={{
          padding: '24px 28px', marginBottom: 28,
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(249,115,22,0.2)',
          borderRadius: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
          boxShadow: '0 0 30px rgba(249,115,22,0.06)',
        }}>
          <div>
            <h1 style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: '1.5rem', color: 'var(--text-primary)' }}>
              {sellerProfile?.shop_name || 'Ma Boutique'} 🏪
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
              <span style={{
                padding: '3px 12px', borderRadius: 999, fontSize: 11,
                fontFamily: 'Orbitron', fontWeight: 700, letterSpacing: 0.5,
                background: isApproved ? 'rgba(74,222,128,0.15)' : 'rgba(250,204,21,0.15)',
                color: isApproved ? '#4ade80' : '#facc15',
                border: `1px solid ${isApproved ? 'rgba(74,222,128,0.3)' : 'rgba(250,204,21,0.3)'}`,
              }}>
                {isApproved ? '✓ APPROUVÉ' : '⏳ EN ATTENTE'}
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'Rajdhani' }}>
                {sellerProfile?.category_focus}
              </span>
            </div>
          </div>
          {isApproved && (
            <Link to="/products/new" className="btn-primary" style={{ fontSize: 13, padding: '10px 20px' }}>
              <Plus style={{ width: 16, height: 16 }} /> Ajouter un produit
            </Link>
          )}
        </div>

        {/* Alerte si pas approuvé */}
        {!isApproved && (
          <div style={{
            padding: '16px 20px', marginBottom: 24,
            background: 'rgba(250,204,21,0.08)',
            border: '1px solid rgba(250,204,21,0.3)',
            borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <AlertCircle style={{ width: 20, height: 20, color: '#facc15', flexShrink: 0 }} />
            <p style={{ fontSize: 14, color: 'rgba(250,204,21,0.9)', fontFamily: 'Rajdhani' }}>
              Votre boutique est en cours de validation. Vous pourrez ajouter des produits après approbation par notre équipe.
            </p>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 28, flexWrap: 'wrap' }}>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 18px', borderRadius: 12, cursor: 'pointer',
                fontFamily: 'Orbitron', fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                border: tab === id ? '1px solid rgba(249,115,22,0.5)' : '1px solid rgba(255,255,255,0.08)',
                background: tab === id ? 'rgba(249,115,22,0.12)' : 'rgba(255,255,255,0.04)',
                color: tab === id ? 'var(--neon-orange)' : 'var(--text-secondary)',
                backdropFilter: 'blur(10px)',
                boxShadow: tab === id ? '0 0 14px var(--neon-orange-glow)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              <Icon style={{ width: 15, height: 15 }} /> {label}
            </button>
          ))}
        </div>

        {/* TAB: OVERVIEW */}
        {tab === 'overview' && stats && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
              <StatCard icon={Package} label="PRODUITS ACTIFS" value={stats.active_products} color="var(--neon-orange)" sub={`${stats.total_products} au total`} />
              <StatCard icon={ShoppingBag} label="COMMANDES" value={stats.total_orders} color="#60a5fa" sub={`${stats.pending_orders} en attente`} />
              <StatCard icon={DollarSign} label="REVENUS TOTAUX" value={formatPrice(stats.total_revenue)} color="#4ade80" />
              <StatCard icon={TrendingUp} label="CE MOIS" value={formatPrice(stats.monthly_revenue)} color="#a78bfa" />
            </div>

            {/* Derniers produits */}
            <div style={{
              background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, overflow: 'hidden',
            }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontFamily: 'Orbitron', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Derniers produits</h3>
                <button onClick={() => setTab('products')} style={{ fontSize: 12, color: 'var(--neon-orange)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Rajdhani', fontWeight: 700 }}>Voir tout →</button>
              </div>
              {products.slice(0, 4).map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, overflow: 'hidden', background: 'rgba(255,255,255,0.06)', flexShrink: 0 }}>
                    {p.primary_image ? <img src={p.primary_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 20 }}>📱</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                    <p style={{ fontFamily: 'Orbitron', fontSize: 12, color: 'var(--neon-orange)', marginTop: 2 }}>{formatPrice(p.price)}</p>
                  </div>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, fontFamily: 'Orbitron', fontWeight: 700, background: p.is_active ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)', color: p.is_active ? '#4ade80' : '#f87171', border: `1px solid ${p.is_active ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}` }}>
                    {p.is_active ? 'ACTIF' : 'INACTIF'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: PRODUCTS */}
        {tab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'Orbitron', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                Mes Produits ({products.length})
              </h2>
              {isApproved && (
                <Link to="/products/new" className="btn-primary" style={{ fontSize: 12, padding: '8px 16px' }}>
                  <Plus style={{ width: 14, height: 14 }} /> Nouveau produit
                </Link>
              )}
            </div>

            {products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
                <Package style={{ width: 56, height: 56, opacity: 0.2, margin: '0 auto 16px' }} />
                <p style={{ fontFamily: 'Rajdhani', fontSize: 16 }}>Aucun produit pour l'instant.</p>
                {isApproved && <Link to="/products/new" className="btn-primary" style={{ marginTop: 16, display: 'inline-flex' }}>Ajouter mon premier produit</Link>}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {products.map(p => (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '16px 20px',
                    background: 'rgba(255,255,255,0.04)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 16, flexWrap: 'wrap',
                    transition: 'border-color 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(249,115,22,0.25)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                  >
                    {/* Image */}
                    <div style={{ width: 56, height: 56, borderRadius: 12, overflow: 'hidden', background: 'rgba(255,255,255,0.06)', flexShrink: 0 }}>
                      {p.primary_image ? <img src={p.primary_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 24 }}>📱</span>}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                      <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'Orbitron', fontSize: 12, color: 'var(--neon-orange)', fontWeight: 800 }}>{formatPrice(p.price)}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Rajdhani' }}>Stock: {p.stock}</span>
                        {p.reviews_count > 0 && <span style={{ fontSize: 12, color: '#facc15', fontFamily: 'Rajdhani' }}>⭐ {parseFloat(p.average_rating).toFixed(1)} ({p.reviews_count})</span>}
                      </div>
                    </div>

                    {/* Status + Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        onClick={() => handleToggleActive(p)}
                        style={{
                          fontSize: 10, padding: '4px 12px', borderRadius: 999,
                          fontFamily: 'Orbitron', fontWeight: 700, cursor: 'pointer',
                          background: p.is_active ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
                          color: p.is_active ? '#4ade80' : '#f87171',
                          border: `1px solid ${p.is_active ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
                          transition: 'all 0.2s',
                        }}
                      >
                        {p.is_active ? 'ACTIF' : 'INACTIF'}
                      </button>

                      <Link to={`/products/${p.slug}`} style={{ padding: 8, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', display: 'flex', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#60a5fa'; e.currentTarget.style.borderColor = 'rgba(96,165,250,0.4)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                      >
                        <Eye style={{ width: 15, height: 15 }} />
                      </Link>

                      <Link to={`/products/edit/${p.slug}`} style={{ padding: 8, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', display: 'flex', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--neon-orange)'; e.currentTarget.style.borderColor = 'rgba(249,115,22,0.4)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                      >
                        <Edit style={{ width: 15, height: 15 }} />
                      </Link>

                      <button
                        onClick={() => setDeleteConfirm(p.id)}
                        style={{ padding: 8, borderRadius: 8, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', cursor: 'pointer', display: 'flex', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.15)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.5)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.08)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.2)'; }}
                      >
                        <Trash2 style={{ width: 15, height: 15 }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Modal suppression */}
            {deleteConfirm && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                <div style={{
                  background: 'rgba(15,15,28,0.95)', backdropFilter: 'blur(30px)',
                  border: '1px solid rgba(248,113,113,0.3)', borderRadius: 20,
                  padding: '32px 28px', maxWidth: 400, width: '100%', textAlign: 'center',
                  boxShadow: '0 0 40px rgba(248,113,113,0.15)',
                }}>
                  <Trash2 style={{ width: 40, height: 40, color: '#f87171', margin: '0 auto 16px' }} />
                  <h3 style={{ fontFamily: 'Orbitron', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>Supprimer ce produit ?</h3>
                  <p style={{ color: 'var(--text-secondary)', fontFamily: 'Rajdhani', fontSize: 14, marginBottom: 24 }}>Cette action est irréversible.</p>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={() => setDeleteConfirm(null)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '11px 0' }}>Annuler</button>
                    <button onClick={() => handleDeleteProduct(deleteConfirm)} style={{ flex: 1, padding: '11px 0', borderRadius: 10, background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.4)', color: '#f87171', fontFamily: 'Orbitron', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: ORDERS */}
        {tab === 'orders' && (
          <div>
            <h2 style={{ fontFamily: 'Orbitron', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
              Commandes ({orders.length})
            </h2>
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
                <ShoppingBag style={{ width: 56, height: 56, opacity: 0.2, margin: '0 auto 16px' }} />
                <p style={{ fontFamily: 'Rajdhani', fontSize: 16 }}>Aucune commande pour l'instant.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {orders.map(order => (
                  <div key={order.id} style={{
                    padding: '18px 22px',
                    background: 'rgba(255,255,255,0.04)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 16,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <p style={{ fontFamily: 'Orbitron', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{order.reference}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Rajdhani', marginTop: 2 }}>{formatDate(order.created_at)}</p>
                      </div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <span style={{
                          fontSize: 10, padding: '4px 12px', borderRadius: 999,
                          fontFamily: 'Orbitron', fontWeight: 700,
                          background: `${STATUS_COLORS[order.status] || '#999'}15`,
                          color: STATUS_COLORS[order.status] || '#999',
                          border: `1px solid ${STATUS_COLORS[order.status] || '#999'}40`,
                        }}>
                          {order.status_display || order.status}
                        </span>
                        <span style={{ fontFamily: 'Orbitron', fontSize: 13, fontWeight: 900, color: 'var(--neon-orange)' }}>
                          {formatPrice(order.total)}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {order.items?.slice(0, 2).map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'Rajdhani' }}>
                          <span>{item.product_name} ×{item.quantity}</span>
                          <span>{formatPrice(item.total_price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: PROFILE */}
        {tab === 'profile' && sellerProfile && (
          <div style={{ maxWidth: 600 }}>
            <h2 style={{ fontFamily: 'Orbitron', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>Ma Boutique</h2>
            <div style={{
              background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '28px 24px',
              display: 'flex', flexDirection: 'column', gap: 16,
            }}>
              {[
                { label: 'Nom de la boutique', value: sellerProfile.shop_name },
                { label: 'Description', value: sellerProfile.shop_description || '—' },
                { label: 'Type de produits', value: sellerProfile.category_focus || '—' },
                { label: 'WhatsApp', value: sellerProfile.whatsapp || '—' },
                { label: 'Statut', value: sellerProfile.status === 'approved' ? '✓ Approuvé' : '⏳ En attente' },
                { label: 'Produits actifs', value: sellerProfile.products_count },
                { label: 'Membre depuis', value: formatDate(sellerProfile.created_at) },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'Orbitron', fontWeight: 700, fontSize: 11, letterSpacing: 0.5 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SellerDashboard;