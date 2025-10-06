import React from 'react';
import { CalendarCheck, Edit3, Home, MapPin, Users } from 'lucide-react';
import type { ChefHomeLocation } from '../../types/chefHome';

interface ChefHomeLocationCardProps {
  location: ChefHomeLocation;
  onEdit?: (location: ChefHomeLocation) => void;
}

const ChefHomeLocationCard: React.FC<ChefHomeLocationCardProps> = ({ location, onEdit }) => {
  const totalAmenities = location.amenities?.length ?? 0;
  const hasPricing = typeof location.pricing?.basePrice === 'number';

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-lg">
      <div className="border-b border-gray-100 px-6 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-emerald-500" />
              <h3 className="text-xl font-semibold text-gray-900">{location.title}</h3>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              {location.description || 'Aucune description détaillée pour le moment.'}
            </p>
          </div>
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(location)}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
            >
              <Edit3 className="h-4 w-4" /> Modifier
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 px-6 py-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <MapPin className="mt-1 h-5 w-5 text-emerald-500" />
            <div>
              <p className="font-medium text-gray-900">Adresse</p>
              <p className="text-sm text-gray-600">
                {location.address.street}, {location.address.zipCode} {location.address.city}
              </p>
              <p className="text-xs text-gray-500">{location.address.country}</p>
              {location.address.accessInstructions && (
                <p className="mt-1 text-xs text-gray-500">{location.address.accessInstructions}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Users className="mt-1 h-5 w-5 text-emerald-500" />
            <div>
              <p className="font-medium text-gray-900">Capacité d'accueil</p>
              <p className="text-sm text-gray-600">
                {location.capacity.minGuests} à {location.capacity.maxGuests} convives
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <CalendarCheck className="mt-1 h-5 w-5 text-emerald-500" />
            <div>
              <p className="font-medium text-gray-900">Disponibilités</p>
              <p className="text-sm text-gray-600">
                {location.availability.daysOfWeek.length
                  ? location.availability.daysOfWeek
                      .map((day) => day.charAt(0).toUpperCase() + day.slice(1))
                      .join(', ')
                  : 'Aucune journée définie'}
              </p>
              <div className="mt-1 text-xs text-gray-500">
                {location.availability.timeSlots.map((slot, index) => (
                  <span key={`${slot.start}-${slot.end}-${index}`} className="mr-2 inline-flex items-center">
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-600">
                      {slot.start} - {slot.end}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-900">Tarification</p>
            {hasPricing ? (
              <p className="mt-1 text-sm text-gray-600">
                {location.pricing.basePrice.toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: location.pricing.currency || 'EUR'
                })}
                {typeof location.pricing.pricePerGuest === 'number' && location.pricing.pricePerGuest > 0 && (
                  <span className="ml-1 text-xs text-gray-500">
                    + {location.pricing.pricePerGuest.toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: location.pricing.currency || 'EUR'
                    })}
                    {' '}par convive
                  </span>
                )}
              </p>
            ) : (
              <p className="mt-1 text-sm text-gray-500">Tarification à définir</p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 px-6 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            {location.isActive ? 'Visible' : 'Non visible'}
          </span>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            {totalAmenities} équipement{totalAmenities > 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChefHomeLocationCard;