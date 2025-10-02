
import React, { useState, useEffect } from 'react';
import { chefService, ChefProfile } from '../../services/chefService';
import { Plus, Trash2 } from 'lucide-react';

const ServiceAreaPage: React.FC = () => {
  const [profile, setProfile] = useState<Partial<ChefProfile> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newServiceArea, setNewServiceArea] = useState({ city: '', zipCodes: '', maxDistance: 0 });

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

  const handleAddServiceArea = () => {
    if (newServiceArea.city && newServiceArea.zipCodes && newServiceArea.maxDistance > 0) {
      const zipCodesArray = newServiceArea.zipCodes.split(',').map(zc => zc.trim());
      setProfile(prev => ({
        ...prev,
        serviceAreas: [...(prev?.serviceAreas || []), { city: newServiceArea.city, zipCodes: zipCodesArray, maxDistance: newServiceArea.maxDistance }]
      }));
      setNewServiceArea({ city: '', zipCodes: '', maxDistance: 0 });
    }
  };

  const handleRemoveServiceArea = (index: number) => {
    setProfile(prev => ({
      ...prev,
      serviceAreas: prev?.serviceAreas?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    try {
      await chefService.updateProfile({ serviceAreas: profile.serviceAreas });
      setIsEditing(false);
      alert("Zones de service mises à jour avec succès !");
    } catch (error) {
      console.error("Failed to update service areas:", error);
      alert("Erreur lors de la mise à jour des zones de service.");
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

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Mes Zones de Service</h1>
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            {profile.serviceAreas?.map((area, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                <div>
                  <p className="font-semibold text-gray-900">{area.city} ({area.maxDistance} km)</p>
                  <p className="text-sm text-gray-600">Codes Postaux: {area.zipCodes.join(', ')}</p>
                </div>
                {isEditing && (
                  <button type="button" onClick={() => handleRemoveServiceArea(index)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {isEditing && (
            <div className="border-t pt-6 mt-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Ajouter une nouvelle zone</h2>
              <input type="text" placeholder="Ville" value={newServiceArea.city} onChange={(e) => setNewServiceArea({...newServiceArea, city: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
              <input type="text" placeholder="Codes Postaux (séparés par des virgules)" value={newServiceArea.zipCodes} onChange={(e) => setNewServiceArea({...newServiceArea, zipCodes: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
              <input type="number" placeholder="Distance Max (km)" value={newServiceArea.maxDistance} onChange={(e) => setNewServiceArea({...newServiceArea, maxDistance: Number(e.target.value)})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
              <button type="button" onClick={handleAddServiceArea} className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center space-x-2">
                <Plus size={18} /><span>Ajouter</span>
              </button>
            </div>
          )}

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

export default ServiceAreaPage;
