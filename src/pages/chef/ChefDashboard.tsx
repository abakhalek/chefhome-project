
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { chefService, Mission } from '../../services/chefService';
import { Calendar, Euro, Star, TrendingUp, Plus, User, FileText } from 'lucide-react';

const ChefDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsData, missionsData] = await Promise.all([
          chefService.getStatistics(),
          chefService.getMissions({ limit: 3, status: 'confirmed' })
        ]);
        setStats(statsData);
        setMissions(missionsData.missions || []);
      } catch (error) {
        console.error("Failed to fetch chef dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  const statCards = [
    { label: 'Missions ce mois', value: stats?.chefStats?.monthlyBookings || 0, icon: Calendar, color: 'text-blue-600' },
    { label: 'Revenus mensuels', value: `${stats?.chefStats?.monthlyRevenue || 0}€`, icon: Euro, color: 'text-green-600' },
    { label: 'Note moyenne', value: stats?.chefStats?.averageRating?.toFixed(1) || 'N/A', icon: Star, color: 'text-yellow-600' },
    { 
      label: 'Taux d\'acceptation', 
      value: `${stats?.performanceMetrics?.totalRequests > 0 ? 
        ((stats.performanceMetrics.acceptedRequests / stats.performanceMetrics.totalRequests) * 100).toFixed(0) : 100}%`, 
      icon: TrendingUp, 
      color: 'text-purple-600' 
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Vue d\'ensemble</h1>
        <Link
          to="/chef-dashboard/menus"
          className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Nouvelle Offre</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className={`w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center ${stat.color} mb-4`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Upcoming Missions */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Prochaines missions confirmées</h3>
          <div className="space-y-4">
            {missions.length > 0 ? missions.map((mission) => (
              <div key={mission.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-semibold text-gray-900 text-sm">{mission.client?.name}</h4>
                  <span className="font-bold text-green-600">{mission.price}</span>
                </div>
                <p className="text-xs text-gray-600 mb-2">{mission.type}</p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{mission.date ? new Date(mission.date).toLocaleDateString('fr-FR') : ''}</span>
                  <Link to={`/chef-dashboard/planning`} className="text-blue-600 hover:underline">Voir détails</Link>
                </div>
              </div>
            )) : (
              <p className="text-gray-500 text-center py-8">Aucune mission à venir.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Actions rapides</h3>
          <div className="space-y-3">
            <Link to="/chef-dashboard/profile" className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Compléter mon profil</span>
            </Link>
            <Link to="/chef-dashboard/menus" className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Gérer mes offres</span>
            </Link>
            <Link to="/chef-dashboard/planning" className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Gérer mes disponibilités</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChefDashboard;
