import React, { useState, useEffect } from 'react';
import { b2bService } from '../../services/b2bService';
import { FileText, Download } from 'lucide-react';

const B2BInvoicing: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const { invoices } = await b2bService.getInvoices({ status: filterStatus || undefined });
      setInvoices(invoices);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [filterStatus]);

  const handleDownloadInvoice = (invoiceId: string) => {
    alert(`Téléchargement de la facture ${invoiceId} (fonctionnalité à implémenter)`);
    // In a real app, you would call an API to get the invoice file
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Facturation</h1>
      
      <div className="mb-6">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="p-3 border rounded-lg">
          <option value="">Tous les statuts</option>
          <option value="paid">Payée</option>
          <option value="pending">En attente</option>
          <option value="overdue">En retard</option>
        </select>
      </div>

      {invoices.length === 0 ? (
        <p className="text-gray-500">Aucune facture trouvée.</p>
      ) : (
        <div className="space-y-6">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="bg-white rounded-2xl shadow-lg p-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Facture #{invoice.id}</h2>
                <p className="text-gray-600">Montant: {invoice.amount}€</p>
                <p className="text-gray-700">Statut: {invoice.status}</p>
              </div>
              <button onClick={() => handleDownloadInvoice(invoice.id)} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center space-x-2">
                <Download size={18} /><span>Télécharger</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default B2BInvoicing;