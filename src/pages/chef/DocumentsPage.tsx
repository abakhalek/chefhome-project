
import React, { useState, useEffect } from 'react';
import { chefService, ChefProfile } from '../../services/chefService';
import { Upload, FileText, CheckCircle, XCircle } from 'lucide-react';

const DocumentsPage: React.FC = () => {
  const [profile, setProfile] = useState<Partial<ChefProfile> | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (documentType: string) => {
    if (!selectedFile) {
      alert("Veuillez sélectionner un fichier à télécharger.");
      return;
    }
    setUploading(true);
    try {
      await chefService.uploadDocument(documentType, selectedFile);
      alert("Document téléchargé avec succès !");
      setSelectedFile(null);
      // Refresh profile to show updated document status
      const fetchedProfile = await chefService.getProfile();
      setProfile(fetchedProfile);
    } catch (error) {
      console.error("Failed to upload document:", error);
      alert("Erreur lors du téléchargement du document.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (!profile) {
    return <div className="p-6 text-center">Aucun profil trouvé.</div>;
  }

  const documentTypes = [
    { key: 'cv', label: 'CV / Curriculum Vitae' },
    { key: 'insurance', label: 'Assurance Responsabilité Civile' },
    { key: 'healthCertificate', label: 'Certificat de Santé' },
    { key: 'businessLicense', label: 'Licence Professionnelle' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Mes Documents</h1>
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="space-y-6">
          {documentTypes.map((docType) => (
            <div key={docType.key} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{docType.label}</h3>
                {profile.documents?.[docType.key]?.uploaded ? (
                  <p className="text-sm text-green-600 flex items-center"><CheckCircle size={16} className="mr-1" /> Téléchargé ({new Date(profile.documents[docType.key].uploadedAt).toLocaleDateString()})</p>
                ) : (
                  <p className="text-sm text-red-600 flex items-center"><XCircle size={16} className="mr-1" /> Non téléchargé</p>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <input type="file" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                <button onClick={() => handleUpload(docType.key)} disabled={!selectedFile || uploading} className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50">
                  {uploading ? 'Envoi...' : 'Envoyer'}
                  <Upload size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;
