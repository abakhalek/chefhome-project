import React, { useState } from 'react';
import { chefService, ChefDocumentStatus, UploadedChefDocument } from '../../services/chefService';

interface DocumentUploadProps {
  documentType: string;
  documentStatus: ChefDocumentStatus;
  onUpload: (documentType: string, document: UploadedChefDocument) => void;
  onDelete: (documentType: string) => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ documentType, documentStatus, onUpload, onDelete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fullDocumentUrl = documentStatus.url ?? '';
  const formattedUploadedAt = documentStatus.uploadedAt
    ? new Date(documentStatus.uploadedAt).toLocaleString()
    : null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const document = await chefService.uploadDocument(documentType, file);
      onUpload(documentType, document);
      setFile(null);
    } catch (error) {
      setError('Upload failed. Please try again.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };
  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      await chefService.deleteDocument(documentType);
      onDelete(documentType);
      setFile(null);
    } catch (error) {
      setError('Failed to delete document. Please try again.');
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  const uploadButtonLabel = uploading
    ? 'Uploading...'
    : documentStatus.uploaded
      ? 'Replace document'
      : 'Upload document';


  return (
     <div className="border p-4 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{documentType.toUpperCase()}</h3>
        {documentStatus.uploaded && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting || uploading}
            className="text-sm text-red-600 hover:text-red-700 disabled:text-red-300"
          >
            {deleting ? 'Deleting…' : 'Delete document'}
          </button>
        )}
      </div>
      {documentStatus.url ? (
        <div className="space-y-2">
          <p className="text-sm text-gray-700">
            Document uploaded.{' '}
            <a
              href={fullDocumentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              View document
            </a>
          </p>
          {formattedUploadedAt && (
            <p className="text-sm text-gray-500">Uploaded at: {formattedUploadedAt}</p>
          )}
        </div>
      ) : (
       <p className="text-sm text-gray-500">No document uploaded yet.</p>
      )}
      
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="file"
          accept=".pdf,image/*"
          onChange={handleFileChange}
          disabled={uploading || deleting}
          className="text-sm"
        />
        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || uploading || deleting}
          className="px-4 py-2 rounded bg-blue-500 text-white disabled:bg-gray-400"
        >
          {uploadButtonLabel}
        </button>
      </div>
      
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default DocumentUpload;
