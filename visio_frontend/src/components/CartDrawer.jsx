import React from 'react';
import { Link } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';

const CartDrawer = () => {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalItems, totalPrice } = useCart();
  if (!isOpen) return null;

  return (
    <>
      <div
        onClick={() => setIsOpen(false)}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 40,
        }}
      />
      <div style={{
        position: 'fixed', right: 0, top: 0,
        height: '100%', width: '100%', maxWidth: 420,
        background: 'rgba(10,10,25,0.95)',
        backdropFilter: 'blur(30px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRight: 'none',
        borderRadius: '20px 0 0 20px',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.6)',
        zIndex: 50,
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}>
          <h2 style={{ fontFamily: 'Orbitron', fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShoppingBag style={{ width: 20, height: 20, color: 'var(--neon-orange)' }} />
            Panier
            {totalItems > 0 && (
              <span style={{
                background: 'var(--neon-orange)',
                color: '#fff', fontSize: 11, fontFamily: 'Orbitron',
                borderRadius: '50%', width: 22, height: 22,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 8px var(--neon-orange-glow)',
              }}>{totalItems}</span>
            )}
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              padding: 8, background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10, cursor: 'pointer',
              color: 'var(--text-secondary)', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.4)'; e.currentTarget.style.color = 'var(--neon-orange)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {items.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16 }}>
              <ShoppingBag style={{ width: 64, height: 64, opacity: 0.15 }} />
              <p style={{ color: 'var(--text-secondary)', fontFamily: 'Rajdhani', fontWeight: 600 }}>Votre panier est vide</p>
              <button onClick={() => setIsOpen(false)} className="btn-primary" style={{ fontSize: 13 }}>
                Continuer mes achats
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map(item => (
                <div key={item.id} style={{
                  display: 'flex', gap: 12, padding: 14,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 14,
                  backdropFilter: 'blur(10px)',
                }}>
                  <div style={{ width: 60, height: 60, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.05)' }}>
                    {item.primary_image
                      ? <img src={item.primary_image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📱</div>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Rajdhani', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                    <p style={{ color: 'var(--neon-orange)', fontFamily: 'Orbitron', fontWeight: 800, fontSize: 13, marginTop: 4, textShadow: '0 0 8px var(--neon-orange-glow)' }}>
                      {formatPrice(item.price, item.currency)}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-primary)' }}>
                        <Minus style={{ width: 12, height: 12 }} />
                      </button>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Orbitron', minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-primary)' }}>
                        <Plus style={{ width: 12, height: 12 }} />
                      </button>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.id)}
                    style={{ color: 'rgba(248,113,113,0.6)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, transition: 'color 0.2s', alignSelf: 'flex-start' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(248,113,113,0.6)'}
                  >
                    <Trash2 style={{ width: 16, height: 16 }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 14, fontFamily: 'Rajdhani' }}>Sous-total</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontFamily: 'Orbitron', fontSize: 13 }}>{formatPrice(totalPrice)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: 14, fontFamily: 'Rajdhani' }}>Livraison</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: 13, fontFamily: 'Rajdhani' }}>2 000 FCFA</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.07)', marginBottom: 16 }}>
              <span style={{ color: 'var(--text-primary)', fontFamily: 'Orbitron', fontWeight: 700, fontSize: 14 }}>Total</span>
              <span style={{ color: 'var(--neon-orange)', fontFamily: 'Orbitron', fontWeight: 900, fontSize: 16, textShadow: '0 0 10px var(--neon-orange-glow)' }}>{formatPrice(totalPrice + 2000)}</span>
            </div>
            <Link to="/checkout" onClick={() => setIsOpen(false)} className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 14, padding: '12px 0' }}>
              Commander maintenant
            </Link>
            <button onClick={() => setIsOpen(false)} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: 13, padding: '10px 0', marginTop: 8 }}>
              Continuer mes achats
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;