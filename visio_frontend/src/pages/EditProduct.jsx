import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Package, DollarSign, Tag, Image, BarChart } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Loader from '../components/Loader';
import api from '../services/api';

const inputStyle = {
  width: '100%', padding: '11px 16px',
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 10, color: 'var(--text-primary)',
  fontFamily: 'Rajdhani', fontSize: 15, outline: 'none',
};

const Field = ({ label, children, error }) => (
  <div>
    <label style={{ display: 'block', fontSize: 11, fontFamily: 'Orbitron', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, letterSpacing: 1 }}>
      {label}
    </label>
    {children}
    {error && <p style={{ fontSize: 12, color: '#f87171', marginTop: 4, fontFamily: 'Rajdhani' }}>{error}</p>}
  </div>
);

const EditProduct = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [form, setForm] = useState({
    name: '', description: '', short_description: '',
    price: '', old_price: '', stock: '',
    condition: 'new', category_id: '', brand_id: '',
    is_active: true, is_featured: false,
    meta_title: '', meta_description: '',
  });

  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [productRes, catRes, brandRes] = await Promise.all([
          api.get(`/products/${slug}/`),
          api.get('/products/categories/'),
          api.get('/products/brands/'),
        ]);
        const p = productRes.data;
        setForm({
          name: p.name || '',
          description: p.description || '',
          short_description: p.short_description || '',
          price: p.price || '',
          old_price: p.old_price || '',
          stock: p.stock || '',
          condition: p.condition || 'new',
          category_id: p.category?.id || '',
          brand_id: p.brand?.id || '',
          is_active: p.is_active,
          is_featured: p.is_featured,
          meta_title: p.meta_title || '',
          meta_description: p.meta_description || '',
        });
        setExistingImages(p.images || []);
        setCategories(catRes.data.results || catRes.data);
        setBrands(brandRes.data.results || brandRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [slug]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const err = (k) => errors[k] ? (Array.isArray(errors[k]) ? errors[k][0] : errors[k]) : null;

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '' && v !== null) data.append(k, v);
      });
      newImages.forEach(img => data.append('uploaded_images', img));

      await api.patch(`/products/${slug}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/seller-dashboard');
    } catch (err) {
      setErrors(err.response?.data || { detail: 'Erreur lors de la modification.' });
    } finally {
      setSaving(false);
    }
  };

  const sectionStyle = {
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20, padding: '24px 28px', marginBottom: 20,
  };

  if (loading) return <Loader text="Chargement du produit..." />;

  return (
    <>
      <SEOHead title="Modifier le produit — Visio" />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 16px' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <button
            onClick={() => navigate('/seller-dashboard')}
            style={{ padding: '8px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'Rajdhani', fontWeight: 600 }}
          >
            ← Retour
          </button>
          <div>
            <h1 style={{ fontFamily: 'Orbitron', fontWeight: 900, fontSize: '1.4rem', color: 'var(--text-primary)' }}>
              Modifier le produit
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'Rajdhani', marginTop: 4 }}>
              Modifiez les informations de votre produit
            </p>
          </div>
        </div>

        {errors.detail && (
          <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 12, padding: '14px 18px', marginBottom: 20, color: '#f87171', fontFamily: 'Rajdhani' }}>
            {errors.detail}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={sectionStyle}>
            <h3 style={{ fontFamily: 'Orbitron', fontSize: 12, fontWeight: 700, color: 'var(--neon-orange)', marginBottom: 20, letterSpacing: 1 }}>
              <Package style={{ width: 14, height: 14, display: 'inline', marginRight: 8 }} />
              INFORMATIONS PRINCIPALES
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label="Nom du produit *" error={err('name')}>
                <input value={form.name} onChange={e => set('name', e.target.value)} style={inputStyle} required
                  onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
              </Field>
              <Field label="Description courte">
                <input value={form.short_description} onChange={e => set('short_description', e.target.value)} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
              </Field>
              <Field label="Description complète *">
                <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={5} style={{ ...inputStyle, resize: 'vertical' }} required
                  onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
              </Field>
            </div>
          </div>

          <div style={sectionStyle}>
            <h3 style={{ fontFamily: 'Orbitron', fontSize: 12, fontWeight: 700, color: 'var(--neon-orange)', marginBottom: 20, letterSpacing: 1 }}>
              <DollarSign style={{ width: 14, height: 14, display: 'inline', marginRight: 8 }} />
              PRIX & STOCK
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <Field label="Prix (FCFA) *" error={err('price')}>
                <input type="number" value={form.price} onChange={e => set('price', e.target.value)} style={inputStyle} required
                  onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
              </Field>
              <Field label="Ancien prix (promo)">
                <input type="number" value={form.old_price} onChange={e => set('old_price', e.target.value)} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
              </Field>
              <Field label="Stock *">
                <input type="number" value={form.stock} onChange={e => set('stock', e.target.value)} style={inputStyle} required
                  onFocus={e => e.target.style.borderColor = 'rgba(249,115,22,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'} />
              </Field>
            </div>
          </div>

          <div style={sectionStyle}>
            <h3 style={{ fontFamily: 'Orbitron', fontSize: 12, fontWeight: 700, color: 'var(--neon-orange)', marginBottom: 20, letterSpacing: 1 }}>
              <Tag style={{ width: 14, height: 14, display: 'inline', marginRight: 8 }} />
              CATÉGORIE & ÉTAT
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <Field label="Catégorie">
                <select value={form.category_id} onChange={e => set('category_id', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Choisir...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Marque">
                <select value={form.brand_id} onChange={e => set('brand_id', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Choisir...</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </Field>
              <Field label="État">
                <select value={form.condition} onChange={e => set('condition', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="new">Neuf</option>
                  <option value="used">Occasion</option>
                  <option value="refurbished">Reconditionné</option>
                </select>
              </Field>
            </div>
            <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
              {[
                { key: 'is_active', label: 'Produit actif' },
                { key: 'is_featured', label: 'Produit vedette' },
              ].map(({ key, label }) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <div onClick={() => set(key, !form[key])} style={{
                    width: 44, height: 24, borderRadius: 12,
                    background: form[key] ? 'var(--neon-orange)' : 'rgba(255,255,255,0.1)',
                    position: 'relative', cursor: 'pointer', transition: 'all 0.3s',
                    boxShadow: form[key] ? '0 0 8px var(--neon-orange-glow)' : 'none',
                  }}>
                    <div style={{
                      position: 'absolute', top: 2, left: form[key] ? 22 : 2,
                      width: 18, height: 18, borderRadius: '50%',
                      background: '#fff', transition: 'left 0.3s',
                    }} />
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'Rajdhani', fontWeight: 600 }}>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Images existantes */}
          {existingImages.length > 0 && (
            <div style={sectionStyle}>
              <h3 style={{ fontFamily: 'Orbitron', fontSize: 12, fontWeight: 700, color: 'var(--neon-orange)', marginBottom: 16, letterSpacing: 1 }}>
                IMAGES ACTUELLES
              </h3>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {existingImages.map((img, i) => (
                  <img key={img.id} src={img.image} alt=""
                    style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10, border: i === 0 ? '2px solid var(--neon-orange)' : '1px solid rgba(255,255,255,0.1)' }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Nouvelles images */}
          <div style={sectionStyle}>
            <h3 style={{ fontFamily: 'Orbitron', fontSize: 12, fontWeight: 700, color: 'var(--neon-orange)', marginBottom: 20, letterSpacing: 1 }}>
              <Image style={{ width: 14, height: 14, display: 'inline', marginRight: 8 }} />
              AJOUTER DE NOUVELLES IMAGES
            </h3>
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '24px', borderRadius: 14, cursor: 'pointer',
              border: '2px dashed rgba(249,115,22,0.3)',
              background: 'rgba(249,115,22,0.04)',
            }}>
              <input type="file" multiple accept="image/*" onChange={handleImages} style={{ display: 'none' }} />
              <Image style={{ width: 28, height: 28, color: 'rgba(249,115,22,0.5)', marginBottom: 8 }} />
              <p style={{ fontFamily: 'Rajdhani', fontSize: 14, color: 'var(--text-secondary)' }}>Cliquez pour ajouter des images</p>
            </label>
            {previews.length > 0 && (
              <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                {previews.map((src, i) => (
                  <img key={i} src={src} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)' }} />
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" onClick={() => navigate('/seller-dashboard')} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '14px 0' }}>
              Annuler
            </button>
            <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 2, justifyContent: 'center', padding: '14px 0', fontSize: 15 }}>
              {saving ? 'Sauvegarde...' : '💾 Sauvegarder les modifications'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditProduct;