
import React, { useState, useEffect } from 'react';
import { chefService, ChefProfile } from '../../services/chefService';
import { Plus, Trash2 } from 'lucide-react';

const CertificationsPage: React.FC = () => {
  const [profile, setProfile] = useState<Partial<ChefProfile> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newCertification, setNewCertification] = useState({ name: '', issuer: '', dateObtained: '', expiryDate: '' });

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

  const handleAddCertification = () => {
    if (newCertification.name && newCertification.issuer && newCertification.dateObtained) {
      setProfile(prev => ({
        ...prev,
        certifications: [...(prev?.certifications || []), { ...newCertification, dateObtained: new Date(newCertification.dateObtained).toISOString() }]
      }));
      setNewCertification({ name: '', issuer: '', dateObtained: '', expiryDate: '' });
    }
  };

  const handleRemoveCertification = (index: number) => {
    setProfile(prev => ({
      ...prev,
      certifications: prev?.certifications?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    try {
      await chefService.updateProfile({ certifications: profile.certifications });
      setIsEditing(false);
      alert("Certifications mises à jour avec succès !");
    } catch (error) {
      console.error("Failed to update certifications:", error);
      alert("Erreur lors de la mise à jour des certifications.");
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Mes Certifications</h1>
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            {profile.certifications?.map((cert, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                <div>
                  <p className="font-semibold text-gray-900">{cert.name}</p>
                  <p className="text-sm text-gray-600">{cert.issuer} - {new Date(cert.dateObtained).toLocaleDateString()}</p>
                </div>
                {isEditing && (
                  <button type="button" onClick={() => handleRemoveCertification(index)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {isEditing && (
            <div className="border-t pt-6 mt-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Ajouter une nouvelle certification</h2>
              <input type="text" placeholder="Nom de la certification" value={newCertification.name} onChange={(e) => setNewCertification({...newCertification, name: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
              <input type="text" placeholder="Organisme émetteur" value={newCertification.issuer} onChange={(e) => setNewCertification({...newCertification, issuer: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
              <input type="date" placeholder="Date d'obtention" value={newCertification.dateObtained} onChange={(e) => setNewCertification({...newCertification, dateObtained: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
              <input type="date" placeholder="Date d'expiration (optionnel)" value={newCertification.expiryDate} onChange={(e) => setNewCertification({...newCertification, expiryDate: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
              <button type="button" onClick={handleAddCertification} className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center space-x-2">
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

export default CertificationsPage;
