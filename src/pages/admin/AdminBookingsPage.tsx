import React, { useState, useEffect } from 'react';
import { Eye, CalendarDays, Users, Clock, Receipt, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { adminService, AdminBooking } from '../../services/adminService';

const BookingDetailModal: React.FC<{ booking: AdminBooking; onClose: () => void }> = ({ booking, onClose }) => {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'deposit_paid': return 'bg-emerald-100 text-emerald-700';
      case 'refunded': return 'bg-red-100 text-red-700';
      case 'paid': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Détails de la réservation</h2>
            <p className="text-sm text-gray-500">
              Créée le {formatDate(booking.createdAt)}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-6 py-6">
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase">Client</h3>
            <p className="text-lg font-semibold text-gray-900">{booking.client.name}</p>
            <p className="text-sm text-gray-600">{booking.client.email}</p>
            {booking.client.phone && (
              <p className="text-sm text-gray-500">{booking.client.phone}</p>
            )}
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase">Chef</h3>
            <p className="text-lg font-semibold text-gray-900">{booking.chef.name}</p>
            <p className="text-sm text-gray-600">{booking.chef.email}</p>
            {booking.chef.phone && (
              <p className="text-sm text-gray-500">{booking.chef.phone}</p>
            )}
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase">Statut</h3>
            <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(booking.status)}`}>
              {booking.status}
            </span>
            <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(booking.payment.status)}`}>
              Paiement : {booking.payment.status}
            </span>
          </div>
        </div>

        <div className="px-6 pb-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-100 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase flex items-center space-x-2">
                <CalendarDays className="h-4 w-4" />
                <span>Évènement</span>
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  Date : {formatDate(booking.eventDetails.date)} à {booking.eventDetails.startTime || '—'}
                </p>
                <p>Durée : {booking.eventDetails.duration} h</p>
                <p>Convives : {booking.eventDetails.guests}</p>
                <p>Type : {booking.eventDetails.eventType || booking.serviceType}</p>
                <p>
                  Adresse : {booking.location.address}, {booking.location.zipCode} {booking.location.city}
                </p>
              </div>
            </div>

            <div className="border border-gray-100 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase flex items-center space-x-2">
                <Receipt className="h-4 w-4" />
                <span>Facturation & paiement</span>
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-center justify-between">
                  <span>Prix de base</span>
                  <strong>{booking.pricing.basePrice.toFixed(2)}€</strong>
                </p>
                <p className="flex items-center justify-between">
                  <span>Frais de service</span>
                  <strong>{booking.pricing.serviceFee.toFixed(2)}€</strong>
                </p>
                <p className="flex items-center justify-between text-gray-800">
                  <span>Total</span>
                  <strong>{booking.pricing.totalAmount.toFixed(2)}€</strong>
                </p>
                {booking.pricing.depositAmount && (
                  <p className="flex items-center justify-between text-emerald-600">
                    <span>Acompte (20%)</span>
                    <strong>{booking.pricing.depositAmount.toFixed(2)}€</strong>
                  </p>
                )}
                <p className="flex items-center justify-between text-sm">
                  <span>Solde à verser</span>
                  <strong>{booking.pricing.remainingBalance.toFixed(2)}€</strong>
                </p>
                {booking.payment.depositPaidAt && (
                  <p className="text-xs text-gray-500">
                    Acompte reçu le {formatDate(booking.payment.depositPaidAt)}
                  </p>
                )}
                {booking.payment.refundAmount && booking.payment.refundedAt && (
                  <p className="text-xs text-red-600">
                    Remboursement de {booking.payment.refundAmount.toFixed(2)}€ le {formatDate(booking.payment.refundedAt)}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="border border-gray-100 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Historique</h3>
            <div className="space-y-2">
              {booking.timeline.length === 0 ? (
                <p className="text-sm text-gray-500">Aucun événement enregistré.</p>
              ) : (
                booking.timeline.map((entry, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="mt-1">
                      {entry.status === 'confirmed' ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{entry.status}</p>
                      {entry.note && <p className="text-sm text-gray-600">{entry.note}</p>}
                      <p className="text-xs text-gray-400">{formatDateTime(entry.timestamp)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);

  const fetchBookings = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getBookings({ page, limit: 10 });
      setBookings(response.bookings);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError("Impossible de récupérer les réservations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(1);
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    fetchBookings(newPage);
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'deposit_paid': return 'bg-green-100 text-green-700';
      case 'refunded': return 'bg-red-100 text-red-700';
      case 'paid': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Suivi des Réservations</h1>
          <p className="text-sm text-gray-500">
            Visualisez les prestations en cours, les paiements et le statut des missions.
          </p>
        </div>
        <button
          type="button"
          onClick={() => fetchBookings(pagination.page)}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Eye className="h-4 w-4 mr-2" />
          )} 
          Rafraîchir
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Chef
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Service
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Acompte
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Chargement des réservations...
                  </div>
                </td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  Aucune réservation trouvée.
                </td>
              </tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">{booking.client.name}</div>
                    <div className="text-xs text-gray-500">{booking.client.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">{booking.chef.name}</div>
                    <div className="text-xs text-gray-500">{booking.chef.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {booking.eventDetails.date 
                      ? new Date(booking.eventDetails.date).toLocaleDateString('fr-FR')
                      : '—'
                    }
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>{booking.eventDetails.guests} pers.</span>
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{booking.eventDetails.duration}h</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{booking.serviceType}</p>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                    {booking.pricing.totalAmount.toFixed(2)}€
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">
                    {booking.pricing.depositAmount ? `${booking.pricing.depositAmount.toFixed(2)}€` : '—'}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusColor(booking.payment.status)}`}>
                      {booking.payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-2" /> Détails
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Précédent
          </button>
          <span className="text-sm text-gray-500">
            Page {pagination.page} sur {pagination.pages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Suivant
          </button>
        </div>
      )}

      {selectedBooking && (
        <BookingDetailModal 
          booking={selectedBooking} 
          onClose={() => setSelectedBooking(null)} 
        />
      )}
    </div>
  );
};

export default AdminBookingsPage;