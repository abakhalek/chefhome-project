import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { DisputeManagement } from '../../components/admin/DisputeManagement';
import { Booking } from '../../services/adminService';

const AdminDisputes: React.FC = () => {
  const [disputes, setDisputes] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      // Assuming getDisputes fetches bookings with disputes
      const { disputes: fetchedDisputes } = await adminService.getDisputes();
      setDisputes(fetchedDisputes);
    } catch (err) {
      setError('Failed to fetch disputes');
      console.error(err);
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
    const dispute = disputes.find(d => d._id === disputeId);
    if (dispute) {
      const clientEmail = dispute.client.email;
      const chefEmail = dispute.chef.user.email;
      window.location.href = `mailto:${clientEmail},${chefEmail}?subject=Regarding your dispute (ID: ${disputeId})`;
    }
  };

  const mapBookingsToDisputes = (bookings: Booking[]) => {
    return bookings.map(booking => ({
      id: booking._id,
      client: booking.client.name,
      chef: booking.chef.user.name,
      issue: `Dispute for booking #${booking._id}`,
      description: `Booking on ${new Date(booking.eventDetails.date).toLocaleDateString()}`,
      date: booking.createdAt,
      status: booking.status === 'disputed' ? 'open' : booking.status, // Example mapping
      priority: 'high', // This could be determined by some logic
      amount: `${booking.pricing.totalAmount}€`,
      bookingId: booking._id
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
