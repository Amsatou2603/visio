import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { FaFacebook, FaXTwitter, FaInstagram } from 'react-icons/fa6';

const Footer = () => {
  return (
    <footer style={{
      background: 'rgba(5,5,15,0.8)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255,255,255,0.07)',
      marginTop: 0,
      position: 'relative',
      zIndex: 1,
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36,
                background: 'linear-gradient(135deg, var(--neon-orange), hsl(22,95%,38%))',
                borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 16px var(--neon-orange-glow)',
              }}>
                <span style={{ color: '#fff', fontFamily: 'Orbitron', fontWeight: 900, fontSize: 16 }}>V</span>
              </div>
              <span style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: 18, color: 'var(--text-primary)', letterSpacing: 2 }}>VISIO</span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, maxWidth: 300, lineHeight: 1.7, fontFamily: 'Rajdhani' }}>
              La marketplace pan-africaine pour vos achats de téléphones et électronique.
              Livraison partout en Afrique.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { Icon: FaFacebook, label: 'Facebook' },
                { Icon: FaXTwitter, label: 'Twitter' },
                { Icon: FaInstagram, label: 'Instagram' },
              ].map(({ Icon, label }) => (
                <button
                  key={label}
                  aria-label={label}
                  style={{
                    width: 38, height: 38,
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backdropFilter: 'blur(8px)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(249,115,22,0.5)';
                    e.currentTarget.style.color = 'var(--neon-orange)';
                    e.currentTarget.style.boxShadow = '0 0 12px var(--neon-orange-glow)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 style={{ fontFamily: 'Orbitron', fontSize: 12, fontWeight: 700, color: 'var(--neon-orange)', letterSpacing: 2, marginBottom: 16, textTransform: 'uppercase' }}>
              Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { to: '/', label: 'Accueil' },
                { to: '/catalogue', label: 'Catalogue' },
                { to: '/login', label: 'Connexion' },
                { to: '/register', label: 'Inscription' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 14, fontFamily: 'Rajdhani', fontWeight: 500, transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = 'var(--neon-orange)'}
                    onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontFamily: 'Orbitron', fontSize: 12, fontWeight: 700, color: 'var(--neon-orange)', letterSpacing: 2, marginBottom: 16, textTransform: 'uppercase' }}>
              Contact
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { Icon: MapPin, text: 'Dakar, Sénégal' },
                { Icon: Phone, text: '+221 77 722 43 43' },
                { Icon: Mail, text: 'ceo@visio.sn' },
              ].map(({ Icon, text }) => (
                <li key={text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon style={{ width: 16, height: 16, color: 'var(--neon-orange)', flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontFamily: 'Rajdhani' }}>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          marginTop: 40, paddingTop: 24,
          display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 12,
        }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'Rajdhani' }}>
            © {new Date().getFullYear()} VISIO. Tous droits réservés.
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Conditions d\'utilisation', 'Politique de confidentialité'].map(t => (
              <button
                key={t}
                style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Rajdhani', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--neon-orange)'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.3)'}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;