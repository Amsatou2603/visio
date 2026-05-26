import React, { useState, useEffect } from 'react';

const SplashScreen = ({ onDone }) => {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Barre de progression
    const steps = [
      { target: 30, delay: 100 },
      { target: 60, delay: 400 },
      { target: 85, delay: 700 },
      { target: 100, delay: 1100 },
    ];

    steps.forEach(({ target, delay }) => {
      setTimeout(() => setProgress(target), delay);
    });

    // Sortie
    setTimeout(() => {
      setExiting(true);
      setTimeout(onDone, 500);
    }, 1600);
  }, [onDone]);

  return (
    <div className={`splash-screen ${exiting ? 'splash-exit' : ''}`}>
      {/* Orbes en arrière-plan */}
      <div style={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)',
        top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <div className="splash-logo">
        <span style={{
          color: '#fff', fontFamily: 'Syne, sans-serif',
          fontWeight: 900, fontSize: 38, letterSpacing: -1,
        }}>V</span>
      </div>

      {/* Titre */}
      <div style={{ textAlign: 'center' }}>
        <div className="splash-title">VISIO</div>
        <div className="splash-subtitle">Marketplace Tech Pan-Africaine</div>
      </div>

      {/* Barre de chargement */}
      <div className="splash-bar-wrapper">
        <div className="splash-bar" style={{ width: `${progress}%` }} />
      </div>

      {/* Texte loading */}
      <p style={{
        fontFamily: 'DM Sans, sans-serif', fontSize: 12,
        color: 'rgba(255,255,255,0.3)', letterSpacing: 0.5,
        animation: 'fadeIn 0.4s ease 0.5s both',
      }}>
        {progress < 50 ? 'Connexion...' : progress < 90 ? 'Chargement des données...' : 'Presque prêt...'}
      </p>
    </div>
  );
};

export default SplashScreen;