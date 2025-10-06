import React, { useMemo, useState } from 'react';
import { Calendar, CheckCircle, Clock, Mail, MapPin, UserRound, Users, XCircle } from 'lucide-react';
import type { ChefHomeAppointment, ChefHomeAppointmentStatus } from '../../types/chefHome';

interface ChefHomeAppointmentBoardProps {
  appointments: ChefHomeAppointment[];
  onRespond?: (appointmentId: string, status: ChefHomeAppointmentStatus) => Promise<void> | void;
}

const statusLabels: Record<ChefHomeAppointmentStatus, string> = {
  pending: 'En attente',
  accepted: 'Accepté',
  declined: 'Refusé',
  cancelled: 'Annulé'
};

const statusStyles: Record<ChefHomeAppointmentStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  accepted: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  declined: 'bg-red-100 text-red-700 border-red-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200'
};

const ChefHomeAppointmentBoard: React.FC<ChefHomeAppointmentBoardProps> = ({ appointments, onRespond }) => {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const groupedAppointments = useMemo(() => {
    const pending = appointments.filter((appointment) => appointment.status === 'pending');
    const upcoming = appointments.filter((appointment) => appointment.status === 'accepted');
    const history = appointments.filter((appointment) => appointment.status === 'declined' || appointment.status === 'cancelled');

    return { pending, upcoming, history };
  }, [appointments]);

  const handleRespond = async (appointmentId: string, status: ChefHomeAppointmentStatus) => {
    if (!onRespond) return;
    setUpdatingId(appointmentId);
    try {
      await onRespond(appointmentId, status);
    } finally {
      setUpdatingId(null);
    }
  };

  const renderAppointmentCard = (appointment: ChefHomeAppointment) => {
    const location = typeof appointment.location === 'string' ? undefined : appointment.location;
    const client = typeof appointment.client === 'string' ? undefined : appointment.client;
    const date = new Date(appointment.requestedDate);

    return (
      <div
        key={appointment._id || appointment.id}
        className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[appointment.status]}`}>
              {statusLabels[appointment.status]}
            </span>
            <p className="text-sm text-gray-500">{location?.title ?? 'Lieu supprimé'}</p>
          </div>
          {onRespond && appointment.status === 'pending' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={updatingId === (appointment._id || appointment.id)}
                onClick={() => handleRespond(appointment._id || appointment.id || '', 'declined')}
                className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
              >
                <XCircle className="h-4 w-4" /> Refuser
              </button>
              <button
                type="button"
                disabled={updatingId === (appointment._id || appointment.id)}
                onClick={() => handleRespond(appointment._id || appointment.id || '', 'accepted')}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                <CheckCircle className="h-4 w-4" /> Confirmer
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Calendar className="h-4 w-4 text-emerald-500" />
              <span>{date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Clock className="h-4 w-4 text-emerald-500" />
              <span>
                {appointment.requestedTime.start} - {appointment.requestedTime.end}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Users className="h-4 w-4 text-emerald-500" />
              <span>{appointment.guests} convive{appointment.guests > 1 ? 's' : ''}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <UserRound className="h-4 w-4 text-emerald-500" />
              <span>{client?.name ?? 'Client supprimé'}</span>
            </div>
            {client && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Mail className="h-4 w-4 text-emerald-500" />
                <span>{client.email}</span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-emerald-500" />
                <span>{location.address.city}</span>
              </div>
            )}
          </div>
        </div>

        {appointment.message && (
          <div className="rounded-xl bg-emerald-50/60 px-4 py-3 text-sm text-emerald-800">
            <p className="font-medium">Message du client</p>
            <p className="mt-1 whitespace-pre-line">{appointment.message}</p>
          </div>
        )}
      </div>
    );
  };

  const renderSection = (title: string, items: ChefHomeAppointment[], emptyMessage: string) => (
    <section className="space-y-4">
      <header>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{emptyMessage}</p>
      </header>
      {items.length ? (
        <div className="space-y-4">
          {items.map((appointment) => renderAppointmentCard(appointment))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-500">
          Aucune donnée pour le moment.
        </div>
      )}
    </section>
  );

  return (
    <div className="space-y-10">
      {renderSection('Demandes en attente', groupedAppointments.pending, 'Les nouvelles demandes apparaissent ici.')}
      {renderSection('Rendez-vous confirmés', groupedAppointments.upcoming, 'Vos rendez-vous acceptés apparaîtront ici.')}
      {renderSection('Historique', groupedAppointments.history, 'Retrouvez vos demandes refusées ou annulées.')}
    </div>
  );
};

export default ChefHomeAppointmentBoard;