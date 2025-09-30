import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Eye } from 'lucide-react';

const AdminBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  const fetchBookings = async (page = 1) => {
    setLoading(true);
    try {
      const { bookings, pagination } = await adminService.getBookings({ page, limit: 10 });
      setBookings(bookings);
      setPagination(pagination);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(1);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestion des Réservations</h1>
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Chef</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8">Loading...</td></tr>
            ) : (
              bookings.map((booking) => (
                <tr key={booking._id}>
                  <td className="px-6 py-4">{booking.client?.name}</td>
                  <td className="px-6 py-4">{booking.chef?.user?.name}</td>
                  <td className="px-6 py-4">{new Date(booking.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td className="px-6 py-4">{booking.pricing?.totalAmount.toFixed(2)}€</td>
                  <td className="px-6 py-4">{booking.status}</td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600"><Eye size={18} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBookingsPage;