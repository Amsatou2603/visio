import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (isAuthenticated) fetchWishlist();
    else setItems([]);
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/auth/wishlist/');
      setItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const toggle = async (productId) => {
    try {
      const res = await api.post('/auth/wishlist/', { product_id: productId });
      if (res.data.status === 'added') {
        await fetchWishlist();
      } else {
        setItems(prev => prev.filter(p => p.id !== productId));
      }
      return res.data.status;
    } catch (err) {
      console.error(err);
    }
  };

  const isInWishlist = (productId) => items.some(p => p.id === productId);

  return (
    <WishlistContext.Provider value={{ items, toggle, isInWishlist, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};