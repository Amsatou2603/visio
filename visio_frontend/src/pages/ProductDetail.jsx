import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Star, Plus, Minus, Check } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Loader from '../components/Loader';
import ProductCard from '../components/ProductCard';
import AuthModal from '../components/AuthModal';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatPrice, formatDate } from '../utils/formatPrice';

const ProductDetail = () => {
  const { slug } = useParams();
  const { addItem, isInCart, items, updateQuantity } = useCart();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [similar, setSimilar] = useState([]);
  const [showAuth, setShowAuth] = useState(false);

  const inCart = product ? isInCart(product.id) : false;
  const cartItem = product ? items.find(i => i.id === product.id) : null;

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/${slug}/`);
        setProduct(res.data);
        const simRes = await api.get('/products/', {
          params: {
            category: res.data.category?.slug,
            limit: 4,
          }
        });
        const simProducts = (simRes.data.results || simRes.data)
          .filter(p => p.id !== res.data.id)
          .slice(0, 4);
        setSimilar(simProducts);
        const revRes = await api.get(`/reviews/product/${res.data.id}/`);
        setReviews(revRes.data.results || revRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (inCart) {
      updateQuantity(product.id, cartItem.quantity + quantity);
    } else {
      addItem(product, quantity);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    setReviewError('');
    try {
      await api.post(`/reviews/product/${product.id}/`, {
        ...reviewForm,
        product: product.id,
      });
      const revRes = await api.get(`/reviews/product/${product.id}/`);
      setReviews(revRes.data.results || revRes.data);
      setReviewForm({ rating: 5, title: '', comment: '' });
    } catch (err) {
      setReviewError(err.response?.data?.detail || 'Erreur lors de l\'envoi de l\'avis.');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return <Loader text="Chargement du produit..." />;
  if (!product) return (
    <div className="text-center py-20">
      <p className="text-xl text-gray-500">Produit introuvable.</p>
      <Link to="/catalogue" className="btn-primary mt-4 inline-block">Retour au catalogue</Link>
    </div>
  );

  const images = product.images?.length > 0 ? product.images : [];

  return (
    <>
      <SEOHead
        title={product.meta_title || product.name}
        description={product.meta_description || product.short_description}
        url={`/products/${product.slug}`}
        type="product"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-primary-500">Accueil</Link>
          <span>/</span>
          <Link to="/catalogue" className="hover:text-primary-500">Catalogue</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          {/* Images */}
          <div>
            <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-3">
              {images[activeImage] ? (
                <img
                  src={images[activeImage].image}
                  alt={images[activeImage].alt_text || product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <span className="text-6xl">📱</span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(idx)}
                    className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                      activeImage === idx ? 'border-primary-500' : 'border-transparent'
                    }`}
                  >
                    <img src={img.image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Infos */}
          <div>
            {product.brand_name && (
              <p className="text-sm text-primary-500 font-semibold uppercase tracking-wide mb-2">
                {product.brand_name}
              </p>
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

            {/* Rating */}
            {product.reviews_count > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${s <= Math.round(product.average_rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {parseFloat(product.average_rating).toFixed(1)} ({product.reviews_count} avis)
                </span>
              </div>
            )}

            {/* Prix */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(product.price, product.currency)}
              </span>
              {product.old_price && (
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.old_price, product.currency)}
                </span>
              )}
              {product.discount_percent > 0 && (
                <span className="badge bg-red-100 text-red-600 text-sm">
                  -{product.discount_percent}%
                </span>
              )}
            </div>

            {/* État + Stock */}
            <div className="flex gap-3 mb-6">
              <span className={`badge ${
                product.condition === 'new' ? 'bg-green-100 text-green-700' :
                product.condition === 'refurbished' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {product.condition === 'new' ? 'Neuf' : product.condition === 'refurbished' ? 'Reconditionné' : 'Occasion'}
              </span>
              <span className={`badge ${product.in_stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {product.in_stock ? `En stock (${product.stock})` : 'Rupture de stock'}
              </span>
            </div>

            {product.short_description && (
              <p className="text-gray-600 mb-6">{product.short_description}</p>
            )}

            {/* Quantité + Panier */}
            {product.in_stock && (
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="p-2 hover:bg-gray-50 rounded-l-lg transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-medium min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="p-2 hover:bg-gray-50 rounded-r-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold transition-all ${
                    inCart ? 'bg-green-500 hover:bg-green-600 text-white' : 'btn-primary'
                  }`}
                >
                  {inCart ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                  {inCart ? 'Dans le panier' : 'Ajouter au panier'}
                </button>
              </div>
            )}

            <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} reason="acheter" returnTo="/checkout" />
            {isAuthenticated ? (
              <Link to="/checkout" className="btn-outline w-full text-center block py-3">
                Commander maintenant
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setShowAuth(true)}
                className="btn-outline w-full text-center block py-3"
                style={{ cursor: 'pointer' }}
              >
                Commander maintenant
              </button>
            )}
          </div>
        </div>

        {/* Description + Specs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
            <div className="prose text-gray-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </div>
          </div>
          {product.specifications?.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Spécifications</h2>
              <div className="card divide-y divide-gray-100">
                {product.specifications.map(spec => (
                  <div key={spec.id} className="flex justify-between px-4 py-3 text-sm">
                    <span className="text-gray-500 font-medium">{spec.key}</span>
                    <span className="text-gray-800 text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Avis */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Avis clients ({reviews.length})
          </h2>

          {/* Formulaire avis */}
          {isAuthenticated && (
            <form onSubmit={handleSubmitReview} className="card p-6 mb-8">
              <h3 className="font-semibold text-gray-800 mb-4">Laisser un avis</h3>
              {reviewError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{reviewError}</div>
              )}
              <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setReviewForm(f => ({ ...f, rating: s }))}
                  >
                    <Star className={`w-6 h-6 ${s <= reviewForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={reviewForm.title}
                onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Titre (optionnel)"
                className="input-field mb-3"
              />
              <textarea
                value={reviewForm.comment}
                onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                placeholder="Votre avis..."
                rows={4}
                required
                className="input-field mb-4 resize-none"
              />
              <button type="submit" disabled={reviewLoading} className="btn-primary">
                {reviewLoading ? 'Envoi...' : 'Publier l\'avis'}
              </button>
            </form>
          )}

          {/* Liste avis */}
          {reviews.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Aucun avis pour l'instant. Soyez le premier !</p>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="card p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-800">{review.user_name}</p>
                      <div className="flex mt-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{formatDate(review.created_at)}</span>
                  </div>
                  {review.title && <p className="font-medium text-gray-800 mb-1">{review.title}</p>}
                  <p className="text-gray-600 text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {similar.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 24 }}>Produits similaires</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
              {similar.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductDetail;