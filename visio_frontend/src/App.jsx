import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Loader from './components/Loader';
import StarField from './components/StarField';

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

const AppContent = () => (
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
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
          <Route path="/register-seller" element={<RegisterSeller />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/seller-dashboard" element={<SellerRoute><SellerDashboard /></SellerRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </React.Suspense>
    </main>
    <Footer />
  </div>
);

const App = () => (
  <HelmetProvider>
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="page-bg" />
          <div className="neon-orb neon-orb-1" />
          <div className="neon-orb neon-orb-2" />
          <div className="neon-orb neon-orb-3" />
          <StarField />
          <AppContent />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  </HelmetProvider>
);

export default App;