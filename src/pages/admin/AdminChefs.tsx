import React, { useEffect, useState } from 'react';
import { adminService, PendingChef } from '../../services/adminService';
import { Eye, MapPin, FileText, Mail } from 'lucide-react';
import { LoadingSpinner } from '../../components/common';
import { ChefVerification } from '../../components/admin/ChefVerification';

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api') as string;
const filesBaseUrl = apiBaseUrl.replace(/\/$/, '').replace(/\/api$/, '');

const buildFileUrl = (url?: string | null) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  const normalised = url.startsWith('/') ? url : `/${url}`;
  return `${filesBaseUrl}${normalised}`;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
      return 'text-green-600 bg-green-100';
    case 'rejected':
      return 'text-red-600 bg-red-100';
    case 'pending':
      return 'text-yellow-600 bg-yellow-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('fr-FR');
};

const AdminChefs: React.FC = () => {
  const [chefs, setChefs] = useState<PendingChef[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedChef, setSelectedChef] = useState<PendingChef | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('pending');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 10 });

  const fetchChefs = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const { chefs, pagination } = await adminService.getChefs({
        status: filterStatus,
        page,
        limit: 10
      });
      setChefs(chefs);
      setPagination({
        page: pagination?.page || page,
        pages: pagination?.pages || 1,
        total: pagination?.total || chefs.length,
        limit: pagination?.limit || 10
      });
    } catch (err) {
      console.error('Failed to fetch chefs:', err);
      setError("Impossible de récupérer les chefs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChefs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const handleVerification = async (chefId: string, status: 'approved' | 'rejected', reason?: string) => {
    try {
      await adminService.verifyChef(chefId, status, reason);
      await fetchChefs(filterStatus === 'pending' ? 1 : pagination.page);
      setSelectedChef(null);
    } catch (err) {
      console.error(`Failed to ${status} chef:`, err);
      alert(`Impossible de ${status === 'approved' ? 'valider' : 'rejeter'} ce chef.`);
    }
  };

  const handleContact = (chefId: string) => {
    const chef = chefs.find(c => c.id === chefId);
    if (chef?.email) {
      window.location.href = `mailto:${chef.email}`;
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.pages || page === pagination.page) {
      return;
    }
    fetchChefs(page);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Gestion des Chefs</h1>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex flex-wrap gap-3">
              {(['all', 'pending', 'approved', 'rejected'] as FilterStatus[]).map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                    filterStatus === status
                      ? 'bg-red-500 text-white shadow'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {status === 'all' ? 'Tous' : status === 'pending' ? 'En attente' : status === 'approved' ? 'Approuvés' : 'Rejetés'}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-6 text-center"><LoadingSpinner /></div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">{error}</div>
          ) : filterStatus === 'pending' ? (
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
                  {chefs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                        Aucun chef trouvé pour ce filtre.
                      </td>
                    </tr>
                  ) : (
                    chefs.map(chef => (
                      <tr key={chef.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{chef.name}</div>
                          <div className="text-sm text-gray-500">{chef.email}</div>
                          {chef.location?.city && (
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              {chef.location.city} {chef.location.zipCode ? `(${chef.location.zipCode})` : ''}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{chef.specialty}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(chef.verification.status)}`}>
                            {chef.verification.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(chef.submittedAt)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setSelectedChef(chef)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="Voir détails"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {pagination.pages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 text-sm text-gray-500">
                  <span>
                    Page {pagination.page} sur {pagination.pages} — {pagination.total} chefs
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      className="px-3 py-1 border rounded-lg hover:bg-gray-50"
                      disabled={pagination.page === 1}
                    >
                      Précédent
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      className="px-3 py-1 border rounded-lg hover:bg-gray-50"
                      disabled={pagination.page === pagination.pages}
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {selectedChef && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <div>
                  <h2 className="text-2xl font-bold">Profil du Chef</h2>
                  <p className="text-sm text-gray-500">{selectedChef.email}</p>
                </div>
                <button onClick={() => setSelectedChef(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100" aria-label="Fermer">
                  <span aria-hidden>×</span>
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase">Informations générales</h3>
                    <p className="text-lg font-semibold text-gray-900">{selectedChef.name}</p>
                    <p className="text-sm text-gray-600">Spécialité : {selectedChef.specialty}</p>
                    <p className="text-sm text-gray-600">Expérience : {selectedChef.experience} ans</p>
                    <p className="text-sm text-gray-600">Tarif horaire : {selectedChef.hourlyRate.toFixed(2)}€</p>
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedChef.verification.status)}`}>
                      Statut : {selectedChef.verification.status}
                    </span>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-2" />
                      {selectedChef.location.city} {selectedChef.location.zipCode && `(${selectedChef.location.zipCode})`}
                    </div>
                    <button
                      onClick={() => handleContact(selectedChef.id)}
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Mail className="h-4 w-4 mr-2" /> Contacter
                    </button>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase">Documents</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      {selectedChef.documents.length === 0 && <li>Aucun document soumis.</li>}
                      {selectedChef.documents.map((doc) => {
                        const documentUrl = buildFileUrl(doc.url);
                        return (
                          <li key={doc.type} className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="font-medium capitalize">{doc.type}</span>
                            {documentUrl ? (
                              <a href={documentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-xs">
                                Voir le document
                              </a>
                            ) : (
                              <span className="text-xs text-gray-400">Non fourni</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Menus proposés</h3>
                  {selectedChef.menus.length === 0 ? (
                    <p className="text-sm text-gray-500">Aucun menu enregistré.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedChef.menus.map(menu => (
                        <div key={menu.id} className="border border-gray-200 rounded-xl p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-base font-semibold text-gray-900">{menu.name}</h4>
                            <span className="text-sm font-semibold text-green-600">{menu.price.toFixed(2)}€</span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-3">{menu.description}</p>
                          <p className="text-xs text-gray-500">Convives : {menu.minGuests} - {menu.maxGuests}</p>
                          {!menu.isActive && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-600">Inactif</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Certifications</h3>
                  {selectedChef.certifications.length === 0 ? (
                    <p className="text-sm text-gray-500">Aucune certification fournie.</p>
                  ) : (
                    <ul className="space-y-2 text-sm text-gray-600">
                      {selectedChef.certifications.map((cert, index) => (
                        <li key={`${cert.name}-${index}`}>
                          <div className="font-medium text-gray-800">{cert.name}</div>
                          <div className="text-xs text-gray-500">{cert.issuer} — obtenu le {formatDate(cert.dateObtained)}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {selectedChef.verification.status === 'pending' && (
                  <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
                    <button
                      onClick={() => handleVerification(selectedChef.id, 'rejected', window.prompt('Indiquez la raison du refus (optionnel)') || undefined)}
                      className="px-5 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50"
                    >
                      Rejeter la candidature
                    </button>
                    <button
                      onClick={() => handleVerification(selectedChef.id, 'approved')}
                      className="px-5 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600"
                    >
                      Approuver le chef
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChefs;
