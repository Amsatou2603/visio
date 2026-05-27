import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Search, Menu, X,
  ChevronDown, LogOut, Package, Store, Sun, Moon, Heart
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
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef(null);

  const isSeller = user?.role === 'seller' || user?.role === 'admin' || user?.is_staff;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const navLinkStyle = {
    fontFamily: 'DM Sans, sans-serif',
    fontWeight: 600, fontSize: 14,
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    padding: '6px 10px',
    borderRadius: 8,
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  };

  const iconBtnStyle = {
    padding: 8,
    background: 'transparent',
    border: '1.5px solid var(--border)',
    borderRadius: 10, cursor: 'pointer',
    color: 'var(--text-secondary)',
    transition: 'all 0.2s ease',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  };

  return (
    <>
      {/* Wrapper flottant */}
      <div style={{
        position: 'sticky',
        top: 12,
        zIndex: 50,
        padding: '0 16px',
        pointerEvents: 'none',
      }}>
        <nav
          className="navbar-glass"
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            pointerEvents: 'all',
            transition: 'all 0.3s ease',
            transform: scrolled ? 'scale(0.995)' : 'scale(1)',
          }}
        >
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            height: 58, padding: '0 20px',
          }}>

            {/* Logo */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
              <div style={{
                width: 34, height: 34,
                background: 'var(--primary)',
                borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 3px 12px rgba(230,57,70,0.3)',
                flexShrink: 0,
              }}>
                <span style={{ color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 17 }}>V</span>
              </div>
              <span style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 800,
                fontSize: 17, color: 'var(--text-primary)',
                letterSpacing: 1,
              }}>
                VISIO
              </span>
              {isSeller && isAuthenticated && (
                <span style={{
                  fontSize: 9, fontFamily: 'DM Sans, sans-serif', fontWeight: 700,
                  padding: '2px 8px', borderRadius: 999,
                  background: 'var(--primary-subtle)',
                  border: '1px solid var(--border-red)',
                  color: 'var(--primary)', letterSpacing: 0.5,
                }}>VENDEUR</span>
              )}
            </Link>

            {/* Recherche desktop */}
            <form
              onSubmit={handleSearch}
              style={{ flex: 1, maxWidth: 380, margin: '0 20px' }}
              className="hide-mobile"
            >
              <div style={{ position: 'relative' }}>
                <Search style={{
                  position: 'absolute', left: 14, top: '50%',
                  transform: 'translateY(-50%)',
                  width: 15, height: 15, color: 'var(--text-muted)',
                }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un produit..."
                  className="input-field"
                  style={{ paddingLeft: 40, borderRadius: 999, fontSize: 13, height: 38 }}
                />
              </div>
            </form>

            {/* Actions desktop */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="hide-mobile">

              {/* Navigation links */}
              {isSeller && isAuthenticated ? (
                <>
                  <Link to="/seller-dashboard" style={{
                    ...navLinkStyle,
                    background: 'var(--primary-subtle)',
                    color: 'var(--primary)',
                    border: '1px solid var(--border-red)',
                    borderRadius: 10,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <Store style={{ width: 14, height: 14 }} /> Ma boutique
                  </Link>
                  <Link to="/products/new" className="btn-primary" style={{ padding: '7px 14px', fontSize: 13, background: 'var(--primary)', color: '#fff', border: '1px solid var(--primary)' }}>
                    + Produit
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/catalogue" style={navLinkStyle}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-subtle)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
                  >Catalogue</Link>
                  <Link to="/partenaires" style={navLinkStyle}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-subtle)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
                  >Vendeurs</Link>
                  <Link to="/comparateur" style={navLinkStyle}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-subtle)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
                  >Comparer</Link>
                </>
              )}

              <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                style={iconBtnStyle}
                title={isDark ? 'Mode clair' : 'Mode sombre'}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                {isDark ? <Sun style={{ width: 17, height: 17 }} /> : <Moon style={{ width: 17, height: 17 }} />}
              </button>

              {/* Panier */}
              {!isSeller && (
                <button
                  onClick={() => setIsOpen(true)}
                  style={{ ...iconBtnStyle, position: 'relative' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <ShoppingCart style={{ width: 17, height: 17 }} />
                  {totalItems > 0 && (
                    <span style={{
                      position: 'absolute', top: -5, right: -5,
                      background: 'var(--primary)', color: '#fff',
                      fontSize: 9, fontWeight: 800, borderRadius: '50%',
                      width: 17, height: 17,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'DM Sans',
                    }}>
                      {totalItems > 9 ? '9+' : totalItems}
                    </span>
                  )}
                </button>
              )}

              {/* Auth */}
              {isAuthenticated ? (
                <div style={{ position: 'relative' }} ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      padding: '5px 12px 5px 5px',
                      borderRadius: 12, cursor: 'pointer',
                      background: 'var(--bg-card)',
                      border: '1.5px solid var(--border-strong)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--primary-glow)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: isSeller ? 'var(--primary)' : '#6366f1',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <span style={{ color: '#fff', fontFamily: 'Syne', fontWeight: 800, fontSize: 12 }}>
                        {user?.first_name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span style={{ fontFamily: 'DM Sans', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.first_name || user?.username}
                    </span>
                    <ChevronDown style={{ width: 14, height: 14, color: 'var(--text-muted)', flexShrink: 0 }} />
                  </button>

                  {userMenuOpen && (
                    <div className="dropdown-menu animate-slide-up" style={{
                      position: 'absolute', right: 0, top: 'calc(100% + 10px)',
                      width: 220, zIndex: 100,
                    }}>
                      {/* Header */}
                      <div style={{
                        padding: '14px 16px',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', gap: 10,
                      }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: '50%',
                          background: isSeller ? 'var(--primary)' : '#6366f1',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <span style={{ color: '#fff', fontFamily: 'Syne', fontWeight: 800, fontSize: 15 }}>
                            {user?.first_name?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user?.full_name || user?.username}
                          </p>
                          <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: isSeller ? 'var(--primary)' : '#6366f1', fontWeight: 600, marginTop: 1 }}>
                            {isSeller ? '🏪 Vendeur' : '🛒 Acheteur'}
                          </p>
                        </div>
                      </div>

                      {/* Liens */}
                      <div style={{ padding: '6px 0' }}>
                        {isSeller ? (
                          <>
                            <DropLink to="/seller-dashboard" icon={<Store size={15} />} label="Ma boutique" onClick={() => setUserMenuOpen(false)} />
                            <DropLink to="/products/new" icon={<Package size={15} />} label="Nouveau produit" onClick={() => setUserMenuOpen(false)} />
                          </>
                        ) : (
                          <>
                            <DropLink to="/dashboard" icon={<Package size={15} />} label="Mes commandes" onClick={() => setUserMenuOpen(false)} />
                            <DropLink to="/wishlist" icon={<Heart size={15} />} label="Ma wishlist" onClick={() => setUserMenuOpen(false)} />
                          </>
                        )}
                        <DropLink to="/partenaires" icon={<Store size={15} />} label="Nos vendeurs" onClick={() => setUserMenuOpen(false)} />
                      </div>

                      <div style={{ borderTop: '1px solid var(--border)', padding: '6px 0' }}>
                        <button
                          onClick={handleLogout}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '9px 16px', width: '100%',
                            color: '#ef4444', fontSize: 14,
                            fontFamily: 'DM Sans', fontWeight: 600,
                            background: 'none', border: 'none', cursor: 'pointer',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <LogOut size={15} /> Déconnexion
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link to="/login" className="btn-secondary" style={{ padding: '7px 16px', fontSize: 13 }}>
                    Connexion
                  </Link>
                  <Link to="/register" className="btn-primary" style={{ padding: '7px 16px', fontSize: 13 }}>
                    Inscription
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="hide-desktop">
              <button onClick={toggleTheme} style={iconBtnStyle}>
                {isDark ? <Sun style={{ width: 17, height: 17 }} /> : <Moon style={{ width: 17, height: 17 }} />}
              </button>
              {!isSeller && (
                <button onClick={() => setIsOpen(true)} style={{ ...iconBtnStyle, position: 'relative' }}>
                  <ShoppingCart style={{ width: 17, height: 17 }} />
                  {totalItems > 0 && (
                    <span style={{
                      position: 'absolute', top: -5, right: -5,
                      background: 'var(--primary)', color: '#fff',
                      fontSize: 9, fontWeight: 800, borderRadius: '50%',
                      width: 16, height: 16,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{totalItems}</span>
                  )}
                </button>
              )}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                style={iconBtnStyle}
              >
                {mobileOpen ? <X style={{ width: 18, height: 18 }} /> : <Menu style={{ width: 18, height: 18 }} />}
              </button>
            </div>
          </div>

          {/* Menu mobile */}
          {mobileOpen && (
            <div style={{
              borderTop: '1px solid var(--border)',
              padding: '16px 20px 20px',
              background: 'var(--menu-bg)',
              borderRadius: '0 0 20px 20px',
            }}>
              {/* Recherche mobile */}
              <form onSubmit={handleSearch} style={{ marginBottom: 16 }}>
                <div style={{ position: 'relative' }}>
                  <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Rechercher..."
                    className="input-field"
                    style={{ paddingLeft: 38, borderRadius: 999, height: 38, fontSize: 13 }}
                  />
                </div>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {isSeller && isAuthenticated ? (
                  <>
                    <MobileLink to="/seller-dashboard" label="🏪 Ma boutique" onClick={() => setMobileOpen(false)} />
                    <MobileLink to="/products/new" label="➕ Nouveau produit" onClick={() => setMobileOpen(false)} />
                    <MobileLink to="/catalogue" label="Catalogue" onClick={() => setMobileOpen(false)} />
                  </>
                ) : (
                  <>
                    <MobileLink to="/catalogue" label="Catalogue" onClick={() => setMobileOpen(false)} />
                    <MobileLink to="/partenaires" label="Nos vendeurs" onClick={() => setMobileOpen(false)} />
                    {isAuthenticated && (
                      <>
                        <MobileLink to="/dashboard" label="Mes commandes" onClick={() => setMobileOpen(false)} />
                        <MobileLink to="/wishlist" label="Ma wishlist" onClick={() => setMobileOpen(false)} />
                      </>
                    )}
                  </>
                )}

                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    style={{
                      padding: '11px 0', color: '#ef4444', background: 'none',
                      border: 'none', cursor: 'pointer', textAlign: 'left',
                      fontFamily: 'DM Sans', fontWeight: 600, fontSize: 14,
                      marginTop: 8, borderTop: '1px solid var(--border)',
                    }}
                  >
                    Déconnexion
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: 10, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '10px 0', fontSize: 14 }}>
                      Connexion
                    </Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '10px 0', fontSize: 14 }}>
                      Inscription
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>
      </div>
    </>
  );
};

const DropLink = ({ to, icon, label, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '9px 16px', textDecoration: 'none',
      color: 'var(--text-secondary)', fontSize: 14,
      fontFamily: 'DM Sans', fontWeight: 600,
      transition: 'all 0.15s',
    }}
    onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-subtle)'; }}
    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
  >
    <span style={{ color: 'inherit', display: 'flex' }}>{icon}</span>
    {label}
  </Link>
);

const MobileLink = ({ to, label, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    style={{
      padding: '11px 0', color: 'var(--text-secondary)',
      textDecoration: 'none', fontFamily: 'DM Sans',
      fontWeight: 600, fontSize: 14, display: 'block',
      borderBottom: '1px solid var(--border)',
      transition: 'color 0.15s',
    }}
    onMouseEnter={e => e.target.style.color = 'var(--primary)'}
    onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
  >
    {label}
  </Link>
);

export default Navbar;
