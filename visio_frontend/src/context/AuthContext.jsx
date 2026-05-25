import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('user');
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');

      if (!accessToken || !refreshToken) {
        setLoading(false);
        return;
      }

      // Vérifier si le token est encore valide
      try {
        const profileRes = await api.get('/auth/profile/');
        setUser(profileRes.data);
        localStorage.setItem('user', JSON.stringify(profileRes.data));
      } catch (error) {
        // Token expiré — essayer de refresh
        try {
          const res = await api.post('/auth/token/refresh/', { refresh: refreshToken });
          localStorage.setItem('access_token', res.data.access);
          // Récupérer le profil avec le nouveau token
          const profileRes = await api.get('/auth/profile/');
          setUser(profileRes.data);
          localStorage.setItem('user', JSON.stringify(profileRes.data));
        } catch (refreshError) {
          // Refresh aussi expiré — déconnecter
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login/', { email, password });
    const { access, refresh } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    const profileResponse = await api.get('/auth/profile/');
    const userData = profileResponse.data;
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    const response = await api.post('/auth/register/', formData);
    const { user: userData, tokens } = response.data;
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) await api.post('/auth/logout/', { refresh });
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const updateProfile = async (formData) => {
    const response = await api.patch('/auth/profile/', formData);
    const updated = response.data;
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
    return updated;
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin' || user?.is_staff;
  const isSeller = user?.role === 'seller' || isAdmin;

  return (
    <AuthContext.Provider value={{
      user, loading, isAuthenticated, isAdmin, isSeller,
      login, register, logout, updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};