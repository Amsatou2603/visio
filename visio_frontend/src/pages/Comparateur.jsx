import React, { useState, useEffect } from 'react';
import { X, Plus, Search, Star, ShoppingCart, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { formatPrice } from '../utils/formatPrice';

const MAX_COMPARE = 3;

const CompareSlot = ({ product, onRemove, onAdd, isEmpty }) => {
  const { addItem } = useCart();

  if (isEmpty) {
    return (
      <div
        onClick={onAdd}
        style={{
          flex: 1, minWidth: 200, maxWidth: 280,
          border: '2px dashed var(--border-red)',
          borderRadius: 20,
          padding: '40px 20px',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 12, cursor: 'pointer',
          background: 'var(--primary-subtle)',
          transition: 'all 0.25s ease',
          minHeight: 400,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(230,57,70,0.12)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--primary-subtle)'; e.currentTarget.style.borderColor = 'var(--border-red)'; }}
      >
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: 'var(--primary)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(230,57,70,0.3)',
        }}>
          <Plus style={{ width: 24, height: 24, color: '#fff' }} />
        </div>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--primary)', textAlign: 'center' }}>
          Ajouter un produit
        </p>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
          Cliquez pour sélectionner
        </p>
      </div>
    );
  }

  return (
    <div style={{
      flex: 1, minWidth: 200, maxWidth: 280,
      background: 'var(--card-bg)',
      border: '1.5px solid var(--border)',
      borderRadius: 20,
      overflow: 'hidden',
      boxShadow: 'var(--shadow-md)',
      position: 'relative',
    }}>
      {/* Bouton supprimer */}
      <button
        onClick={() => onRemove(product.id)}
        style={{
          position: 'absolute', top: 10, right: 10, zIndex: 10,
          width: 28, height: 28, borderRadius: '50%',
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          color: '#ef4444', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
      >
        <X style={{ width: 14, height: 14 }} />
      </button>

      {/* Image */}
      <div style={{ height: 180, background: 'var(--bg-soft)', overflow: 'hidden' }}>
        {product.primary_image
          ? <img src={product.primary_image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>📱</div>
        }
      </div>

      {/* Infos */}
      <div style={{ padding: '16px' }}>
        {product.brand_name && (
          <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
            {product.brand_name}
          </p>
        )}
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 10 }}>
          {product.name}
        </h3>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
          <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 18, color: 'var(--primary)' }}>
            {formatPrice(product.price, product.currency)}
          </span>
          {product.old_price && (
            <span style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'var(--text-muted)', textDecoration: 'line-through' }}>
              {formatPrice(product.old_price)}
            </span>
          )}
        </div>

        {product.reviews_count > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
            <Star style={{ width: 13, height: 13, fill: '#f59e0b', color: '#f59e0b' }} />
            <span style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'var(--text-secondary)' }}>
              {parseFloat(product.average_rating).toFixed(1)} ({product.reviews_count} avis)
            </span>
          </div>
        )}

        <button
          onClick={() => addItem(product)}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', fontSize: 13, padding: '9px 0' }}
        >
          <ShoppingCart style={{ width: 14, height: 14 }} /> Ajouter
        </button>
      </div>
    </div>
  );
};

// Ligne de comparaison
const CompareRow = ({ label, values, highlight = false, isPrice = false }) => {
  const best = isPrice
    ? Math.min(...values.filter(v => v !== null && v !== undefined && v !== '—'))
    : null;

  return (
    <tr style={{ borderBottom: '1px solid var(--border)' }}>
      <td style={{
        padding: '12px 16px',
        fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700,
        color: 'var(--text-secondary)', textTransform: 'uppercase',
        letterSpacing: 0.3, background: 'var(--bg-soft)',
        minWidth: 130, whiteSpace: 'nowrap',
      }}>
        {label}
      </td>
      {values.map((val, i) => (
        <td key={i} style={{
          padding: '12px 16px',
          fontFamily: 'DM Sans, sans-serif', fontSize: 13,
          color: highlight
            ? (val === 'Oui' ? '#10b981' : val === 'Non' ? '#ef4444' : 'var(--text-primary)')
            : isPrice && val === best
              ? 'var(--primary)'
              : 'var(--text-primary)',
          fontWeight: (isPrice && val === best) || highlight ? 700 : 400,
          textAlign: 'center',
          background: isPrice && val === best ? 'var(--primary-subtle)' : 'transparent',
          transition: 'background 0.2s',
        }}>
          {isPrice && val === best && val !== '—' ? (
            <span>
              {formatPrice(val)} <span style={{ fontSize: 10, background: 'var(--primary)', color: '#fff', padding: '1px 5px', borderRadius: 4, marginLeft: 4 }}>Meilleur prix</span>
            </span>
          ) : (
            val || '—'
          )}
        </td>
      ))}
      {/* Colonnes vides pour les slots non remplis */}
      {Array.from({ length: MAX_COMPARE - values.length }).map((_, i) => (
        <td key={`empty-${i}`} style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>—</td>
      ))}
    </tr>
  );
};

const Comparateur = () => {
  const navigate = useNavigate();
  const [compared, setCompared] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get('/products/', { params: { search, limit: 8 } });
        const results = (res.data.results || res.data)
          .filter(p => !compared.find(c => c.id === p.id));
        setSearchResults(results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [search, compared]);

  const addProduct = (product) => {
    if (compared.length >= MAX_COMPARE) return;
    setCompared(prev => [...prev, product]);
    setSearch('');
    setSearchResults([]);
    setShowSearch(false);
  };

  const removeProduct = (id) => {
    setCompared(prev => prev.filter(p => p.id !== id));
  };

  const canAddMore = compared.length < MAX_COMPARE;

  // Données de comparaison
  const getCompareData = () => {
    if (compared.length === 0) return [];
    return [
      { label: 'Marque', values: compared.map(p => p.brand_name || '—') },
      { label: 'Prix', values: compared.map(p => parseFloat(p.price)), isPrice: true },
      { label: 'État', values: compared.map(p => p.condition === 'new' ? 'Neuf' : p.condition === 'refurbished' ? 'Reconditionné' : 'Occasion') },
      { label: 'Stock', values: compared.map(p => p.in_stock ? `${p.stock} dispo` : 'Rupture'), highlight: false },
      { label: 'Note', values: compared.map(p => p.reviews_count > 0 ? `⭐ ${parseFloat(p.average_rating).toFixed(1)}/5 (${p.reviews_count})` : 'Pas de note') },
      { label: 'Catégorie', values: compared.map(p => p.category_name || '—') },
    ];
  };

  return (
    <>
      <SEOHead
        title="Comparateur de produits — Visio"
        description="Comparez les téléphones et électronique côte à côte pour faire le meilleur choix."
        url="/comparateur"
      />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px 60px' }}>
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary mb-6"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <ArrowLeft style={{ width: 16, height: 16 }} /> Retour
        </button>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 18px', borderRadius: 999,
            background: 'var(--primary-subtle)',
            border: '1px solid var(--border-red)',
            marginBottom: 16,
          }}>
            <span style={{ fontSize: 12, fontFamily: 'DM Sans', color: 'var(--primary)', fontWeight: 700, letterSpacing: 0.5 }}>
              🔍 COMPARATEUR
            </span>
          </div>
          <h1 className="section-title" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: 12 }}>
            Comparez vos produits
          </h1>
          <p style={{ fontFamily: 'DM Sans', fontSize: 15, color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto' }}>
            Sélectionnez jusqu'à 3 produits pour les comparer côte à côte et faire le meilleur choix.
          </p>
        </div>

        {/* Barre de recherche */}
        {canAddMore && (
          <div style={{ maxWidth: 500, margin: '0 auto 40px', position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 17, height: 17, color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={() => setShowSearch(true)}
                placeholder={`Rechercher un produit à ajouter... (${compared.length}/${MAX_COMPARE})`}
                className="input-field"
                style={{ paddingLeft: 44, borderRadius: 999, fontSize: 14 }}
              />
              {search && (
                <button
                  onClick={() => { setSearch(''); setSearchResults([]); }}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
                >
                  <X style={{ width: 16, height: 16 }} />
                </button>
              )}
            </div>

            {/* Résultats */}
            {showSearch && search && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                background: 'var(--menu-bg)',
                border: '1.5px solid var(--border)',
                borderRadius: 16, overflow: 'hidden',
                boxShadow: 'var(--shadow-lg)', zIndex: 50,
                maxHeight: 320, overflowY: 'auto',
              }}>
                {loading ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'DM Sans', fontSize: 14 }}>
                    Recherche...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'DM Sans', fontSize: 14 }}>
                    Aucun résultat
                  </div>
                ) : searchResults.map(product => (
                  <button
                    key={product.id}
                    onClick={() => addProduct(product)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 16px', width: '100%', textAlign: 'left',
                      background: 'none', border: 'none', cursor: 'pointer',
                      borderBottom: '1px solid var(--border)',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-subtle)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: 10, overflow: 'hidden', background: 'var(--bg-soft)', flexShrink: 0 }}>
                      {product.primary_image
                        ? <img src={product.primary_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📱</div>
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {product.name}
                      </p>
                      <p style={{ fontFamily: 'Syne', fontSize: 13, fontWeight: 800, color: 'var(--primary)', marginTop: 2 }}>
                        {formatPrice(product.price)}
                      </p>
                    </div>
                    <Plus style={{ width: 16, height: 16, color: 'var(--primary)', flexShrink: 0 }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Slots de comparaison */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 40, flexWrap: 'wrap' }}>
          {compared.map(product => (
            <CompareSlot
              key={product.id}
              product={product}
              onRemove={removeProduct}
            />
          ))}
          {canAddMore && (
            <CompareSlot
              isEmpty
              onAdd={() => document.querySelector('.input-field')?.focus()}
            />
          )}
        </div>

        {/* Tableau de comparaison */}
        {compared.length >= 2 && (
          <div style={{
            background: 'var(--card-bg)',
            border: '1.5px solid var(--border)',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: 'var(--shadow-md)',
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-soft)' }}>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>
                Comparaison détaillée
              </h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 400 }}>
                <thead>
                  <tr style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'DM Sans', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', width: 130 }}>
                      CRITÈRE
                    </th>
                    {compared.map(p => (
                      <th key={p.id} style={{ padding: '12px 16px', textAlign: 'center', fontFamily: 'Syne', fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>
                        {p.name.slice(0, 20)}{p.name.length > 20 ? '…' : ''}
                      </th>
                    ))}
                    {Array.from({ length: MAX_COMPARE - compared.length }).map((_, i) => (
                      <th key={i} style={{ padding: '12px 16px' }} />
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {getCompareData().map((row, i) => (
                    <CompareRow
                      key={i}
                      label={row.label}
                      values={row.values}
                      highlight={row.highlight}
                      isPrice={row.isPrice}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Message si moins de 2 produits */}
        {compared.length < 2 && compared.length > 0 && (
          <div style={{
            textAlign: 'center', padding: '40px',
            background: 'var(--primary-subtle)',
            border: '1.5px dashed var(--border-red)',
            borderRadius: 20, color: 'var(--primary)',
            fontFamily: 'DM Sans', fontSize: 14, fontWeight: 600,
          }}>
            Ajoutez au moins un autre produit pour comparer
          </div>
        )}

        {/* Lien catalogue */}
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <a href="/catalogue" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontFamily: 'DM Sans', fontSize: 14, color: 'var(--primary)',
            textDecoration: 'none', fontWeight: 700,
          }}>
            Voir tous les produits <ArrowRight style={{ width: 16, height: 16 }} />
          </a>
        </div>
      </div>
    </>
  );
};

export default Comparateur;