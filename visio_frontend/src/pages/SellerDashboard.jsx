import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package, TrendingUp, ShoppingBag, DollarSign,
  Plus, Edit, Trash2, Eye, Star, AlertCircle,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import SEOHead from '../components/SEOHead';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatPrice, formatDate } from '../utils/formatPrice';

const COLORS = ['#e63946', '#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

const STATUS_CONFIG = {
  pending: { label: 'En attente', color: '#f59e0b' },
  confirmed: { label: 'Confirmée', color: '#6366f1' },
  processing: { label: 'En traitement', color: '#8b5cf6' },
  shipped: { label: 'Expédiée', color: '#06b6d4' },
  delivered: { label: 'Livrée', color: '#10b981' },
  cancelled: { label: 'Annulée', color: '#ef4444' },
};

// Tooltip personnalisé
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--menu-bg)', border: '1.5px solid var(--border)',
        borderRadius: 12, padding: '12px 16px',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 6 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: p.color, marginTop: 2 }}>
            {p.name}: <strong>{p.name === 'Revenus' ? formatPrice(p.value) : p.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const KPICard = ({ label, value, sub, icon: Icon, color, growth }) => (
  <div style={{
    padding: '20px 22px',
    background: 'var(--card-bg)',
    border: '1.5px solid var(--border)',
    borderRadius: 18,
    boxShadow: 'var(--shadow-sm)',
    transition: 'all 0.25s ease',
  }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = color + '40'; e.currentTarget.style.boxShadow = `0 4px 20px ${color}15`; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</p>
        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--text-primary)' }}>{value}</p>
        {sub && <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</p>}
      </div>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: color + '15', border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon style={{ width: 20, height: 20, color }} />
      </div>
    </div>
    {growth !== undefined && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
        {growth >= 0
          ? <ArrowUpRight style={{ width: 14, height: 14, color: '#10b981' }} />
          : <ArrowDownRight style={{ width: 14, height: 14, color: '#ef4444' }} />
        }
        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: growth >= 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>
          {growth >= 0 ? '+' : ''}{growth}%
        </span>
        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--text-muted)' }}>vs mois dernier</span>
      </div>
    )}
  </div>
);

const SellerDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
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
      const [analyticsRes, productsRes, ordersRes, profileRes] = await Promise.all([
        api.get('/auth/seller/analytics/'),
        api.get('/products/my_products/'),
        api.get('/orders/'),
        api.get('/auth/seller/profile/'),
      ]);
      setAnalytics(analyticsRes.data);
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

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
    { id: 'analytics', label: 'Statistiques', icon: TrendingUp },
    { id: 'products', label: 'Mes produits', icon: Package },
    { id: 'orders', label: 'Commandes', icon: ShoppingBag },
    { id: 'profile', label: 'Boutique', icon: Star },
  ];

  const sectionStyle = {
    background: 'var(--card-bg)',
    border: '1.5px solid var(--border)',
    borderRadius: 20,
    padding: '24px',
    boxShadow: 'var(--shadow-sm)',
    marginBottom: 20,
  };

  if (loading) return <Loader text="Chargement du tableau de bord..." />;

  const isApproved = sellerProfile?.status === 'approved';
  const kpis = analytics?.kpis || {};

  return (
    <>
      <SEOHead title="Tableau de bord Vendeur — Visio" />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px 48px' }}>

        {/* Header */}
        <div style={{
          padding: '22px 26px', marginBottom: 24,
          background: 'var(--primary)',
          borderRadius: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 14,
        }}>
          <div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: '1.4rem', color: '#fff', marginBottom: 4 }}>
              {sellerProfile?.shop_name || 'Ma Boutique'} 🏪
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                padding: '3px 12px', borderRadius: 999, fontSize: 11,
                fontFamily: 'DM Sans, sans-serif', fontWeight: 700,
                background: isApproved ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.15)',
                color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
              }}>
                {isApproved ? '✓ Approuvé' : '⏳ En attente de validation'}
              </span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontFamily: 'DM Sans' }}>
                {sellerProfile?.category_focus}
              </span>
            </div>
          </div>
          {isApproved && (
            <Link to="/products/new" style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 12,
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff', textDecoration: 'none',
              fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 14,
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            >
              <Plus style={{ width: 16, height: 16 }} /> Ajouter un produit
            </Link>
          )}
        </div>

        {/* Alerte si pas approuvé */}
        {!isApproved && (
          <div style={{
            padding: '14px 18px', marginBottom: 20,
            background: 'rgba(245,158,11,0.08)',
            border: '1.5px solid rgba(245,158,11,0.3)',
            borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <AlertCircle style={{ width: 18, height: 18, color: '#f59e0b', flexShrink: 0 }} />
            <p style={{ fontSize: 14, color: '#f59e0b', fontFamily: 'DM Sans', lineHeight: 1.5 }}>
              Votre boutique est en cours de validation. Vous pourrez ajouter des produits après approbation.
            </p>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap', borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 16px', borderRadius: 10, cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 700,
                border: tab === id ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
                background: tab === id ? 'var(--primary-subtle)' : 'var(--card-bg)',
                color: tab === id ? 'var(--primary)' : 'var(--text-secondary)',
                transition: 'all 0.2s',
              }}
            >
              <Icon style={{ width: 14, height: 14 }} /> {label}
            </button>
          ))}
        </div>

        {/* =================== TAB: OVERVIEW =================== */}
        {tab === 'overview' && analytics && (
          <div>
            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
              <KPICard icon={DollarSign} label="Revenus totaux" value={formatPrice(kpis.total_revenue)} color="#e63946" growth={kpis.growth_percent} />
              <KPICard icon={TrendingUp} label="Ce mois" value={formatPrice(kpis.this_month_revenue)} color="#6366f1" sub={`vs ${formatPrice(kpis.last_month_revenue)} le mois dernier`} />
              <KPICard icon={ShoppingBag} label="Commandes" value={kpis.total_orders} color="#10b981" sub={`${kpis.pending_orders} en attente`} />
              <KPICard icon={Package} label="Produits actifs" value={kpis.active_products} color="#f59e0b" sub={`${kpis.total_products} au total`} />
            </div>

            {/* Graphique revenus */}
            <div style={{ ...sectionStyle }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, color: 'var(--text-primary)', marginBottom: 20 }}>
                📈 Revenus des 6 derniers mois
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={analytics.monthly_data}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e63946" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#e63946" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontFamily: 'DM Sans', fontSize: 12, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontFamily: 'DM Sans', fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" name="Revenus" stroke="#e63946" strokeWidth={2.5} fill="url(#colorRevenue)" dot={{ fill: '#e63946', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Top produits */}
            {analytics.top_products?.length > 0 && (
              <div style={sectionStyle}>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, color: 'var(--text-primary)', marginBottom: 20 }}>
                  🔥 Top produits par vues
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analytics.top_products} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis type="number" tick={{ fontFamily: 'DM Sans', fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontFamily: 'DM Sans', fontSize: 12, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} width={120} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="views_count" name="Vues" fill="#e63946" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* =================== TAB: ANALYTICS =================== */}
        {tab === 'analytics' && analytics && (
          <div>
            {/* KPIs row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
              <KPICard icon={DollarSign} label="Revenus totaux" value={formatPrice(kpis.total_revenue)} color="#e63946" growth={kpis.growth_percent} />
              <KPICard icon={TrendingUp} label="Ce mois" value={formatPrice(kpis.this_month_revenue)} color="#6366f1" />
              <KPICard icon={ShoppingBag} label="Total commandes" value={kpis.total_orders} color="#10b981" />
              <KPICard icon={Package} label="Produits actifs" value={kpis.active_products} color="#f59e0b" />
            </div>

            {/* Graphiques côte à côte */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              {/* Revenus + Commandes */}
              <div style={sectionStyle}>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, color: 'var(--text-primary)', marginBottom: 18 }}>
                  Revenus & Commandes
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analytics.monthly_data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" tick={{ fontFamily: 'DM Sans', fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fontFamily: 'DM Sans', fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontFamily: 'DM Sans', fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontFamily: 'DM Sans', fontSize: 12 }} />
                    <Bar yAxisId="left" dataKey="revenue" name="Revenus" fill="#e63946" radius={[4, 4, 0, 0]} opacity={0.85} />
                    <Bar yAxisId="right" dataKey="orders" name="Commandes" fill="#6366f1" radius={[4, 4, 0, 0]} opacity={0.85} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Statuts commandes */}
              <div style={sectionStyle}>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, color: 'var(--text-primary)', marginBottom: 18 }}>
                  Statuts des commandes
                </h3>
                {analytics.status_data?.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie
                          data={analytics.status_data}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {analytics.status_data.map((entry, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [value, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                      {analytics.status_data.map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                          <span style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'var(--text-secondary)' }}>{item.name} ({item.value})</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontFamily: 'DM Sans', fontSize: 14 }}>
                    Aucune commande pour l'instant
                  </div>
                )}
              </div>
            </div>

            {/* Top produits détaillé */}
            {analytics.top_products?.length > 0 && (
              <div style={sectionStyle}>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, color: 'var(--text-primary)', marginBottom: 18 }}>
                  Performance des produits
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        {['Produit', 'Vues', 'Note', 'Stock', 'Prix'].map(h => (
                          <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.top_products.map((p, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-subtle)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '12px', fontFamily: 'DM Sans', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</td>
                          <td style={{ padding: '12px', fontFamily: 'DM Sans', fontSize: 13, color: 'var(--text-secondary)' }}>{p.views_count}</td>
                          <td style={{ padding: '12px', fontFamily: 'DM Sans', fontSize: 13, color: '#f59e0b' }}>⭐ {parseFloat(p.average_rating).toFixed(1)}</td>
                          <td style={{ padding: '12px', fontFamily: 'DM Sans', fontSize: 13, color: p.stock > 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>{p.stock}</td>
                          <td style={{ padding: '12px', fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>{formatPrice(p.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================== TAB: PRODUCTS =================== */}
        {tab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
                Mes Produits ({products.length})
              </h2>
              {isApproved && (
                <Link to="/products/new" className="btn-primary" style={{ fontSize: 13, padding: '9px 18px' }}>
                  <Plus style={{ width: 15, height: 15 }} /> Nouveau produit
                </Link>
              )}
            </div>

            {products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
                <Package style={{ width: 52, height: 52, opacity: 0.2, margin: '0 auto 14px' }} />
                <p style={{ fontFamily: 'DM Sans', fontSize: 15, marginBottom: 16 }}>Aucun produit pour l'instant.</p>
                {isApproved && <Link to="/products/new" className="btn-primary">Ajouter mon premier produit</Link>}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {products.map(p => (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
                    background: 'var(--card-bg)', border: '1.5px solid var(--border)',
                    borderRadius: 16, flexWrap: 'wrap',
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-red)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ width: 54, height: 54, borderRadius: 12, overflow: 'hidden', background: 'var(--bg-soft)', flexShrink: 0, border: '1px solid var(--border)' }}>
                      {p.primary_image
                        ? <img src={p.primary_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📱</div>
                      }
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                      <div style={{ display: 'flex', gap: 12, marginTop: 3, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'Syne', fontSize: 13, color: 'var(--primary)', fontWeight: 800 }}>{formatPrice(p.price)}</span>
                        <span style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'var(--text-secondary)' }}>Stock: {p.stock}</span>
                        <span style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'var(--text-muted)' }}>👁 {p.views_count}</span>
                        {p.reviews_count > 0 && <span style={{ fontSize: 12, color: '#f59e0b', fontFamily: 'DM Sans' }}>⭐ {parseFloat(p.average_rating).toFixed(1)}</span>}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button onClick={() => handleToggleActive(p)} style={{
                        fontSize: 11, padding: '4px 12px', borderRadius: 999, cursor: 'pointer',
                        fontFamily: 'DM Sans', fontWeight: 700,
                        background: p.is_active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        color: p.is_active ? '#10b981' : '#ef4444',
                        border: `1px solid ${p.is_active ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                        transition: 'all 0.2s',
                      }}>
                        {p.is_active ? 'Actif' : 'Inactif'}
                      </button>

                      <Link to={`/products/${p.slug}`} style={{ padding: 7, borderRadius: 8, background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text-secondary)', display: 'flex', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#6366f1'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                      >
                        <Eye style={{ width: 14, height: 14 }} />
                      </Link>

                      <Link to={`/products/edit/${p.slug}`} style={{ padding: 7, borderRadius: 8, background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text-secondary)', display: 'flex', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.borderColor = 'var(--border-red)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                      >
                        <Edit style={{ width: 14, height: 14 }} />
                      </Link>

                      <button onClick={() => setDeleteConfirm(p.id)} style={{ padding: 7, borderRadius: 8, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', cursor: 'pointer', display: 'flex', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; }}
                      >
                        <Trash2 style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Modal suppression */}
            {deleteConfirm && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                <div style={{
                  background: 'var(--menu-bg)', border: '1.5px solid rgba(239,68,68,0.3)',
                  borderRadius: 20, padding: '32px 28px', maxWidth: 380, width: '100%',
                  textAlign: 'center', boxShadow: 'var(--shadow-lg)',
                }}>
                  <Trash2 style={{ width: 36, height: 36, color: '#ef4444', margin: '0 auto 14px' }} />
                  <h3 style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Supprimer ce produit ?</h3>
                  <p style={{ color: 'var(--text-secondary)', fontFamily: 'DM Sans', fontSize: 14, marginBottom: 24 }}>Cette action est irréversible.</p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setDeleteConfirm(null)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '11px 0' }}>Annuler</button>
                    <button onClick={() => handleDeleteProduct(deleteConfirm)} style={{ flex: 1, padding: '11px 0', borderRadius: 12, background: '#ef4444', border: 'none', color: '#fff', fontFamily: 'DM Sans', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================== TAB: ORDERS =================== */}
        {tab === 'orders' && (
          <div>
            <h2 style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 18 }}>
              Commandes ({orders.length})
            </h2>
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
                <ShoppingBag style={{ width: 52, height: 52, opacity: 0.2, margin: '0 auto 14px' }} />
                <p style={{ fontFamily: 'DM Sans', fontSize: 15 }}>Aucune commande pour l'instant.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {orders.map(order => {
                  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                  return (
                    <div key={order.id} style={{
                      padding: '16px 20px',
                      background: 'var(--card-bg)', border: '1.5px solid var(--border)',
                      borderRadius: 16,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                        <div>
                          <p style={{ fontFamily: 'Syne', fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{order.reference}</p>
                          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'DM Sans', marginTop: 2 }}>{formatDate(order.created_at)}</p>
                        </div>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <span style={{
                            fontSize: 11, padding: '4px 12px', borderRadius: 999,
                            fontFamily: 'DM Sans', fontWeight: 700,
                            background: cfg.color + '15',
                            color: cfg.color,
                            border: `1px solid ${cfg.color}40`,
                          }}>
                            {cfg.label}
                          </span>
                          <span style={{ fontFamily: 'Syne', fontSize: 14, fontWeight: 800, color: 'var(--primary)' }}>
                            {formatPrice(order.total)}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {order.items?.slice(0, 2).map(item => (
                          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'DM Sans' }}>
                            <span>{item.product_name} ×{item.quantity}</span>
                            <span>{formatPrice(item.total_price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =================== TAB: PROFILE =================== */}
        {tab === 'profile' && sellerProfile && (
          <div style={{ maxWidth: 560 }}>
            <h2 style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 18 }}>Ma Boutique</h2>
            <div style={{ ...sectionStyle }}>
              {[
                { label: 'Nom de la boutique', value: sellerProfile.shop_name },
                { label: 'Description', value: sellerProfile.shop_description || '—' },
                { label: 'Type de produits', value: sellerProfile.category_focus || '—' },
                { label: 'WhatsApp', value: sellerProfile.whatsapp || '—' },
                { label: 'Statut', value: sellerProfile.status === 'approved' ? '✅ Approuvé' : '⏳ En attente' },
                { label: 'Produits actifs', value: sellerProfile.products_count },
                { label: 'Membre depuis', value: formatDate(sellerProfile.created_at) },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 12, fontFamily: 'DM Sans', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.3 }}>{label}</span>
                  <span style={{ fontSize: 14, color: 'var(--text-primary)', fontFamily: 'DM Sans', fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{value}</span>
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