import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/';
  const [form, setForm] = useState({
    email: '', username: '', first_name: '', last_name: '',
    password: '', password2: '', phone: '', country: 'Sénégal', city: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await register(form);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setErrors(err.response?.data || { detail: 'Erreur lors de l\'inscription.' });
    } finally {
      setLoading(false);
    }
  };

  const getError = (field) => {
    if (errors[field]) return Array.isArray(errors[field]) ? errors[field][0] : errors[field];
    return null;
  };

  return (
    <>
      <SEOHead title="Créer un compte" url="/register" />
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
            <p className="text-gray-500 mt-2">Rejoignez la marketplace Visio</p>
          </div>

          <div className="card p-8">
            {errors.detail && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{errors.detail}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                  <input
                    value={form.first_name}
                    onChange={e => handleChange('first_name', e.target.value)}
                    className="input-field"
                    required
                  />
                  {getError('first_name') && <p className="text-red-500 text-xs mt-1">{getError('first_name')}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input
                    value={form.last_name}
                    onChange={e => handleChange('last_name', e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => handleChange('email', e.target.value)}
                  className="input-field"
                  required
                />
                {getError('email') && <p className="text-red-500 text-xs mt-1">{getError('email')}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom d'utilisateur *</label>
                <input
                  value={form.username}
                  onChange={e => handleChange('username', e.target.value)}
                  className="input-field"
                  required
                />
                {getError('username') && <p className="text-red-500 text-xs mt-1">{getError('username')}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  value={form.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                  className="input-field"
                  placeholder="+221 77 000 00 00"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                  <input
                    value={form.country}
                    onChange={e => handleChange('country', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                  <input
                    value={form.city}
                    onChange={e => handleChange('city', e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => handleChange('password', e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                  required
                />
                {getError('password') && <p className="text-red-500 text-xs mt-1">{getError('password')}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe *</label>
                <input
                  type="password"
                  value={form.password2}
                  onChange={e => handleChange('password2', e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Création du compte...' : 'Créer mon compte'}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-primary-500 font-medium hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;