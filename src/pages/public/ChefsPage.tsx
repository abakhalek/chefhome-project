
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { chefService } from '../../services/chefService';
import { Chef } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button'; // Assuming you have a Button component

const ChefsPage: React.FC = () => {
  const [chefs, setChefs] = useState<Chef[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChefs = async () => {
      setLoading(true);
      try {
        // Assuming getChefs can be called with filters, here none for all approved chefs
        const response = await chefService.getChefs({});
        setChefs(response.chefs || []);
      } catch (error) {
        console.error("Failed to fetch chefs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChefs();
  }, []);

  const handleViewOffers = (chefId: string) => {
    navigate(`/chefs/${chefId}/menus`);
  };

  const handleBooking = (chefId: string) => {
    if (!isAuthenticated) {
      // Redirect to login page, saving the intended destination
      navigate('/login', { state: { from: `/chefs/${chefId}/booking` } });
    } else {
      // User is logged in, proceed to booking page
      navigate(`/chefs/${chefId}/booking`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl font-semibold">Loading chefs...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-10">Découvrez nos Chefs d'Exception</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {chefs.map((chef) => (
            <div key={chef.id} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
              <div className="relative">
                <img 
                  src={chef.profilePicture || '/chef-images/default-profile.png'} 
                  alt={chef.user?.name || 'Chef profile'} 
                  className="w-full h-64 object-cover rounded-t-xl"
                />
                <div className="absolute top-2 right-2 bg-white rounded-full px-3 py-1 text-sm font-semibold text-gray-800 shadow-md">
                  {chef.hourlyRate ? `${chef.hourlyRate}€/hr` : 'N/A'}
                </div>
              </div>
              <div className="p-5">
                <h2 className="text-2xl font-bold text-gray-900 truncate">{chef.user?.name}</h2>
                <p className="text-gray-600 font-medium mb-3">{chef.specialty}</p>
                <div className="flex items-center mb-4">
                  {/* Add rating later if available */}
                </div>
                <div className="flex flex-col space-y-2">
                  <Button onClick={() => handleViewOffers(chef.id)} variant="outline">
                    Voir les Offres
                  </Button>
                  <Button onClick={() => handleBooking(chef.id)}>
                    Réserver
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChefsPage;
