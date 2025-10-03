import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Euro,
  PiggyBank,
  FileText,
  CalendarCheck,
  Star,
  TrendingUp,
  Calendar,
  Receipt,
  AlertCircle,
  Building2
} from 'lucide-react';
import { chefService } from '../../services/chefService';
import { useAuth } from '../../hooks/useAuth';
import { ChefEarningsResponse, ChefEarningsBooking, ChefInvoiceSummary } from '../../types';

const formatCurrency = (value: number): string => value.toLocaleString('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2
});

const formatDate = (value?: string | null): string => {
  if (!value) {
    return '—';
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleDateString('fr-FR');
};

const formatServiceType = (value: string): string => value.replace(/-/g, ' ');

const bookingStatusLabels: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  in_progress: 'En cours',
  completed: 'Terminée',
  cancelled: 'Annulée',
  disputed: 'Litige'
};

const invoiceStatusLabels: Record<'paid' | 'pending' | 'overdue', string> = {
  paid: 'Payée',
  pending: 'En attente',
  overdue: 'En retard'
};

const invoiceStatusClasses: Record<'paid' | 'pending' | 'overdue', string> = {
  paid: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  overdue: 'bg-red-100 text-red-700'
};

const ChefEarnings: React.FC = () => {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<ChefEarningsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('30d');

  const chefIdentifier = user?.id;

  const fetchEarnings = useCallback(async (targetChefId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await chefService.getChefEarnings(targetChefId, { period });
      setEarnings(data);
    } catch (err) {
      console.error('Failed to fetch earnings:', err);
      setError('Impossible de récupérer vos revenus pour le moment.');
      setEarnings(null);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    if (!chefIdentifier) {
      return;
    }
    fetchEarnings(chefIdentifier);
  }, [chefIdentifier, fetchEarnings]);

  const summary = earnings?.summary;
  const bookings = earnings?.bookings ?? [];
  const dailyEntries = useMemo(() => {
    if (!earnings) {
      return [];
    }
    return [...earnings.timeline.daily].sort((a, b) => {
      const aDate = new Date(a.date).getTime();
      const bDate = new Date(b.date).getTime();
      return bDate - aDate;
    });
  }, [earnings]);

  const sortedInvoices = useMemo(() => {
    const source = earnings?.invoices ?? [];
    if (!source.length) {
      return [];
    }
    return [...source].sort((a, b) => {
      const aDate = a.issuedAt ? new Date(a.issuedAt).getTime() : 0;
      const bDate = b.issuedAt ? new Date(b.issuedAt).getTime() : 0;
      return bDate - aDate;
    });
  }, [earnings]);

  const summaryCards = [
    {
      id: 'totalGross',
      label: 'Revenus bruts',
      value: formatCurrency(summary?.totalGross ?? 0),
      description: 'Total encaissé avant commission',
      Icon: Euro,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50'
    },
    {
      id: 'totalNet',
      label: 'Revenus nets',
      value: formatCurrency(summary?.totalNet ?? 0),
      description: 'Vos gains après commission',
      Icon: PiggyBank,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-50'
    },
    {
      id: 'commission',
      label: 'Commission Chef@Home',
      value: formatCurrency(summary?.totalCommission ?? 0),
      description: 'Frais de plateforme retenus',
      Icon: FileText,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50'
    },
    {
      id: 'totalBookings',
      label: 'Missions terminées',
      value: (summary?.totalBookings ?? 0).toLocaleString('fr-FR'),
      description: 'Prestations finalisées sur la période',
      Icon: CalendarCheck,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50'
    },
    {
      id: 'averageRating',
      label: 'Note moyenne',
      value: summary?.averageRating != null ? summary.averageRating.toFixed(2) : '—',
      description: 'Avis clients sur vos missions',
      Icon: Star,
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-50'
    },
    {
      id: 'averagePerMission',
      label: 'Gain moyen/mission',
      value: formatCurrency(summary?.averagePerMission ?? 0),
      description: 'Revenu net par prestation',
      Icon: TrendingUp,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50'
    }
  ];

  const netForBooking = (booking: ChefEarningsBooking): number => booking.earnings - booking.commission;
  const netForInvoice = (invoice: ChefInvoiceSummary): number => invoice.earnings - invoice.commission;

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-2xl shadow-inner border border-dashed border-gray-200 p-10 text-center">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-pulse" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Chargement de vos revenus…</h3>
          <p className="text-gray-600">Nous analysons vos missions et factures.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Revenus & Factures</h1>
          <p className="text-gray-600 mt-1">Suivez vos revenus, commissions et factures clients en temps réel.</p>
          {earnings?.period?.start && (
            <p className="text-xs text-gray-500 mt-2">
              Période analysée : {formatDate(earnings.period.start)} → {formatDate(earnings.period.end)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor="period" className="text-sm text-gray-600">Période</label>
          <select
            id="period"
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">90 derniers jours</option>
            <option value="1y">1 an</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {summaryCards.map(({ id, label, value, description, Icon, iconColor, iconBg }) => (
          <div key={id} className="bg-white rounded-2xl shadow p-6 border border-gray-100 flex items-start gap-4">
            <div className={`p-3 rounded-xl ${iconBg}`}>
              <Icon className={`h-6 w-6 ${iconColor}`} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="bg-white rounded-2xl shadow-lg p-6 space-y-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-emerald-500" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Revenus par jour</h2>
              <p className="text-sm text-gray-500">Comparatif des revenus bruts, nets et commissions sur la période sélectionnée.</p>
            </div>
          </div>
          <span className="text-sm font-medium text-gray-500">{dailyEntries.length} enregistrements</span>
        </div>

        {dailyEntries.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center">
            <p className="text-sm text-gray-500">Aucune mission terminée sur la période sélectionnée.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Missions</th>
                  <th className="px-4 py-3">Brut</th>
                  <th className="px-4 py-3">Commission</th>
                  <th className="px-4 py-3">Net</th>
                </tr>
              </thead>
              <tbody>
                {dailyEntries.slice(0, 10).map((entry) => (
                  <tr key={entry.date} className="border-t border-gray-100">
                    <td className="px-4 py-4 font-medium text-gray-900">{formatDate(entry.date)}</td>
                    <td className="px-4 py-4 text-gray-600">{entry.bookingCount}</td>
                    <td className="px-4 py-4 text-gray-900">{formatCurrency(entry.totalGross)}</td>
                    <td className="px-4 py-4 text-amber-600">{formatCurrency(entry.totalCommission)}</td>
                    <td className="px-4 py-4 text-emerald-600 font-semibold">{formatCurrency(entry.totalNet)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="bg-white rounded-2xl shadow-lg p-6 space-y-6 border border-gray-100">
        <div className="flex items-center gap-3">
          <Receipt className="h-6 w-6 text-emerald-500" />
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Détails des missions rémunérées</h2>
            <p className="text-sm text-gray-500">Chaque mission terminée avec le détail des revenus et commissions associées.</p>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center">
            <AlertCircle className="h-6 w-6 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Aucune mission rémunérée sur la période sélectionnée.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Revenu net</th>
                  <th className="px-4 py-3">Commission</th>
                  <th className="px-4 py-3">Facture</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => {
                  const net = netForBooking(booking);
                  const statusLabel = bookingStatusLabels[booking.status] || booking.status;
                  const invoice = booking.invoice;

                  return (
                    <tr key={booking.id} className="border-t border-gray-100 hover:bg-gray-50/60">
                      <td className="px-4 py-4 font-medium text-gray-900">{formatDate(booking.eventDate || booking.createdAt)}</td>
                      <td className="px-4 py-4 text-gray-700">
                        <div className="flex items-center gap-2">
                          <span>{booking.client.name}</span>
                          {booking.isB2B && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                              <Building2 className="h-3 w-3" /> B2B
                            </span>
                          )}
                        </div>
                        {booking.client.company && (
                          <p className="text-xs text-gray-500 mt-1">{booking.client.company}</p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-gray-600 capitalize">{formatServiceType(booking.serviceType)}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-emerald-600 font-semibold">{formatCurrency(net)}</td>
                      <td className="px-4 py-4 text-amber-600">{formatCurrency(booking.commission)}</td>
                      <td className="px-4 py-4">
                        {invoice ? (
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-gray-900">{invoice.number}</p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${invoiceStatusClasses[invoice.status]}`}>
                              {invoiceStatusLabels[invoice.status]}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="bg-white rounded-2xl shadow-lg p-6 space-y-6 border border-gray-100">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-emerald-500" />
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Factures associées</h2>
            <p className="text-sm text-gray-500">Suivi des factures générées pour vos missions B2B.</p>
          </div>
        </div>

        {sortedInvoices.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center">
            <AlertCircle className="h-6 w-6 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Aucune facture disponible sur la période sélectionnée.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Numéro</th>
                  <th className="px-4 py-3">Mission / Client</th>
                  <th className="px-4 py-3">Émise le</th>
                  <th className="px-4 py-3">Échéance</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Montant TTC</th>
                  <th className="px-4 py-3">Revenu net</th>
                  <th className="px-4 py-3">Commission</th>
                </tr>
              </thead>
              <tbody>
                {sortedInvoices.map((invoice) => (
                  <tr key={invoice.number} className="border-t border-gray-100">
                    <td className="px-4 py-4 font-semibold text-gray-900">{invoice.number}</td>
                    <td className="px-4 py-4 text-gray-700">
                      <div>{invoice.clientName}</div>
                      {invoice.company && <p className="text-xs text-gray-500 mt-1">{invoice.company}</p>}
                    </td>
                    <td className="px-4 py-4 text-gray-600">{formatDate(invoice.issuedAt)}</td>
                    <td className="px-4 py-4 text-gray-600">{formatDate(invoice.dueDate)}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${invoiceStatusClasses[invoice.status]}`}>
                        {invoiceStatusLabels[invoice.status]}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-900">{formatCurrency(invoice.totalAmount)}</td>
                    <td className="px-4 py-4 text-emerald-600 font-semibold">{formatCurrency(netForInvoice(invoice))}</td>
                    <td className="px-4 py-4 text-amber-600">{formatCurrency(invoice.commission)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default ChefEarnings;
