import React, { useState } from 'react';
import { Users, Search, Filter, Mail, Ban, Shield, Edit, Trash2, Download, Eye, MessageCircle, RefreshCw } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'client' | 'chef' | 'b2b';
  status: 'active' | 'suspended' | 'pending';
  joinDate: string;
  lastLogin: string;
  totalBookings?: number;
  totalSpent?: string;
  rating?: number;
  verificationStatus?: string;
  company?: string;
}

const AdminUsers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const [users] = useState<User[]>([
    {
      id: 1,
      name: "Sophie Martin",
      email: "sophie.martin@email.com",
      role: "client",
      status: "active",
      joinDate: "2023-12-15",
      lastLogin: "2024-01-13",
      totalBookings: 8,
      totalSpent: "1,240€"
    },
    {
      id: 2,
      name: "Marie Dubois",
      email: "marie.dubois@email.com",
      role: "chef",
      status: "active",
      joinDate: "2023-11-20",
      lastLogin: "2024-01-14",
      totalBookings: 45,
      rating: 4.9,
      verificationStatus: "verified"
    },
    {
      id: 3,
      name: "Restaurant Le Gourmet",
      email: "contact@legourmet.fr",
      role: "b2b",
      status: "active",
      joinDate: "2024-01-05",
      lastLogin: "2024-01-14",
      totalBookings: 12,
      totalSpent: "8,500€",
      company: "Le Gourmet SARL"
    },
    {
      id: 4,
      name: "Giuseppe Romano",
      email: "giuseppe.romano@email.com",
      role: "chef",
      status: "pending",
      joinDate: "2024-01-10",
      lastLogin: "2024-01-13",
      totalBookings: 0,
      verificationStatus: "pending"
    }
  ]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || user.role === filterRole;
    const matchesStatus = !filterStatus || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'client': return 'text-blue-600 bg-blue-100';
      case 'chef': return 'text-green-600 bg-green-100';
      case 'b2b': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleUserAction = (action: string, userId: number) => {
    console.log(`Action: ${action} for user ${userId}`);
    // Implement user actions
  };

  const exportUsers = () => {
    console.log('Exporting users data');
    // Implement export functionality
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
            <p className="text-gray-600 mt-1">Administrez tous les comptes de la plateforme</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={exportUsers}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Exporter</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-2xl font-bold text-blue-600 mb-1">{users.filter(u => u.role === 'client').length}</div>
            <div className="text-sm text-gray-600">Clients</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-2xl font-bold text-green-600 mb-1">{users.filter(u => u.role === 'chef').length}</div>
            <div className="text-sm text-gray-600">Chefs</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-2xl font-bold text-purple-600 mb-1">{users.filter(u => u.role === 'b2b').length}</div>
            <div className="text-sm text-gray-600">Comptes B2B</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-2xl font-bold text-yellow-600 mb-1">{users.filter(u => u.status === 'pending').length}</div>
            <div className="text-sm text-gray-600">En attente</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Tous les rôles</option>
              <option value="client">Clients</option>
              <option value="chef">Chefs</option>
              <option value="b2b">B2B</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="suspended">Suspendu</option>
              <option value="pending">En attente</option>
            </select>
            <button className="bg-red-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors">
              Appliquer les filtres
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dernière connexion
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.company && (
                          <div className="text-xs text-purple-600">{user.company}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                      {user.verificationStatus && (
                        <div className="text-xs text-gray-500 mt-1">
                          {user.verificationStatus === 'verified' ? '✓ Vérifié' : '⏳ En attente'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.role === 'client' && (
                        <div>
                          <div>{user.totalBookings} réservations</div>
                          <div className="text-xs text-green-600">{user.totalSpent}</div>
                        </div>
                      )}
                      {user.role === 'chef' && (
                        <div>
                          <div>{user.totalBookings} prestations</div>
                          {user.rating && (
                            <div className="text-xs text-yellow-600">★ {user.rating}/5</div>
                          )}
                        </div>
                      )}
                      {user.role === 'b2b' && (
                        <div>
                          <div>{user.totalBookings} missions</div>
                          <div className="text-xs text-purple-600">{user.totalSpent}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.lastLogin).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Voir détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUserAction('message', user.id)}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title="Envoyer message"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUserAction('edit', user.id)}
                          className="text-yellow-600 hover:text-yellow-900 p-1 rounded"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUserAction('suspend', user.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Suspendre"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Detail Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">Détails de l'utilisateur</h2>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Nom</label>
                          <p className="text-gray-900 font-medium">{selectedUser.name}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email</label>
                          <p className="text-gray-900">{selectedUser.email}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Rôle</label>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(selectedUser.role)}`}>
                            {selectedUser.role.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Statut</label>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedUser.status)}`}>
                            {selectedUser.status}
                          </span>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Inscription</label>
                          <p className="text-gray-900">{new Date(selectedUser.joinDate).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Dernière connexion</label>
                          <p className="text-gray-900">{new Date(selectedUser.lastLogin).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                    </div>

                    {/* Activity Stats */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques d'activité</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {selectedUser.role === 'client' && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Réservations totales</label>
                              <p className="text-2xl font-bold text-blue-600">{selectedUser.totalBookings}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Montant dépensé</label>
                              <p className="text-2xl font-bold text-green-600">{selectedUser.totalSpent}</p>
                            </div>
                          </>
                        )}
                        {selectedUser.role === 'chef' && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Prestations réalisées</label>
                              <p className="text-2xl font-bold text-green-600">{selectedUser.totalBookings}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Note moyenne</label>
                              <p className="text-2xl font-bold text-yellow-600">{selectedUser.rating}/5</p>
                            </div>
                          </>
                        )}
                        {selectedUser.role === 'b2b' && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Missions publiées</label>
                              <p className="text-2xl font-bold text-purple-600">{selectedUser.totalBookings}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Budget total</label>
                              <p className="text-2xl font-bold text-green-600">{selectedUser.totalSpent}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Sidebar */}
                  <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
                      <div className="space-y-3">
                        <button
                          onClick={() => handleUserAction('message', selectedUser.id)}
                          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center space-x-2"
                        >
                          <Mail className="h-4 w-4" />
                          <span>Envoyer un message</span>
                        </button>
                        <button
                          onClick={() => handleUserAction('resetPassword', selectedUser.id)}
                          className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-yellow-600 transition-colors flex items-center space-x-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                          <span>Réinitialiser MDP</span>
                        </button>
                        <button
                          onClick={() => handleUserAction('suspend', selectedUser.id)}
                          className="w-full bg-red-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center space-x-2"
                        >
                          <Ban className="h-4 w-4" />
                          <span>Suspendre compte</span>
                        </button>
                      </div>
                    </div>

                    {selectedUser.role === 'chef' && (
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Chef</h3>
                        <div className="space-y-3">
                          <button className="w-full bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center space-x-2">
                            <Shield className="h-4 w-4" />
                            <span>Vérifier profil</span>
                          </button>
                          <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                            Voir documents
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;