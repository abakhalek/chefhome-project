import React, { useState, useEffect } from 'react';
import { adminService, AdminUser } from '../../services/adminService';
import { Search, Mail, Ban, Edit, Eye } from 'lucide-react';

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const { users, pagination } = await adminService.getUsers({ page, limit: 10, search: searchTerm, role: roleFilter });
      setUsers(users);
      setPagination(pagination);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
        fetchUsers(1);
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchTerm, roleFilter]);

  const handlePageChange = (newPage: number) => {
    fetchUsers(newPage);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestion des Utilisateurs</h1>
      
      {/* Filters */}
      <div className="mb-6 flex space-x-4">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input 
                type="text" 
                placeholder="Rechercher par nom ou email..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="py-2 px-4 border rounded-lg">
            <option value="">Tous les rôles</option>
            <option value="client">Client</option>
            <option value="chef">Chef</option>
            <option value="b2b">B2B</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Utilisateur</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Rôle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Inscrit le</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8">Loading...</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4">{user.name}<br/><span className="text-sm text-gray-500">{user.email}</span></td>
                  <td className="px-6 py-4">{user.role}</td>
                  <td className="px-6 py-4">{user.status}</td>
                  <td className="px-6 py-4">{new Date(user.joinDate).toLocaleDateString('fr-FR')}</td>
                  <td className="px-6 py-4 flex space-x-2">
                    <button className="text-blue-600"><Eye size={18} /></button>
                    <button className="text-red-600"><Ban size={18} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination would go here */}
    </div>
  );
};

export default AdminUsersPage;