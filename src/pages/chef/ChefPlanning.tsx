
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
    setLoading(true);
    try {
      const availabilityData = await chefService.getAvailability();
      setAvailability(availabilityData);
    } catch (error) {
      console.error("Failed to fetch availability:", error);
       } finally {
      setLoading(false);
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

   const getStatusStyles = (status: Mission['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-600 border border-gray-200';
    }
  };

  const getStatusLabel = (status: Mission['status']) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'confirmed':
        return 'Confirmée';
      case 'in_progress':
        return 'En cours';
      case 'completed':
        return 'Terminée';
      case 'cancelled':
        return 'Annulée';
      case 'disputed':
        return 'Litige';
      default:
        return status;
    }
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
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <Search className="h-5 w-5 text-gray-400" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Filtrer les missions</h3>
                  <p className="text-sm text-gray-500">Affinez vos missions par statut</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                  <option value="">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmé</option>
                  <option value="in_progress">En cours</option>
                  <option value="completed">Terminé</option>
                  <option value="cancelled">Annulé</option>
                </select>
              </div>
            </div>
            
            {missions.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-inner border border-dashed border-gray-200 p-10 text-center">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune mission trouvée</h3>
                <p className="text-gray-600">Ajustez vos filtres ou revenez plus tard pour découvrir vos prochaines missions.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {missions.map((mission) => {
                  const missionDate = mission.date ? new Date(mission.date) : null;
                  return (
                    <div key={mission.id} className="bg-white rounded-2xl shadow-lg p-6 border border-transparent hover:border-green-200 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <div className="flex-1 space-y-4">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyles(mission.status)}`}>
                              {getStatusLabel(mission.status)}
                            </span>
                            <span className="text-sm text-gray-500 flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{missionDate ? missionDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Date à définir'}</span>
                            </span>
                            {mission.time && (
                              <span className="text-sm text-gray-500 flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{mission.time}</span>
                              </span>
                            )}
                          </div>

                          <div>
                            <h3 className="text-2xl font-semibold text-gray-900">{mission.client.name}</h3>
                            <p className="text-gray-600">{mission.type}</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-green-500" />
                              <span>{mission.guests} convives</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-green-500" />
                              <span>{mission.location || 'Adresse à confirmer'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <AlertCircle className="h-4 w-4 text-green-500" />
                              <span>Budget : {mission.price}</span>
                            </div>
                          </div>

                          {mission.specialRequests && (
                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-700">
                              <p className="font-medium text-gray-900 mb-1 flex items-center space-x-2">
                                <MessageCircle className="h-4 w-4 text-green-500" />
                                <span>Demande spéciale</span>
                              </p>
                              <p>{mission.specialRequests}</p>

                            </div>
                         )}
                        </div>

                        <div className="w-full lg:w-56 space-y-3">
                          {mission.status === 'pending' && (
                            <>
                              <button onClick={() => handleMissionAction(mission.id, 'confirmed')} className="w-full bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-2">
                                <CheckCircle className="h-4 w-4" />
                                <span>Accepter la mission</span>
                              </button>
                              <button onClick={() => handleMissionAction(mission.id, 'cancelled')} className="w-full bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-200 transition-colors flex items-center justify-center space-x-2">
                                <XCircle className="h-4 w-4" />
                                <span>Décliner</span>
                              </button>
                            </>
                          )}
                          {mission.status === 'confirmed' && (
                            <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-center">
                              <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                              <p className="text-sm text-green-700">Mission confirmée. Préparez votre menu et contactez le client si nécessaire.</p>
                            </div>
                          )}
                          {mission.status === 'completed' && (
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
                              <CheckCircle className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                              <p className="text-sm text-blue-700">Mission terminée. Pensez à demander un avis au client.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
              );
                })}
              </div>
            )}
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
