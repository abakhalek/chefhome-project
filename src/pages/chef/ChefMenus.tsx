import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { chefService, ChefMenu } from '../../services/chefService';
import { Plus, Edit, Trash2, Camera } from 'lucide-react';
import { API_CONFIG } from '../../utils/constants';

const ChefMenus: React.FC = () => {
  const [menus, setMenus] = useState<ChefMenu[]>([]);
  const [loading, setLoading] = useState(true);

  const serverBaseUrl = API_CONFIG.BASE_URL.replace('/api', '');

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const fetchedMenus = await chefService.getMenus();
      setMenus(fetchedMenus);
    } catch (error) {
      console.error("Failed to fetch menus:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleDelete = async (menuId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) return;
    try {
      await chefService.deleteMenu(menuId);
      fetchMenus(); // Refresh menus list
    } catch (error) {
      console.error('Error deleting menu:', error);
    }
  };

  if (loading && menus.length === 0) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Offres</h1>
          <p className="text-gray-600 mt-1">Créez et gérez vos menus et prestations</p>
        </div>
        <Link
          to="/chef-dashboard/menus/new"
          className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Nouvelle Offre</span>
        </Link>
      </div>

      {/* Menus Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menus.map((menu) => (
          <div key={menu._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="relative h-48 bg-gray-200">
              {menu.image ? (
                <img src={`${serverBaseUrl}${menu.image}`} alt={menu.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center"><Camera className="h-12 w-12 text-gray-400" /></div>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{menu.name}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{menu.description}</p>

              {/* New Info */}
              <div className="text-sm text-gray-700 space-y-1 mb-4">
                <p><strong>Catégorie:</strong> {menu.category}</p>
                {menu.courses && menu.courses.length > 0 && <p><strong>Plats:</strong> {menu.courses.join(', ')}</p>}
                {menu.ingredients && menu.ingredients.length > 0 && <p><strong>Ingrédients:</strong> {menu.ingredients.join(', ')}</p>}
                {menu.allergens && menu.allergens.length > 0 && <p><strong>Allergènes:</strong> {menu.allergens.join(', ')}</p>}
                {menu.dietaryOptions && menu.dietaryOptions.length > 0 && <p><strong>Options Diététiques:</strong> {menu.dietaryOptions.join(', ')}</p>}
                {menu.duration && <p><strong>Durée:</strong> {menu.duration}</p>}
                <p><strong>Invités:</strong> {menu.minGuests} - {menu.maxGuests}</p>
                {menu.createdAt && <p><strong>Créé le:</strong> {new Date(menu.createdAt).toLocaleDateString()}</p>}
                {menu.updatedAt && <p><strong>Mis à jour le:</strong> {new Date(menu.updatedAt).toLocaleDateString()}</p>}
              </div>
              {/* End New Info */}

              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl font-bold text-green-600">{menu.price}€{menu.type === 'horaire' && '/h'}</div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${menu.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                  {menu.isActive ? 'Actif' : 'Inactif'}
                </span>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => {}} className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2">
                  <Edit className="h-4 w-4" />
                  <span>Modifier</span>
                </button>
                <button onClick={() => handleDelete(menu._id)} className="bg-red-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>


    </div>
  );
};

export default ChefMenus;