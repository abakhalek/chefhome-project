
import React, { useState, useEffect } from 'react';
import { clientService, ClientProfile, ClientBooking } from '../../services/clientService';
import { Link } from 'react-router-dom';
import { User, Calendar, Euro, ChefHat, MessageCircle, XCircle } from 'lucide-react';

const ClientDashboard: React.FC = () => {
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<ClientBooking[]>([]);
  const [pastBookings, setPastBookings] = useState<ClientBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profileData, upcomingBookingsData, pastBookingsData] = await Promise.all([
          clientService.getProfile(),
          clientService.getBookings({ status: 'confirmed' }),
          clientService.getBookings({ status: 'completed' }),
        ]);
        setProfile(profileData);
        setUpcomingBookings(upcomingBookingsData.bookings || []);
        setPastBookings(pastBookingsData.bookings || []);
      } catch (error) {
        console.error("Failed to fetch client dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")) {
      try {
        await clientService.cancelBooking(bookingId);
        alert("Réservation annulée avec succès !");
        // Refresh bookings
        const upcomingBookingsData = await clientService.getBookings({ status: 'confirmed' });
        setUpcomingBookings(upcomingBookingsData.bookings || []);
      } catch (error) {
        console.error("Failed to cancel booking:", error);
        alert("Erreur lors de l'annulation de la réservation.");
      }
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (!profile) {
    return <div className="p-6 text-center">Impossible de charger le profil client.</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Mon Tableau de Bord Client</h1>

      {/* Profile Overview and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Bienvenue, {profile.name} !</h2>
          <p className="text-gray-600 mb-4">Gérez vos réservations et découvrez de nouveaux chefs.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/chefs" className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2">
              <ChefHat size={20} />
              <span>Réserver un Chef</span>
            </Link>
            <Link to="/client-dashboard/profile" className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
              <User size={20} />
              <span>Mon Profil</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Statistiques Rapides</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Réservations à venir</span>
              <span className="font-bold text-blue-600">{upcomingBookings.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Réservations terminées</span>
              <span className="font-bold text-green-600">{pastBookings.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Dépenses totales</span>
              <span className="font-bold text-purple-600">{pastBookings.reduce((sum, booking) => sum + booking.totalAmount, 0).toFixed(2)}€</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Bookings */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Mes Prochaines Réservations</h2>
        {upcomingBookings.length === 0 ? (
          <p className="text-gray-500">Vous n'avez aucune réservation à venir.</p>
        ) : (
          <div className="space-y-4">
            {upcomingBookings.map(booking => (
              <div key={booking.id} className="border border-blue-200 rounded-lg p-4 bg-blue-50 flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-900">Chef {booking.chef.name}</p>
                  <p className="text-sm text-gray-600">{booking.serviceType} le {new Date(booking.date).toLocaleDateString()} à {booking.time}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-green-600">{booking.totalAmount.toFixed(2)}€</span>
                  <button onClick={() => handleCancelBooking(booking.id)} className="text-red-500 hover:text-red-700"><XCircle size={20} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking History */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Historique des Réservations</h2>
        {pastBookings.length === 0 ? (
          <p className="text-gray-500">Vous n'avez pas encore d'historique de réservations.</p>
        ) : (
          <div className="space-y-4">
            {pastBookings.map(booking => (
              <div key={booking.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-900">Chef {booking.chef.name}</p>
                  <p className="text-sm text-gray-600">{booking.serviceType} le {new Date(booking.date).toLocaleDateString()} à {booking.time}</p>
                </div>
                <span className="font-bold text-green-600">{booking.totalAmount.toFixed(2)}€</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
