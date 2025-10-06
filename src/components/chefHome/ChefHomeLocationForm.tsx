import React, { useEffect, useMemo, useState } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import type { ChefHomeLocationFormValues, ChefHomeTimeSlot } from '../../types/chefHome';

const dayOptions: Array<{ value: string; label: string }> = [
  { value: 'monday', label: 'Lundi' },
  { value: 'tuesday', label: 'Mardi' },
  { value: 'wednesday', label: 'Mercredi' },
  { value: 'thursday', label: 'Jeudi' },
  { value: 'friday', label: 'Vendredi' },
  { value: 'saturday', label: 'Samedi' },
  { value: 'sunday', label: 'Dimanche' }
];

const defaultValues: ChefHomeLocationFormValues = {
  title: '',
  description: '',
  heroImage: null,
  address: {
    street: '',
    city: '',
    zipCode: '',
    country: 'France',
    accessInstructions: ''
  },
  capacity: {
    minGuests: 2,
    maxGuests: 8
  },
  amenities: [],
  pricing: {
    basePrice: 120,
    pricePerGuest: 0,
    currency: 'EUR'
  },
  availability: {
    daysOfWeek: ['friday', 'saturday'],
    timeSlots: [{ start: '18:00', end: '22:00' }],
    leadTimeDays: 3,
    advanceBookingLimitDays: 90,
    blackoutDates: []
  },
  isActive: true
};

interface ChefHomeLocationFormProps {
  initialValues?: Partial<ChefHomeLocationFormValues>;
  onSubmit: (values: ChefHomeLocationFormValues) => Promise<void> | void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const ChefHomeLocationForm: React.FC<ChefHomeLocationFormProps> = ({ initialValues, onSubmit, onCancel, isSubmitting }) => {
  const resolvedInitialValues = useMemo(() => ({
    ...defaultValues,
    ...initialValues,
    address: {
      ...defaultValues.address,
      ...initialValues?.address
    },
    capacity: {
      ...defaultValues.capacity,
      ...initialValues?.capacity
    },
    pricing: {
      ...defaultValues.pricing,
      ...initialValues?.pricing
    },
    availability: {
      ...defaultValues.availability,
      ...initialValues?.availability,
      timeSlots: initialValues?.availability?.timeSlots?.length
        ? initialValues.availability.timeSlots
        : defaultValues.availability.timeSlots
    }
  }), [initialValues]);

  const [formValues, setFormValues] = useState<ChefHomeLocationFormValues>(resolvedInitialValues);
  const [amenityInput, setAmenityInput] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setFormValues(resolvedInitialValues);
  }, [resolvedInitialValues]);

  const updateAvailability = (updates: Partial<ChefHomeLocationFormValues['availability']>) => {
    setFormValues((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        ...updates
      }
    }));
  };

  const updateTimeSlot = (index: number, field: keyof ChefHomeTimeSlot, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        timeSlots: prev.availability.timeSlots.map((slot, slotIndex) =>
          slotIndex === index ? { ...slot, [field]: value } : slot
        )
      }
    }));
  };

  const addTimeSlot = () => {
    setFormValues((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        timeSlots: [...prev.availability.timeSlots, { start: '11:00', end: '15:00' }]
      }
    }));
  };

  const removeTimeSlot = (index: number) => {
    setFormValues((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        timeSlots: prev.availability.timeSlots.filter((_, slotIndex) => slotIndex !== index)
      }
    }));
  };

  const toggleDay = (day: string) => {
    setFormValues((prev) => {
      const isSelected = prev.availability.daysOfWeek.includes(day);
      const daysOfWeek = isSelected
        ? prev.availability.daysOfWeek.filter((value) => value !== day)
        : [...prev.availability.daysOfWeek, day];

      return {
        ...prev,
        availability: {
          ...prev.availability,
          daysOfWeek
        }
      };
    });
  };

  const handleChange = (field: keyof ChefHomeLocationFormValues, value: unknown) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = <K extends keyof ChefHomeLocationFormValues>(
    field: K,
    nestedField: keyof ChefHomeLocationFormValues[K],
    value: unknown
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: {
        ...(prev[field] as Record<string, unknown>),
        [nestedField]: value
      }
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!formValues.title.trim()) {
      setFormError('Merci de renseigner un titre pour votre lieu.');
      return;
    }

    if (!formValues.address.street.trim() || !formValues.address.city.trim() || !formValues.address.zipCode.trim()) {
      setFormError('Les informations d\'adresse sont obligatoires.');
      return;
    }

    if (formValues.capacity.maxGuests < formValues.capacity.minGuests) {
      setFormError('Le nombre maximum de convives doit être supérieur au minimum.');
      return;
    }

    const normalizedValues: ChefHomeLocationFormValues = {
      ...formValues,
      title: formValues.title.trim(),
      description: formValues.description.trim(),
      amenities: formValues.amenities.map((item) => item.trim()).filter(Boolean),
      address: {
        ...formValues.address,
        street: formValues.address.street.trim(),
        city: formValues.address.city.trim(),
        zipCode: formValues.address.zipCode.trim(),
        country: formValues.address.country.trim(),
        accessInstructions: formValues.address.accessInstructions?.trim() ?? ''
      },
      capacity: {
        minGuests: Number(formValues.capacity.minGuests),
        maxGuests: Number(formValues.capacity.maxGuests)
      },
      pricing: {
        basePrice: Number(formValues.pricing.basePrice),
        pricePerGuest: Number(formValues.pricing.pricePerGuest ?? 0),
        currency: formValues.pricing.currency.trim()
      },
      availability: {
        ...formValues.availability,
        daysOfWeek: [...new Set(formValues.availability.daysOfWeek)],
        timeSlots: formValues.availability.timeSlots.map((slot) => ({
          start: slot.start,
          end: slot.end
        }))
      }
    };

    await onSubmit(normalizedValues);
  };

  const handleAmenityAdd = () => {
    const trimmed = amenityInput.trim();
    if (!trimmed) return;
    if (formValues.amenities.includes(trimmed)) {
      setAmenityInput('');
      return;
    }

    setFormValues((prev) => ({
      ...prev,
      amenities: [...prev.amenities, trimmed]
    }));
    setAmenityInput('');
  };

  const handleAmenityRemove = (item: string) => {
    setFormValues((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((amenity) => amenity !== item)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Titre du lieu</label>
            <input
              type="text"
              value={formValues.title}
              onChange={(event) => handleChange('title', event.target.value)}
              className="mt-2 w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
              placeholder="Ex: Expérience gastronomique chez Chef Léa"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formValues.description}
              onChange={(event) => handleChange('description', event.target.value)}
              rows={6}
              className="mt-2 w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
              placeholder="Présentez l'expérience proposée à votre domicile, l'ambiance et les services inclus."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Capacité minimale</label>
              <input
                type="number"
                min={1}
                value={formValues.capacity.minGuests}
                onChange={(event) =>
                  handleNestedChange('capacity', 'minGuests', Number(event.target.value))
                }
                className="mt-2 w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Capacité maximale</label>
              <input
                type="number"
                min={1}
                value={formValues.capacity.maxGuests}
                onChange={(event) =>
                  handleNestedChange('capacity', 'maxGuests', Number(event.target.value))
                }
                className="mt-2 w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Adresse</label>
            <div className="mt-2 space-y-3">
              <input
                type="text"
                value={formValues.address.street}
                onChange={(event) => handleNestedChange('address', 'street', event.target.value)}
                className="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="Rue et numéro"
              />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input
                  type="text"
                  value={formValues.address.city}
                  onChange={(event) => handleNestedChange('address', 'city', event.target.value)}
                  className="rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                  placeholder="Ville"
                />
                <input
                  type="text"
                  value={formValues.address.zipCode}
                  onChange={(event) => handleNestedChange('address', 'zipCode', event.target.value)}
                  className="rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                  placeholder="Code postal"
                />
              </div>
              <input
                type="text"
                value={formValues.address.country}
                onChange={(event) => handleNestedChange('address', 'country', event.target.value)}
                className="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="Pays"
              />
              <textarea
                value={formValues.address.accessInstructions ?? ''}
                onChange={(event) => handleNestedChange('address', 'accessInstructions', event.target.value)}
                rows={3}
                className="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="Codes d'accès, étage, particularités..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Tarification</label>
            <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <span className="text-xs text-gray-500">Tarif d'accueil (forfait)</span>
                <input
                  type="number"
                  min={0}
                  step={10}
                  value={formValues.pricing.basePrice}
                  onChange={(event) => handleNestedChange('pricing', 'basePrice', Number(event.target.value))}
                  className="mt-1 w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <div>
                <span className="text-xs text-gray-500">Tarif par convive (optionnel)</span>
                <input
                  type="number"
                  min={0}
                  step={5}
                  value={formValues.pricing.pricePerGuest ?? 0}
                  onChange={(event) => handleNestedChange('pricing', 'pricePerGuest', Number(event.target.value))}
                  className="mt-1 w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Statut</label>
            <label className="mt-2 flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formValues.isActive}
                onChange={(event) => handleChange('isActive', event.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-600">Rendre ce lieu visible dans la recherche</span>
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900">Équipements & Ambiance</h3>
        <p className="mt-1 text-sm text-gray-500">Listez les éléments qui rendent votre domicile unique (piano, terrasse, vue...).</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {formValues.amenities.map((item) => (
            <span
              key={item}
              className="inline-flex items-center space-x-2 rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700"
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={() => handleAmenityRemove(item)}
                className="text-emerald-600 hover:text-emerald-800"
                aria-label={`Retirer ${item}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={amenityInput}
            onChange={(event) => setAmenityInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleAmenityAdd();
              }
            }}
            className="flex-1 rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
            placeholder="Ex: Salle à manger lumineuse"
          />
          <button
            type="button"
            onClick={handleAmenityAdd}
            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900">Disponibilités à domicile</h3>
        <p className="mt-1 text-sm text-gray-500">
          Indiquez les jours et créneaux où vous pouvez accueillir vos clients chez vous.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
          {dayOptions.map((day) => {
            const isActive = formValues.availability.daysOfWeek.includes(day.value);
            return (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6 space-y-4">
          {formValues.availability.timeSlots.map((slot, index) => (
            <div key={`${slot.start}-${slot.end}-${index}`} className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label className="text-xs uppercase text-gray-500">Heure de début</label>
                <input
                  type="time"
                  value={slot.start}
                  onChange={(event) => updateTimeSlot(index, 'start', event.target.value)}
                  className="mt-1 w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs uppercase text-gray-500">Heure de fin</label>
                <input
                  type="time"
                  value={slot.end}
                  onChange={(event) => updateTimeSlot(index, 'end', event.target.value)}
                  className="mt-1 w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeTimeSlot(index)}
                  className="flex w-full items-center justify-center rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addTimeSlot}
            className="inline-flex items-center rounded-lg border border-dashed border-emerald-300 px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un créneau
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Délai de préparation minimum (jours)</label>
            <input
              type="number"
              min={0}
              value={formValues.availability.leadTimeDays}
              onChange={(event) => updateAvailability({ leadTimeDays: Number(event.target.value) })}
              className="mt-2 w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Réservation maximale à l'avance (jours)</label>
            <input
              type="number"
              min={0}
              value={formValues.availability.advanceBookingLimitDays}
              onChange={(event) => updateAvailability({ advanceBookingLimitDays: Number(event.target.value) })}
              className="mt-2 w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {formError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>
      )}

      <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Enregistrement en cours...' : 'Enregistrer le lieu'}
        </button>
      </div>
    </form>
  );
};

export default ChefHomeLocationForm;
