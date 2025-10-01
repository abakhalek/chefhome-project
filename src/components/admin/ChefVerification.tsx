import React from 'react';
import { Check, X, MapPin, Users, UtensilsCrossed, FileText, Mail } from 'lucide-react';
import type { PendingChef } from '../../services/adminService';

interface ChefVerificationProps {
  pendingChefs: PendingChef[];
  loading?: boolean;
  onVerifyChef: (chefId: string, status: 'approved' | 'rejected', reason?: string) => void;
  onContactChef: (chefId: string) => void;
}

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

export const ChefVerification: React.FC<ChefVerificationProps> = ({ pendingChefs, loading, onVerifyChef, onContactChef }) => {
  if (loading) {
    return null;
  }

  if (!pendingChefs.length) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
        Aucun chef en attente de vérification pour le moment.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {pendingChefs.map(chef => (
        <div key={chef.id} className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{chef.name}</h3>
                <p className="text-sm text-gray-500">{chef.email}</p>
                {chef.phone && <p className="text-sm text-gray-500">{chef.phone}</p>}
              </div>
              <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                En attente de validation
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-gray-600 md:grid-cols-2">
              <div className="flex items-center">
                <UtensilsCrossed className="mr-2 h-4 w-4 text-gray-400" />
                <span>{chef.specialty}</span>
              </div>
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4 text-gray-400" />
                <span>{chef.experience} ans d'expérience</span>
              </div>
              <div className="flex items-center">
                <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                <span>{chef.location.city} {chef.location.zipCode && `(${chef.location.zipCode})`}</span>
              </div>
              <div className="flex items-center">
                <FileText className="mr-2 h-4 w-4 text-gray-400" />
                <span>{chef.menus.length} offre(s) proposée(s)</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 uppercase">Menus signatures</h4>
              {chef.menus.length === 0 ? (
                <p className="text-sm text-gray-500">Aucun menu renseigné.</p>
              ) : (
                <div className="mt-2 space-y-2">
                  {chef.menus.slice(0, 2).map(menu => (
                    <div key={menu.id} className="rounded-lg border border-gray-200 p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-800">{menu.name}</span>
                        <span className="text-sm font-semibold text-green-600">{menu.price.toFixed(2)}€</span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500 line-clamp-2">{menu.description}</p>
                      <p className="mt-1 text-xs text-gray-400">Convives : {menu.minGuests} - {menu.maxGuests}</p>
                    </div>
                  ))}
                  {chef.menus.length > 2 && (
                    <p className="text-xs text-gray-400">+{chef.menus.length - 2} menu(s) supplémentaire(s)</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 uppercase mb-2">Documents justificatifs</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                {chef.documents.length === 0 && <li>Aucun document transmis.</li>}
                {chef.documents.map(doc => {
                  const documentUrl = buildFileUrl(doc.url);
                  return (
                    <li key={doc.type} className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="font-medium capitalize">{doc.type}</span>
                      {documentUrl ? (
                        <a href={documentUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:text-blue-800">
                          Consulter
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">Non fourni</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <button
                onClick={() => onContactChef(chef.id)}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Mail className="mr-2 h-4 w-4" /> Contacter
              </button>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={() => onVerifyChef(chef.id, 'rejected', window.prompt('Indiquez la raison du refus (optionnel)') || undefined)}
                  className="inline-flex items-center justify-center rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  <X className="mr-2 h-4 w-4" /> Refuser
                </button>
                <button
                  onClick={() => onVerifyChef(chef.id, 'approved')}
                  className="inline-flex items-center justify-center rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600"
                >
                  <Check className="mr-2 h-4 w-4" /> Approuver
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
