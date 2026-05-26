import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import api from '../services/api';

const Catalogue = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    brand: '',
    min_price: '',
    max_price: '',
    condition: '',
    ordering: '-created_at',
  });

  const fetchProducts = useCallback(async (page = 1, currentFilters) => {
    const f = currentFilters || filters;
    setLoading(true);
    try {
      const params = { page };
      if (f.search) params.search = f.search;
      if (f.category) params.category = f.category;
      if (f.brand) params.brand = f.brand;
      if (f.min_price) params.min_price = f.min_price;
      if (f.max_price) params.max_price = f.max_price;
      if (f.condition) params.condition = f.condition;
      if (f.ordering) params.ordering = f.ordering;

      const res = await api.get('/products/', { params });
      setProducts(res.data.results || res.data);
      setTotalCount(res.data.count || 0);
      setTotalPages(Math.ceil((res.data.count || 0) / 12));
      setCurrentPage(page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          api.get('/products/categories/'),
          api.get('/products/brands/'),
        ]);
        setCategories(catRes.data.results || catRes.data);
        setBrands(brandRes.data.results || brandRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMeta();
  }, []);

  useEffect(() => {
    fetchProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts(1, filters);
    setSidebarOpen(false);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (key !== 'search') {
      fetchProducts(1, newFilters);
      if (window.innerWidth < 768) setSidebarOpen(false);
    }
  };

  const resetFilters = () => {
    const empty = {
      search: '', category: '', brand: '',
      min_price: '', max_price: '', condition: '', ordering: '-created_at',
    };
    setFilters(empty);
    fetchProducts(1, empty);
    setSidebarOpen(false);
  };

  const activeFilterCount = [
    filters.search, filters.category, filters.brand,
    filters.min_price, filters.max_price, filters.condition,
  ].filter(Boolean).length;

  const inputSt = {
    width: '100%', padding: '10px 14px',
    background: 'var(--input-bg)',
    border: '1.5px solid var(--border-color)',
    borderRadius: 10, color: 'var(--text-primary)',
    fontFamily: 'DM Sans, sans-serif', fontSize: 14, outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const FilterLabel = ({ children }) => (
    <label style={{
      display: 'block', fontSize: 11, fontFamily: 'Syne, sans-serif',
      fontWeight: 700, color: 'var(--text-secondary)',
      marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase',
    }}>
      {children}
    </label>
  );

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header sidebar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>
          Filtres {activeFilterCount > 0 && (
            <span style={{
              marginLeft: 8, fontSize: 11, padding: '2px 8px', borderRadius: 999,
              background: 'var(--neon-orange)', color: '#fff', fontFamily: 'DM Sans',
            }}>{activeFilterCount}</span>
          )}
        </span>
        <button
          onClick={resetFilters}
          style={{
            fontSize: 12, color: 'var(--neon-orange)', background: 'none',
            border: 'none', cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 600,
          }}
        >
          Réinitialiser
        </button>
      </div>

      {/* Recherche */}
      <form onSubmit={handleSearchSubmit}>
        <FilterLabel>Recherche</FilterLabel>
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: 'var(--text-secondary)' }} />
          <input
            type="text"
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            placeholder="Nom, marque..."
            style={{ ...inputSt, paddingLeft: 38 }}
            onFocus={e => { e.target.style.borderColor = 'var(--neon-orange)'; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.12)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
        <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '9px 0', fontSize: 13 }}>
          Rechercher
        </button>
      </form>

      {/* Catégorie */}
      <div>
        <FilterLabel>Catégorie</FilterLabel>
        <select
          value={filters.category}
          onChange={e => handleFilterChange('category', e.target.value)}
          style={{ ...inputSt, cursor: 'pointer' }}
          onFocus={e => { e.target.style.borderColor = 'var(--neon-orange)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--border-color)'; }}
        >
          <option value="">Toutes les catégories</option>
          {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
      </div>

      {/* Marque */}
      <div>
        <FilterLabel>Marque</FilterLabel>
        <select
          value={filters.brand}
          onChange={e => handleFilterChange('brand', e.target.value)}
          style={{ ...inputSt, cursor: 'pointer' }}
          onFocus={e => { e.target.style.borderColor = 'var(--neon-orange)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--border-color)'; }}
        >
          <option value="">Toutes les marques</option>
          {brands.map(b => <option key={b.id} value={b.slug}>{b.name}</option>)}
        </select>
      </div>

      {/* Prix */}
      <div>
        <FilterLabel>Prix (FCFA)</FilterLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <input
            type="number"
            value={filters.min_price}
            onChange={e => handleFilterChange('min_price', e.target.value)}
            placeholder="Min"
            style={inputSt}
            onFocus={e => { e.target.style.borderColor = 'var(--neon-orange)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border-color)'; }}
          />
          <input
            type="number"
            value={filters.max_price}
            onChange={e => handleFilterChange('max_price', e.target.value)}
            placeholder="Max"
            style={inputSt}
            onFocus={e => { e.target.style.borderColor = 'var(--neon-orange)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border-color)'; }}
          />
        </div>
      </div>

      {/* État */}
      <div>
        <FilterLabel>État</FilterLabel>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { value: '', label: 'Tous' },
            { value: 'new', label: 'Neuf' },
            { value: 'used', label: 'Occasion' },
            { value: 'refurbished', label: 'Reconditionné' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => handleFilterChange('condition', opt.value)}
              style={{
                padding: '7px 14px', borderRadius: 999, cursor: 'pointer',
                fontFamily: 'DM Sans', fontSize: 13, fontWeight: 600,
                border: `1.5px solid ${filters.condition === opt.value ? 'var(--neon-orange)' : 'var(--border-color)'}`,
                background: filters.condition === opt.value ? 'rgba(249,115,22,0.12)' : 'var(--input-bg)',
                color: filters.condition === opt.value ? 'var(--neon-orange)' : 'var(--text-secondary)',
                transition: 'all 0.2s',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tri */}
      <div>
        <FilterLabel>Trier par</FilterLabel>
        <select
          value={filters.ordering}
          onChange={e => handleFilterChange('ordering', e.target.value)}
          style={{ ...inputSt, cursor: 'pointer' }}
          onFocus={e => { e.target.style.borderColor = 'var(--neon-orange)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--border-color)'; }}
        >
          <option value="-created_at">Plus récents</option>
          <option value="price">Prix croissant</option>
          <option value="-price">Prix décroissant</option>
          <option value="-average_rating">Mieux notés</option>
          <option value="-views_count">Plus populaires</option>
        </select>
      </div>
    </div>
  );

  return (
    <>
      <SEOHead
        title="Catalogue — Téléphones et Électronique"
        description="Parcourez notre catalogue de téléphones, tablettes et accessoires."
        url="/catalogue"
      />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px 48px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h1 className="section-title">Catalogue</h1>
            <p className="section-subtitle">
              {totalCount} produit{totalCount > 1 ? 's' : ''} disponible{totalCount > 1 ? 's' : ''}
            </p>
          </div>

          {/* Bouton filtre mobile */}
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', borderRadius: 12, cursor: 'pointer',
              background: 'var(--card-bg)', border: '1.5px solid var(--border-color)',
              color: 'var(--text-primary)', fontFamily: 'DM Sans', fontWeight: 600, fontSize: 14,
              backdropFilter: 'blur(10px)', transition: 'all 0.2s',
            }}
            className="md-hidden"
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--neon-orange)'; e.currentTarget.style.color = 'var(--neon-orange)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          >
            <SlidersHorizontal style={{ width: 16, height: 16 }} />
            Filtres
            {activeFilterCount > 0 && (
              <span style={{
                width: 20, height: 20, borderRadius: '50%',
                background: 'var(--neon-orange)', color: '#fff',
                fontSize: 11, fontWeight: 800, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>{activeFilterCount}</span>
            )}
          </button>
        </div>

        {/* Layout */}
        <div className="catalogue-layout">

          {/* === SIDEBAR DESKTOP === */}
          <aside style={{
            width: 260, flexShrink: 0,
            background: 'var(--card-bg)',
            backdropFilter: 'blur(20px)',
            border: '1.5px solid var(--border-color)',
            borderRadius: 20, padding: '24px 20px',
            boxShadow: 'var(--glass-shadow)',
            position: 'sticky', top: 80,
          }} className="desktop-sidebar">
            <SidebarContent />
          </aside>

          {/* === SIDEBAR MOBILE (drawer) === */}
          <>
            {/* Overlay */}
            {sidebarOpen && (
              <div
                onClick={() => setSidebarOpen(false)}
                style={{
                  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(4px)', zIndex: 39,
                }}
              />
            )}

            {/* Drawer */}
            <div style={{
              position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
              background: 'var(--menu-bg)',
              backdropFilter: 'blur(24px)',
              border: '1.5px solid var(--border-color)',
              borderRadius: '24px 24px 0 0',
              padding: '20px 20px 32px',
              maxHeight: '85vh', overflowY: 'auto',
              transform: sidebarOpen ? 'translateY(0)' : 'translateY(100%)',
              transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.3)',
            }} className="mobile-drawer">
              {/* Handle */}
              <div style={{
                width: 40, height: 4, borderRadius: 999,
                background: 'var(--border-color)',
                margin: '0 auto 20px',
              }} />
              {/* Bouton fermer */}
              <button
                onClick={() => setSidebarOpen(false)}
                style={{
                  position: 'absolute', top: 16, right: 20,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-secondary)', padding: 4,
                }}
              >
                <X style={{ width: 20, height: 20 }} />
              </button>
              <SidebarContent />
            </div>
          </>

          {/* === GRILLE PRODUITS === */}
          <div className="catalogue-grid">
            {loading ? (
              <Loader text="Chargement des produits..." />
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <p style={{ fontFamily: 'Syne', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                  Aucun produit trouvé
                </p>
                <p style={{ fontFamily: 'DM Sans', fontSize: 14, marginBottom: 20 }}>
                  Essayez de modifier vos filtres
                </p>
                <button onClick={resetFilters} className="btn-primary">
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: 16,
                }}>
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{
                    display: 'flex', justifyContent: 'center',
                    alignItems: 'center', gap: 8, marginTop: 40,
                    flexWrap: 'wrap',
                  }}>
                    <button
                      onClick={() => fetchProducts(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="btn-secondary"
                      style={{ padding: '8px 16px', fontSize: 13 }}
                    >
                      ← Précédent
                    </button>

                    <div style={{ display: 'flex', gap: 6 }}>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                        .map((page, idx, arr) => (
                          <React.Fragment key={page}>
                            {idx > 0 && arr[idx - 1] !== page - 1 && (
                              <span style={{ padding: '8px 4px', color: 'var(--text-secondary)', fontFamily: 'DM Sans' }}>…</span>
                            )}
                            <button
                              onClick={() => fetchProducts(page)}
                              style={{
                                width: 36, height: 36, borderRadius: 10, cursor: 'pointer',
                                fontFamily: 'Syne', fontSize: 13, fontWeight: 700,
                                border: `1.5px solid ${currentPage === page ? 'var(--neon-orange)' : 'var(--border-color)'}`,
                                background: currentPage === page ? 'rgba(249,115,22,0.15)' : 'var(--card-bg)',
                                color: currentPage === page ? 'var(--neon-orange)' : 'var(--text-secondary)',
                                transition: 'all 0.2s',
                                boxShadow: currentPage === page ? '0 0 10px var(--neon-orange-glow)' : 'none',
                              }}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        ))}
                    </div>

                    <button
                      onClick={() => fetchProducts(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="btn-secondary"
                      style={{ padding: '8px 16px', fontSize: 13 }}
                    >
                      Suivant →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* CSS responsive */}
      <style>{`
        @media (min-width: 769px) {
          .desktop-sidebar { display: block !important; }
          .mobile-drawer { display: none !important; }
          .md-hidden { display: none !important; }
        }
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
        }
        
        select option {
          background: var(--menu-bg, #0f0f1a);
          color: var(--text-primary, #fff);
        }
      `}</style>
    </>
  );
};

export default Catalogue;