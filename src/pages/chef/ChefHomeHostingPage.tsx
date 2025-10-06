import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, MapPin, PlusCircle, ShieldCheck } from 'lucide-react';
import ChefHomeLocationForm from '../../components/chefHome/ChefHomeLocationForm';
import ChefHomeLocationCard from '../../components/chefHome/ChefHomeLocationCard';
import ChefHomeAppointmentBoard from '../../components/chefHome/ChefHomeAppointmentBoard';
import { chefHomeService } from '../../services/chefHomeService';
import type {
  ChefHomeAppointment,
  ChefHomeAppointmentStatus,
  ChefHomeLocation,
  ChefHomeLocationFormValues
} from '../../types/chefHome';

const ChefHomeHostingPage: React.FC = () => {
  const [locations, setLocations] = useState<ChefHomeLocation[]>([]);
  const [appointments, setAppointments] = useState<ChefHomeAppointment[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<ChefHomeLocation | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [responseError, setResponseError] = useState<string | null>(null);

  const selectedLocationId = selectedLocation?._id || selectedLocation?.id || null;

  const fetchData = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const [locationsResponse, appointmentsResponse] = await Promise.all([
        chefHomeService.getMyLocations(),
        chefHomeService.getChefAppointments()
      ]);

      setLocations(locationsResponse.data ?? []);
      setAppointments(appointmentsResponse.data ?? []);
    } catch (error) {
      console.error('Failed to load chef home data', error);
      setFeedback({
        type: 'error',
        message: 'Impossible de charger vos lieux et rendez-vous. Veuillez réessayer plus tard.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateOrUpdate = async (values: ChefHomeLocationFormValues) => {
    setIsSubmitting(true);
    setFeedback(null);
    try {
      if (selectedLocationId) {
        await chefHomeService.updateLocation(selectedLocationId, values);
        setFeedback({ type: 'success', message: 'Lieu mis à jour avec succès.' });
      } else {
        await chefHomeService.createLocation(values);
        setFeedback({ type: 'success', message: 'Nouveau lieu créé avec succès.' });
      }
      await fetchData();
      setIsFormOpen(false);
      setSelectedLocation(null);
    } catch (error: any) {
      console.error('Failed to save location', error);
      setFeedback({
        type: 'error',
        message: error?.response?.data?.message || "Une erreur est survenue lors de l'enregistrement."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRespond = async (appointmentId: string, status: ChefHomeAppointmentStatus) => {
    setResponseError(null);
    try {
      await chefHomeService.respondToAppointment(appointmentId, status);
      await fetchData();
    } catch (error: any) {
      console.error('Failed to update appointment status', error);
      setResponseError(error?.response?.data?.message || 'Impossible de mettre à jour ce rendez-vous.');
    }
  };

  const currentLocation = useMemo(() => {
    if (!selectedLocationId) return null;
    return locations.find((item) => (item._id || item.id) === selectedLocationId) ?? selectedLocation;
  }, [locations, selectedLocation, selectedLocationId]);

  const hasLocations = locations.length > 0;

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white px-8 py-10 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1 text-sm font-medium text-emerald-700">
              <ShieldCheck className="h-4 w-4" /> Nouveauté Chef à domicile
            </span>
            <h1 className="text-3xl font-semibold text-gray-900">
              Accueillez vos clients directement dans votre domicile
            </h1>
            <p className="max-w-2xl text-sm text-gray-600">
              Déclarez votre lieu d'accueil, configurez vos disponibilités et recevez des demandes de rendez-vous pour des expériences culinaires exclusives chez vous.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-emerald-700">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm">
                <MapPin className="h-4 w-4" /> Adresse privée sécurisée
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-sm">
                <CheckCircle2 className="h-4 w-4" /> Gestion des demandes centralisée
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedLocation(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700"
          >
            <PlusCircle className="mr-2 h-5 w-5" /> Créer un lieu d'accueil
          </button>
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
          {feedback.type === 'success' ? <CheckCircle2 className="mt-0.5 h-4 w-4" /> : <AlertCircle className="mt-0.5 h-4 w-4" />}
          <p>{feedback.message}</p>
        </div>
      )}

      {responseError && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4" />
          <p>{responseError}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white py-20 text-gray-500">
          <Loader2 className="mr-3 h-5 w-5 animate-spin text-emerald-500" /> Chargement de vos données d'accueil...
        </div>
      ) : (
        <div className="space-y-12">
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">Vos lieux d'accueil</h2>
              {hasLocations && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLocation(null);
                    setIsFormOpen(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                >
                  <PlusCircle className="h-4 w-4" /> Ajouter un lieu
                </button>
              )}
            </div>

            {hasLocations ? (
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                {locations.map((location) => (
                  <ChefHomeLocationCard
                    key={location._id || location.id}
                    location={location}
                    onEdit={(item) => {
                      setSelectedLocation(item);
                      setIsFormOpen(true);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-10 py-16 text-center">
                <MapPin className="mx-auto h-12 w-12 text-emerald-500" />
                <h3 className="mt-4 text-xl font-semibold text-gray-900">Déclarez votre premier lieu d'accueil</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Ajoutez les informations de votre domicile pour permettre aux clients de prendre rendez-vous directement chez vous.
                </p>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(true)}
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Commencer
                </button>
              </div>
            )}
          </section>

          {isFormOpen && (
            <section className="rounded-3xl border border-gray-100 bg-white p-8 shadow-lg">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {currentLocation ? 'Modifier votre lieu' : 'Créer un nouveau lieu'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Décrivez votre espace et vos conditions d'accueil pour rassurer vos futurs clients.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setSelectedLocation(null);
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Fermer
                </button>
              </div>

              <ChefHomeLocationForm
                initialValues={currentLocation ?? undefined}
                onSubmit={handleCreateOrUpdate}
                onCancel={() => {
                  setIsFormOpen(false);
                  setSelectedLocation(null);
                }}
                isSubmitting={isSubmitting}
              />
            </section>
          )}

          <section className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Demandes de rendez-vous</h2>
              <p className="text-sm text-gray-500">
                Gérez ici les demandes pour des expériences à domicile. Confirmez ou refusez selon vos disponibilités.
              </p>
            </div>
            <ChefHomeAppointmentBoard appointments={appointments} onRespond={handleRespond} />
          </section>
        </div>
      )}
    </div>
  );
};

export default ChefHomeHostingPage;