import React, { useState, useEffect } from 'react';
import { b2bService, B2BProfileData } from '../../services/b2bService';

const B2BProfile: React.FC = () => {
  const [profile, setProfile] = useState<B2BProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const fetchedProfile = await b2bService.getProfile();
        setProfile(fetchedProfile);
      } catch (error) {
        console.error("Failed to fetch B2B profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("company.")) {
      const companyField = name.split(".")[1];
      setProfile(prev => ({
        ...prev,
        company: { ...prev?.company, [companyField]: value } as B2BProfileData['company'],
      }));
    } else {
      setProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    try {
      await b2bService.updateProfile(profile);
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
    return <div className="p-6 text-center">Impossible de charger le profil B2B.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Mon Profil Entreprise</h1>
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="company.name" className="block text-sm font-medium text-gray-700">Nom de l'entreprise</label>
              <input type="text" id="company.name" name="company.name" value={profile.company.name || ''} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="company.siret" className="block text-sm font-medium text-gray-700">Numéro SIRET</label>
              <input type="text" id="company.siret" name="company.siret" value={profile.company.siret || ''} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="company.address" className="block text-sm font-medium text-gray-700">Adresse de l'entreprise</label>
              <input type="text" id="company.address" name="company.address" value={profile.company.address || ''} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="company.contactPerson" className="block text-sm font-medium text-gray-700">Personne de contact</label>
              <input type="text" id="company.contactPerson" name="company.contactPerson" value={profile.company.contactPerson || ''} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email de contact</label>
              <input type="email" id="email" name="email" value={profile.email || ''} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom du compte</label>
              <input type="text" id="name" name="name" value={profile.name || ''} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
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

export default B2BProfile;
