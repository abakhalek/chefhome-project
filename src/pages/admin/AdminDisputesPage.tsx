import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

const AdminDisputesPage: React.FC = () => {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const { disputes } = await adminService.getDisputes();
      setDisputes(disputes);
    } catch (error) {
      console.error("Failed to fetch disputes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolveDispute = async (bookingId: string) => {
    const resolution = prompt("Entrez la résolution (ex: resolved, cancelled):");
    const refundAmount = prompt("Entrez le montant du remboursement (0 si aucun):");

    if (resolution) {
        try {
            await adminService.resolveDispute(bookingId, resolution, Number(refundAmount));
            fetchDisputes();
        } catch (error) {
            console.error('Failed to resolve dispute', error);
        }
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestion des Litiges</h1>
      {loading ? (
        <p>Loading...</p>
      ) : disputes.length === 0 ? (
        <p>Aucun litige en cours.</p>
      ) : (
        <div className="space-y-6">
          {disputes.map((dispute) => (
            <div key={dispute._id} className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold">Litige sur la réservation #{dispute._id}</h3>
              <p>Client: {dispute.client?.name}</p>
              <p>Chef: {dispute.chef?.user?.name}</p>
              <p>Date: {new Date(dispute.createdAt).toLocaleDateString('fr-FR')}</p>
              <button onClick={() => handleResolveDispute(dispute._id)} className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg">
                Résoudre
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDisputesPage;