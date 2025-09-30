import React, { useState, useEffect } from 'react';
import { chefService } from '../../services/chefService';
import { Search, Star, Euro, MapPin } from 'lucide-react';

const B2BFindChefs: React.FC = () => {
  const [chefs, setChefs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  // Filter states
  const [cuisineType, setCuisineType] = useState('');
  const [city, setCity] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');

  const fetchChefs = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        cuisineType: cuisineType || undefined,
        city: city || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        rating: minRating || undefined,
      };
      const { chefs, pagination } = await chefService.getChefs(params);
      setChefs(chefs);
      setPagination(pagination);
    } catch (error) {
      console.error("Failed to fetch chefs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchChefs(1);
    }, 300);
    return () => clearTimeout(debounce);
  }, [cuisineType, city, minPrice, maxPrice, minRating]);

  const handlePageChange = (newPage: number) => {
    fetchChefs(newPage);
  };

  const handleSelectChef = (chef: any) => {
    alert(`Chef ${chef.user?.name} sélectionné pour une mission B2B. (Fonctionnalité d'attribution à implémenter)`);
    // Here you would typically navigate to a mission assignment page or open a modal
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Trouver un Chef pour ma Mission</h1>

      {/* Filters Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Filtres de Recherche</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <select value={cuisineType} onChange={(e) => setCuisineType(e.target.value)} className="p-3 border rounded-lg">
            <option value="">Type de Cuisine</option>
            <option value="french">Française</option>
            <option value="italian">Italienne</option>
            <option value="asian">Asiatique</option>
          </select>
          <input type="text" placeholder="Ville" value={city} onChange={(e) => setCity(e.target.value)} className="p-3 border rounded-lg" />
          <input type="number" placeholder="Prix Min (€/h)" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="p-3 border rounded-lg" />
          <input type="number" placeholder="Prix Max (€/h)" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="p-3 border rounded-lg" />
          <select value={minRating} onChange={(e) => setMinRating(e.target.value)} className="p-3 border rounded-lg">
            <option value="">Note Min</option>
            <option value="4">4 étoiles et plus</option>
            <option value="3">3 étoiles et plus</option>
          </select>
        </div>
      </div>

      {/* Chef List */}
      {loading ? (
        <div className="text-center py-12">Chargement des chefs...</div>
      ) : chefs.length === 0 ? (
        <div className="text-center py-12">Aucun chef trouvé avec ces critères.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {chefs.map((chef) => (
            <div key={chef._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {chef.portfolio?.images?.[0] ? (
                <img src={chef.portfolio.images[0]} alt={chef.name} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">Pas d'image</div>
              )}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{chef.user?.name}</h2>
                <p className="text-orange-500 font-semibold mb-2">{chef.specialty}</p>
                <div className="flex items-center mb-4">
                  <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                  <span className="text-gray-600">{chef.rating?.average?.toFixed(1) || 'N/A'} ({chef.rating?.count || 0} avis)</span>
                </div>
                <p className="text-gray-700 mb-4 line-clamp-3">{chef.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-green-600">{chef.hourlyRate}€/h</span>
                  <button onClick={() => handleSelectChef(chef)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                    Sélectionner
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-8 space-x-4">
          <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1} className="px-4 py-2 border rounded-lg">Précédent</button>
          <span className="py-2">Page {pagination.page} sur {pagination.pages}</span>
          <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.pages} className="px-4 py-2 border rounded-lg">Suivant</button>
        </div>
      )}
    </div>
  );
};

export default B2BFindChefs;