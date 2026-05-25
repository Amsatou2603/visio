import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, ChevronDown, LogOut, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems, setIsOpen } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef(null);
  const { isDark, toggleTheme } = useTheme();

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

  return (
    <nav className="navbar-glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
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
          </Link>

          {/* Recherche desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div style={{ position: 'relative', width: '100%' }}>
              <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-secondary)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit..."
                className="input-field"
                style={{ paddingLeft: 42, borderRadius: 999, fontSize: 14 }}
              />
            </div>
          </form>

          {/* Actions desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/catalogue" style={{
              fontFamily: 'Rajdhani', fontWeight: 600, fontSize: 14,
              letterSpacing: 1, color: 'var(--text-secondary)',
              textDecoration: 'none', textTransform: 'uppercase',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.target.style.color = 'var(--neon-orange)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
            >
              Catalogue
            </Link>

            {/* Panier */}
            <button
              onClick={() => setIsOpen(true)}
              style={{ position: 'relative', padding: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', transition: 'color 0.2s' }}
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
            <button
              onClick={toggleTheme}
              style={{
                padding: 8, background: 'none', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, cursor: 'pointer',
                color: 'var(--text-secondary)', transition: 'all 0.2s',
                backdropFilter: 'blur(10px)',
                background: 'rgba(255,255,255,0.05)',
              }}
              title={isDark ? 'Mode clair' : 'Mode sombre'}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.4)'; e.currentTarget.style.color = 'var(--neon-orange)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              {isDark
                ? <Sun style={{ width: 18, height: 18 }} />
                : <Moon style={{ width: 18, height: 18 }} />
              }
            </button>

            {/* User menu */}
            {isAuthenticated ? (
              <div style={{ position: 'relative' }} ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 12px', borderRadius: 10, cursor: 'pointer',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.4)'; e.currentTarget.style.boxShadow = '0 0 12px var(--neon-orange-glow)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{
                    width: 30, height: 30,
                    background: 'linear-gradient(135deg, var(--neon-orange), hsl(22,95%,35%))',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 10px var(--neon-orange-glow)',
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
                    width: 200,
                    background: 'rgba(15,15,28,0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 14,
                    boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                    overflow: 'hidden',
                    zIndex: 50,
                  }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      <p style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 14, fontFamily: 'Rajdhani' }}>{user?.full_name}</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{user?.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 16px', textDecoration: 'none',
                        color: 'var(--text-secondary)', fontSize: 14,
                        fontFamily: 'Rajdhani', fontWeight: 600,
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--neon-orange)'; e.currentTarget.style.background = 'rgba(249,115,22,0.08)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
                    >
                      <Package style={{ width: 16, height: 16 }} /> Mes commandes
                    </Link>
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 16px', width: '100%', textAlign: 'left',
                        color: '#f87171', fontSize: 14,
                        fontFamily: 'Rajdhani', fontWeight: 600,
                        background: 'none', border: 'none', cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut style={{ width: 16, height: 16 }} /> Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary" style={{ fontSize: 13, padding: '8px 16px' }}>Connexion</Link>
                <Link to="/register" className="btn-primary" style={{ fontSize: 13, padding: '8px 16px' }}>Inscription</Link>
              </div>
            )}
          </div>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-2">
            <button onClick={() => setIsOpen(true)} style={{ position: 'relative', padding: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
              <ShoppingCart style={{ width: 24, height: 24 }} />
              {totalItems > 0 && (
                <span style={{
                  position: 'absolute', top: 2, right: 2,
                  background: 'var(--neon-orange)', color: '#fff',
                  fontSize: 10, borderRadius: '50%', width: 16, height: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {totalItems}
                </span>
              )}
            </button>
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
            background: 'rgba(10,10,20,0.8)',
            backdropFilter: 'blur(20px)',
          }}>
            <form onSubmit={handleSearch} style={{ marginBottom: 16 }}>
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className="input-field"
                  style={{ paddingLeft: 42, borderRadius: 999 }}
                />
              </div>
            </form>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <Link to="/catalogue" onClick={() => setMobileOpen(false)} style={{ padding: '10px 0', color: 'var(--text-secondary)', textDecoration: 'none', fontFamily: 'Rajdhani', fontWeight: 600 }}>Catalogue</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)} style={{ padding: '10px 0', color: 'var(--text-secondary)', textDecoration: 'none', fontFamily: 'Rajdhani', fontWeight: 600 }}>Mes commandes</Link>
                  <button onClick={handleLogout} style={{ padding: '10px 0', color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'Rajdhani', fontWeight: 600 }}>Déconnexion</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary" style={{ marginTop: 8, textAlign: 'center' }}>Connexion</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary" style={{ marginTop: 8, textAlign: 'center' }}>Inscription</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;