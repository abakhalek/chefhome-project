import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, FileText, ShieldCheck, Eye, Loader2 } from 'lucide-react';
import { adminService, PendingChef, ChefDocumentSummary, ChefMenuSummary } from '../../services/adminService';

const DocumentBadge: React.FC<{ document: ChefDocumentSummary }> = ({ document }) => {
  const isUploaded = Boolean(document.url);
  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-lg border ${isUploaded ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
      <div className="flex items-center space-x-2">
        <FileText className={`h-4 w-4 ${isUploaded ? 'text-green-600' : 'text-amber-600'}`} />
        <span className="text-sm font-medium text-gray-700 capitalize">{document.type.replace(/([A-Z])/g, ' $1').trim()}</span>
      </div>
      {isUploaded ? (
        <a
          href={document.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-green-600 hover:underline"
        >
          Consulter
        </a>
      ) : (
        <span className="text-xs font-semibold text-amber-600">Manquant</span>
      )}
    </div>
  );
};

const MenuCard: React.FC<{
  chefId: string;
  menu: ChefMenuSummary;
  onToggle: (chefId: string, menu: ChefMenuSummary) => void;
  disabled: boolean;
}> = ({ chefId, menu, onToggle, disabled }) => {
  return (
    <div className="border border-gray-200 rounded-xl p-4 flex flex-col space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">{menu.name}</h4>
          <p className="text-sm text-gray-500">{menu.category} · {menu.type === 'horaire' ? 'Tarif horaire' : 'Forfait'}</p>
        </div>
        <span className="text-lg font-bold text-amber-600">{menu.price.toFixed(2)}€</span>
      </div>
      <p className="text-sm text-gray-600 line-clamp-3">{menu.description}</p>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{menu.minGuests} - {menu.maxGuests} convives</span>
        <span className={`px-2 py-1 rounded-full font-semibold ${menu.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {menu.isActive ? 'Actif' : 'En attente'}
        </span>
      </div>
      <button
        type="button"
        onClick={() => onToggle(chefId, menu)}
        disabled={disabled}
        className={`inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg border transition ${menu.isActive ? 'border-red-300 text-red-600 hover:bg-red-50' : 'border-green-300 text-green-600 hover:bg-green-50'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {disabled ? <Loader2 className="h-4 w-4 animate-spin" /> : menu.isActive ? 'Suspendre le menu' : 'Activer le menu'}
      </button>
    </div>
  );
};

const AdminChefsPage: React.FC = () => {
  const [pendingChefs, setPendingChefs] = useState<PendingChef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingMenuId, setUpdatingMenuId] = useState<string | null>(null);

  const fetchPendingChefs = async () => {
    setLoading(true);
    setError(null);
    try {
      const chefs = await adminService.getPendingChefs();
      setPendingChefs(chefs);
    } catch (err) {
      console.error('Failed to fetch pending chefs:', err);
      setError("Impossible de récupérer les candidatures en attente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingChefs();
  }, []);

  const handleVerifyChef = async (chefId: string, status: 'approved' | 'rejected') => {
    const reason = status === 'rejected' ? prompt('Raison du rejet :') : '';
    if (status === 'rejected' && !reason) return;

    try {
      await adminService.verifyChef(chefId, status, reason || undefined);
      fetchPendingChefs();
    } catch (err) {
      console.error('Failed to verify chef:', err);
      alert("Une erreur est survenue lors de la mise à jour de la candidature.");
    }
  };

  const handleToggleMenuStatus = async (chefId: string, menu: ChefMenuSummary) => {
    try {
      setUpdatingMenuId(menu.id);
      const updatedMenu = await adminService.updateChefMenuStatus(chefId, menu.id, !menu.isActive);
      setPendingChefs(prev => prev.map(chef => {
        if (chef.id !== chefId) return chef;
        return {
          ...chef,
          menus: chef.menus.map(m => (m.id === menu.id ? { ...m, isActive: updatedMenu.isActive } : m))
        };
      }));
    } catch (err) {
      console.error('Failed to update menu status:', err);
      alert("Impossible de mettre à jour le statut du menu.");
    } finally {
      setUpdatingMenuId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Validation des Chefs</h1>
          <p className="text-sm text-gray-500">Vérifiez les documents réglementaires et activez les offres proposées avant publication.</p>
        </div>
        <button
          type="button"
          onClick={fetchPendingChefs}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Eye className="h-4 w-4 mr-2" /> Rafraîchir
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

      {loading ? (
        <div className="bg-white rounded-2xl shadow p-12 text-center text-gray-500">Chargement des candidatures...</div>
      ) : pendingChefs.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-12 text-center text-gray-500">Aucune candidature de chef en attente.</div>
      ) : (
        <div className="space-y-6">
          {pendingChefs.map((chef) => (
            <div key={chef.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                    <span>{chef.name}</span>
                    <span className="text-sm font-medium text-gray-500">{chef.specialty}</span>
                  </h2>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                    <span>{chef.experience} ans d'expérience</span>
                    <span>Tarif horaire : <strong className="text-amber-600">{chef.hourlyRate.toFixed(2)}€</strong></span>
                    <span>Zone : {chef.location.city || 'N/A'} ({chef.location.zipCode || '—'})</span>
                    <span>Inscription le {new Date(chef.submittedAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-3">
                    {chef.phone && <span>{chef.phone}</span>}
                    <span>{chef.email}</span>
                    <span className="inline-flex items-center text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      <ShieldCheck className="h-3 w-3 mr-1" /> Statut : {chef.verification.status === 'pending' ? 'En attente' : chef.verification.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleVerifyChef(chef.id, 'approved')}
                    className="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" /> Approuver
                  </button>
                  <button
                    onClick={() => handleVerifyChef(chef.id, 'rejected')}
                    className="inline-flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold"
                  >
                    <XCircle className="h-4 w-4 mr-2" /> Rejeter
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <span>Documents réglementaires</span>
                  </h3>
                  <div className="space-y-2">
                    {chef.documents.length === 0 ? (
                      <p className="text-sm text-gray-500">Aucun document fourni.</p>
                    ) : (
                      chef.documents.map((document) => (
                        <DocumentBadge key={`${chef.id}-${document.type}`} document={document} />
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-indigo-500" />
                    <span>Certifications</span>
                  </h3>
                  <div className="space-y-2">
                    {chef.certifications.length === 0 ? (
                      <p className="text-sm text-gray-500">Aucune certification renseignée.</p>
                    ) : (
                      chef.certifications.map((cert, index) => (
                        <div key={`${chef.id}-cert-${index}`} className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600">
                          <p className="font-semibold text-gray-800">{cert.name}</p>
                          <p>{cert.issuer}</p>
                          <p className="text-xs text-gray-500">Obtenu le {cert.dateObtained ? new Date(cert.dateObtained).toLocaleDateString('fr-FR') : 'N/A'}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-amber-500" />
                    <span>Offres proposées</span>
                  </h3>
                  <div className="space-y-3">
                    {chef.menus.length === 0 ? (
                      <p className="text-sm text-gray-500">Aucun menu enregistré.</p>
                    ) : (
                      chef.menus.map((menu) => (
                        <MenuCard
                          key={`${chef.id}-${menu.id}`}
                          chefId={chef.id}
                          menu={menu}
                          disabled={updatingMenuId === menu.id}
                          onToggle={handleToggleMenuStatus}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminChefsPage;