import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Tag, DollarSign, Image, FileText, BarChart } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import api from '../services/api';

const Field = ({ label, children, error }) => (
  <div>
    <label style={{
      display: 'block', fontSize: 11, fontFamily: 'Orbitron',
      fontWeight: 700, color: 'var(--text-secondary)',
      marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase',
    }}>{label}</label>
    {children}
    {error && <p style={{ fontSize: 12, color: '#f87171', marginTop: 4, fontFamily: 'Rajdhani' }}>{error}</p>}
  </div>
);

const inputStyle = {
  width: '100%', padding: '11px 16px',
  background: 'var(--input-bg)',
  backdropFilter: 'blur(10px)',
  border: '1px solid var(--border-strong)',
  borderRadius: 10, color: 'var(--text-primary)',
  fontFamily: 'Rajdhani', fontSize: 15, outline: 'none',
};

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [form, setForm] = useState({
    name: '', description: '', short_description: '',
    price: '', old_price: '', stock: '',
    condition: 'new', category_id: '', brand_id: '',
    is_active: true, is_featured: false,
    meta_title: '', meta_description: '',
  });

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          api.get('/products/categories/'),
          api.get('/products/brands/'),
        ]);
        setCategories(catRes.data.results || catRes.data);
        setBrands(brandRes.data.results || brandRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMeta();
  }, []);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const err = (k) => errors[k] ? (Array.isArray(errors[k]) ? errors[k][0] : errors[k]) : null;

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '' && v !== null) data.append(k, v);
      });
      images.forEach(img => data.append('uploaded_images', img));

      await api.post('/products/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/seller-dashboard');
    } catch (err) {
      setErrors(err.response?.data || { detail: 'Erreur lors de la création.' });
    } finally {
      setLoading(false);
    }
  };

  const sectionStyle = {
    background: 'var(--card-bg)',
    backdropFilter: 'blur(20px)',
    border: '1px solid var(--border)',
    borderRadius: 20, padding: '24px 28px',
    marginBottom: 20,
  };

  return (
    <>
      <SEOHead title="Ajouter un produit — Visio" />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 16px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <button
            onClick={() => navigate('/seller-dashboard')}
            style={{ padding: '8px 16px', borderRadius: 10, background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'Rajdhani', fontWeight: 600 }}
          >
            ← Retour
          </button>
          <div>
            <h1 style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: '1.4rem', color: 'var(--text-primary)' }}>
              Ajouter un produit
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'Rajdhani', marginTop: 4 }}>
              Remplissez les informations de votre produit
            </p>
          </div>
        </div>

        {errors.detail && (
          <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 12, padding: '14px 18px', marginBottom: 20, color: '#f87171', fontFamily: 'Rajdhani' }}>
            {errors.detail}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Informations principales */}
          <div style={sectionStyle}>
            <h3 style={{ fontFamily: 'Orbitron', fontSize: 12, fontWeight: 700, color: 'var(--primary)', marginBottom: 20, letterSpacing: 1 }}>
              <Package style={{ width: 14, height: 14, display: 'inline', marginRight: 8 }} />
              INFORMATIONS PRINCIPALES
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label="Nom du produit *" error={err('name')}>
                <input
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="Ex: iPhone 14 Pro Max 256Go"
                  style={inputStyle}
                  required
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-strong)'}
                />
              </Field>

              <Field label="Description courte" error={err('short_description')}>
                <input
                  value={form.short_description}
                  onChange={e => set('short_description', e.target.value)}
                  placeholder="Résumé en une phrase"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-strong)'}
                />
              </Field>

              <Field label="Description complète *" error={err('description')}>
                <textarea
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Description détaillée du produit..."
                  rows={5}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  required
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-strong)'}
                />
              </Field>
            </div>
          </div>

          {/* Prix et stock */}
          <div style={sectionStyle}>
            <h3 style={{ fontFamily: 'Orbitron', fontSize: 12, fontWeight: 700, color: 'var(--primary)', marginBottom: 20, letterSpacing: 1 }}>
              <DollarSign style={{ width: 14, height: 14, display: 'inline', marginRight: 8 }} />
              PRIX & STOCK
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <Field label="Prix (FCFA) *" error={err('price')}>
                <input
                  type="number"
                  value={form.price}
                  onChange={e => set('price', e.target.value)}
                  placeholder="150000"
                  style={inputStyle}
                  required
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-strong)'}
                />
              </Field>
              <Field label="Ancien prix (promo)" error={err('old_price')}>
                <input
                  type="number"
                  value={form.old_price}
                  onChange={e => set('old_price', e.target.value)}
                  placeholder="200000"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-strong)'}
                />
              </Field>
              <Field label="Stock *" error={err('stock')}>
                <input
                  type="number"
                  value={form.stock}
                  onChange={e => set('stock', e.target.value)}
                  placeholder="10"
                  style={inputStyle}
                  required
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-strong)'}
                />
              </Field>
            </div>
          </div>

          {/* Catégorie et état */}
          <div style={sectionStyle}>
            <h3 style={{ fontFamily: 'Orbitron', fontSize: 12, fontWeight: 700, color: 'var(--primary)', marginBottom: 20, letterSpacing: 1 }}>
              <Tag style={{ width: 14, height: 14, display: 'inline', marginRight: 8 }} />
              CATÉGORIE & ÉTAT
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <Field label="Catégorie *" error={err('category_id')}>
                <select
                  value={form.category_id}
                  onChange={e => set('category_id', e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                  required
                >
                  <option value="">Choisir...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Marque" error={err('brand_id')}>
                <select
                  value={form.brand_id}
                  onChange={e => set('brand_id', e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="">Choisir...</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="État" error={err('condition')}>
                <select
                  value={form.condition}
                  onChange={e => set('condition', e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="new">Neuf</option>
                  <option value="used">Occasion</option>
                  <option value="refurbished">Reconditionné</option>
                </select>
              </Field>
            </div>

            {/* Options */}
            <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
              {[
                { key: 'is_active', label: 'Produit actif (visible)' },
                { key: 'is_featured', label: 'Produit vedette (page d\'accueil)' },
              ].map(({ key, label }) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <div
                    onClick={() => set(key, !form[key])}
                    style={{
                      width: 44, height: 24, borderRadius: 12,
                      background: form[key] ? 'var(--primary)' : 'var(--input-bg)',
                      border: `1px solid ${form[key] ? 'var(--primary)' : 'var(--border)'}`,
                      position: 'relative', cursor: 'pointer',
                      transition: 'all 0.3s',
                      boxShadow: form[key] ? '0 0 8px var(--primary-glow)' : 'none',
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: 2,
                      left: form[key] ? 22 : 2,
                      width: 18, height: 18, borderRadius: '50%',
                      background: '#fff',
                      transition: 'left 0.3s',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                    }} />
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'Rajdhani', fontWeight: 600 }}>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Images */}
          <div style={sectionStyle}>
            <h3 style={{ fontFamily: 'Orbitron', fontSize: 12, fontWeight: 700, color: 'var(--primary)', marginBottom: 20, letterSpacing: 1 }}>
              <Image style={{ width: 14, height: 14, display: 'inline', marginRight: 8 }} />
              IMAGES DU PRODUIT
            </h3>
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '32px', borderRadius: 14, cursor: 'pointer',
              border: '2px dashed var(--primary)',
              background: 'var(--primary-subtle)',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--primary)'}
            >
              <input type="file" multiple accept="image/*" onChange={handleImages} style={{ display: 'none' }} />
              <Image style={{ width: 32, height: 32, color: 'var(--primary)', marginBottom: 10 }} />
              <p style={{ fontFamily: 'Rajdhani', fontSize: 14, color: 'var(--text-secondary)' }}>
                Cliquez pour ajouter des images
              </p>
              <p style={{ fontFamily: 'Rajdhani', fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
                PNG, JPG jusqu'à 5MB — la 1ère image sera l'image principale
              </p>
            </label>

            {previews.length > 0 && (
              <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                {previews.map((src, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img
                      src={src}
                      alt=""
                      style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10, border: i === 0 ? '2px solid var(--primary)' : '1px solid var(--border)' }}
                    />
                    {i === 0 && (
                      <span style={{
                        position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)',
                        fontSize: 9, fontFamily: 'Orbitron', fontWeight: 700,
                        background: 'var(--primary)', color: '#fff',
                        padding: '2px 6px', borderRadius: 4,
                      }}>PRINCIPALE</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SEO */}
          <div style={sectionStyle}>
            <h3 style={{ fontFamily: 'Orbitron', fontSize: 12, fontWeight: 700, color: 'var(--primary)', marginBottom: 20, letterSpacing: 1 }}>
              <BarChart style={{ width: 14, height: 14, display: 'inline', marginRight: 8 }} />
              SEO (OPTIONNEL)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Titre SEO">
                <input
                  value={form.meta_title}
                  onChange={e => set('meta_title', e.target.value)}
                  placeholder="Laissez vide pour utiliser le nom du produit"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-strong)'}
                />
              </Field>
              <Field label="Description SEO">
                <textarea
                  value={form.meta_description}
                  onChange={e => set('meta_description', e.target.value)}
                  placeholder="Description pour les moteurs de recherche (160 caractères max)"
                  rows={2}
                  style={{ ...inputStyle, resize: 'none' }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-strong)'}
                />
              </Field>
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={() => navigate('/seller-dashboard')}
              className="btn-secondary"
              style={{ flex: 1, justifyContent: 'center', padding: '14px 0' }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ flex: 2, justifyContent: 'center', padding: '14px 0', fontSize: 15 }}
            >
              {loading ? 'Publication en cours...' : '🚀 Publier le produit'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddProduct;