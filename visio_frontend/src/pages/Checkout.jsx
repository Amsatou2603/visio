import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatPrice } from '../utils/formatPrice';

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
    try {
      const orderData = {
        ...form,
        items: items.map(i => ({ product_id: i.id, quantity: i.quantity })),
      };
      const res = await api.post('/orders/', orderData);
      setOrderId(res.data.id);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la commande.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/payments/initiate/', {
        order_id: orderId,
        method: payment.method,
        phone_number: payment.phone_number,
      });
      clearCart();
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du paiement.');
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