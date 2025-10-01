import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Mail,
  Ban,
  Shield,
  Edit,
  Trash2,
  Download,
  Eye,
  MessageCircle,
  RefreshCw,
  Plus,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { adminService, AdminUser } from '../../services/adminService';


interface FeedbackState {
  type: 'success' | 'error';
  message: string;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  role: 'client' | 'chef' | 'admin' | 'b2b';
  password: string;
  isActive: boolean;
  isVerified: boolean;
  companyName: string;
  companySiret: string;
  companyAddress: string;
  companyContact: string;
}

const initialFormState: FormState = {
  name: '',
  email: '',
  phone: '',
  role: 'client',
  password: '',
  isActive: true,
  isVerified: false,
  companyName: '',
  companySiret: '',
  companyAddress: '',
  companyContact: ''
};

const pageSize = 20;

const formatCurrency = (value?: number) => {
  if (!value && value !== 0) return '—';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(value);
};

const formatDate = (value?: string) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('fr-FR');
};

const statusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'text-green-600 bg-green-100';
    case 'pending':
      return 'text-yellow-600 bg-yellow-100';
    case 'suspended':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const roleColor = (role: string) => {
  switch (role) {
    case 'client':
      return 'text-blue-600 bg-blue-100';
    case 'chef':
      return 'text-green-600 bg-green-100';
    case 'b2b':
      return 'text-purple-600 bg-purple-100';
    case 'admin':
      return 'text-orange-600 bg-orange-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: pageSize });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadFlag, setReloadFlag] = useState(0);

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [showFormModal, setShowFormModal] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [formUserId, setFormUserId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageUser, setMessageUser] = useState<AdminUser | null>(null);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [messageSubmitting, setMessageSubmitting] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    type: 'status' | 'delete';
    user: AdminUser;
    nextStatus?: 'active' | 'suspended';
  } | null>(null);
  const [confirmSubmitting, setConfirmSubmitting] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    const timeout = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const { users, pagination } = await adminService.getUsers({
          page: currentPage,
          limit: pageSize,
          role: filterRole || undefined,
          status: filterStatus || undefined,
          search: searchTerm || undefined
        });

        if (!isCancelled) {
          setUsers(users);
          setPagination(pagination);
          if (pagination.pages > 0 && currentPage > pagination.pages) {
            setCurrentPage(pagination.pages);
          }
        }
      } catch (err) {
        if (!isCancelled) {
          const message = (err as any)?.response?.data?.message || 'Impossible de charger les utilisateurs.';
          setError(message);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }, 300);

  
    return () => {
      isCancelled = true;
      clearTimeout(timeout);
    };
  }, [currentPage, filterRole, filterStatus, searchTerm, reloadFlag]);

  useEffect(() => {
    if (feedback) {
      const timeout = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timeout);
    }
  }, [feedback]);

  const stats = useMemo(() => {
    const totals = {
      clients: 0,
      chefs: 0,
      b2b: 0,
      admins: 0,
      pending: 0
    };

    users.forEach((user) => {
      switch (user.role) {
        case 'client':
          totals.clients += 1;
          break;
        case 'chef':
          totals.chefs += 1;
          break;
        case 'b2b':
          totals.b2b += 1;
          break;
        case 'admin':
          totals.admins += 1;
          break;
        default:
          break;
      }
      if (user.status === 'pending') {
        totals.pending += 1;
      }
    });

    return totals;
  }, [users]);

  const closeModals = () => {
    setShowFormModal(false);
    setShowMessageModal(false);
    setConfirmDialog(null);
    setFormData(initialFormState);
    setFormUserId(null);
    setFormError(null);
    setMessageSubject('');
    setMessageBody('');
    setMessageError(null);
  };

  const refreshUsers = () => setReloadFlag((flag) => flag + 1);

  const openDetailModal = async (user: AdminUser) => {
    setSelectedUser(user);
    setShowUserModal(true);
    setDetailsLoading(true);
    try {
      const detailedUser = await adminService.getUser(user.id);
      setSelectedUser(detailedUser);
    } catch (err) {
      const message = (err as any)?.response?.data?.message || 'Impossible de charger les détails de l\'utilisateur.';
      setFeedback({ type: 'error', message });
    } finally {
      setDetailsLoading(false);
    }
  };

  const openCreateModal = () => {
    setFormMode('create');
    setFormData(initialFormState);
    setFormUserId(null);
    setShowFormModal(true);
  };

  const openEditModal = (user: AdminUser) => {
    setFormMode('edit');
    setFormUserId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      password: '',
      isActive: user.isActive,
      isVerified: user.isVerified,
      companyName: user.company?.name || '',
      companySiret: user.company?.siret || '',
      companyAddress: user.company?.address || '',
      companyContact: user.company?.contactPerson || ''
    });
    setShowFormModal(true);
  };

  const applyUserUpdate = (updatedUser: AdminUser) => {
    setUsers((prev) => prev.map((user) => (user.id === updatedUser.id ? updatedUser : user)));
    if (selectedUser?.id === updatedUser.id) {
      setSelectedUser(updatedUser);
    }
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    const payload: any = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      role: formData.role,
      isActive: formData.isActive,
      isVerified: formData.isVerified
    };

    if (formData.role === 'b2b') {
      payload.company = {
        name: formData.companyName || undefined,
        siret: formData.companySiret || undefined,
        address: formData.companyAddress || undefined,
        contactPerson: formData.companyContact || undefined
      };
    }

    if (formMode === 'create' || formData.password) {
      payload.password = formData.password;
    }

    try {
      if (formMode === 'create') {
        await adminService.createUser(payload);
        setFeedback({ type: 'success', message: 'Utilisateur créé avec succès.' });
        setCurrentPage(1);
        refreshUsers();
      } else if (formUserId) {
        const updated = await adminService.updateUser(formUserId, payload);
        applyUserUpdate(updated);
        setFeedback({ type: 'success', message: 'Utilisateur mis à jour avec succès.' });
      }
      closeModals();
    } catch (err) {
      const message =
        (err as any)?.response?.data?.message ||
        (err as any)?.response?.data?.errors?.[0]?.msg ||
        'Impossible d\'enregistrer les modifications.';
      setFormError(message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleExportUsers = async () => {
    try {
      const blob = await adminService.exportData('users', 'csv');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `utilisateurs_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setFeedback({ type: 'success', message: 'Export des utilisateurs démarré.' });
    } catch (err) {
      const message = (err as any)?.response?.data?.message || 'Échec de l\'export des utilisateurs.';
      setFeedback({ type: 'error', message });
    }
  };

    // Implement user actions
  const handleToggleVerification = async (user: AdminUser) => {
    setVerificationLoading(true);
    try {
      const updated = await adminService.updateUser(user.id, { isVerified: !user.isVerified });
      applyUserUpdate(updated);
      setFeedback({
        type: 'success',
        message: !user.isVerified ? 'Profil vérifié avec succès.' : 'Vérification retirée.'
      });
    } catch (err) {
      const message = (err as any)?.response?.data?.message || 'Impossible de modifier la vérification.';
      setFeedback({ type: 'error', message });
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog) return;
    setConfirmSubmitting(true);
    try {
      if (confirmDialog.type === 'delete') {
        await adminService.deleteUser(confirmDialog.user.id);
        setFeedback({ type: 'success', message: 'Utilisateur désactivé avec succès.' });
        if (users.length === 1 && currentPage > 1) {
          setCurrentPage((page) => Math.max(1, page - 1));
        }
        refreshUsers();
      } else if (confirmDialog.type === 'status' && confirmDialog.nextStatus) {
        const updated = await adminService.updateUserStatus(confirmDialog.user.id, confirmDialog.nextStatus);
        applyUserUpdate(updated);
        setFeedback({
          type: 'success',
          message:
            confirmDialog.nextStatus === 'active'
              ? 'Utilisateur réactivé avec succès.'
              : 'Utilisateur suspendu avec succès.'
        });
      }
      setConfirmDialog(null);
    } catch (err) {
      const message = (err as any)?.response?.data?.message || 'Action impossible à réaliser.';
      setFeedback({ type: 'error', message });
    } finally {
      setConfirmSubmitting(false);
    }
  };

    // Implement export functionality
  const openMessageModal = (user: AdminUser) => {
    setMessageUser(user);
    setMessageSubject('');
    setMessageBody('');
    setMessageError(null);
    setShowMessageModal(true);
  };

  const handleSendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!messageUser) return;
    setMessageSubmitting(true);
    setMessageError(null);
    try {
      await adminService.sendMessageToUser(messageUser.id, messageSubject, messageBody);
      setFeedback({ type: 'success', message: 'Message envoyé avec succès.' });
      closeModals();
    } catch (err) {
      const message = (err as any)?.response?.data?.message || 'Impossible d\'envoyer le message.';
      setMessageError(message);
    } finally {
      setMessageSubmitting(false);
    }
  };

  const filteredUsers = users;

  const totalPages = pagination.pages || Math.ceil(pagination.total / pagination.limit) || 1;

  const renderPagination = () => (
    <div className="flex justify-between items-center mt-6">
      <p className="text-sm text-gray-600">
        Page {pagination.page} sur {totalPages} — {pagination.total} utilisateurs
      </p>
      <div className="space-x-2">
        <button
          onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          disabled={pagination.page <= 1 || loading}
          className="px-3 py-2 border rounded-lg text-sm font-medium disabled:opacity-50"
        >
          Précédent
        </button>
        <button
          onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
          disabled={pagination.page >= totalPages || loading}
          className="px-3 py-2 border rounded-lg text-sm font-medium disabled:opacity-50"
        >
          Suivant
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
            <p className="text-gray-600 mt-1">Administrez les profils, accès et statuts de tous les comptes.</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleExportUsers}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Exporter</span>
            </button>
            <button
              onClick={openCreateModal}
              className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Nouvel utilisateur</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {feedback && (
          <div
            className={`mb-6 rounded-xl px-4 py-3 flex items-center space-x-3 ${
              feedback.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {feedback.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
            <span>{feedback.message}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl px-4 py-3 bg-red-50 text-red-700 border border-red-200 flex items-center space-x-3">
            <XCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-2xl font-bold text-blue-600 mb-1">{stats.clients}</div>
            <div className="text-sm text-gray-600">Clients</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-2xl font-bold text-green-600 mb-1">{stats.chefs}</div>
            <div className="text-sm text-gray-600">Chefs</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-2xl font-bold text-purple-600 mb-1">{stats.b2b}</div>
            <div className="text-sm text-gray-600">Comptes B2B</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-sm text-gray-600">En attente</div>
            <div className="text-2xl font-bold text-yellow-600 mb-1">{stats.pending}</div>
            <div className="text-sm text-gray-600">En attente de validation</div>
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
                onChange={(e) => {
                  setCurrentPage(1);
                  setSearchTerm(e.target.value);
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => {
                setCurrentPage(1);
                setFilterRole(e.target.value);
              }}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Tous les rôles</option>
              <option value="client">Clients</option>
              <option value="chef">Chefs</option>
              <option value="b2b">B2B</option>
              <option value="admin">Administrateurs</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => {
                setCurrentPage(1);
                setFilterStatus(e.target.value);
              }}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="pending">En attente</option>
              <option value="suspended">Suspendus</option>
            </select>
            <button
              onClick={() => refreshUsers()}
              className="bg-red-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activité</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernière connexion</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Chargement des utilisateurs...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.company?.name && (
                          <div className="text-xs text-purple-600">{user.company.name}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${roleColor(user.role)}`}>
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor(user.status)}`}>
                          {user.status === 'pending' ? 'En attente' : user.status === 'suspended' ? 'Suspendu' : 'Actif'}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {user.isVerified ? '✓ Vérifié' : 'Non vérifié'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.role === 'chef' && (
                          <div>
                            <div>{user.chefStats?.totalBookings || 0} prestations</div>
                            {user.chefStats?.rating && (
                              <div className="text-xs text-yellow-600">★ {user.chefStats.rating.toFixed(1)}/5</div>
                            )}
                          </div>
                        )}
                        {(user.role === 'client' || user.role === 'b2b') && (
                          <div>
                            <div>{user.bookingStats?.totalBookings || 0} réservations</div>
                            <div className="text-xs text-green-600">{formatCurrency(user.bookingStats?.totalSpent || 0)}</div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.lastLogin || user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openDetailModal(user)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="Voir détails"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openMessageModal(user)}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="Envoyer un message"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(user)}
                            className="text-yellow-600 hover:text-yellow-900 p-1 rounded"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              setConfirmDialog({
                                type: 'status',
                                user,
                                nextStatus: user.isActive ? 'suspended' : 'active'
                              })
                            }
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title={user.isActive ? 'Suspendre' : 'Réactiver'}
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setConfirmDialog({ type: 'delete', user })}
                            className="text-gray-500 hover:text-gray-700 p-1 rounded"
                            title="Désactiver le compte"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {filteredUsers.length > 0 && renderPagination()}
      </div>

      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Profil utilisateur</h2>
                <p className="text-gray-500">Gestion des accès et des informations du compte</p>
              </div>
              <button
                onClick={() => setShowUserModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {detailsLoading && (
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 text-sm">
                  Chargement des dernières informations...
                </div>
              )}

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <span className="block text-sm font-medium text-gray-600">Nom</span>
                        <p className="text-gray-900 font-semibold">{selectedUser.name}</p>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-600">Email</span>
                        <p className="text-gray-900">{selectedUser.email}</p>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-600">Téléphone</span>
                        <p className="text-gray-900">{selectedUser.phone || '—'}</p>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-600">Rôle</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${roleColor(selectedUser.role)}`}>
                          {selectedUser.role.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-600">Statut</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor(selectedUser.status)}`}>
                          {selectedUser.status === 'pending' ? 'En attente' : selectedUser.status === 'suspended' ? 'Suspendu' : 'Actif'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-600">Inscription</span>
                        <p className="text-gray-900">{formatDate(selectedUser.createdAt)}</p>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-600">Dernière connexion</span>
                        <p className="text-gray-900">{formatDate(selectedUser.lastLogin || selectedUser.updatedAt)}</p>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-600">Vérification</span>
                        <p className="text-gray-900">{selectedUser.isVerified ? 'Profil vérifié' : 'À vérifier'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques d'activité</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {selectedUser.role === 'chef' && (
                        <>
                          <div>
                            <span className="block text-sm font-medium text-gray-600">Prestations réalisées</span>
                            <p className="text-2xl font-bold text-green-600">{selectedUser.chefStats?.totalBookings || 0}</p>
                          </div>
                          <div>
                            <span className="block text-sm font-medium text-gray-600">Note moyenne</span>
                            <p className="text-2xl font-bold text-yellow-600">
                              {selectedUser.chefStats?.rating ? selectedUser.chefStats.rating.toFixed(1) : '—'}
                            </p>
                          </div>
                        </>
                      )}

                      {(selectedUser.role === 'client' || selectedUser.role === 'b2b') && (
                        <>
                          <div>
                            <span className="block text-sm font-medium text-gray-600">Réservations</span>
                            <p className="text-2xl font-bold text-blue-600">{selectedUser.bookingStats?.totalBookings || 0}</p>
                          </div>
                          <div>
                            <span className="block text-sm font-medium text-gray-600">Montant engagé</span>
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedUser.bookingStats?.totalSpent || 0)}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {selectedUser.role === 'b2b' && selectedUser.company && (
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations entreprise</h3>
                      <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                        <div>
                          <span className="block text-xs uppercase text-gray-500">Entreprise</span>
                          <p className="font-medium">{selectedUser.company.name || '—'}</p>
                        </div>
                        <div>
                          <span className="block text-xs uppercase text-gray-500">SIRET</span>
                          <p className="font-medium">{selectedUser.company.siret || '—'}</p>
                        </div>
                        <div>
                          <span className="block text-xs uppercase text-gray-500">Adresse</span>
                          <p className="font-medium">{selectedUser.company.address || '—'}</p>
                        </div>
                        <div>
                          <span className="block text-xs uppercase text-gray-500">Contact</span>
                          <p className="font-medium">{selectedUser.company.contactPerson || '—'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => openMessageModal(selectedUser)}
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center space-x-2 justify-center"
                      >
                        <Mail className="h-4 w-4" />
                        <span>Envoyer un message</span>
                      </button>
                      <button
                        onClick={() => openEditModal(selectedUser)}
                        className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-yellow-600 transition-colors flex items-center space-x-2 justify-center"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Modifier le profil</span>
                      </button>
                      <button
                        onClick={() => setConfirmDialog({
                          type: 'status',
                          user: selectedUser,
                          nextStatus: selectedUser.isActive ? 'suspended' : 'active'
                        })}
                        className="w-full bg-red-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center space-x-2 justify-center"
                      >
                        <Ban className="h-4 w-4" />
                        <span>{selectedUser.isActive ? 'Suspendre le compte' : 'Réactiver le compte'}</span>
                      </button>
                      <button
                        onClick={() => handleToggleVerification(selectedUser)}
                        disabled={verificationLoading}
                        className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2 justify-center disabled:opacity-50"
                      >
                        <Shield className="h-4 w-4" />
                        <span>{selectedUser.isVerified ? 'Retirer la vérification' : 'Valider le profil'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Journal du compte</h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li><strong>Créé le :</strong> {formatDate(selectedUser.createdAt)}</li>
                      <li><strong>Dernière mise à jour :</strong> {formatDate(selectedUser.updatedAt)}</li>
                      <li><strong>Statut actuel :</strong> {selectedUser.status}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900">
                {formMode === 'create' ? 'Créer un utilisateur' : 'Modifier l\'utilisateur'}
              </h2>
              <button onClick={closeModals} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                ×
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
              {formError && (
                <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{formError}</div>
              )}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom complet</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rôle</label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, role: e.target.value as FormState['role'] }))
                    }
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="client">Client</option>
                    <option value="chef">Chef</option>
                    <option value="b2b">B2B</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Mot de passe {formMode === 'edit' ? '(laisser vide pour ne pas changer)' : ''}
                  </label>
                  <input
                    type="password"
                    minLength={formMode === 'create' ? 6 : 0}
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required={formMode === 'create'}
                  />
                </div>
                <div className="flex items-center space-x-4 mt-6">
                  <label className="flex items-center space-x-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                    />
                    <span>Compte actif</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.isVerified}
                      onChange={(e) => setFormData((prev) => ({ ...prev, isVerified: e.target.checked }))}
                    />
                    <span>Profil vérifié</span>
                  </label>
                </div>
              </div>

              {formData.role === 'b2b' && (
                <div className="border-t border-gray-200 pt-4 space-y-4">
                  <h3 className="text-md font-semibold text-gray-900">Informations entreprise</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nom de l'entreprise</label>
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
                        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">SIRET</label>
                      <input
                        type="text"
                        value={formData.companySiret}
                        onChange={(e) => setFormData((prev) => ({ ...prev, companySiret: e.target.value }))}
                        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Adresse</label>
                      <input
                        type="text"
                        value={formData.companyAddress}
                        onChange={(e) => setFormData((prev) => ({ ...prev, companyAddress: e.target.value }))}
                        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Personne de contact</label>
                      <input
                        type="text"
                        value={formData.companyContact}
                        onChange={(e) => setFormData((prev) => ({ ...prev, companyContact: e.target.value }))}
                        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {formSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMessageModal && messageUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Envoyer un message</h2>
                <p className="text-gray-500 text-sm">à {messageUser.name}</p>
              </div>
              <button onClick={closeModals} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                ×
              </button>
            </div>
            <form onSubmit={handleSendMessage} className="p-6 space-y-4">
              {messageError && (
                <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{messageError}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Sujet</label>
                <input
                  type="text"
                  required
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <textarea
                  required
                  rows={6}
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={messageSubmitting}
                  className="px-5 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {messageSubmitting ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">Confirmation requise</h3>
            </div>
            <p className="text-sm text-gray-600">
              {confirmDialog.type === 'delete'
                ? `Êtes-vous sûr de vouloir désactiver le compte de ${confirmDialog.user.name} ?`
                : confirmDialog.nextStatus === 'suspended'
                ? `Confirmez-vous la suspension du compte de ${confirmDialog.user.name} ?`
                : `Confirmez-vous la réactivation du compte de ${confirmDialog.user.name} ?`}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled={confirmSubmitting}
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={confirmSubmitting}
                className="px-5 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {confirmSubmitting ? 'Traitement...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;