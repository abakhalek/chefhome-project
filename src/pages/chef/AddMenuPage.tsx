
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { chefService, ChefMenuFormData } from '../../services/chefService';
import { Save, X, Plus, ArrowLeft } from 'lucide-react';

const AddMenuPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ChefMenuFormData>({
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
    image: ''
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleInputChange = <K extends keyof ChefMenuFormData>(field: K, value: ChefMenuFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const sanitizeArray = (values: string[]) =>
        values
          .map((item) => item.trim())
          .filter((item) => item.length > 0);

      const payload: ChefMenuFormData = {
        ...formData,
        price: Number.isFinite(formData.price) ? formData.price : 0,
        minGuests: formData.minGuests > 0 ? formData.minGuests : 1,
        maxGuests: formData.maxGuests >= formData.minGuests ? formData.maxGuests : formData.minGuests,
        courses: sanitizeArray(formData.courses),
        ingredients: sanitizeArray(formData.ingredients),
        dietaryOptions: sanitizeArray(formData.dietaryOptions),
        allergens: sanitizeArray(formData.allergens),
      };

      const createdMenu = await chefService.createMyMenu(payload);
      const menuId = createdMenu.id;

      if (imageFile && menuId) {
        await chefService.uploadMyMenuImage(menuId, imageFile);
      }

      navigate('/chef-dashboard/menus');
    } catch (error) {
      console.error('Error creating menu:', error);
      alert("Impossible de créer l'offre. Merci de réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const addArrayItem = (field: 'courses' | 'ingredients') => {
    setFormData(prev => {
      const updated = { ...prev };
      updated[field] = [...prev[field], ''];
      return updated;
    });
  };

  const removeArrayItem = (field: 'courses' | 'ingredients', index: number) => {
    setFormData(prev => {
      const updated = { ...prev };
      updated[field] = prev[field].filter((_, i) => i !== index);
      return updated;
    });
  };

  const toggleArrayItem = (field: 'dietaryOptions' | 'allergens', item: string) => {
    setFormData(prev => {
      const updated = { ...prev };
      const list = updated[field];
      updated[field] = list.includes(item)
        ? list.filter((entry) => entry !== item)
        : [...list, item];
      return updated;
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

  return (
    <div className="p-6">
        <div className="flex items-center mb-6">
            <button onClick={() => navigate('/chef-dashboard/menus')} className="p-2 rounded-full hover:bg-gray-100">
                <ArrowLeft className="h-6 w-6 text-gray-500" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900 ml-4">Créer une Nouvelle Offre</h1>
        </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Image Upload */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Image de l'offre</h3>
          <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="mx-auto h-48 w-auto rounded-md" />
              ) : (
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              <div className="flex text-sm text-gray-600">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
                  <span>Télécharger une image</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                </label>
                <p className="pl-1">ou glisser-déposer</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF jusqu'à 10MB</p>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'offre *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: Menu Gastronomique Français"
                className="w-full py-3 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
              <select
                value={formData.category || 'Gastronomique'}
                onChange={(e) => handleInputChange('category', e.target.value)}
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
              onChange={(e) => handleInputChange('description', e.target.value)}
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
                onChange={(e) => handleInputChange('type', e.target.value as 'forfait' | 'horaire')}
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
                onChange={(e) => handleInputChange('price', Number(e.target.value))}
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
                onChange={(e) => handleInputChange('duration', e.target.value)}
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
                  onChange={(e) => handleInputChange('minGuests', Number(e.target.value))}
                  min="1"
                  className="w-full py-3 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <input
                  type="number"
                  value={formData.maxGuests || 12}
                  onChange={(e) => handleInputChange('maxGuests', Number(e.target.value))}
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
                {formData.courses.map((course, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={course}
                      onChange={(e) => {
                        const newCourses = [...formData.courses];
                        newCourses[index] = e.target.value;
                        handleInputChange('courses', newCourses);
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
                  onClick={() => addArrayItem('courses')}
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
                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={ingredient}
                      onChange={(e) => {
                        const newIngredients = [...formData.ingredients];
                        newIngredients[index] = e.target.value;
                        handleInputChange('ingredients', newIngredients);
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
                  onClick={() => addArrayItem('ingredients')}
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
            onClick={() => navigate('/chef-dashboard/menus')}
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
  );
};

export default AddMenuPage;
