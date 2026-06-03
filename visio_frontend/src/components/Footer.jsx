import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      background: 'var(--bg-soft)',
      borderTop: '1px solid var(--border)',
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
                width: 34, height: 34,
                background: 'var(--primary)',
                borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 3px 12px rgba(230,57,70,0.3)',
              }}>
                <span style={{ color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 24, lineHeight: 1 }}>V</span>
              </div>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 18, color: 'var(--text-primary)', letterSpacing: 1 }}>VISIO</span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, maxWidth: 300, lineHeight: 1.7, fontFamily: 'DM Sans, sans-serif' }}>
              La marketplace pan-africaine pour vos achats de téléphones et électronique.
              Livraison partout en Afrique.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {['Facebook', 'Twitter', 'Instagram'].map((label) => (
                <button
                  key={label}
                  aria-label={label}
                  style={{
                    width: 36, height: 36,
                    borderRadius: 10,
                    background: 'var(--bg-card)',
                    border: '1.5px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: 15,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.color = 'var(--primary)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                >
                  {label === 'Facebook' ? 'f' : label === 'Twitter' ? 'X' : 'ig'}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 style={{ fontFamily: 'Syne, sans-serif', fontSize: 12, fontWeight: 700, color: 'var(--primary)', letterSpacing: 2, marginBottom: 16, textTransform: 'uppercase' }}>
              Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { to: '/', label: 'Accueil' },
                { to: '/catalogue', label: 'Catalogue' },
                { to: '/partenaires', label: 'Nos vendeurs' },
                { to: '/login', label: 'Connexion' },
                { to: '/register', label: 'Inscription' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 14, fontFamily: 'DM Sans, sans-serif', fontWeight: 500, transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = 'var(--primary)'}
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
            <h4 style={{ fontFamily: 'Syne, sans-serif', fontSize: 12, fontWeight: 700, color: 'var(--primary)', letterSpacing: 2, marginBottom: 16, textTransform: 'uppercase' }}>
              Contact
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { Icon: MapPin, text: 'Dakar, Sénégal' },
                { Icon: Phone, text: '+221 77 722 43 43' },
                { Icon: Mail, text: 'ceo@visio.sn' },
              ].map(({ Icon, text }) => (
                <li key={text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon style={{ width: 16, height: 16, color: 'var(--primary)', flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div style={{
          borderTop: '1px solid var(--border)',
          marginTop: 40, paddingTop: 24,
          display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 12,
        }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>
            © {new Date().getFullYear()} VISIO. Tous droits réservés.
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Conditions d\'utilisation', 'Politique de confidentialité'].map(t => (
              <button
                key={t}
                style={{ fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--primary)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
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