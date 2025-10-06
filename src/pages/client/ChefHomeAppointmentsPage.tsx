import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CalendarCheck, Home, Loader2, MapPin, Sparkles } from 'lucide-react';
import ChefHomeLocationCard from '../../components/chefHome/ChefHomeLocationCard';
import ChefHomeAppointmentRequestForm from '../../components/chefHome/ChefHomeAppointmentRequestForm';
import ChefHomeAppointmentBoard from '../../components/chefHome/ChefHomeAppointmentBoard';
import { chefHomeService } from '../../services/chefHomeService';
import type {
  ChefHomeAppointment,
  ChefHomeAppointmentRequestPayload,
  ChefHomeLocation
} from '../../types/chefHome';

const ChefHomeAppointmentsPage: React.FC = () => {
  const [locations, setLocations] = useState<ChefHomeLocation[]>([]);
  const [appointments, setAppointments] = useState<ChefHomeAppointment[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<ChefHomeLocation | null>(null);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const selectedLocationId = selectedLocation?._id || selectedLocation?.id || null;

  const fetchData = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const [locationsResponse, appointmentsResponse] = await Promise.all([
        chefHomeService.getActiveLocations(),
        chefHomeService.getClientAppointments()
      ]);

      setLocations(locationsResponse.data ?? []);
      setAppointments(appointmentsResponse.data ?? []);
    } catch (error) {
      console.error('Failed to load chef home discovery data', error);
      setFeedback({
        type: 'error',
        message: 'Impossible de charger les lieux à domicile pour le moment.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitRequest = async (payload: ChefHomeAppointmentRequestPayload) => {
    if (!selectedLocationId) return;

    setIsSubmitting(true);
    setFeedback(null);
    try {
      await chefHomeService.requestAppointment(selectedLocationId, payload);
      setFeedback({ type: 'success', message: 'Votre demande de rendez-vous a bien été envoyée au chef.' });
      await fetchData();
      setIsRequestOpen(false);
      setSelectedLocation(null);
    } catch (error: any) {
      console.error('Failed to request chef home appointment', error);
      setFeedback({
        type: 'error',
        message: error?.response?.data?.message || 'Impossible de soumettre votre demande pour le moment.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenRequest = (location: ChefHomeLocation) => {
    setSelectedLocation(location);
    setIsRequestOpen(true);
    setFeedback(null);
  };

  const currentLocation = useMemo(() => {
    if (!selectedLocationId) return null;
    return locations.find((item) => (item._id || item.id) === selectedLocationId) ?? selectedLocation;
  }, [locations, selectedLocation, selectedLocationId]);

  const hasLocations = locations.length > 0;

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-white px-8 py-10 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1 text-sm font-medium text-indigo-700">
              <Sparkles className="h-4 w-4" /> Expérience immersive
            </span>
            <h1 className="text-3xl font-semibold text-gray-900">Vivez un menu d'exception directement chez votre chef</h1>
            <p className="max-w-2xl text-sm text-gray-600">
              Réservez un moment privilégié au domicile de chefs sélectionnés. Découvrez des lieux uniques, parfaitement équipés pour vous accueillir comme à la maison.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-indigo-700">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm">
                <Home className="h-4 w-4" /> Confort du domicile du chef
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm">
                <CalendarCheck className="h-4 w-4" /> Rendez-vous sur mesure
              </div>
            </div>
          </div>
        </div>
      </section>

      {feedback && (
        <div
          className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {feedback.type === 'success' ? <Sparkles className="mt-0.5 h-4 w-4" /> : <AlertCircle className="mt-0.5 h-4 w-4" />}
          <p>{feedback.message}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white py-20 text-gray-500">
          <Loader2 className="mr-3 h-5 w-5 animate-spin text-indigo-500" /> Recherche des lieux disponibles...
        </div>
      ) : (
        <div className="space-y-12">
          <section className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Lieux disponibles</h2>
                <p className="text-sm text-gray-500">Sélectionnez un lieu pour découvrir les détails et demander un rendez-vous.</p>
              </div>
            </div>

            {hasLocations ? (
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                {locations.map((location) => (
                  <div key={location._id || location.id} className="space-y-4">
                    <ChefHomeLocationCard location={location} />
                    <button
                      type="button"
                      onClick={() => handleOpenRequest(location)}
                      className="w-full rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                    >
                      Demander un rendez-vous
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-10 py-16 text-center">
                <MapPin className="mx-auto h-12 w-12 text-indigo-500" />
                <h3 className="mt-4 text-xl font-semibold text-gray-900">Aucun lieu disponible pour le moment</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Revenez prochainement : nos chefs mettent régulièrement à jour leurs disponibilités à domicile.
                </p>
              </div>
            )}
          </section>

          {isRequestOpen && currentLocation && (
            <section className="rounded-3xl border border-gray-100 bg-white p-8 shadow-lg">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Demande de rendez-vous</h2>
                  <p className="text-sm text-gray-500">
                    Partagez vos attentes et choisissez la date idéale pour vivre cette expérience culinaire chez le chef.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsRequestOpen(false);
                    setSelectedLocation(null);
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Fermer
                </button>
              </div>

              <ChefHomeAppointmentRequestForm
                location={currentLocation}
                onSubmit={handleSubmitRequest}
                onCancel={() => {
                  setIsRequestOpen(false);
                  setSelectedLocation(null);
                }}
                isSubmitting={isSubmitting}
              />
            </section>
          )}

          <section className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Suivi de vos demandes</h2>
              <p className="text-sm text-gray-500">
                Retrouvez toutes vos demandes de rendez-vous et suivez leur statut en temps réel.
              </p>
            </div>
            <ChefHomeAppointmentBoard appointments={appointments} />
          </section>
        </div>
      )}
    </div>
  );
};

export default ChefHomeAppointmentsPage;