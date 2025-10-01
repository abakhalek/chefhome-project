import React, { useState, useEffect } from 'react';
import { chefService } from '../../services/chefService';
import { Search, Star, Euro, MapPin, Filter, Users, Clock, Calendar, CheckCircle, XCircle } from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const FindChefPage: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const [chefs, setChefs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  // Filter states
  const [serviceType, setServiceType] = useState('');
  const [cuisineType, setCuisineType] = useState('');
  const [city, setCity] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');

  // Booking states
  const [selectedChef, setSelectedChef] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    date: '',
    time: '',
    guests: 1,
    specialRequests: '',
    allergies: '',
    equipment: '',
  });

  const fetchChefs = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        serviceType: serviceType || undefined,
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
  }, [serviceType, cuisineType, city, minPrice, maxPrice, minRating]);

  const handlePageChange = (newPage: number) => {
    fetchChefs(newPage);
  };

  const handleBookChef = (chef: any) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (role !== 'client') {
      alert('Seuls les clients peuvent réserver un chef.');
      return;
    }
    setSelectedChef(chef);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Booking submitted for chef:", selectedChef, bookingDetails);
    alert("Réservation envoyée ! (Fonctionnalité de paiement à implémenter)");
    setShowBookingModal(false);
    // Here you would integrate with a payment gateway like Stripe
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 md:px-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">Trouver votre Chef Idéal</h1>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Filtres Personnalisés</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} className="p-3 border rounded-lg">
              <option value="">Type de Prestation</option>
              <option value="home-dining">Repas à domicile</option>
              <option value="private-events">Événement privé</option>
              <option value="cooking-classes">Cours de cuisine</option>
            </select>
            <select value={cuisineType} onChange={(e) => setCuisineType(e.target.value)} className="p-3 border rounded-lg">
              <option value="">Type de Cuisine</option>
              <option value="french">Française</option>
              <option value="italian">Italienne</option>
              <option value="asian">Asiatique</option>
            </select>
            <input type="text" placeholder="Ville" value={city} onChange={(e) => setCity(e.target.value)} className="p-3 border rounded-lg" />
            <input type="number" placeholder="Prix Min (€)" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="p-3 border rounded-lg" />
            <input type="number" placeholder="Prix Max (€)" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="p-3 border rounded-lg" />
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
                    <button onClick={() => handleBookChef(chef)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                      Réserver
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

        {/* Booking Modal */}
        {showBookingModal && selectedChef && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-4 md:p-6 border-b">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Réserver {selectedChef.user?.name}</h2>
                <button onClick={() => setShowBookingModal(false)} className="text-gray-500 hover:text-gray-700"><XCircle size={24} /></button>
              </div>
              <form onSubmit={handleBookingSubmit} className="p-4 md:p-6 space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Type de Prestation</label>
                  <select className="w-full p-3 border rounded-lg">
                    <option>Repas quotidien</option>
                    <option>Événement privé</option>
                    <option>Cours de cuisine</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Date</label>
                    <input type="date" value={bookingDetails.date} onChange={(e) => setBookingDetails({...bookingDetails, date: e.target.value})} className="w-full p-3 border rounded-lg" required />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Heure</label>
                    <input type="time" value={bookingDetails.time} onChange={(e) => setBookingDetails({...bookingDetails, time: e.target.value})} className="w-full p-3 border rounded-lg" required />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Nombre de convives</label>
                  <input type="number" value={bookingDetails.guests} onChange={(e) => setBookingDetails({...bookingDetails, guests: Number(e.target.value)})} min="1" className="w-full p-3 border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Préférences culinaires / Demandes spéciales</label>
                  <textarea value={bookingDetails.specialRequests} onChange={(e) => setBookingDetails({...bookingDetails, specialRequests: e.target.value})} rows={3} className="w-full p-3 border rounded-lg"></textarea>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Allergies</label>
                  <input type="text" value={bookingDetails.allergies} onChange={(e) => setBookingDetails({...bookingDetails, allergies: e.target.value})} placeholder="Ex: Gluten, Lactose" className="w-full p-3 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Équipement disponible</label>
                  <input type="text" value={bookingDetails.equipment} onChange={(e) => setBookingDetails({...bookingDetails, equipment: e.target.value})} placeholder="Ex: Four, Plaque de cuisson" className="w-full p-3 border rounded-lg" />
                </div>
                
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                  <button type="button" onClick={() => setShowBookingModal(false)} className="px-6 py-2 border rounded-lg text-gray-700">Annuler</button>
                  <button type="submit" className="px-6 py-2 bg-orange-500 text-white rounded-lg">Procéder au paiement</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindChefPage;