
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { addDays, format, isAfter, isWithinInterval, parseISO, startOfToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { chefService } from '../../services/chefService';
import { Booking, SearchFilters } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import {
  AlertCircle,
  Briefcase,
  Building2,
  Calendar,
  CalendarDays,
  CheckCircle,
  Clock,
  MapPin,
  MessageCircle,
  Search,
  Users,
  XCircle
} from 'lucide-react';

const ChefPlanning: React.FC = () => {
  const { user } = useAuth();
  const [missions, setMissions] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('');

  const chefIdentifier = user?.chefId || user?.id;

  const fetchMissions = useCallback(async () => {
    if (!chefIdentifier) {
      setMissions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const filters: SearchFilters = filterStatus ? { status: filterStatus } : {};
      const response = await chefService.getChefBookings(chefIdentifier, filters);
      setMissions(response.data || []);
    } catch (err) {
      console.error('Failed to fetch missions:', err);
      setError('Impossible de récupérer vos missions pour le moment.');
      setMissions([]);
    } finally {
      setLoading(false);
    }
  }, [chefIdentifier, filterStatus]);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  const handleMissionAction = async (missionId: string | undefined, status: 'confirmed' | 'cancelled') => {
    if (!missionId) {
      return;
    }

    try {
      await chefService.updateBookingStatus(missionId, status);
      fetchMissions();
    } catch (err) {
      console.error(`Failed to update mission ${missionId} status:`, err);
    }
  };

  const parseEventDate = (value?: string) => {
    if (!value) return null;
    try {
      const parsed = parseISO(value);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    } catch {
      return null;
    }
  };

  const getStatusStyles = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-600 border border-gray-200';
    }
  };

  const getStatusLabel = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'confirmed':
        return 'Confirmée';
      case 'in_progress':
        return 'En cours';
      case 'completed':
        return 'Terminée';
      case 'cancelled':
        return 'Annulée';
      case 'disputed':
        return 'Litige';
      default:
        return status;
    }
  };

  const getMissionKey = (mission: Booking) => mission.id || mission._id || `${mission.client?.id ?? 'client'}-${mission.eventDetails?.date ?? 'date'}`;

  const derived = useMemo(() => {
    const today = startOfToday();
    const endOfWeek = addDays(today, 7);

    const sortByDate = (a: Booking, b: Booking) => {
      const dateA = parseEventDate(a.eventDetails?.date) ?? new Date(0);
      const dateB = parseEventDate(b.eventDetails?.date) ?? new Date(0);
      return dateA.getTime() - dateB.getTime();
    };

    const sorted = [...missions].sort(sortByDate);

    const upcoming = sorted.filter((mission) => {
      const date = parseEventDate(mission.eventDetails?.date);
      if (!date) return false;
      return !isAfter(today, date) && mission.status !== 'cancelled';
    });

    const weeklyGroupedMap = upcoming
      .filter((mission) => {
        const date = parseEventDate(mission.eventDetails?.date);
        return date ? isWithinInterval(date, { start: today, end: endOfWeek }) : false;
      })
      .reduce<Record<string, { date: Date; items: Booking[] }>>((acc, mission) => {
        const date = parseEventDate(mission.eventDetails?.date);
        if (!date) return acc;
        const key = format(date, 'yyyy-MM-dd');
        if (!acc[key]) {
          acc[key] = { date, items: [] };
        }
        acc[key].items.push(mission);
        return acc;
      }, {});

    const weeklyGrouped = Object.values(weeklyGroupedMap).sort((a, b) => a.date.getTime() - b.date.getTime());

    const b2b = sorted.filter((mission) => mission.isB2B);
    const direct = sorted.filter((mission) => !mission.isB2B);
    const pending = sorted.filter((mission) => mission.status === 'pending');
    const pendingB2B = b2b.filter((mission) => mission.status === 'pending');

    return {
      sorted,
      upcoming,
      weeklyGrouped,
      b2b,
      direct,
      pending,
      pendingB2B,
      nextMission: upcoming[0] ?? null
    };
  }, [missions]);

  const renderMissionCard = (mission: Booking) => {
    const missionKey = getMissionKey(mission);
    const missionDate = parseEventDate(mission.eventDetails?.date);
    const formattedDate = missionDate
      ? format(missionDate, "EEEE d MMMM yyyy", { locale: fr })
      : 'Date à confirmer';
    const formattedBudget = typeof mission.pricing?.totalAmount === 'number'
      ? mission.pricing.totalAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
      : '—';
    const isPending = mission.status === 'pending';

    const cardClasses = `bg-white rounded-2xl shadow-lg p-6 border transition-colors ${mission.isB2B ? 'border-amber-200 hover:border-amber-300' : 'border-transparent hover:border-emerald-200'} ${isPending ? 'ring-1 ring-emerald-100 bg-emerald-50/40' : ''}`;

    return (
      <div key={missionKey} className={cardClasses}>
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyles(mission.status)}`}>
                {getStatusLabel(mission.status)}
              </span>
              <span className="text-sm text-gray-500 flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span className="capitalize">{formattedDate}</span>
              </span>
              {mission.eventDetails?.startTime && (
                <span className="text-sm text-gray-500 flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{mission.eventDetails.startTime}</span>
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-2xl font-semibold text-gray-900">{mission.client?.name || 'Client inconnu'}</h3>
                {mission.isB2B && (
                  <span className="px-2.5 py-1 text-xs font-semibold tracking-wide uppercase bg-amber-100 text-amber-700 rounded-full">
                    Mission B2B
                  </span>
                )}
              </div>
              <p className="text-gray-600 capitalize">{mission.serviceType?.replace(/-/g, ' ')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-emerald-500" />
                <span>{mission.eventDetails?.guests ?? 0} convives</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-emerald-500" />
                <span>{mission.location?.address || 'Adresse à confirmer'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-emerald-500" />
                <span>Budget : {formattedBudget}</span>
              </div>
            </div>

            {mission.isB2B && (mission.company?.name || mission.company?.contactPerson) && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800 flex items-start gap-3">
                <Building2 className="h-4 w-4 mt-1" />
                <div>
                  <p className="font-semibold">{mission.company?.name || 'Client B2B'}</p>
                  {mission.company?.contactPerson && (
                    <p>Contact : {mission.company.contactPerson}</p>
                  )}
                </div>
              </div>
            )}

            {mission.menu?.customRequests && (
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-700">
                <p className="font-medium text-gray-900 mb-1 flex items-center space-x-2">
                  <MessageCircle className="h-4 w-4 text-emerald-500" />
                  <span>Demande spéciale</span>
                </p>
                <p>{mission.menu.customRequests}</p>
              </div>
            )}
          </div>

          <div className="w-full lg:w-56 space-y-3">
            {isPending && (
              <>
                <button
                  onClick={() => handleMissionAction(mission.id || mission._id, 'confirmed')}
                  className="w-full bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Accepter la mission</span>
                </button>
                <button
                  onClick={() => handleMissionAction(mission.id || mission._id, 'cancelled')}
                  className="w-full bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Décliner</span>
                </button>
              </>
            )}

            {!isPending && mission.status === 'confirmed' && (
              <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-center">
                <CheckCircle className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm text-emerald-700">Mission confirmée. Préparez votre menu et contactez le client si nécessaire.</p>
              </div>
            )}

            {!isPending && mission.status === 'completed' && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
                <CheckCircle className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <p className="text-sm text-blue-700">Mission terminée. Pensez à recueillir un avis auprès du client.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-2xl shadow-inner border border-dashed border-gray-200 p-10 text-center">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4 animate-pulse" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Chargement du planning…</h3>
          <p className="text-gray-600">Nous récupérons vos missions en cours.</p>
        </div>
      </div>
    );
  }

  const weeklyMissionsCount = derived.weeklyGrouped.reduce((acc, group) => acc + group.items.length, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Planning & Missions</h1>
          <p className="text-gray-600 mt-1">Gardez une vue claire sur votre agenda et vos missions B2B.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total missions</p>
              <p className="text-2xl font-semibold text-gray-900">{missions.length}</p>
            </div>
            <Calendar className="h-8 w-8 text-emerald-500" />
          </div>
          {derived.nextMission && (
            <p className="mt-3 text-xs text-gray-500">
              Prochaine : {format(parseEventDate(derived.nextMission.eventDetails.date) ?? new Date(), "EEEE d MMMM", { locale: fr })}
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Semaine en cours</p>
              <p className="text-2xl font-semibold text-gray-900">{weeklyMissionsCount}</p>
            </div>
            <CalendarDays className="h-8 w-8 text-emerald-500" />
          </div>
          <p className="mt-3 text-xs text-gray-500">Missions planifiées sur 7 jours</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Missions en attente</p>
              <p className="text-2xl font-semibold text-gray-900">{derived.pending.length}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-amber-500" />
          </div>
          <p className="mt-3 text-xs text-gray-500">Validez rapidement vos nouvelles demandes.</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Missions B2B</p>
              <p className="text-2xl font-semibold text-gray-900">{derived.b2b.length}</p>
            </div>
            <Briefcase className="h-8 w-8 text-emerald-500" />
          </div>
          <p className="mt-3 text-xs text-gray-500">{derived.pendingB2B.length} en attente d’action</p>
        </div>
      </div>

      <section className="bg-white rounded-2xl shadow-lg p-6 space-y-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-6 w-6 text-emerald-500" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Planning de la semaine</h2>
              <p className="text-sm text-gray-500">Vos missions confirmées pour les 7 prochains jours.</p>
            </div>
          </div>
          <span className="text-sm font-medium text-gray-500">{weeklyMissionsCount} mission(s)</span>
        </div>

        {weeklyMissionsCount === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center">
            <p className="text-sm text-gray-500">Aucune mission planifiée cette semaine.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {derived.weeklyGrouped.map((group) => (
              <div key={group.date.toISOString()} className="border border-gray-100 rounded-xl p-4 bg-gray-50/60">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-gray-900 capitalize">
                      {format(group.date, "EEEE d MMMM", { locale: fr })}
                    </p>
                    <p className="text-sm text-gray-500">{group.items.length} mission(s)</p>
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  {group.items.map((mission) => {
                    const missionKey = getMissionKey(mission);
                    return (
                      <div key={missionKey} className="bg-white border border-gray-100 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusStyles(mission.status)}`}>
                              {getStatusLabel(mission.status)}
                            </span>
                            {mission.isB2B && (
                              <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">B2B</span>
                            )}
                          </div>
                          <p className="font-semibold text-gray-900">{mission.client?.name || 'Client'}</p>
                          <p className="text-sm text-gray-500 capitalize">{mission.serviceType?.replace(/-/g, ' ')}</p>
                        </div>
                        <div className="text-sm text-gray-500 space-y-1 text-right">
                          {mission.eventDetails?.startTime && <p>{mission.eventDetails.startTime}</p>}
                          <p>{mission.eventDetails?.guests ?? 0} convives</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white rounded-2xl shadow-lg p-6 space-y-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Briefcase className="h-6 w-6 text-emerald-500" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Missions B2B</h2>
              <p className="text-sm text-gray-500">Vos collaborations entreprises en cours.</p>
            </div>
          </div>
          {derived.pendingB2B.length > 0 && (
            <span className="px-3 py-1 text-sm font-semibold bg-amber-100 text-amber-700 rounded-full">
              {derived.pendingB2B.length} en attente
            </span>
          )}
        </div>

        {derived.b2b.length === 0 ? (
          <div className="border border-dashed border-amber-200 rounded-xl p-8 text-center text-amber-700 bg-amber-50/60">
            <p className="text-sm">Aucune mission B2B pour le moment. Restez disponible pour les demandes à venir.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {derived.b2b.map((mission) => renderMissionCard(mission))}
          </div>
        )}
      </section>

      <section className="space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Search className="h-5 w-5 text-gray-400" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Missions directes</h2>
              <p className="text-sm text-gray-500">Filtrez vos missions provenant des particuliers.</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmé</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminé</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
        </div>

        {derived.direct.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-inner border border-dashed border-gray-200 p-10 text-center">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune mission directe</h3>
            <p className="text-gray-600">Ajustez le filtre par statut ou revenez plus tard pour voir de nouvelles missions.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {derived.direct.map((mission) => renderMissionCard(mission))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ChefPlanning;
