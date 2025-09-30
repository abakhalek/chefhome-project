
import React, { useState, useEffect } from 'react';
import { chefService, ChefProfile } from '../../services/chefService';
import { Upload, FileText, CheckCircle, XCircle, Plus, Edit, Trash2, MapPin, Download } from 'lucide-react';

const PersonalInfoPage: React.FC = () => {
  const [profile, setProfile] = useState<Partial<ChefProfile> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [newCertification, setNewCertification] = useState({ name: '', issuer: '', dateObtained: '', expiryDate: '' });
  const [newServiceArea, setNewServiceArea] = useState({ city: '', zipCodes: '', maxDistance: 0 });

  const cuisineOptions = [
    'Française', 'Italienne', 'Japonaise', 'Chinoise', 'Indienne', 'Mexicaine',
    'Méditerranéenne', 'Fusion', 'Végétarienne', 'Vegan', 'Sans gluten'
  ];

  const serviceTypeOptions = [
    { value: 'home-dining', label: 'Repas à domicile' },
    { value: 'private-events', label: 'Événements privés' },
    { value: 'cooking-classes', label: 'Cours de cuisine' },
    { value: 'catering', label: 'Traiteur' }
  ];

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
    if (!profile) return;

    const numericFields = ['hourlyRate', 'experience'];
    const nextValue = numericFields.includes(name)
      ? Number(value)
      : value;

    setProfile(prev => ({ ...prev, [name]: nextValue as never }));
  };

  const handleFileChange = (documentType: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFiles(prev => ({ ...prev, [documentType]: file }));
    }
  };

  const handleUpload = async (documentType: string) => {
    const file = selectedFiles[documentType];
    if (!file) {
      alert("Veuillez sélectionner un fichier à télécharger.");
      return;
    }
    setUploadingType(documentType);
    try {
      await chefService.uploadDocument(documentType, file);
      const fetchedProfile = await chefService.getProfile();
      setProfile(fetchedProfile);
      setSelectedFiles(prev => ({ ...prev, [documentType]: null }));
      alert("Document téléchargé avec succès !");
    } catch (error) {
      console.error(`Failed to upload document ${documentType}:`, error);
      alert("Erreur lors du téléchargement du document.");
    } finally {
      setUploadingType(null);
    }
  };

 const toggleArrayValue = (field: 'cuisineTypes' | 'serviceTypes', value: string) => {
    setProfile(prev => {
      if (!prev) return prev;
      const currentValues = new Set(prev[field] || []);
      if (currentValues.has(value)) {
        currentValues.delete(value);
      } else {
        currentValues.add(value);
      }
      return { ...prev, [field]: Array.from(currentValues) };
    });
  };
  const handleAddCertification = () => {
    if (newCertification.name && newCertification.issuer && newCertification.dateObtained) {
      setProfile(prev => ({
        ...prev,
        certifications: [...(prev?.certifications || []), {
          ...newCertification,
          dateObtained: new Date(newCertification.dateObtained).toISOString(),
          expiryDate: newCertification.expiryDate ? new Date(newCertification.expiryDate).toISOString() : ''
        }]
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

  const handleAddServiceArea = () => {
    if (newServiceArea.city && newServiceArea.zipCodes && newServiceArea.maxDistance > 0) {
      const zipCodesArray = newServiceArea.zipCodes.split(',').map(zc => zc.trim());
      setProfile(prev => ({
        ...prev,
        serviceAreas: [...(prev?.serviceAreas || []), {
          city: newServiceArea.city,
          zipCodes: zipCodesArray,
          maxDistance: Number(newServiceArea.maxDistance)
        }]
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
      const updatedProfile = await chefService.updateProfile(profile);
      setProfile(updatedProfile);
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
              <input type="number" id="hourlyRate" name="hourlyRate" value={profile.hourlyRate ?? 0} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700">Expérience (années)</label>
              <input type="number" id="experience" name="experience" value={profile.experience ?? 0} onChange={handleChange} disabled={!isEditing} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea id="description" name="description" value={profile.description || ''} onChange={handleChange} disabled={!isEditing} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
          </div>

          {/* Cuisine & Services */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Styles culinaires proposés</h2>
              <div className="flex flex-wrap gap-2">
                {cuisineOptions.map(option => {
                  const isSelected = profile?.cuisineTypes?.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleArrayValue('cuisineTypes', option)}
                      disabled={!isEditing}
                      className={`px-3 py-2 rounded-full text-sm border transition-colors ${
                        isSelected
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-200 text-gray-700 hover:border-green-400 hover:text-green-600'
                      } ${!isEditing ? 'cursor-not-allowed opacity-60' : ''}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Types de services</h2>
              <div className="space-y-3">
                {serviceTypeOptions.map(option => {
                  const isChecked = profile?.serviceTypes?.includes(option.value);
                  return (
                    <label key={option.value} className={`flex items-center space-x-3 p-3 border rounded-lg ${isChecked ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleArrayValue('serviceTypes', option.value)}
                        disabled={!isEditing}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>


          {/* Documents Section */}
          <div className="mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Mes Documents</h2>
            <div className="space-y-6">
              {[
                { key: 'cv', label: 'CV / Curriculum Vitae' },
                { key: 'insurance', label: 'Assurance Responsabilité Civile' },
                { key: 'healthCertificate', label: 'Certificat de Santé' },
                { key: 'businessLicense', label: 'Licence Professionnelle' },
              ].map((docType) => (
                <div key={docType.key} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{docType.label}</h3>
                    {profile.documents?.[docType.key]?.uploaded ? (
                      <div className="flex items-center">
                        <p className="text-sm text-green-600 flex items-center"><CheckCircle size={16} className="mr-1" /> Téléchargé</p>
                        <a href={profile.documents?.[docType.key]?.url} target="_blank" rel="noopener noreferrer" className="ml-4 text-blue-600 hover:text-blue-800">
                          <Download size={16} />
                        </a>
                      </div>
                    ) : (
                      <p className="text-sm text-red-600 flex items-center"><XCircle size={16} className="mr-1" /> Non téléchargé</p>
                    )}
                  </div>
                  {isEditing && (
                    <div className="flex items-center space-x-3">
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(docType.key, e)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {selectedFiles[docType.key] && (
                        <span className="text-xs text-gray-500 truncate max-w-[160px]">
                          {selectedFiles[docType.key]?.name}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleUpload(docType.key)}
                        disabled={!selectedFiles[docType.key] || uploadingType === docType.key}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
                      >
                        {uploadingType === docType.key ? 'Envoi...' : (profile.documents?.[docType.key]?.uploaded ? 'Changer' : 'Envoyer')}
                        <Upload size={18} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Certifications Section */}
          <div className="mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Mes Certifications</h2>
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
                <h3 className="text-lg font-bold text-gray-900">Ajouter une nouvelle certification</h3>
                <input type="text" placeholder="Nom de la certification" value={newCertification.name} onChange={(e) => setNewCertification({...newCertification, name: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                <input type="text" placeholder="Organisme émetteur" value={newCertification.issuer} onChange={(e) => setNewCertification({...newCertification, issuer: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                <input type="date" placeholder="Date d'obtention" value={newCertification.dateObtained} onChange={(e) => setNewCertification({...newCertification, dateObtained: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                <input type="date" placeholder="Date d'expiration (optionnel)" value={newCertification.expiryDate} onChange={(e) => setNewCertification({...newCertification, expiryDate: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                <button type="button" onClick={handleAddCertification} className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center space-x-2">
                  <Plus size={18} /><span>Ajouter</span>
                </button>
              </div>
            )}
          </div>

          {/* Service Areas Section */}
          <div className="mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Mes Zones de Service</h2>
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
                <h3 className="text-lg font-bold text-gray-900">Ajouter une nouvelle zone</h3>
                <input type="text" placeholder="Ville" value={newServiceArea.city} onChange={(e) => setNewServiceArea({...newServiceArea, city: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                <input type="text" placeholder="Codes Postaux (séparés par des virgules)" value={newServiceArea.zipCodes} onChange={(e) => setNewServiceArea({...newServiceArea, zipCodes: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                <input type="number" placeholder="Distance Max (km)" value={newServiceArea.maxDistance} onChange={(e) => setNewServiceArea({...newServiceArea, maxDistance: Number(e.target.value)})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                <button type="button" onClick={handleAddServiceArea} className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center space-x-2">
                  <Plus size={18} /><span>Ajouter</span>
                </button>
              </div>
            )}
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
