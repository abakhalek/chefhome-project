
import React, { useState, useEffect } from 'react';
import { chefService, Mission } from '../../services/chefService';
import { Calendar, Clock, Users, MapPin, CheckCircle, XCircle, MessageCircle, AlertCircle, Search } from 'lucide-react';

const ChefPlanning: React.FC = () => {
  const [currentView, setCurrentView] = useState('missions');
  const [missions, setMissions] = useState<Mission[]>([]);
  const [availability, setAvailability] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchMissions = async () => {
    setLoading(true);
    try {
      const { missions } = await chefService.getMissions({ status: filterStatus || undefined });
      setMissions(missions || []);
    } catch (error) {
      console.error("Failed to fetch missions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    try {
      const availabilityData = await chefService.getAvailability();
      setAvailability(availabilityData);
    } catch (error) {
      console.error("Failed to fetch availability:", error);
    }
  };

  useEffect(() => {
    if (currentView === 'missions') {
      fetchMissions();
    } else {
      fetchAvailability();
    }
  }, [currentView, filterStatus]);

  const handleMissionAction = async (missionId: string, status: 'confirmed' | 'cancelled') => {
    try {
      await chefService.updateMissionStatus(missionId, status);
      fetchMissions();
    } catch (error) {
      console.error(`Failed to update mission ${missionId} status:`, error);
    }
  };

  const handleSaveAvailability = async () => {
    try {
      await chefService.updateAvailability(availability);
      alert('Disponibilités mises à jour avec succès !');
    } catch (error) {
      console.error("Failed to save availability:", error);
    }
  };

  const getStatusColor = (status: string) => {
    // ... (same as before)
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Planning & Missions</h1>
          <p className="text-gray-600 mt-1">Gérez votre agenda et vos demandes de mission</p>
        </div>
        <div className="flex space-x-3">
            <button onClick={() => setCurrentView('missions')} className={`px-4 py-2 rounded-lg font-medium ${currentView === 'missions' ? 'bg-green-500 text-white' : 'bg-white'}`}>Missions</button>
            <button onClick={() => setCurrentView('availability')} className={`px-4 py-2 rounded-lg font-medium ${currentView === 'availability' ? 'bg-green-500 text-white' : 'bg-white'}`}>Disponibilités</button>
        </div>
      </div>

      {currentView === 'missions' && (
          <div>
            {/* Filters and mission list */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-3 border rounded-lg">
                    <option value="">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmé</option>
                    <option value="completed">Terminé</option>
                </select>
            </div>
            <div className="space-y-6">
                {missions.map((mission) => (
                    <div key={mission.id} className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-xl font-bold">{mission.client.name}</h3>
                        <p>{mission.type} - {new Date(mission.date).toLocaleDateString('fr-FR')}</p>
                        <p>Statut: {mission.status}</p>
                        {mission.status === 'pending' && (
                            <div className="flex space-x-2 mt-4">
                                <button onClick={() => handleMissionAction(mission.id, 'confirmed')} className="bg-green-500 text-white px-4 py-2 rounded-lg">Accepter</button>
                                <button onClick={() => handleMissionAction(mission.id, 'cancelled')} className="bg-red-500 text-white px-4 py-2 rounded-lg">Refuser</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
          </div>
      )}

      {currentView === 'availability' && availability && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Gestion des Disponibilités</h2>
              {/* Availability form will go here, using the `availability` state */}
              <button onClick={handleSaveAvailability} className="bg-green-500 text-white px-8 py-3 rounded-lg mt-8">Enregistrer</button>
          </div>
      )}
    </div>
  );
};

export default ChefPlanning;
