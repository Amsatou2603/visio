import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Visio render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '60vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: 8 }}>
            Une erreur est survenue
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', marginBottom: 24, maxWidth: 400 }}>
            La page n'a pas pu s'afficher correctement.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="btn-primary"
            style={{ padding: '12px 28px' }}
          >
            Retour à l'accueil
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
