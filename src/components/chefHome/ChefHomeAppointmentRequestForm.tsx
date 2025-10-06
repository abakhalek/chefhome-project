import React, { useMemo, useState } from 'react';
import { Calendar, Clock, MessageSquare, Users } from 'lucide-react';
import type {
  ChefHomeAppointmentRequestPayload,
  ChefHomeLocation
} from '../../types/chefHome';

interface ChefHomeAppointmentRequestFormProps {
  location: ChefHomeLocation;
  onSubmit: (payload: ChefHomeAppointmentRequestPayload) => Promise<void> | void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const ChefHomeAppointmentRequestForm: React.FC<ChefHomeAppointmentRequestFormProps> = ({
  location,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const defaultDate = useMemo(() => new Date().toISOString().split('T')[0], []);
  const defaultStartTime = location.availability.timeSlots[0]?.start ?? '19:00';
  const defaultEndTime = location.availability.timeSlots[0]?.end ?? '22:00';

  const [formValues, setFormValues] = useState<ChefHomeAppointmentRequestPayload>({
    requestedDate: defaultDate,
    requestedTime: { start: defaultStartTime, end: defaultEndTime },
    guests: Math.min(Math.max(location.capacity.minGuests, 2), location.capacity.maxGuests),
    message: ''
  });
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const start = formValues.requestedTime.start;
    const end = formValues.requestedTime.end;

    if (!start || !end) {
      setFormError('Merci de préciser un horaire de début et de fin.');
      return;
    }

    if (start >= end) {
      setFormError('L\'horaire de fin doit être postérieur à l\'horaire de début.');
      return;
    }

    await onSubmit({
      ...formValues,
      message: formValues.message?.trim() || undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Demande de rendez-vous chez {location.title}</h3>
        <p className="mt-1 text-sm text-gray-500">
          Vous serez accueilli directement au domicile du chef. Les coordonnées exactes seront partagées une fois le rendez-vous confirmé.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Date souhaitée</label>
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-emerald-500" />
            <input
              type="date"
              value={formValues.requestedDate}
              onChange={(event) => setFormValues((prev) => ({ ...prev, requestedDate: event.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Nombre de convives</label>
          <div className="relative">
            <Users className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-emerald-500" />
            <input
              type="number"
              min={location.capacity.minGuests}
              max={location.capacity.maxGuests}
              value={formValues.guests}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, guests: Number(event.target.value) }))
              }
              className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 focus:border-emerald-500 focus:ring-emerald-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Capacité d'accueil: {location.capacity.minGuests} à {location.capacity.maxGuests} convives.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Heure d'arrivée</label>
          <div className="relative">
            <Clock className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-emerald-500" />
            <input
              type="time"
              value={formValues.requestedTime.start}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  requestedTime: { ...prev.requestedTime, start: event.target.value }
                }))
              }
              className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Heure de fin</label>
          <div className="relative">
            <Clock className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-emerald-500" />
            <input
              type="time"
              value={formValues.requestedTime.end}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  requestedTime: { ...prev.requestedTime, end: event.target.value }
                }))
              }
              className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Message à l'attention du chef</label>
        <div className="relative">
          <MessageSquare className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-emerald-500" />
          <textarea
            rows={5}
            value={formValues.message}
            onChange={(event) => setFormValues((prev) => ({ ...prev, message: event.target.value }))}
            className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 focus:border-emerald-500 focus:ring-emerald-500"
            placeholder="Partagez vos attentes, éventuelles allergies ou le type d'expérience recherché."
          />
        </div>
      </div>

      {formError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
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
          {isSubmitting ? 'Envoi en cours...' : 'Demander un rendez-vous'}
        </button>
      </div>
    </form>
  );
};

export default ChefHomeAppointmentRequestForm;