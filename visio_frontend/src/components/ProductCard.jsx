import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';

const ProductCard = ({ product }) => {
  const { addItem, isInCart } = useCart();
  const inCart = isInCart(product.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inCart) addItem(product);
  };

  const conditionLabel = product.condition === 'new' ? 'Neuf'
    : product.condition === 'refurbished' ? 'Reconditionné' : 'Occasion';

  return (
    <Link to={`/products/${product.slug}`} className="flip-card-container block" style={{ textDecoration: 'none' }}>
      <div className="flip-card">

        {/* FACE AVANT */}
        <div className="card-front">
          <div className="card-figure">
            {product.primary_image ? (
              <img src={product.primary_image} alt={product.name} className="card-product-img" />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a2e', fontSize: 64 }}>
                📱
              </div>
            )}
            <div className="card-img-bg" />
            {product.brand_name && (
              <span className="card-figcaption">{product.brand_name}</span>
            )}
          </div>

          <ul className="card-front-details">
            <li style={{ fontWeight: 700, fontSize: 14 }}>{product.name.length > 28 ? product.name.slice(0, 28) + '…' : product.name}</li>
            <li>{conditionLabel}</li>
            {product.reviews_count > 0 && (
              <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Star style={{ width: 12, height: 12, fill: '#facc15', color: '#facc15' }} />
                {parseFloat(product.average_rating).toFixed(1)} ({product.reviews_count})
              </li>
            )}
            <li style={{ fontWeight: 800, color: 'hsl(22,90%,60%)', fontSize: 16 }}>
              {formatPrice(product.price, product.currency)}
            </li>
            {!product.in_stock && <li style={{ color: '#f87171' }}>Rupture de stock</li>}
          </ul>
        </div>

        {/* FACE ARRIERE */}
        <div className="card-back">
          {product.primary_image ? (
            <img
              src={product.primary_image}
              alt={product.name}
              className="card-product-img"
              style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}
            />
          ) : (
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: '#1a1a2e', zIndex: 0 }} />
          )}
          <div className="card-img-bg" style={{ zIndex: 1 }} />

          <p className="card-back-title" style={{ zIndex: 2 }}>{product.name}</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, zIndex: 2 }}>
            <span className="card-back-price">{formatPrice(product.price, product.currency)}</span>
            {product.old_price && (
              <span className="card-back-old-price">{formatPrice(product.old_price, product.currency)}</span>
            )}
          </div>

          {product.discount_percent > 0 && (
            <span className="card-back-badge">-{product.discount_percent}%</span>
          )}

          <button
            onClick={handleAddToCart}
            disabled={!product.in_stock}
            className={`flip-btn ${inCart ? 'in-cart' : ''}`}
          >
            {inCart ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Check size={14} /> Dans le panier
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShoppingCart size={14} /> Ajouter au panier
              </span>
            )}
          </button>

          <div className="design-container">
            <span className="design design--1"></span>
            <span className="design design--2"></span>
            <span className="design design--3"></span>
            <span className="design design--4"></span>
            <span className="design design--5"></span>
            <span className="design design--6"></span>
            <span className="design design--7"></span>
            <span className="design design--8"></span>
          </div>
        </div>

      </div>
    </Link>
  );
};

export default ProductCard;