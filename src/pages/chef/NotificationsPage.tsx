
import React, { useState, useEffect, useCallback } from 'react';
import { chefService } from '../../services/chefService';
import { useAuth } from '../../hooks/useAuth';
import { Notification } from '../../types';
import { Bell, CheckCircle, XCircle } from 'lucide-react';

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user?.chefId) return;
    setLoading(true);
    try {
      const response = await chefService.getChefNotifications(user.chefId);
      setNotifications(response.data || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.chefId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (notificationId: string) => {
    if (!user?.chefId) return;
    try {
      await chefService.markChefNotificationAsRead(user.chefId, notificationId);
      setNotifications(prev => prev.map(notif => notif.id === notificationId ? { ...notif, read: true } : notif));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    // In a real app, you would call an API to delete
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Mes Notifications</h1>
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {loading ? (
          <p>Chargement des notifications...</p>
        ) : notifications.length === 0 ? (
          <p>Vous n'avez aucune notification.</p>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif) => (
              <div key={notif.id} className={`flex items-center justify-between p-4 rounded-lg ${notif.read ? 'bg-gray-50' : 'bg-blue-50 border border-blue-200'}`}>
                <div className="flex items-center space-x-3">
                  <Bell size={20} className={notif.read ? 'text-gray-400' : 'text-blue-600'} />
                  <div>
                    <p className={`font-medium ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>{notif.message}</p>
                    <p className="text-sm text-gray-500">{new Date(notif.createdAt).toLocaleString('fr-FR')}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {!notif.read && (
                                      <button onClick={() => markAsRead(notif.id)} className="text-green-600 hover:text-green-800">
                                        <CheckCircle size={20} />
                                      </button>
                                    )}
                                    {/* <button onClick={() => deleteNotification(notif.id)} className="text-red-600 hover:text-red-800">
                                      <XCircle size={20} />
                                    </button> */}
                                  </div>              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
