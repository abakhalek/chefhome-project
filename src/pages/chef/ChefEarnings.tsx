
import React, { useState, useEffect } from 'react';
import { chefService, Earnings } from '../../services/chefService';
import { TrendingUp, Euro, Calendar, Star, Download } from 'lucide-react';

const ChefEarnings: React.FC = () => {
  const [earnings, setEarnings] = useState<Earnings[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  const fetchEarnings = async () => {
    setLoading(true);
    try {
      const response = await chefService.getEarnings({ period });
      setEarnings(response.earnings?.daily || []);
      setSummary(response.earnings?.total);
    } catch (error) {
      console.error("Failed to fetch earnings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, [period]);

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Revenus & Factures</h1>
          <p className="text-gray-600 mt-1">Suivez vos revenus, paiements et évaluations.</p>
        </div>
        <select value={period} onChange={(e) => setPeriod(e.target.value)} className="px-4 py-2 border rounded-lg">
          <option value="7d">7 derniers jours</option>
          <option value="30d">30 derniers jours</option>
          <option value="90d">90 derniers jours</option>
          <option value="1y">1 an</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <Euro className="h-6 w-6 text-green-600 mb-4" />
          <p className="text-2xl font-bold text-gray-900 mb-1">{summary?.totalEarnings?.toFixed(2) || 0}€</p>
          <p className="text-sm text-gray-600">Revenus totaux</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <Calendar className="h-6 w-6 text-blue-600 mb-4" />
          <p className="text-2xl font-bold text-gray-900 mb-1">{summary?.totalBookings || 0}</p>
          <p className="text-sm text-gray-600">Missions réalisées</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <Star className="h-6 w-6 text-yellow-600 mb-4" />
          <p className="text-2xl font-bold text-gray-900 mb-1">{summary?.averageRating?.toFixed(1) || 'N/A'}</p>
          <p className="text-sm text-gray-600">Note moyenne</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <TrendingUp className="h-6 w-6 text-purple-600 mb-4" />
          <p className="text-2xl font-bold text-gray-900 mb-1">{summary?.averagePerMission?.toFixed(2) || 0}€</p>
          <p className="text-sm text-gray-600">Revenu moyen/mission</p>
        </div>
      </div>

      {/* Detailed Earnings Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Historique détaillé</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Net perçu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Statut</th>
              </tr>
            </thead>
            <tbody>
              {earnings.map((earning) => (
                <tr key={earning.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{new Date(earning.date).toLocaleDateString('fr-FR')}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{earning.client}</td>
                  <td className="px-6 py-4 text-sm font-bold text-green-600">{earning.netAmount.toFixed(2)}€</td>
                  <td className="px-6 py-4 text-sm"><span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">{earning.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ChefEarnings;
