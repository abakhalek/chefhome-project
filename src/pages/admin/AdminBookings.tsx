import React, { useState, useEffect, useCallback } from 'react';
import { adminService, AdminBooking, PaginationData } from '../../services/adminService';
import { LoadingSpinner } from '../../components/common';

const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [pagination, setPagination] = useState<PaginationData | undefined>();
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 10, status: filterStatus };
      const data = await adminService.getBookings(params);
      setBookings(data.bookings);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterStatus]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Suivi des Réservations</h1>
        
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6">
            <select onChange={(e) => setFilterStatus(e.target.value)} value={filterStatus} className="border-gray-300 rounded-md">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="disputed">Disputed</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6 text-center"><LoadingSpinner /></div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chef</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4">{booking.client.name}</td>
                      <td className="px-6 py-4">{booking.chef.name}</td>
                      <td className="px-6 py-4">{new Date(booking.eventDetails.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">€{booking.pricing.totalAmount.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-end items-center gap-3 p-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border rounded disabled:opacity-50"
              >
                Précédent
              </button>
              <span className="text-sm text-gray-500">
                Page {currentPage} sur {pagination.pages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(page + 1, pagination.pages))}
                disabled={currentPage === pagination.pages}
                className="px-3 py-2 text-sm border rounded disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;
