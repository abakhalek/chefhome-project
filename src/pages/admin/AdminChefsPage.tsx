import React, { useState, useEffect } from 'react';
import { adminService, PendingChef } from '../../services/adminService';
import { CheckCircle, XCircle, Mail, FileText } from 'lucide-react';

const AdminChefsPage: React.FC = () => {
  const [pendingChefs, setPendingChefs] = useState<PendingChef[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingChefs = async () => {
    setLoading(true);
    try {
      const chefs = await adminService.getPendingChefs();
      setPendingChefs(chefs);
    } catch (error) {
      console.error("Failed to fetch pending chefs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingChefs();
  }, []);

  const handleVerifyChef = async (chefId: string, status: 'approved' | 'rejected') => {
    const reason = status === 'rejected' ? prompt('Raison du rejet :') : '';
    if (status === 'rejected' && !reason) return;

    try {
      await adminService.verifyChef(chefId, status, reason || undefined);
      fetchPendingChefs();
    } catch (error) {
      console.error("Failed to verify chef:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Vérification des Chefs</h1>
      {loading ? (
        <p>Loading...</p>
      ) : pendingChefs.length === 0 ? (
        <p>Aucune candidature de chef en attente.</p>
      ) : (
        <div className="space-y-6">
          {pendingChefs.map((chef) => (
            <div key={chef.id} className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{chef.name}</h3>
              <p className="text-amber-600 font-medium mb-1">{chef.specialty}</p>
              <p className="text-gray-600 mb-2">{chef.experience} d'expérience - {chef.location}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                <span>{chef.email}</span>
                <span>{chef.phone}</span>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => handleVerifyChef(chef.id, 'approved')} className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                  <CheckCircle size={18} />
                  <span>Approuver</span>
                </button>
                <button onClick={() => handleVerifyChef(chef.id, 'rejected')} className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                  <XCircle size={18} />
                  <span>Rejeter</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminChefsPage;