import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, User, Lock, Phone, MapPin, FileText, Tag } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import api from '../services/api';

// InputField HORS du composant principal — évite les re-renders
const InputField = ({ icon: Icon, label, name, type = 'text', placeholder, textarea = false, value, onChange, error }) => (
  <div style={{ position: 'relative' }}>
    <label style={{
      display: 'block', fontSize: 12, fontFamily: 'Orbitron',
      fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, letterSpacing: 1
    }}>
      {label}
    </label>
    <div style={{ position: 'relative' }}>
      <Icon style={{
        position: 'absolute', left: 14,
        top: textarea ? 14 : '50%',
        transform: textarea ? 'none' : 'translateY(-50%)',
        width: 16, height: 16, color: 'var(--neon-orange)', zIndex: 1
      }} />
      {textarea ? (
        <textarea
          value={value}
          onChange={e => onChange(name, e.target.value)}
          placeholder={placeholder}
          rows={3}
          style={{
            width: '100%', padding: '12px 16px 12px 44px',
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${error ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.12)'}`,
            borderRadius: 10, color: 'var(--text-primary)',
            fontFamily: 'Rajdhani', fontSize: 15, outline: 'none',
            resize: 'none', transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.5)'}
          onBlur={e => e.target.style.borderColor = error ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.12)'}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(name, e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%', padding: '12px 16px 12px 44px',
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${error ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.12)'}`,
            borderRadius: 10, color: 'var(--text-primary)',
            fontFamily: 'Rajdhani', fontSize: 15, outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.5)'}
          onBlur={e => e.target.style.borderColor = error ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.12)'}
        />
      )}
    </div>
    {error && <p style={{ fontSize: 12, color: '#f87171', marginTop: 4, fontFamily: 'Rajdhani' }}>{error}</p>}
  </div>
);

const steps = ['Compte', 'Boutique', 'Confirmation'];

const RegisterSeller = () => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    email: '', username: '', first_name: '', last_name: '',
    password: '', password2: '', phone: '', country: 'Sénégal', city: '',
    shop_name: '', shop_description: '', category_focus: '', whatsapp: '',
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const err = (k) => errors[k] ? (Array.isArray(errors[k]) ? errors[k][0] : errors[k]) : null;

  const validateStep0 = () => {
    const e = {};
    if (!form.email) e.email = 'Email requis';
    if (!form.username) e.username = 'Nom d\'utilisateur requis';
    if (!form.first_name) e.first_name = 'Prénom requis';
    if (!form.last_name) e.last_name = 'Nom requis';
    if (!form.password || form.password.length < 8) e.password = 'Minimum 8 caractères';
    if (form.password !== form.password2) e.password2 = 'Les mots de passe ne correspondent pas';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.shop_name) e.shop_name = 'Nom de boutique requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 0 && validateStep0()) setStep(1);
    else if (step === 1 && validateStep1()) setStep(2);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});
    try {
      const res = await api.post('/auth/register-seller/', form);
      localStorage.setItem('access_token', res.data.tokens.access);
      localStorage.setItem('refresh_token', res.data.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.location.href = '/seller-dashboard';
    } catch (err) {
      setErrors(err.response?.data || { detail: 'Erreur lors de l\'inscription.' });
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead title="Devenir Vendeur — Visio" url="/register-seller" />
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 16px' }}>
        <div style={{ width: '100%', maxWidth: 560 }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{
              width: 64, height: 64,
              background: 'linear-gradient(135deg, var(--neon-orange), hsl(22,95%,35%))',
              borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 0 30px var(--neon-orange-glow)',
            }}>
              <Store style={{ width: 32, height: 32, color: '#fff' }} />
            </div>
            <h1 style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: 8 }}>
              Devenir Vendeur
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontFamily: 'Rajdhani', fontSize: 15 }}>
              Rejoignez la marketplace pan-africaine Visio
            </p>
          </div>

          {/* Stepper */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 36 }}>
            {steps.map((s, i) => (
              <React.Fragment key={s}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Orbitron', fontWeight: 700, fontSize: 13,
                    background: i <= step
                      ? 'linear-gradient(135deg, var(--neon-orange), hsl(22,95%,35%))'
                      : 'rgba(255,255,255,0.07)',
                    border: i === step ? '2px solid var(--neon-orange)' : '1px solid rgba(255,255,255,0.1)',
                    color: i <= step ? '#fff' : 'var(--text-secondary)',
                    boxShadow: i === step ? '0 0 16px var(--neon-orange-glow)' : 'none',
                    transition: 'all 0.3s',
                  }}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span style={{
                    fontSize: 11, fontFamily: 'Orbitron',
                    color: i === step ? 'var(--neon-orange)' : 'var(--text-secondary)',
                    fontWeight: 700, letterSpacing: 0.5,
                  }}>{s}</span>
                </div>
                {i < steps.length - 1 && (
                  <div style={{
                    height: 2, width: 60,
                    background: i < step ? 'var(--neon-orange)' : 'rgba(255,255,255,0.1)',
                    margin: '0 8px', marginBottom: 28,
                    transition: 'background 0.3s',
                    boxShadow: i < step ? '0 0 6px var(--neon-orange-glow)' : 'none',
                  }} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Card */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 24,
            padding: '36px 32px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}>
            {errors.detail && (
              <div style={{
                background: 'rgba(248,113,113,0.1)',
                border: '1px solid rgba(248,113,113,0.3)',
                borderRadius: 10, padding: '12px 16px', marginBottom: 20,
                color: '#f87171', fontFamily: 'Rajdhani', fontSize: 14,
              }}>
                {errors.detail}
              </div>
            )}

            {/* STEP 0 */}
            {step === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontFamily: 'Orbitron', fontSize: 13, fontWeight: 700, color: 'var(--neon-orange)', marginBottom: 4, letterSpacing: 1 }}>
                  INFORMATIONS DU COMPTE
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <InputField icon={User} label="Prénom *" name="first_name" placeholder="Jean" value={form.first_name} onChange={set} error={err('first_name')} />
                  <InputField icon={User} label="Nom *" name="last_name" placeholder="Diallo" value={form.last_name} onChange={set} error={err('last_name')} />
                </div>
                <InputField icon={User} label="Email *" name="email" type="email" placeholder="jean@email.com" value={form.email} onChange={set} error={err('email')} />
                <InputField icon={User} label="Nom d'utilisateur *" name="username" placeholder="jean_diallo" value={form.username} onChange={set} error={err('username')} />
                <InputField icon={Phone} label="Téléphone" name="phone" placeholder="+221 77 000 00 00" value={form.phone} onChange={set} error={err('phone')} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <InputField icon={MapPin} label="Pays" name="country" placeholder="Sénégal" value={form.country} onChange={set} error={err('country')} />
                  <InputField icon={MapPin} label="Ville" name="city" placeholder="Dakar" value={form.city} onChange={set} error={err('city')} />
                </div>
                <InputField icon={Lock} label="Mot de passe *" name="password" type="password" placeholder="••••••••" value={form.password} onChange={set} error={err('password')} />
                <InputField icon={Lock} label="Confirmer *" name="password2" type="password" placeholder="••••••••" value={form.password2} onChange={set} error={err('password2')} />
              </div>
            )}

            {/* STEP 1 */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontFamily: 'Orbitron', fontSize: 13, fontWeight: 700, color: 'var(--neon-orange)', marginBottom: 4, letterSpacing: 1 }}>
                  INFORMATIONS DE LA BOUTIQUE
                </h3>
                <InputField icon={Store} label="Nom de la boutique *" name="shop_name" placeholder="Tech Store Dakar" value={form.shop_name} onChange={set} error={err('shop_name')} />
                <InputField icon={FileText} label="Description" name="shop_description" placeholder="Décrivez votre boutique..." textarea value={form.shop_description} onChange={set} error={err('shop_description')} />
                <InputField icon={Tag} label="Type de produits" name="category_focus" placeholder="Smartphones, accessoires..." value={form.category_focus} onChange={set} error={err('category_focus')} />
                <InputField icon={Phone} label="WhatsApp (optionnel)" name="whatsapp" placeholder="+221 77 000 00 00" value={form.whatsapp} onChange={set} error={err('whatsapp')} />
                <div style={{
                  padding: 16, borderRadius: 12,
                  background: 'rgba(249,115,22,0.08)',
                  border: '1px solid rgba(249,115,22,0.2)',
                  marginTop: 8,
                }}>
                  <p style={{ fontSize: 13, color: 'rgba(249,115,22,0.9)', fontFamily: 'Rajdhani', lineHeight: 1.5 }}>
                    ℹ️ Votre boutique sera vérifiée par notre équipe avant d'être publiée. Confirmation sous 24h.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontFamily: 'Orbitron', fontSize: 13, fontWeight: 700, color: 'var(--neon-orange)', marginBottom: 4, letterSpacing: 1 }}>
                  CONFIRMATION
                </h3>
                {[
                  { label: 'Nom complet', value: `${form.first_name} ${form.last_name}` },
                  { label: 'Email', value: form.email },
                  { label: 'Nom d\'utilisateur', value: form.username },
                  { label: 'Ville', value: `${form.city}, ${form.country}` },
                  { label: 'Boutique', value: form.shop_name },
                  { label: 'Type de produits', value: form.category_focus || '—' },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px',
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)',
                  }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Orbitron', fontWeight: 700, letterSpacing: 0.3 }}>{label}</span>
                    <span style={{ fontSize: 14, color: 'var(--text-primary)', fontFamily: 'Rajdhani', fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
                <div style={{
                  padding: 16, borderRadius: 12,
                  background: 'rgba(74,222,128,0.07)',
                  border: '1px solid rgba(74,222,128,0.2)',
                  marginTop: 8,
                }}>
                  <p style={{ fontSize: 13, color: 'rgba(74,222,128,0.9)', fontFamily: 'Rajdhani', lineHeight: 1.5 }}>
                    ✅ En confirmant, vous acceptez les conditions d'utilisation de Visio.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              {step > 0 && (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="btn-secondary"
                  style={{ flex: 1, justifyContent: 'center', padding: '13px 0' }}
                >
                  ← Retour
                </button>
              )}
              {step < 2 ? (
                <button
                  onClick={handleNext}
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: 'center', padding: '13px 0', fontSize: 14 }}
                >
                  Continuer →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: 'center', padding: '13px 0', fontSize: 14 }}
                >
                  {loading ? 'Création...' : '🚀 Créer ma boutique'}
                </button>
              )}
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'Rajdhani' }}>
            Déjà un compte ?{' '}
            <Link to="/login" style={{ color: 'var(--neon-orange)', textDecoration: 'none', fontWeight: 700 }}>
              Se connecter
            </Link>
            {' · '}
            <Link to="/register" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Créer un compte acheteur
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default RegisterSeller;