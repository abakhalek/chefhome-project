
import React, { useState, useEffect } from 'react';
import { chefService, ChefProfile } from '../../services/chefService';

const PersonalInfoPage: React.FC = () => {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    try {
      await chefService.updateProfile(profile);
      setIsEditing(false);
      alert("Profil mis à jour avec succès !");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Erreur lors de la mise à jour du profil.");
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Informations Personnelles</h1>
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom</label>
              <input type="text" id="name" name="name" value={profile.name || ''} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" id="email" name="email" value={profile.email || ''} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Téléphone</label>
              <input type="text" id="phone" name="phone" value={profile.phone || ''} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">Adresse</label>
              <input type="text" id="address" name="address" value={profile.address || ''} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">Ville</label>
              <input type="text" id="city" name="city" value={profile.city || ''} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">Code Postal</label>
              <input type="text" id="zipCode" name="zipCode" value={profile.zipCode || ''} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">Spécialité</label>
              <input type="text" id="specialty" name="specialty" value={profile.specialty || ''} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700">Tarif Horaire (€)</label>
              <input type="number" id="hourlyRate" name="hourlyRate" value={profile.hourlyRate || 0} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700">Expérience (années)</label>
              <input type="number" id="experience" name="experience" value={profile.experience || 0} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea id="description" name="description" value={profile.description || ''} onChange={handleChange} disabled={!isEditing} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
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

export default PersonalInfoPage;
