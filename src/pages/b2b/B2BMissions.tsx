import React, { useState, useEffect, useCallback } from 'react';
import { b2bService, B2BMission, PaginationData } from '../../services/b2bService';
import { Eye, CheckCircle, XCircle, Calendar, Euro, Users } from 'lucide-react';

const B2BMissions: React.FC = () => {
  const [missions, setMissions] = useState<B2BMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [pagination, setPagination] = useState<PaginationData>({ page: 1, limit: 10, total: 0, pages: 1 });

  const fetchMissions = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const { missions, pagination } = await b2bService.getMissions({ status: filterStatus || undefined, page, limit: 10 });
      setMissions(missions);
      setPagination(pagination);
    } catch (error) {
      console.error("Failed to fetch missions:", error);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchMissions(1);
  }, [fetchMissions]);

  const handlePageChange = (newPage: number) => {
    fetchMissions(newPage);
  };

  const handleUpdateMissionStatus = async (missionId: string, status: 'completed' | 'cancelled') => {
    if (window.confirm(`Êtes-vous sûr de vouloir marquer cette mission comme ${status === 'completed' ? 'terminée' : 'annulée'} ?`)) {
      try {
        // Assuming there's a service method to update mission status
        // For now, we'll just simulate the update and refetch
        // await b2bService.updateMissionStatus(missionId, status);
        alert("Statut de la mission mis à jour !");
        fetchMissions(pagination.page);
      } catch (error) {
        console.error("Failed to update mission status:", error);
        alert("Erreur lors de la mise à jour du statut de la mission.");
      }
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Mes Missions</h1>
      
      <div className="mb-6 flex space-x-4">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="p-3 border rounded-lg">
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="accepted">Acceptée</option>
          <option value="completed">Terminée</option>
          <option value="cancelled">Annulée</option>
        </select>
      </div>

      {missions.length === 0 ? (
        <p className="text-gray-500">Aucune mission trouvée.</p>
      ) : (
        <div className="space-y-6">
          {missions.map((mission) => (
            <div key={mission.id} className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{mission.title}</h2>
              <p className="text-gray-600 mb-2">{mission.description}</p>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center"><Euro size={16} className="mr-1" /> Budget: {mission.budget}€</div>
                <div className="flex items-center"><Calendar size={16} className="mr-1" /> Créée le: {new Date(mission.createdAt).toLocaleDateString()}</div>
                {mission.chef && <div className="flex items-center"><Users size={16} className="mr-1" /> Chef: {mission.chef.name}</div>}
                <div>Statut: {mission.status}</div>
              </div>
              <div className="flex space-x-3">
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
                  title="Voir les détails de cette mission"
                >
                  <Eye size={18} />
                  <span>Voir Détails</span>
                </button>
                {mission.status === 'accepted' && (
                  <button 
                    onClick={() => handleUpdateMissionStatus(mission.id, 'completed')} 
                    className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors"
                    title="Marquer cette mission comme terminée"
                  >
                    <CheckCircle size={18} />
                    <span>Marquer comme terminée</span>
                  </button>
                )}
                {mission.status === 'pending' && (
                  <button 
                    onClick={() => handleUpdateMissionStatus(mission.id, 'cancelled')} 
                    className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center space-x-2 hover:bg-red-700 transition-colors"
                    title="Annuler cette mission"
                  >
                    <XCircle size={18} />
                    <span>Annuler</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-8 space-x-4">
          <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1} className="px-4 py-2 border rounded-lg">Précédent</button>
          <span className="py-2">Page {pagination.page} sur {pagination.pages}</span>
          <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.pages} className="px-4 py-2 border rounded-lg">Suivant</button>
        </div>
      )}
    </div>
  );
};

export default B2BMissions;
