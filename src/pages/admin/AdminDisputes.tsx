import React, { useState, useEffect } from 'react';
import { adminService, AdminBooking } from '../../services/adminService';
import { DisputeManagement } from '../../components/admin/DisputeManagement';

const AdminDisputes: React.FC = () => {
  const [disputes, setDisputes] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);


  const fetchDisputes = async () => {
    setLoading(true);
    try {
      // Assuming getDisputes fetches bookings with disputes
      const { disputes: fetchedDisputes } = await adminService.getDisputes();
      setDisputes(fetchedDisputes);
    } catch (err) {
      console.error('Failed to fetch disputes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleResolveDispute = async (disputeId: string, resolution: string, refundAmount?: number) => {
    try {
      await adminService.resolveDispute(disputeId, resolution, refundAmount);
      fetchDisputes(); // Refresh the list after resolving
    } catch (err) {
      console.error('Failed to resolve dispute:', err);
      alert('Failed to resolve dispute.');
    }
  };

  const handleContactParties = (disputeId: string) => {
    const dispute = disputes.find(d => d.id === disputeId);
    if (dispute) {
      const clientEmail = dispute.client.email;
      const chefEmail = dispute.chef.email;
      window.location.href = `mailto:${clientEmail},${chefEmail}?subject=Regarding your dispute (ID: ${disputeId})`;
    }
  };

  const mapBookingsToDisputes = (bookings: AdminBooking[]) => {
    return bookings.map(booking => ({
      id: booking.id,
      client: booking.client.name,
      chef: booking.chef.name,
      issue: `Dispute for booking #${booking.id}`,
      description: booking.eventDetails.date
        ? `Booking on ${new Date(booking.eventDetails.date).toLocaleDateString()}`
        : 'Date à préciser',
      date: booking.createdAt,
      status: booking.status === 'disputed' ? 'open' : booking.status, // Example mapping
      priority: 'high', // This could be determined by some logic
      amount: `${booking.pricing.totalAmount.toFixed(2)}€`,
      bookingId: booking.id
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DisputeManagement 
          disputes={mapBookingsToDisputes(disputes)}
          onResolveDispute={handleResolveDispute}
          onContactParties={handleContactParties}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default AdminDisputes;
