import React, { useEffect, useState } from 'react';
import { chefService, ChefProfile } from '../../../../services/chefService';
import DocumentUpload from '../../../../components/common/DocumentUpload';

const DocumentsPage: React.FC = () => {
  const [profile, setProfile] = useState<ChefProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await chefService.getProfile();
        setProfile(profileData);
      } catch (err) {
        setError('Failed to fetch profile.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpload = (documentType: string, url: string) => {
    if (profile) {
      setProfile({
        ...profile,
        documents: {
          ...profile.documents,
          [documentType]: {
            uploaded: true,
            url,
            uploadedAt: new Date().toISOString(),
          },
        },
      });
    }
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
        <DocumentUpload documentType="cv" documentStatus={profile.documents.cv} onUpload={handleUpload} />
        <DocumentUpload documentType="insurance" documentStatus={profile.documents.insurance} onUpload={handleUpload} />
        <DocumentUpload documentType="healthCertificate" documentStatus={profile.documents.healthCertificate} onUpload={handleUpload} />
        <DocumentUpload documentType="businessLicense" documentStatus={profile.documents.businessLicense} onUpload={handleUpload} />
      </div>
    </div>
  );
};

export default DocumentsPage;
