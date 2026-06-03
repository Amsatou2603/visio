import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatPrice } from '../utils/formatPrice';
import AuthModal from '../components/AuthModal';

const PAYMENT_METHODS = [
  { id: 'wave', label: 'Wave', emoji: '🌊', needsPhone: true },
  { id: 'orange_money', label: 'Orange Money', emoji: '🟠', needsPhone: true },
  { id: 'free_money', label: 'Free Money', emoji: '🟢', needsPhone: true },
  { id: 'cash', label: 'Paiement à la livraison', emoji: '💵', needsPhone: false },
];

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Vérification de l'authentification
  React.useEffect(() => {
    console.log('🔍 État utilisateur:', user); // Debug
    console.log('🛒 Items du panier:', items); // Debug
    
    if (!user) {
      console.log('❌ Utilisateur non connecté, redirection vers authentification'); // Debug
      setShowAuthModal(true);
    }
  }, [user]);

  const [form, setForm] = useState({
    shipping_name: user?.full_name || '',
    shipping_phone: user?.phone || '',
    shipping_address: user?.address || '',
    shipping_city: user?.city || '',
    shipping_country: user?.country || 'Sénégal',
    notes: '',
  });

  const [payment, setPayment] = useState({
    method: 'wave',
    phone_number: user?.phone || '',
  });

  const handleFormChange = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');
    
    console.log('🛒 Début création commande...'); // Debug
    console.log('Form data:', form); // Debug
    console.log('Items:', items); // Debug
    
    try {
      const orderData = {
        ...form,
        items: items.map(i => ({ product_id: i.id, quantity: i.quantity })),
      };
      
      console.log('Order data à envoyer:', orderData); // Debug
      
      const res = await api.post('/orders/', orderData);
      
      console.log('✅ Commande créée:', res.data); // Debug
      
      setOrderId(res.data.id);
      setStep(2);
    } catch (err) {
      console.error('❌ Erreur création commande:', err); // Debug
      console.error('Response data:', err.response?.data); // Debug
      console.error('Response status:', err.response?.status); // Debug
      
      // Gestion plus précise des erreurs
      let errorMessage = 'Erreur lors de la commande.';
      
      if (err.response?.status === 401) {
        errorMessage = 'Vous devez être connecté pour passer commande.';
      } else if (err.response?.status === 400) {
        const errorData = err.response?.data;
        if (typeof errorData === 'object') {
          // Si c'est un objet avec des erreurs de validation
          const firstError = Object.values(errorData)[0];
          errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        }
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    setError('');
    
    console.log('💳 Début initiation paiement...'); // Debug
    console.log('Order ID:', orderId); // Debug
    console.log('Payment data:', payment); // Debug
    
    try {
      const paymentData = {
        order_id: orderId,
        method: payment.method,
        phone_number: payment.phone_number,
      };
      
      console.log('Payment data à envoyer:', paymentData); // Debug
      
      const res = await api.post('/payments/initiate/', paymentData);
      
      console.log('✅ Réponse paiement:', res.data); // Debug

      // If backend returns a payment_url (PayTech), redirect the user
      if (res.data && (res.data.payment_url || res.data.redirect_url)) {
        const url = res.data.payment_url || res.data.redirect_url;
        console.log('🔀 Redirection vers:', url); // Debug
        window.location.href = url;
        return;
      }

      // Fallback: assume payment succeeded (simulation)
      console.log('✅ Paiement simulé réussi'); // Debug
      clearCart();
      setSuccess(true);
    } catch (err) {
      console.error('❌ Erreur paiement:', err); // Debug
      console.error('Response data:', err.response?.data); // Debug
      console.error('Response status:', err.response?.status); // Debug
      
      // Gestion plus précise des erreurs de paiement
      let errorMessage = 'Erreur lors du paiement.';
      
      if (err.response?.status === 401) {
        errorMessage = 'Session expirée. Veuillez vous reconnecter.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Commande introuvable.';
      } else if (err.response?.status === 400) {
        const errorData = err.response?.data;
        if (errorData?.error) {
          errorMessage = errorData.error;
        } else if (typeof errorData === 'object') {
          const firstError = Object.values(errorData)[0];
          errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
        }
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  if (items.length === 0 && !success) {
    navigate('/cart');
    return null;
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          reason="acheter"
        />
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Commande confirmée ! 🎉</h1>
        <p className="text-gray-500 mb-8">
          Votre paiement a été traité avec succès. Vous recevrez une confirmation bientôt.
        </p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary px-8 py-3">
          Voir mes commandes
        </button>
      </div>
    );
  }

  return (
    <>
      <SEOHead title="Finaliser la commande" url="/checkout" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary mb-6"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <ArrowLeft style={{ width: 16, height: 16 }} /> Retour
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Finaliser la commande</h1>

        {/* Steps */}
        <div className="flex items-center gap-4 mb-8">
          {['Livraison', 'Paiement'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step > i + 1 ? 'bg-green-500 text-white' :
                step === i + 1 ? 'bg-primary-500 text-white' :
                'bg-gray-200 text-gray-400'
              }`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className={`text-sm font-medium ${step === i + 1 ? 'text-gray-900' : 'text-gray-400'}`}>{s}</span>
              {i < 1 && <div className="w-12 h-0.5 bg-gray-200" />}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="card p-6">
                <h2 className="font-bold text-lg mb-5">Adresse de livraison</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
                      <input
                        value={form.shipping_name}
                        onChange={e => handleFormChange('shipping_name', e.target.value)}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                      <input
                        value={form.shipping_phone}
                        onChange={e => handleFormChange('shipping_phone', e.target.value)}
                        className="input-field"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
                    <textarea
                      value={form.shipping_address}
                      onChange={e => handleFormChange('shipping_address', e.target.value)}
                      className="input-field resize-none"
                      rows={2}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
                      <input
                        value={form.shipping_city}
                        onChange={e => handleFormChange('shipping_city', e.target.value)}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                      <input
                        value={form.shipping_country}
                        onChange={e => handleFormChange('shipping_country', e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optionnel)</label>
                    <textarea
                      value={form.notes}
                      onChange={e => handleFormChange('notes', e.target.value)}
                      className="input-field resize-none"
                      rows={2}
                      placeholder="Instructions spéciales..."
                    />
                  </div>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading || !form.shipping_name || !form.shipping_phone || !form.shipping_address || !form.shipping_city}
                    className="btn-primary w-full py-3"
                  >
                    {loading ? 'Traitement...' : 'Continuer vers le paiement'}
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="card p-6">
                <h2 className="font-bold text-lg mb-5">Mode de paiement</h2>
                <div className="space-y-3 mb-6">
                  {PAYMENT_METHODS.map(m => (
                    <label
                      key={m.id}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                        payment.method === m.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value={m.id}
                        checked={payment.method === m.id}
                        onChange={() => setPayment(p => ({ ...p, method: m.id }))}
                        className="hidden"
                      />
                      <span className="text-2xl">{m.emoji}</span>
                      <span className="font-medium">{m.label}</span>
                    </label>
                  ))}
                </div>

                {PAYMENT_METHODS.find(m => m.id === payment.method)?.needsPhone && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numéro de téléphone *
                    </label>
                    <input
                      value={payment.phone_number}
                      onChange={e => setPayment(p => ({ ...p, phone_number: e.target.value }))}
                      placeholder="+221 77 000 00 00"
                      className="input-field"
                    />
                  </div>
                )}

                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="btn-primary w-full py-3"
                >
                  {loading ? 'Traitement du paiement...' : `Payer ${formatPrice(totalPrice + 2000)}`}
                </button>
              </div>
            )}
          </div>

          {/* Récap commande */}
          <div className="card p-5 h-fit">
            <h3 className="font-bold text-gray-900 mb-4">Votre commande</h3>
            <div className="space-y-3 mb-4">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 line-clamp-1 flex-1 mr-2">
                    {item.name} x{item.quantity}
                  </span>
                  <span className="font-medium flex-shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Sous-total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Livraison</span>
                <span>2 000 FCFA</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-1 border-t">
                <span>Total</span>
                <span className="text-primary-600">{formatPrice(totalPrice + 2000)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;