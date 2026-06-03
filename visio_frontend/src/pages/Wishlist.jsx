import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import ProductCard from '../components/ProductCard';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';

const Wishlist = () => {
  const { items, toggle, fetchWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = React.useState(false);

  if (!isAuthenticated) {
    return (
      <>
        <SEOHead title="Ma Liste de Souhaits" url="/wishlist" />
        <div className="max-w-2xl mx-auto px-4 py-10 text-center">
          <div style={{ textAlign: 'left', marginBottom: 20 }}>
            <button
              onClick={() => navigate(-1)}
              className="btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <ArrowLeft style={{ width: 16, height: 16 }} /> Retour
            </button>
          </div>
          <Heart className="w-20 h-20 mx-auto mb-6" style={{ color: 'var(--primary)' }} />
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Connectez-vous pour voir votre liste</h1>
          <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>Vous devez être connecté pour accéder à votre liste de souhaits.</p>
          <button onClick={() => setShowAuth(true)} className="btn-primary px-8 py-3">
            Se connecter
          </button>
          <AuthModal
            isOpen={showAuth}
            onClose={() => setShowAuth(false)}
            reason="voir votre liste de souhaits"
          />
        </div>
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <SEOHead title="Ma Liste de Souhaits" url="/wishlist" />
        <div className="max-w-2xl mx-auto px-4 py-10 text-center">
          <div style={{ textAlign: 'left', marginBottom: 20 }}>
            <button
              onClick={() => navigate(-1)}
              className="btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <ArrowLeft style={{ width: 16, height: 16 }} /> Retour
            </button>
          </div>
          <Heart className="w-20 h-20 mx-auto mb-6" style={{ color: 'var(--text-muted)' }} />
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Votre liste est vide</h1>
          <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>Ajoutez des produits à votre liste de souhaits pour les retrouver plus tard.</p>
          <Link to="/catalogue" className="btn-primary px-8 py-3">
            Découvrir le catalogue
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead title="Ma Liste de Souhaits" url="/wishlist" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary mb-6"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <ArrowLeft style={{ width: 16, height: 16 }} /> Retour
        </button>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Ma Liste de Souhaits <span className="font-normal text-lg" style={{ color: 'var(--text-secondary)' }}>({items.length} article{items.length > 1 ? 's' : ''})</span>
          </h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
          {items.map(product => (
            <div key={product.id} style={{ position: 'relative' }}>
              <ProductCard product={product} />
              <button
                onClick={() => toggle(product.id).then(() => fetchWishlist())}
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'var(--bg-card)',
                  border: '1.5px solid var(--border-red)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  zIndex: 10,
                  boxShadow: 'var(--shadow-sm)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--primary)';
                  e.currentTarget.style.borderColor = 'var(--primary)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--bg-card)';
                  e.currentTarget.style.borderColor = 'var(--border-red)';
                }}
                title="Retirer de la liste"
              >
                <Trash2 style={{ width: 16, height: 16, color: 'var(--primary)' }} />
              </button>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <Link to="/catalogue" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Continuer mes achats <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
        </div>
      </div>
    </>
  );
};

export default Wishlist;
