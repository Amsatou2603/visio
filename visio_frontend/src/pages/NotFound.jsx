import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEOHead from '../components/SEOHead';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead title="404 — Page introuvable" />
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="text-8xl mb-6">🔍</div>
        <h1 className="text-6xl font-bold text-primary-500 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Page introuvable</h2>
        <p className="text-gray-500 mb-8 max-w-sm">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <div className="flex gap-4">
          <button onClick={() => navigate(-1)} className="btn-secondary px-6 py-3">
            Retour
          </button>
          <Link to="/" className="btn-primary px-6 py-3">
            Accueil
          </Link>
        </div>
      </div>
    </>
  );
};

export default NotFound;