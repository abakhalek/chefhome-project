
import React, { useState, useEffect } from 'react';
import { b2bService, B2BProfileData, B2BMission } from '../../services/b2bService';
import { Link } from 'react-router-dom';
import { Briefcase, Target, Euro, CheckCircle, User } from 'lucide-react';

const B2BDashboard: React.FC = () => {
  const [profile, setProfile] = useState<B2BProfileData | null>(null);
  const [recentMissions, setRecentMissions] = useState<B2BMission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profileData, missionsData] = await Promise.all([
          b2bService.getProfile(),
          b2bService.getMissions({ limit: 3 }),
        ]);
        setProfile(profileData);
        setRecentMissions(missionsData.missions || []);
      } catch (error) {
        console.error("Failed to fetch B2B dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (!profile) {
    return <div className="p-6 text-center">Impossible de charger le profil B2B.</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Tableau de Bord B2B</h1>

      {/* Company Overview and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Bienvenue, {profile.company.name} !</h2>
          <p className="text-gray-600 mb-4">Gérez votre espace professionnel dédié, publiez des missions et suivez vos activités.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/b2b-dashboard/post-mission" className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2">
              <Target size={20} />
              <span>Publier une Mission</span>
            </Link>
            <Link to="/b2b-dashboard/find-chefs" className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
              <Briefcase size={20} />
              <span>Trouver un Chef</span>
            </Link>
            <Link to="/b2b-dashboard/profile" className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
              <User size={20} />
              <span>Mon Profil</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Statistiques Rapides</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Missions totales</span>
              <span className="font-bold text-blue-600">{recentMissions.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Missions en cours</span>
              <span className="font-bold text-blue-600">{recentMissions.filter(m => m.status === 'pending' || m.status === 'accepted').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Missions terminées</span>
              <span className="font-bold text-green-600">{recentMissions.filter(m => m.status === 'completed').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Budget total dépensé</span>
              <span className="font-bold text-purple-600">{recentMissions.reduce((sum, mission) => sum + mission.budget, 0).toFixed(2)}€</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Missions */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Mes Missions Récentes</h2>
        {recentMissions.length === 0 ? (
          <p className="text-gray-500">Vous n'avez pas de missions récentes.</p>
        ) : (
          <div className="space-y-4">
            {recentMissions.map(mission => (
              <div key={mission.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-900">{mission.title}</p>
                  <p className="text-sm text-gray-600">Chef: {mission.chef?.name || 'Non attribué'}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-blue-600">{mission.budget.toFixed(2)}€</span>
                  <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-600">{mission.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default B2BDashboard;
