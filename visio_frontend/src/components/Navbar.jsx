import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Search, Menu, X,
  ChevronDown, LogOut, Package, Store, Sun, Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems, setIsOpen } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef(null);

  const isSeller = user?.role === 'seller' || user?.role === 'admin' || user?.is_staff;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalogue?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const ThemeBtn = () => (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Mode clair' : 'Mode sombre'}
      style={{
        padding: 8,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 10, cursor: 'pointer',
        color: 'var(--text-secondary)', transition: 'all 0.2s',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(249,115,22,0.4)';
        e.currentTarget.style.color = 'var(--neon-orange)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
        e.currentTarget.style.color = 'var(--text-secondary)';
      }}
    >
      {isDark
        ? <Sun style={{ width: 18, height: 18 }} />
        : <Moon style={{ width: 18, height: 18 }} />
      }
    </button>
  );

  const CartBtn = () => (
    <button
      onClick={() => setIsOpen(true)}
      style={{
        position: 'relative', padding: 8,
        background: 'none', border: 'none',
        cursor: 'pointer', color: 'var(--text-secondary)',
        transition: 'color 0.2s',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onMouseEnter={e => e.currentTarget.style.color = 'var(--neon-orange)'}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
    >
      <ShoppingCart style={{ width: 22, height: 22 }} />
      {totalItems > 0 && (
        <span style={{
          position: 'absolute', top: 2, right: 2,
          background: 'var(--neon-orange)',
          color: '#fff', fontSize: 10, fontWeight: 800,
          borderRadius: '50%', width: 18, height: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 8px var(--neon-orange-glow)',
          fontFamily: 'Orbitron',
        }}>
          {totalItems > 9 ? '9+' : totalItems}
        </span>
      )}
    </button>
  );

  return (
    <nav className="navbar-glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, var(--neon-orange), hsl(22,95%,40%))',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px var(--neon-orange-glow)',
            }}>
              <span style={{ color: '#fff', fontFamily: 'Orbitron', fontWeight: 900, fontSize: 16 }}>V</span>
            </div>
            <span style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: 18, color: 'var(--text-primary)', letterSpacing: 2 }}>
              VISIO
            </span>
            {/* Badge vendeur */}
            {isSeller && isAuthenticated && (
              <span style={{
                fontSize: 9, fontFamily: 'Orbitron', fontWeight: 700,
                padding: '2px 8px', borderRadius: 999,
                background: 'rgba(249,115,22,0.15)',
                border: '1px solid rgba(249,115,22,0.4)',
                color: 'var(--neon-orange)', letterSpacing: 1,
              }}>VENDEUR</span>
            )}
          </Link>

          {/* Recherche desktop */}
          <form onSubmit={handleSearch} style={{ display: 'none', flex: 1, maxWidth: 400, margin: '0 24px' }}
            className="md-search-form"
          >
            <div style={{ position: 'relative', width: '100%' }}>
              <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-secondary)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit..."
                className="input-field"
                style={{ paddingLeft: 42, borderRadius: 999, fontSize: 14 }}
              />
            </div>
          </form>

          {/* Actions desktop */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="desktop-actions">

            {/* Liens nav selon rôle */}
            {isSeller && isAuthenticated ? (
              // Interface VENDEUR
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Link to="/seller-dashboard"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 14px', borderRadius: 10, textDecoration: 'none',
                    background: 'rgba(249,115,22,0.1)',
                    border: '1px solid rgba(249,115,22,0.3)',
                    color: 'var(--neon-orange)',
                    fontFamily: 'Orbitron', fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 12px var(--neon-orange-glow)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                >
                  <Store style={{ width: 14, height: 14 }} /> MA BOUTIQUE
                </Link>
                <Link to="/products/new"
                  className="btn-primary"
                  style={{ fontSize: 11, padding: '7px 14px', letterSpacing: 0.5 }}
                >
                  + PRODUIT
                </Link>
                <Link to="/catalogue"
                  style={{
                    fontFamily: 'Rajdhani', fontWeight: 600, fontSize: 13,
                    color: 'var(--text-secondary)', textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.target.style.color = 'var(--neon-orange)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
                >
                  Catalogue
                </Link>
              </div>
            ) : (
              // Interface ACHETEUR
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Link to="/catalogue"
                  style={{
                    fontFamily: 'Rajdhani', fontWeight: 600, fontSize: 13,
                    letterSpacing: 0.5, color: 'var(--text-secondary)',
                    textDecoration: 'none', textTransform: 'uppercase',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.target.style.color = 'var(--neon-orange)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
                >
                  Catalogue
                </Link>
                <Link to="/partenaires"
                  style={{
                    fontFamily: 'Rajdhani', fontWeight: 600, fontSize: 13,
                    letterSpacing: 0.5, color: 'var(--text-secondary)',
                    textDecoration: 'none', textTransform: 'uppercase',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => e.target.style.color = 'var(--neon-orange)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
                >
                  Vendeurs
                </Link>
              </div>
            )}

            {/* Theme toggle — toujours visible */}
            <ThemeBtn />

            {/* Panier — acheteurs seulement */}
            {!isSeller && <CartBtn />}

            {/* Menu utilisateur */}
            {isAuthenticated ? (
              <div style={{ position: 'relative' }} ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 12px', borderRadius: 10, cursor: 'pointer',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(249,115,22,0.4)';
                    e.currentTarget.style.boxShadow = '0 0 12px var(--neon-orange-glow)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    width: 30, height: 30,
                    background: isSeller
                      ? 'linear-gradient(135deg, var(--neon-orange), hsl(22,95%,35%))'
                      : 'linear-gradient(135deg, #818cf8, #6366f1)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: isSeller ? '0 0 10px var(--neon-orange-glow)' : '0 0 10px rgba(129,140,248,0.4)',
                  }}>
                    <span style={{ color: '#fff', fontFamily: 'Orbitron', fontWeight: 700, fontSize: 12 }}>
                      {user?.first_name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <ChevronDown style={{ width: 14, height: 14, color: 'var(--text-secondary)' }} />
                </button>

                {userMenuOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    width: 220,
                    background: 'rgba(15,15,28,0.97)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 16,
                    boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                    overflow: 'hidden', zIndex: 50,
                  }}>
                    {/* Header menu */}
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: isSeller
                            ? 'linear-gradient(135deg, var(--neon-orange), hsl(22,95%,35%))'
                            : 'linear-gradient(135deg, #818cf8, #6366f1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <span style={{ color: '#fff', fontFamily: 'Orbitron', fontWeight: 700, fontSize: 14 }}>
                            {user?.first_name?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 14, fontFamily: 'Rajdhani' }}>
                            {user?.full_name || user?.username}
                          </p>
                          <p style={{ color: 'var(--text-secondary)', fontSize: 11, fontFamily: 'Orbitron' }}>
                            {isSeller ? '🏪 VENDEUR' : '🛒 ACHETEUR'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Liens selon rôle */}
                    {isSeller ? (
                      <>
                        <MenuLink to="/seller-dashboard" icon={<Store style={{ width: 15, height: 15 }} />} label="Ma boutique" onClick={() => setUserMenuOpen(false)} />
                        <MenuLink to="/products/new" icon={<Package style={{ width: 15, height: 15 }} />} label="Ajouter un produit" onClick={() => setUserMenuOpen(false)} />
                        <MenuLink to="/partenaires" icon={<Store style={{ width: 15, height: 15 }} />} label="Nos partenaires" onClick={() => setUserMenuOpen(false)} />
                      </>
                    ) : (
                      <>
                        <MenuLink to="/dashboard" icon={<Package style={{ width: 15, height: 15 }} />} label="Mes commandes" onClick={() => setUserMenuOpen(false)} />
                        <MenuLink to="/partenaires" icon={<Store style={{ width: 15, height: 15 }} />} label="Nos vendeurs" onClick={() => setUserMenuOpen(false)} />
                      </>
                    )}

                    {/* Séparateur */}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '4px 0' }} />

                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 16px', width: '100%', textAlign: 'left',
                        color: '#f87171', fontSize: 14,
                        fontFamily: 'Rajdhani', fontWeight: 600,
                        background: 'none', border: 'none', cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut style={{ width: 15, height: 15 }} /> Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Link to="/login" className="btn-secondary" style={{ fontSize: 13, padding: '8px 16px' }}>Connexion</Link>
                <Link to="/register" className="btn-primary" style={{ fontSize: 13, padding: '8px 16px' }}>Inscription</Link>
              </div>
            )}
          </div>

          {/* Mobile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="mobile-actions">
            <ThemeBtn />
            {!isSeller && <CartBtn />}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
            >
              {mobileOpen ? <X style={{ width: 24, height: 24 }} /> : <Menu style={{ width: 24, height: 24 }} />}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {mobileOpen && (
          <div style={{
            padding: '16px 0',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(10,10,20,0.95)',
            backdropFilter: 'blur(20px)',
          }}>
            {/* Recherche mobile */}
            <form onSubmit={handleSearch} style={{ marginBottom: 16 }}>
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="input-field"
                  style={{ paddingLeft: 42, borderRadius: 999 }}
                />
              </div>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {isSeller && isAuthenticated ? (
                <>
                  <MobileLink to="/seller-dashboard" label="🏪 Ma boutique" onClick={() => setMobileOpen(false)} />
                  <MobileLink to="/products/new" label="+ Ajouter un produit" onClick={() => setMobileOpen(false)} />
                  <MobileLink to="/catalogue" label="Catalogue" onClick={() => setMobileOpen(false)} />
                  <MobileLink to="/partenaires" label="Nos partenaires" onClick={() => setMobileOpen(false)} />
                </>
              ) : isAuthenticated ? (
                <>
                  <MobileLink to="/catalogue" label="Catalogue" onClick={() => setMobileOpen(false)} />
                  <MobileLink to="/partenaires" label="Nos vendeurs" onClick={() => setMobileOpen(false)} />
                  <MobileLink to="/dashboard" label="Mes commandes" onClick={() => setMobileOpen(false)} />
                </>
              ) : (
                <>
                  <MobileLink to="/catalogue" label="Catalogue" onClick={() => setMobileOpen(false)} />
                  <MobileLink to="/partenaires" label="Nos vendeurs" onClick={() => setMobileOpen(false)} />
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary" style={{ marginTop: 8, textAlign: 'center', display: 'block', padding: '11px 0' }}>
                    Connexion
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary" style={{ marginTop: 8, textAlign: 'center', display: 'block', padding: '11px 0' }}>
                    Inscription
                  </Link>
                </>
              )}

              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  style={{ padding: '10px 0', color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'Rajdhani', fontWeight: 600, fontSize: 15, marginTop: 8 }}
                >
                  Déconnexion
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CSS responsive inline */}
      <style>{`
        @media (min-width: 768px) {
          .md-search-form { display: flex !important; }
          .desktop-actions { display: flex !important; }
          .mobile-actions { display: none !important; }
        }
        @media (max-width: 767px) {
          .desktop-actions { display: none !important; }
        }
      `}</style>
    </nav>
  );
};

// Composants helper
const MenuLink = ({ to, icon, label, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 16px', textDecoration: 'none',
      color: 'var(--text-secondary)', fontSize: 14,
      fontFamily: 'Rajdhani', fontWeight: 600,
      transition: 'all 0.2s',
    }}
    onMouseEnter={e => { e.currentTarget.style.color = 'var(--neon-orange)'; e.currentTarget.style.background = 'rgba(249,115,22,0.06)'; }}
    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
  >
    {icon} {label}
  </Link>
);

const MobileLink = ({ to, label, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    style={{
      padding: '11px 4px', color: 'var(--text-secondary)',
      textDecoration: 'none', fontFamily: 'Rajdhani',
      fontWeight: 600, fontSize: 15, display: 'block',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}
  >
    {label}
  </Link>
);

export default Navbar;