import React, { useState, useEffect } from 'react';

const messages = [
  'Initialisation...',
  'Chargement des produits...',
  'Connexion au serveur...',
  'Préparation de votre expérience...',
  'Presque prêt...',
];

const SplashScreen = ({ onDone }) => {
  const [progress, setProgress] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Progression sur 5 secondes
    const steps = [
      { target: 15, delay: 300 },
      { target: 35, delay: 900 },
      { target: 55, delay: 1800 },
      { target: 72, delay: 2700 },
      { target: 88, delay: 3700 },
      { target: 100, delay: 4500 },
    ];

    const timers = steps.map(({ target, delay }) =>
      setTimeout(() => setProgress(target), delay)
    );

    // Rotation des messages
    const msgTimer = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % messages.length);
    }, 1000);

    // Sortie après 5s
    const exitTimer = setTimeout(() => {
      setExiting(true);
      setTimeout(onDone, 500);
    }, 5000);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(msgTimer);
      clearTimeout(exitTimer);
    };
  }, [onDone]);

  return (
    <div className={`splash-screen ${exiting ? 'splash-exit' : ''}`}>

      {/* Cercle décoratif */}
      <div style={{
        position: 'absolute',
        width: 500, height: 500,
        borderRadius: '50%',
        border: '1px solid rgba(230,57,70,0.06)',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        animation: 'splashRing 3s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        width: 350, height: 350,
        borderRadius: '50%',
        border: '1px solid rgba(230,57,70,0.1)',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        animation: 'splashRing 3s ease-in-out infinite 0.5s',
      }} />

      <style>{`
        @keyframes splashRing {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
          50% { transform: translate(-50%, -50%) scale(1.04); opacity: 1; }
        }
      `}</style>

      {/* Logo */}
      <div className="splash-logo">
        <span style={{
          color: '#fff',
          fontFamily: 'Syne, sans-serif',
          fontWeight: 900,
          fontSize: 42,
          letterSpacing: -2,
        }}>V</span>
      </div>

      {/* Textes */}
      <div style={{ textAlign: 'center' }}>
        <div className="splash-title">VISIO</div>
        <div className="splash-tagline">Marketplace Tech Pan-Africaine</div>
      </div>

      {/* Barre progression */}
      <div className="splash-bar-wrapper">
        <div className="splash-bar" style={{ width: `${progress}%` }} />
      </div>

      {/* Message dynamique */}
      <p className="splash-status" key={msgIndex} style={{ animation: 'fadeIn 0.4s ease' }}>
        {messages[msgIndex]}
      </p>

      {/* Pourcentage */}
      <p style={{
        fontFamily: 'Syne, sans-serif',
        fontSize: 12, fontWeight: 700,
        color: 'var(--primary)',
        letterSpacing: 1,
        animation: 'fadeIn 0.4s ease 0.6s both',
      }}>
        {progress}%
      </p>
    </div>
  );
};

export default SplashScreen;