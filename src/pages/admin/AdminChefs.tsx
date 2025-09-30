import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Check, X, Eye } from 'lucide-react';
import { LoadingSpinner } from '../../components/common';
import { ChefVerification } from '../../components/admin/ChefVerification';

interface PendingChef {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  experience: string;
  location: string;
  submittedAt: string;
  documents: string[];
  status: 'pending' | 'approved' | 'rejected';
  description?: string;
  hourlyRate?: string;
}

const AdminChefs: React.FC = () => {
  const [chefs, setChefs] = useState<PendingChef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChef, setSelectedChef] = useState<PendingChef | null>(null);
  const [filterStatus, setFilterStatus] = useState('pending');

  const fetchChefs = async () => {
    setLoading(true);
    try {
      const fetchedChefs = await adminService.getChefs(filterStatus === 'all' ? undefined : filterStatus);
      setChefs(fetchedChefs);
    } catch (err) {
      setError('Failed to fetch chefs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChefs();
  }, [filterStatus]);

  const handleVerification = async (chefId: number, status: 'approved' | 'rejected', reason?: string) => {
    try {
      await adminService.verifyChef(String(chefId), status, reason);
      fetchChefs();
      setSelectedChef(null);
    } catch (err) {
      console.error(`Failed to ${status} chef:`, err);
      alert(`Failed to ${status} chef.`);
    }
  };

  const handleContact = (chefId: number) => {
    const chef = chefs.find(c => c.id === String(chefId));
    if (chef) {
      window.location.href = `mailto:${chef.email}`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Gestion des Chefs</h1>
        
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex space-x-4">
              <button onClick={() => setFilterStatus('all')} className={`px-3 py-2 rounded-md text-sm font-medium ${filterStatus === 'all' ? 'bg-red-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Tous</button>
              <button onClick={() => setFilterStatus('pending')} className={`px-3 py-2 rounded-md text-sm font-medium ${filterStatus === 'pending' ? 'bg-red-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>En attente</button>
              <button onClick={() => setFilterStatus('approved')} className={`px-3 py-2 rounded-md text-sm font-medium ${filterStatus === 'approved' ? 'bg-red-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Approuvés</button>
              <button onClick={() => setFilterStatus('rejected')} className={`px-3 py-2 rounded-md text-sm font-medium ${filterStatus === 'rejected' ? 'bg-red-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Rejetés</button>
            </div>
          </div>
          
          {loading ? (
            <div className="p-6 text-center"><LoadingSpinner /></div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">{error}</div>
          ) : (
            <>
              {filterStatus === 'pending' ? (
                <div className="p-6">
                  <ChefVerification 
                    pendingChefs={chefs}
                    onVerifyChef={handleVerification}
                    onContactChef={handleContact}
                    loading={loading}
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chef</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spécialité</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date de soumission</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {chefs.map((chef) => (
                        <tr key={chef.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{chef.name}</div>
                            <div className="text-sm text-gray-500">{chef.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{chef.specialty}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(chef.status)}`}>
                              {chef.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(chef.submittedAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button onClick={() => setSelectedChef(chef)} className="text-blue-600 hover:text-blue-900 p-1 rounded" title="Voir détails">
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {selectedChef && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-2xl font-bold">Vérification du Chef</h2>
                <button onClick={() => setSelectedChef(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"><X size={20}/></button>
              </div>
              <div className="p-6">
                <p><strong>Nom:</strong> {selectedChef.name}</p>
                <p><strong>Email:</strong> {selectedChef.email}</p>
                <p><strong>Téléphone:</strong> {selectedChef.phone}</p>
                <p><strong>Spécialité:</strong> {selectedChef.specialty}</p>
                <p><strong>Expérience:</strong> {selectedChef.experience} ans</p>
                <p><strong>Documents:</strong></p>
                <ul className="list-disc list-inside pl-4">
                  {selectedChef.documents.map(doc => <li key={doc}>{doc} <a href={`http://localhost:5000/${doc}`} target="_blank" rel="noopener noreferrer" className="text-blue-500">(Télécharger)</a></li>)}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChefs;
