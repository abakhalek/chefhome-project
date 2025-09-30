
import React, { useState, useEffect } from 'react';
import { chefService, ChefProfile } from '../../services/chefService';

const SpecialtiesPage: React.FC = () => {
  const [profile, setProfile] = useState<Partial<ChefProfile> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const fetchedProfile = await chefService.getProfile();
        setProfile(fetchedProfile);
      } catch (error) {
        console.error("Failed to fetch chef profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleCuisineTypeChange = (type: string) => {
    setProfile(prev => {
      const currentTypes = prev?.cuisineTypes || [];
      if (currentTypes.includes(type)) {
        return { ...prev, cuisineTypes: currentTypes.filter(t => t !== type) };
      } else {
        return { ...prev, cuisineTypes: [...currentTypes, type] };
      }
    });
  };

  const handleServiceTypeChange = (type: string) => {
    setProfile(prev => {
      const currentTypes = prev?.serviceTypes || [];
      if (currentTypes.includes(type)) {
        return { ...prev, serviceTypes: currentTypes.filter(t => t !== type) };
      } else {
        return { ...prev, serviceTypes: [...currentTypes, type] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    try {
      await chefService.updateProfile({ cuisineTypes: profile.cuisineTypes, serviceTypes: profile.serviceTypes });
      setIsEditing(false);
      alert("Spécialités mises à jour avec succès !");
    } catch (error) {
      console.error("Failed to update specialties:", error);
      alert("Erreur lors de la mise à jour des spécialités.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (!profile) {
    return <div className="p-6 text-center">Aucun profil trouvé.</div>;
  }

  const allCuisineTypes = ["Française", "Italienne", "Asiatique", "Indienne", "Mexicaine", "Méditerranéenne", "Végétarienne", "Vegan"];
  const allServiceTypes = ["Repas à domicile", "Événements privés", "Cours de cuisine", "Traiteur"];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Spécialités Culinaires</h1>
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Types de Cuisine</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {allCuisineTypes.map(type => (
                <label key={type} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={profile.cuisineTypes?.includes(type) || false}
                    onChange={() => handleCuisineTypeChange(type)}
                    disabled={!isEditing}
                    className="rounded border-gray-300 text-green-600 shadow-sm"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Types de Prestations</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {allServiceTypes.map(type => (
                <label key={type} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={profile.serviceTypes?.includes(type) || false}
                    onChange={() => handleServiceTypeChange(type)}
                    disabled={!isEditing}
                    className="rounded border-gray-300 text-green-600 shadow-sm"
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            {!isEditing ? (
              <button type="button" onClick={() => setIsEditing(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md">Modifier</button>
            ) : (
              <>
                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 border border-gray-300 rounded-md">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md">Enregistrer</button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SpecialtiesPage;
