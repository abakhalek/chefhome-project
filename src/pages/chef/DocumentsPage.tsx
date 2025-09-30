
import React, { useState, useEffect } from 'react';
import { chefService, ChefProfile, UploadedChefDocument } from '../../services/chefService';
import { Upload, FileText, CheckCircle, XCircle } from 'lucide-react';
import DocumentUpload from '../../components/common/DocumentUpload';

type ChefDocumentKey = keyof ChefProfile['documents'];

const DocumentsPage: React.FC = () => {
  const [profile, setProfile] = useState<ChefProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await chefService.getProfile();
        setProfile(profileData);
        console.log('Frontend Profile Data:', profileData);
      } catch (err) {
        setError('Failed to fetch profile.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpload = (documentType: string, document: UploadedChefDocument) => {
    setProfile(prevProfile => {
      if (!prevProfile) {
        return prevProfile;
      }

      const documentKey = documentType as ChefDocumentKey;

      return {
        ...prevProfile,
        documents: {
          ...prevProfile.documents,
          [documentKey]: {
            uploaded: Boolean(document.url),
            url: document.url || undefined,
            uploadedAt: document.uploadedAt || new Date().toISOString(),
          },
        },
      };
    });
  };

  const handleDelete = (documentType: string) => {
    setProfile(prevProfile => {
      if (!prevProfile) {
        return prevProfile;
      }

      const documentKey = documentType as ChefDocumentKey;

      return {
        ...prevProfile,
        documents: {
          ...prevProfile.documents,
          [documentKey]: {
            uploaded: false,
            url: undefined,
            uploadedAt: null,
          },
        },
      };
    });
  };

  if (loading) {
    return <div>Loading documents...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!profile) {
    return <div>No profile found.</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Manage Documents</h1>
      <div className="space-y-4">
        <DocumentUpload
          documentType="cv"
          documentStatus={profile.documents.cv}
          onUpload={handleUpload}
          onDelete={handleDelete}
        />
        <DocumentUpload
          documentType="insurance"
          documentStatus={profile.documents.insurance}
          onUpload={handleUpload}
          onDelete={handleDelete}
        />
        <DocumentUpload
          documentType="healthCertificate"
          documentStatus={profile.documents.healthCertificate}
          onUpload={handleUpload}
          onDelete={handleDelete}
        />
        <DocumentUpload
          documentType="businessLicense"
          documentStatus={profile.documents.businessLicense}
          onUpload={handleUpload}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default DocumentsPage;