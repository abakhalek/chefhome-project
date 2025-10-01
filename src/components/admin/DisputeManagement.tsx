import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, MessageSquare, X } from 'lucide-react';

export type Dispute = {
  id: string;
  client: string;
  chef: string;
  issue: string;
  description: string;
  date: string;
  status: 'open' | 'resolved' | 'pending';
  priority: 'high' | 'medium' | 'low';
  amount: string;
  bookingId: string;
};

interface DisputeManagementProps {
  disputes: Dispute[];
  onResolveDispute: (disputeId: string, resolution: string, refundAmount?: number) => void;
  onContactParties: (disputeId: string) => void;
  loading: boolean;
}

const ResolveDisputeModal: React.FC<{ dispute: Dispute; onClose: () => void; onResolve: (resolution: string, refundAmount?: number) => void; }> = ({ dispute, onClose, onResolve }) => {
  const [resolution, setResolution] = useState('');
  const [refundAmount, setRefundAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onResolve(resolution, refundAmount ? parseFloat(refundAmount) : undefined);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Resolve Dispute #{dispute.id}</h2>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Resolution Note</label>
            <textarea
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="w-full p-2 border rounded-lg mt-1"
              rows={4}
              placeholder="Explain the resolution..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Refund Amount (€)</label>
            <input
              type="number"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              className="w-full p-2 border rounded-lg mt-1"
              placeholder="Optional refund amount"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg">Resolve</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const DisputeManagement: React.FC<DisputeManagementProps> = ({ disputes, onResolveDispute, onContactParties, loading }) => {
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);

  if (loading) {
    return <div className="text-center p-8">Loading disputes...</div>;
  }

  if (disputes.length === 0) {
    return <div className="text-center p-8 text-gray-500">No disputes found.</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dispute Management</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Dispute ID</th>
              <th scope="col" className="px-6 py-3">Client & Chef</th>
              <th scope="col" className="px-6 py-3">Issue</th>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Amount</th>
              <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {disputes.map((dispute) => (
              <tr key={dispute.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">#{dispute.id.substring(0, 6)}...</td>
                <td className="px-6 py-4">
                  <div>{dispute.client}</div>
                  <div className="text-xs text-gray-500">vs {dispute.chef}</div>
                </td>
                <td className="px-6 py-4">{dispute.issue}</td>
                <td className="px-6 py-4">{new Date(dispute.date).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${dispute.status === 'open' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {dispute.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium">{dispute.amount}</td>
                <td className="px-6 py-4 space-x-2">
                  <button onClick={() => setSelectedDispute(dispute)} className="font-medium text-blue-600 hover:underline">Resolve</button>
                  <button onClick={() => onContactParties(dispute.id)} className="font-medium text-gray-600 hover:underline">Contact</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedDispute && (
        <ResolveDisputeModal
          dispute={selectedDispute}
          onClose={() => setSelectedDispute(null)}
          onResolve={(resolution, refundAmount) => {
            onResolveDispute(selectedDispute.id, resolution, refundAmount);
            setSelectedDispute(null);
          }}
        />
      )}
    </div>
  );
};
