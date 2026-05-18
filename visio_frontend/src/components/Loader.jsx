import React from 'react';

export const Spinner = ({ size = 'md' }) => {
  const sizes = { sm: 32, md: 48, lg: 64 };
  const s = sizes[size] || 48;
  return (
    <div style={{ width: s, height: s, position: 'relative' }}>
      <svg viewBox="0 0 50 50" style={{ animation: 'spin 1s linear infinite', width: s, height: s }}>
        <circle cx="25" cy="25" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
        <circle cx="25" cy="25" r="20" fill="none" stroke="var(--neon-orange)" strokeWidth="3"
          strokeLinecap="round" strokeDasharray="80 120"
          style={{ filter: 'drop-shadow(0 0 6px var(--neon-orange-glow))' }} />
      </svg>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

const Loader = ({ text = 'Chargement...' }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    minHeight: 300, gap: 16,
  }}>
    <Spinner size="lg" />
    <p style={{ color: 'var(--text-secondary)', fontSize: 14, fontFamily: 'Rajdhani', letterSpacing: 1 }}>{text}</p>
  </div>
);

export default Loader;