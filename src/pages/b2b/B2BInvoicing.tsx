import React, { useState, useEffect, useCallback } from 'react';
import { b2bService, B2BInvoice } from '../../services/b2bService';
import { Download } from 'lucide-react';

const B2BInvoicing: React.FC = () => {
  const [invoices, setInvoices] = useState<B2BInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const { invoices: fetchedInvoices } = await b2bService.getInvoices({ status: filterStatus || undefined });
      setInvoices(fetchedInvoices);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      setDownloadingId(invoiceId);
      const blob = await b2bService.generateInvoice(invoiceId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `facture_${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download invoice:', error);
    } finally {
      setDownloadingId(null);
    }
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
                <p className="text-gray-600">Montant: {invoice.total?.toFixed(2) ?? '—'}€</p>
                <p className="text-gray-700">Statut: {invoice.status ?? 'Inconnu'}</p>
              </div>
              <button
                onClick={() => handleDownloadInvoice(invoice.id)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center space-x-2 disabled:opacity-50"
                disabled={downloadingId === invoice.id}
              >
                <Download size={18} /><span>{downloadingId === invoice.id ? 'Téléchargement...' : 'Télécharger'}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default B2BInvoicing;
