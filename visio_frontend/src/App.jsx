import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { WishlistProvider } from './context/WishlistContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Loader from './components/Loader';
import StarField from './components/StarField';
import WhatsAppCTA from './components/WhatsAppCTA';

const Home = React.lazy(() => import('./pages/Home'));
const Catalogue = React.lazy(() => import('./pages/Catalogue'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const RegisterSeller = React.lazy(() => import('./pages/RegisterSeller'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const SellerDashboard = React.lazy(() => import('./pages/SellerDashboard'));
const Partenaires = React.lazy(() => import('./pages/Partenaires'));
const SellerShop = React.lazy(() => import('./pages/SellerShop'));
const AddProduct = React.lazy(() => import('./pages/AddProduct'));
const EditProduct = React.lazy(() => import('./pages/EditProduct'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loader />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
};

const SellerRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'seller' && !user?.is_staff) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppContent = () => {
  const { isAuthenticated, user } = useAuth();
  const isSeller = user?.role === 'seller' || user?.is_staff;

  return (
    <div className="min-h-screen flex flex-col" style={{ position: 'relative', zIndex: 1 }}>
      <Navbar />
      <CartDrawer />
      <main className="flex-1">
        <React.Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalogue" element={<Catalogue />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/partenaires" element={<Partenaires />} />
            <Route path="/boutique/:slug" element={<SellerShop />} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
            <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
            <Route path="/register-seller" element={<RegisterSeller />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/seller-dashboard" element={<SellerRoute><SellerDashboard /></SellerRoute>} />
            <Route path="/products/new" element={<SellerRoute><AddProduct /></SellerRoute>} />
            <Route path="/products/edit/:slug" element={<SellerRoute><EditProduct /></SellerRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </React.Suspense>
      </main>
      <Footer />
      {/* WhatsApp CTA — visible pour tous */}
      <WhatsAppCTA phone="+221770000000" />
    </div>
  );
};

const App = () => (
  <HelmetProvider>
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <BrowserRouter>
              <div className="page-bg" />
              <div className="neon-orb neon-orb-1" />
              <div className="neon-orb neon-orb-2" />
              <div className="neon-orb neon-orb-3" />
              <StarField />
              <AppContent />
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  </HelmetProvider>
);

export default App;