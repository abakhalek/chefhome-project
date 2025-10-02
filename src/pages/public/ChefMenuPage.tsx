
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { chefService } from '../../services/chefService';
import { Chef, Menu } from '../../types';

const ChefMenuPage: React.FC = () => {
  const { chefId } = useParams<{ chefId: string }>();
  const [chef, setChef] = useState<Chef | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChefMenus = async () => {
      if (!chefId) return;
      setLoading(true);
      try {
        const response = await chefService.getChefProfile(chefId);
        setChef(response.chef);
      } catch (error) {
        console.error("Failed to fetch chef menus:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChefMenus();
  }, [chefId]);

  if (loading) {
    return <div className="p-6 text-center">Loading menus...</div>;
  }

  if (!chef) {
    return <div className="p-6 text-center">Chef not found.</div>;
  }

  const menus = chef.portfolio?.menus || [];

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-4">Les Offres de {chef.user?.name}</h1>
        <p className="text-center text-gray-600 mb-10">Découvrez les créations culinaires uniques de notre chef.</p>
        
        {menus.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {menus.map((menu: Menu) => (
              <div key={menu.id || menu._id} className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
                {menu.image && (
                  <img src={menu.image} alt={menu.name} className="w-full h-56 object-cover"/>
                )}
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{menu.name}</h2>
                  <p className="text-gray-600 mb-4 h-20 overflow-y-auto">{menu.description}</p>
                  
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-green-600">{menu.price}€</span>
                    <span className="text-gray-500">/{menu.type === 'horaire' ? 'heure' : 'personne'}</span>
                  </div>

                  {menu.courses && menu.courses.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-2">Composition du menu :</h4>
                      <ul className="list-disc list-inside text-gray-600 text-sm">
                        {menu.courses.map((course, index) => (
                          <li key={index}>{course.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button 
                    onClick={() => alert('Redirection vers la réservation de ce menu.')} 
                    className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors">
                    Réserver ce menu
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500">Ce chef n'a pas encore publié d'offres.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChefMenuPage;
