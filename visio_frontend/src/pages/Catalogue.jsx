import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import api from '../services/api';

const Catalogue = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    brand: '',
    min_price: '',
    max_price: '',
    condition: '',
    ordering: '-created_at',
  });

  const fetchProducts = useCallback(async (page = 1, currentFilters) => {
    const f = currentFilters || filters;
    setLoading(true);
    try {
      const params = { page };
      if (f.search) params.search = f.search;
      if (f.category) params.category = f.category;
      if (f.brand) params.brand = f.brand;
      if (f.min_price) params.min_price = f.min_price;
      if (f.max_price) params.max_price = f.max_price;
      if (f.condition) params.condition = f.condition;
      if (f.ordering) params.ordering = f.ordering;
      const res = await api.get('/products/', { params });
      setProducts(res.data.results || res.data);
      setTotalCount(res.data.count || 0);
      setTotalPages(Math.ceil((res.data.count || 0) / 12));
      setCurrentPage(page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          api.get('/products/categories/'),
          api.get('/products/brands/'),
        ]);
        setCategories(catRes.data.results || catRes.data);
        setBrands(brandRes.data.results || brandRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMeta();
  }, []);

  useEffect(() => {
    fetchProducts(1, filters);
  }, []);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    // Pour les selects (pas la recherche texte), fetch immédiat
    if (key !== 'search') {
      fetchProducts(1, newFilters);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts(1, filters);
  };

  const resetFilters = () => {
    const empty = {
      search: '', category: '', brand: '',
      min_price: '', max_price: '', condition: '', ordering: '-created_at',
    };
    setFilters(empty);
    fetchProducts(1, empty);
  };

  return (
    <>
      <SEOHead
        title="Catalogue — Téléphones et Électronique"
        description="Parcourez notre catalogue de téléphones, tablettes et accessoires au meilleur prix."
        url="/catalogue"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Catalogue</h1>
            <p className="text-sm text-gray-500 mt-1">{totalCount} produit{totalCount > 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 btn-secondary md:hidden"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtres
          </button>
        </div>

        <div className="flex gap-6">
          {/* Sidebar filtres */}
          <aside className={`${filtersOpen ? 'block' : 'hidden'} md:block w-full md:w-64 flex-shrink-0`}>
            <div className="card p-4 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Filtres</h3>
                <button onClick={resetFilters} className="text-xs text-primary-500 hover:underline">
                  Réinitialiser
                </button>
              </div>

              {/* Recherche */}
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={e => handleFilterChange('search', e.target.value)}
                    placeholder="Rechercher..."
                    className="input-field pl-9 text-sm"
                  />
                </div>
              </form>

              {/* Catégorie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                <select
                  value={filters.category}
                  onChange={e => handleFilterChange('category', e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="">Toutes</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Marque */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Marque</label>
                <select
                  value={filters.brand}
                  onChange={e => handleFilterChange('brand', e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="">Toutes</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.slug}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Prix */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prix (FCFA)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filters.min_price}
                    onChange={e => handleFilterChange('min_price', e.target.value)}
                    placeholder="Min"
                    className="input-field text-sm"
                  />
                  <input
                    type="number"
                    value={filters.max_price}
                    onChange={e => handleFilterChange('max_price', e.target.value)}
                    placeholder="Max"
                    className="input-field text-sm"
                  />
                </div>
              </div>

              {/* État */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">État</label>
                <select
                  value={filters.condition}
                  onChange={e => handleFilterChange('condition', e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="">Tous</option>
                  <option value="new">Neuf</option>
                  <option value="used">Occasion</option>
                  <option value="refurbished">Reconditionné</option>
                </select>
              </div>

              {/* Tri */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trier par</label>
                <select
                  value={filters.ordering}
                  onChange={e => handleFilterChange('ordering', e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="-created_at">Plus récents</option>
                  <option value="price">Prix croissant</option>
                  <option value="-price">Prix décroissant</option>
                  <option value="-average_rating">Mieux notés</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Grille produits */}
          <div className="flex-1">
            {loading ? (
              <Loader text="Chargement des produits..." />
            ) : products.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-lg font-medium">Aucun produit trouvé</p>
                <p className="text-sm mt-2">Essayez de modifier vos filtres</p>
                <button onClick={resetFilters} className="btn-primary mt-4">
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-10">
                    <button
                      onClick={() => fetchProducts(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
                    >
                      Précédent
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                        .map((page, idx, arr) => (
                          <React.Fragment key={page}>
                            {idx > 0 && arr[idx - 1] !== page - 1 && (
                              <span className="px-2 py-1 text-gray-400">...</span>
                            )}
                            <button
                              onClick={() => fetchProducts(page)}
                              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                                  ? 'bg-primary-500 text-white'
                                  : 'bg-white border border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        ))}
                    </div>
                    <button
                      onClick={() => fetchProducts(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
                    >
                      Suivant
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Catalogue;