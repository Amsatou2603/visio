import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import AuthModal from '../components/AuthModal';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/formatPrice';

const Cart = () => {
  const { items, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (items.length === 0) {
    return (
      <>
        <SEOHead title="Mon Panier" url="/cart" />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <ShoppingBag className="w-20 h-20 text-gray-200 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Votre panier est vide</h1>
          <p className="text-gray-500 mb-8">Ajoutez des produits pour commencer vos achats.</p>
          <Link to="/catalogue" className="btn-primary px-8 py-3">
            Découvrir le catalogue
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead title="Mon Panier" url="/cart" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Mon panier <span className="text-gray-400 font-normal text-lg">({totalItems} article{totalItems > 1 ? 's' : ''})</span>
          </h1>
          <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-600 transition-colors">
            Vider le panier
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Articles */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item.id} className="card p-4 flex gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                  {item.primary_image ? (
                    <img src={item.primary_image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">📱</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 line-clamp-2 mb-1">{item.name}</h3>
                  {item.brand_name && <p className="text-xs text-primary-500 mb-2">{item.brand_name}</p>}
                  <p className="font-bold text-gray-900">{formatPrice(item.price, item.currency)}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 hover:bg-gray-50"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3 text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 hover:bg-gray-50"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Récapitulatif */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="font-bold text-lg text-gray-900 mb-4">Récapitulatif</h2>
              <div className="space-y-3 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Sous-total</span>
                  <span className="font-medium">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Livraison</span>
                  <span className="font-medium">2 000 FCFA</span>
                </div>
              </div>
              <div className="border-t pt-4 flex justify-between font-bold text-lg mb-6">
                <span>Total</span>
                <span className="text-primary-600">{formatPrice(totalPrice + 2000)}</span>
              </div>
              <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} reason="acheter" returnTo="/checkout" />
              {isAuthenticated ? (
                <Link to="/checkout" className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                  Commander <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAuth(true)}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                >
                  Commander <ArrowRight className="w-4 h-4" />
                </button>
              )}
              <Link to="/catalogue" className="btn-secondary w-full text-center mt-3 py-2 block text-sm">
                Continuer mes achats
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;