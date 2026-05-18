import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatPrice, formatDate } from '../utils/formatPrice';

const STATUS_CONFIG = {
  pending:    { label: 'En attente',    color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  confirmed:  { label: 'Confirmée',     color: 'bg-blue-100 text-blue-700',    icon: CheckCircle },
  processing: { label: 'En traitement', color: 'bg-purple-100 text-purple-700', icon: Package },
  shipped:    { label: 'Expédiée',      color: 'bg-indigo-100 text-indigo-700', icon: Truck },
  delivered:  { label: 'Livrée',        color: 'bg-green-100 text-green-700',  icon: CheckCircle },
  cancelled:  { label: 'Annulée',       color: 'bg-red-100 text-red-600',      icon: XCircle },
  refunded:   { label: 'Remboursée',    color: 'bg-gray-100 text-gray-600',    icon: XCircle },
};

const Dashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/');
        setOrders(res.data.results || res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <>
      <SEOHead title="Mon espace" url="/dashboard" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="card p-6 mb-8 bg-gradient-to-r from-primary-500 to-primary-700 text-white">
          <h1 className="text-2xl font-bold mb-1">Bonjour, {user?.first_name} 👋</h1>
          <p className="text-primary-100">{user?.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total commandes', value: orders.length, color: 'text-primary-600' },
            { label: 'En attente', value: orders.filter(o => o.status === 'pending').length, color: 'text-yellow-600' },
            { label: 'Livrées', value: orders.filter(o => o.status === 'delivered').length, color: 'text-green-600' },
            { label: 'Annulées', value: orders.filter(o => o.status === 'cancelled').length, color: 'text-red-500' },
          ].map(stat => (
            <div key={stat.label} className="card p-4 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Commandes */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">Mes commandes</h2>

        {loading ? (
          <Loader text="Chargement des commandes..." />
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Aucune commande pour l'instant</p>
            <Link to="/catalogue" className="btn-primary mt-4 inline-block">
              Commencer à acheter
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const StatusIcon = statusCfg.icon;
              return (
                <div key={order.id} className="card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-900">{order.reference}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.created_at)}</p>
                    </div>
                    <span className={`badge ${statusCfg.color} flex items-center gap-1`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusCfg.label}
                    </span>
                  </div>

                  <div className="space-y-1 mb-4">
                    {order.items?.map(item => (
                      <div key={item.id} className="flex justify-between text-sm text-gray-600">
                        <span>{item.product_name} x{item.quantity}</span>
                        <span>{formatPrice(item.total_price)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t pt-3">
                    <div className="text-sm text-gray-500">
                      📍 {order.shipping_city}, {order.shipping_country}
                    </div>
                    <div className="font-bold text-primary-600">
                      {formatPrice(order.total, order.currency)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;