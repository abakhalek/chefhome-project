import React, { useState, useEffect } from 'react';
import { chefService, ChefMenu } from '../../services/chefService';
import { Plus, Edit, Trash2, Eye, Camera, Save, X, Euro, Clock, Users } from 'lucide-react';

const ChefMenus: React.FC = () => {
  const [menus, setMenus] = useState<ChefMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState<ChefMenu | null>(null);
  const [formData, setFormData] = useState<Partial<ChefMenu>>({});

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingMenu) {
        await chefService.updateMenu(editingMenu._id, formData);
      } else {
        await chefService.createMenu(formData);
      }
      setShowModal(false);
      setEditingMenu(null);
      fetchMenus(); // Refresh menus list
    } catch (error) {
      console.error('Error saving menu:', error);
    }
  };

  const handleDelete = async (menuId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) return;
    try {
      await chefService.deleteMenu(menuId);
      fetchMenus(); // Refresh menus list
    } catch (error) {
      console.error('Error deleting menu:', error);
    }
  };

  const handleEdit = (menu: ChefMenu) => {
    setEditingMenu(menu);
    setFormData(menu);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingMenu(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      type: 'forfait',
      isActive: true,
      courses: [],
      dietaryOptions: [],
      duration: '',
      minGuests: 1,
      maxGuests: 12,
      ingredients: [],
      allergens: [],
      category: 'Gastronomique',
    });
    setShowModal(true);
  };

  const handleArrayInput = (field: keyof ChefMenu, value: string) => {
    setFormData(prev => {
      const currentArray = (prev[field] as string[]) || [];
      return { ...prev, [field]: [...currentArray, value.trim()] };
    });
  };

  const removeArrayItem = (field: keyof ChefMenu, index: number) => {
    setFormData(prev => {
      const currentArray = (prev[field] as string[]) || [];
      return { ...prev, [field]: currentArray.filter((_, i) => i !== index) };
    });
  };

  const toggleArrayItem = (field: keyof ChefMenu, item: string) => {
    setFormData(prev => {
      const currentArray = (prev[field] as string[]) || [];
      if (currentArray.includes(item)) {
        return { ...prev, [field]: currentArray.filter(i => i !== item) };
      }
      return { ...prev, [field]: [...currentArray, item] };
    });
  };

  const dietaryOptionsList = [
    'Végétarien', 'Vegan', 'Sans gluten', 'Sans lactose', 'Halal', 'Casher',
    'Paléo', 'Cétogène', 'Diabétique', 'Hypocalorique'
  ];

  const commonAllergensList = [
    'Gluten', 'Lactose', 'Œufs', 'Fruits à coque', 'Arachides', 'Soja',
    'Poisson', 'Crustacés', 'Mollusques', 'Céleri', 'Moutarde', 'Sésame'
  ];

  const menuCategoriesList = [
    'Gastronomique', 'Traditionnel', 'Moderne', 'Fusion', 'Formation', 'Événementiel'
  ];

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
        <button
          onClick={handleCreate}
          className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Nouvelle Offre</span>
        </button>
      </div>

      {/* Menus Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menus.map((menu) => (
          <div key={menu._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="relative h-48 bg-gray-200">
              {menu.image ? (
                <img src={menu.image} alt={menu.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center"><Camera className="h-12 w-12 text-gray-400" /></div>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{menu.name}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{menu.description}</p>
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl font-bold text-green-600">{menu.price}€{menu.type === 'horaire' && '/h'}</div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${menu.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                  {menu.isActive ? 'Actif' : 'Inactif'}
                </span>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => handleEdit(menu)} className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2">
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">{editingMenu ? 'Modifier l\'offre' : 'Nouvelle offre culinaire'}</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l\'offre *</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Menu Gastronomique Français"
                      className="w-full py-3 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
                    <select
                      value={formData.category || 'Gastronomique'}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full py-3 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      {menuCategoriesList.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    placeholder="Décrivez votre offre en détail..."
                    className="w-full py-3 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Pricing and Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tarification et détails</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type de tarification *</label>
                    <select
                      value={formData.type || 'forfait'}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'forfait' | 'horaire' }))}
                      className="w-full py-3 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="forfait">Forfait</option>
                      <option value="horaire">Horaire</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prix (€) {formData.type === 'horaire' && '/h'} *
                    </label>
                    <input
                      type="number"
                      value={formData.price || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                      min="0"
                      className="w-full py-3 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Durée estimée</label>
                    <input
                      type="text"
                      value={formData.duration || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="Ex: 2-3h"
                      className="w-full py-3 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Invités (min-max)</label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        value={formData.minGuests || 1}
                        onChange={(e) => setFormData(prev => ({ ...prev, minGuests: Number(e.target.value) }))}
                        min="1"
                        className="w-full py-3 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        value={formData.maxGuests || 12}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxGuests: Number(e.target.value) }))}
                        min="1"
                        className="w-full py-3 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Courses */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Composition du menu</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Plats inclus</label>
                    <div className="space-y-2">
                      {formData.courses?.map((course, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={course}
                            onChange={(e) => {
                              const newCourses = [...(formData.courses || [])];
                              newCourses[index] = e.target.value;
                              setFormData(prev => ({ ...prev, courses: newCourses }));
                            }}
                            placeholder="Ex: Velouté de châtaigne aux cèpes"
                            className="flex-1 py-2 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => removeArrayItem('courses', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleArrayInput('courses', 'Nouveau plat')}
                        className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center space-x-1"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Ajouter un plat</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ingrédients principaux</label>
                    <div className="space-y-2">
                      {formData.ingredients?.map((ingredient, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={ingredient}
                            onChange={(e) => {
                              const newIngredients = [...(formData.ingredients || [])];
                              newIngredients[index] = e.target.value;
                              setFormData(prev => ({ ...prev, ingredients: newIngredients }));
                            }}
                            placeholder="Ex: Canard fermier du Périgord"
                            className="flex-1 py-2 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => removeArrayItem('ingredients', index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleArrayInput('ingredients', 'Nouvel ingrédient')}
                        className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center space-x-1"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Ajouter un ingrédient</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dietary Options */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Options alimentaires</h3>
                <div className="grid md:grid-cols-3 gap-3">
                  {dietaryOptionsList.map((option) => (
                    <label key={option} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.dietaryOptions?.includes(option) || false}
                        onChange={() => toggleArrayItem('dietaryOptions', option)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500 shadow-sm"
                      />
                      <span className="ml-2 text-sm text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Allergens */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Allergènes présents</h3>
                <div className="grid md:grid-cols-4 gap-3">
                  {commonAllergensList.map((allergen) => (
                    <label key={allergen} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.allergens?.includes(allergen) || false}
                        onChange={() => toggleArrayItem('allergens', allergen)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500 shadow-sm"
                      />
                      <span className="ml-2 text-sm text-gray-700">{allergen}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>{loading ? 'Enregistrement...' : 'Enregistrer l\'offre'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChefMenus;