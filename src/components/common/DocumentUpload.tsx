import React, { useState } from 'react';
import { chefService, ChefDocumentStatus } from '../../services/chefService';
import { API_CONFIG } from '../../utils/constants';

interface DocumentUploadProps {
  documentType: string;
  documentStatus: ChefDocumentStatus;
  onUpload: (documentType: string, url: string) => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ documentType, documentStatus, onUpload }) => {
  console.log(`[DocumentUpload] Rendering for ${documentType}. documentStatus:`, documentStatus);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const serverBaseUrl = API_CONFIG.BASE_URL.replace('/api', '');
  const fullDocumentUrl = documentStatus.url ? `${serverBaseUrl}${documentStatus.url}` : '';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    console.log(`[DocumentUpload] handleUpload triggered for ${documentType}. File:`, file);
    if (!file) {
      console.log(`[DocumentUpload] No file selected for ${documentType}.`);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const { url } = await chefService.uploadDocument(documentType, file);
      console.log(`[DocumentUpload] chefService.uploadDocument success for ${documentType}. URL:`, url);
      onUpload(documentType, url);
      console.log(`[DocumentUpload] onUpload prop called for ${documentType}.`);
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error(`[DocumentUpload] Upload failed for ${documentType}:`, err);
    } finally {
      setUploading(false);
      console.log(`[DocumentUpload] Upload process finished for ${documentType}.`);
    }
  };

  return (
    <div className="border p-4 rounded-lg">
      <h3 className="text-lg font-semibold">{documentType.toUpperCase()}</h3>
      {documentStatus.url ? (
        <div>
          <p>
            Document uploaded. You can view it{' '}
            <a href={fullDocumentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500">
              here
            </a>.
          </p>
          <p className="text-sm text-gray-500">Uploaded at: {documentStatus.uploadedAt}</p>
        </div>
      ) : (
        <p>No document uploaded yet.</p>
      )}
      <div className="mt-4">
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={!file || uploading} className="ml-4 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400">
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default DocumentUpload;