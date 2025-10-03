
import React, { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCircle } from 'lucide-react';
import { clientService, ClientNotification } from '../../services/clientService';
import { useAuth } from '../../hooks/useAuth';

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<ClientNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const notificationsData = await clientService.getNotifications();
      setNotifications(notificationsData);
    } catch (unknownError) {
      console.error('Failed to fetch notifications:', unknownError);
      setError('Impossible de récupérer vos notifications pour le moment.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    if (!user) {
      return;
    }
    try {
      await clientService.markNotificationAsRead(notificationId);
      setNotifications(prev => prev.map((notif) => notif.id === notificationId ? { ...notif, read: true } : notif));
    } catch (unknownError) {
      console.error('Failed to mark notification as read:', unknownError);
    }
  };

  const priorityClasses: Record<NonNullable<ClientNotification['priority']>, string> = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-amber-100 text-amber-700',
    urgent: 'bg-red-100 text-red-700'
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Mes Notifications</h1>
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {loading ? (
          <p>Chargement des notifications...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : notifications.length === 0 ? (
          <p>Vous n'avez aucune notification.</p>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`flex items-start justify-between p-4 rounded-lg border ${notif.read ? 'bg-gray-50 border-gray-100' : 'bg-blue-50 border-blue-200'}`}
              >
                <div className="flex items-start space-x-3">
                  <Bell size={20} className={notif.read ? 'text-gray-400 mt-1' : 'text-blue-600 mt-1'} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={`font-semibold ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>{notif.title || 'Notification'}</p>
                      {notif.priority && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${priorityClasses[notif.priority]}`}>
                          {notif.priority === 'high' ? 'Priorité haute' : notif.priority === 'urgent' ? 'Urgent' : `Priorité ${notif.priority}`}
                        </span>
                      )}
                      {notif.type && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          {notif.type.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                    <p className="text-xs text-gray-500 mt-2">{new Date(notif.createdAt).toLocaleString('fr-FR')}</p>
                    {notif.actionUrl && (
                      <a
                        href={notif.actionUrl}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        Voir la demande
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  {!notif.read && (
                    <button
                      type="button"
                      onClick={() => markAsRead(notif.id)}
                      className="text-emerald-600 hover:text-emerald-700"
                      title="Marquer comme lue"
                    >
                      <CheckCircle size={20} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
