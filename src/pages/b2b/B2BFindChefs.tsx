import React, { useState, useEffect, useCallback } from 'react';
import { chefService } from '../../services/chefService';
import { Star } from 'lucide-react';
import { ChefSearchFilters, PaginationData } from '../../services/clientService';

type ApiRecord = Record<string, unknown>;

const toObject = (value: unknown): ApiRecord => (typeof value === 'object' && value !== null ? value as ApiRecord : {});
const toArray = (value: unknown): ApiRecord[] => (Array.isArray(value) ? value as ApiRecord[] : []);

interface PublicChefSummary {
  id: string;
  name: string;
  specialty: string;
  description: string;
  hourlyRate: number;
  ratingAverage: number;
  ratingCount: number;
  image?: string;
}

const PAGE_SIZE = 10;

const B2BFindChefs: React.FC = () => {
  const [chefs, setChefs] = useState<PublicChefSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({ page: 1, limit: PAGE_SIZE, total: 0, pages: 1 });

  // Filter states
  const [cuisineType, setCuisineType] = useState('');
  const [city, setCity] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');

  const mapChefSummary = (chef: unknown): PublicChefSummary => {
    const chefObj = toObject(chef);
    const userObj = toObject(chefObj.user);
    const portfolioObj = toObject(chefObj.portfolio);
    const ratingObj = toObject(chefObj.rating);
    const images = Array.isArray(portfolioObj.images) ? (portfolioObj.images as string[]) : [];

    const idCandidate = typeof chefObj._id === 'string'
      ? chefObj._id
      : (typeof chefObj.id === 'string' ? chefObj.id : undefined);

    return {
      id: idCandidate || `${userObj.email ?? Math.random()}`,
      name: typeof userObj.name === 'string'
        ? userObj.name
        : (typeof chefObj.name === 'string' ? chefObj.name : 'Chef sans nom'),
      specialty: typeof chefObj.specialty === 'string' ? chefObj.specialty : 'Spécialité non renseignée',
      description: typeof chefObj.description === 'string' ? chefObj.description : 'Description non disponible.',
      hourlyRate: typeof chefObj.hourlyRate === 'number' ? chefObj.hourlyRate : Number(chefObj.hourlyRate ?? 0),
      ratingAverage: typeof ratingObj.average === 'number' ? ratingObj.average : 0,
      ratingCount: typeof ratingObj.count === 'number' ? ratingObj.count : 0,
      image: images.length ? images[0] : undefined
    };
  };

  const fetchChefs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params: ChefSearchFilters = {
        page,
        limit: PAGE_SIZE,
        cuisineType: cuisineType || undefined,
        city: city || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        rating: minRating ? Number(minRating) : undefined
      };
      const { chefs: fetchedChefs, pagination: fetchedPagination } = await chefService.getChefs(params);
      const summaries = toArray(fetchedChefs).map(mapChefSummary);
      setChefs(summaries);
      setPagination(fetchedPagination || {
        page,
        limit: PAGE_SIZE,
        total: summaries.length,
        pages: Math.max(1, Math.ceil(summaries.length / PAGE_SIZE))
      });
    } catch (error) {
      console.error("Failed to fetch chefs:", error);
    } finally {
      setLoading(false);
    }
  }, [cuisineType, city, minPrice, maxPrice, minRating]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchChefs(1);
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchChefs]);

  const handlePageChange = (newPage: number) => {
    fetchChefs(newPage);
  };

  const handleSelectChef = (chef: PublicChefSummary) => {
    alert(`Chef ${chef.name} sélectionné pour une mission B2B. (Fonctionnalité d'attribution à implémenter)`);
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
            <div key={chef.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {chef.image ? (
                <img src={chef.image} alt={chef.name} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">Pas d'image</div>
              )}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{chef.name}</h2>
                <p className="text-orange-500 font-semibold mb-2">{chef.specialty}</p>
                <div className="flex items-center mb-4">
                  <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                  <span className="text-gray-600">{chef.ratingAverage.toFixed(1)} ({chef.ratingCount} avis)</span>
                </div>
                <p className="text-gray-700 mb-4 line-clamp-3">{chef.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-green-600">{chef.hourlyRate.toFixed(2)}€/h</span>
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
