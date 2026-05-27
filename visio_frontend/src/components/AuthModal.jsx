import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, ShoppingCart, Heart, Star } from 'lucide-react';

const AuthModal = ({ isOpen, onClose, reason = 'acheter', returnTo }) => {
  const location = useLocation();
  const redirectPath = returnTo || location.pathname;

  if (!isOpen) return null;

  const reasons = {
    acheter: { icon: <ShoppingCart style={{ width: 32, height: 32, color: 'var(--primary)' }} />, title: 'Connectez-vous pour commander', text: 'Créez un compte gratuit pour passer vos commandes et suivre vos achats.' },
    wishlist: { icon: <Heart style={{ width: 32, height: 32, color: 'var(--primary)' }} />, title: 'Connectez-vous pour sauvegarder', text: 'Créez une liste de souhaits et retrouvez vos produits favoris à tout moment.' },
    review: { icon: <Star style={{ width: 32, height: 32, color: 'var(--primary)' }} />, title: 'Connectez-vous pour laisser un avis', text: 'Partagez votre expérience et aidez la communauté Visio.' },
  };

  const { icon, title, text } = reasons[reason] || reasons.acheter;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          zIndex: 200,
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 201,
        width: '90%', maxWidth: 400,
        background: 'var(--menu-bg)',
        border: '1.5px solid var(--border)',
        borderRadius: 24,
        padding: '36px 32px',
        boxShadow: 'var(--shadow-lg)',
        animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        textAlign: 'center',
      }}>
        {/* Fermer */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: 4,
            borderRadius: 8, transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <X style={{ width: 20, height: 20 }} />
        </button>

        {/* Icône */}
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: 'var(--primary-subtle)',
          border: '1.5px solid var(--border-red)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          {icon}
        </div>

        <h2 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800,
          fontSize: '1.2rem', color: 'var(--text-primary)',
          marginBottom: 10,
        }}>{title}</h2>

        <p style={{
          fontFamily: 'DM Sans, sans-serif', fontSize: 14,
          color: 'var(--text-secondary)', lineHeight: 1.6,
          marginBottom: 28,
        }}>{text}</p>

        <div style={{ display: 'flex', gap: 12 }}>
          <Link
            to="/login"
            state={{ from: { pathname: redirectPath } }}
            onClick={onClose}
            className="btn-secondary"
            style={{ flex: 1, justifyContent: 'center', padding: '12px 0', fontSize: 14 }}
          >
            Se connecter
          </Link>
          <Link
            to="/register"
            state={{ from: { pathname: redirectPath } }}
            onClick={onClose}
            className="btn-primary"
            style={{ flex: 1, justifyContent: 'center', padding: '12px 0', fontSize: 14 }}
          >
            Créer un compte
          </Link>
        </div>

        <p style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)', fontFamily: 'DM Sans' }}>
          Gratuit • Rapide • Sécurisé
        </p>
      </div>
    </>
  );
};

export default AuthModal;