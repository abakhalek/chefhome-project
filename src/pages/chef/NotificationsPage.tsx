
import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, XCircle } from 'lucide-react';

interface Notification {
  id: string;
  type: 'booking' | 'system' | 'message' | 'alert';
  message: string;
  read: boolean;
  createdAt: string;
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', type: 'booking', message: 'Nouvelle demande de réservation de Sophie Martin.', read: false, createdAt: '2024-01-20T10:00:00Z' },
    { id: '2', type: 'system', message: 'Votre profil a été mis à jour.', read: true, createdAt: '2024-01-19T15:30:00Z' },
    { id: '3', type: 'message', message: 'Nouveau message de Pierre Dubois.', read: false, createdAt: '2024-01-18T11:45:00Z' },
    { id: '4', type: 'alert', message: 'Rappel: Mettez à jour vos disponibilités pour Février.', read: true, createdAt: '2024-01-17T09:00:00Z' },
  ]);
  const [loading, setLoading] = useState(false);

  // In a real app, you would fetch notifications from an API
  // useEffect(() => {
  //   const fetchNotifications = async () => {
  //     setLoading(true);
  //     try {
  //       const response = await chefService.getNotifications(); // Assuming such a service exists
  //       setNotifications(response.notifications);
  //     } catch (error) {
  //       console.error("Failed to fetch notifications:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchNotifications();
  // }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(notif => notif.id === id ? { ...notif, read: true } : notif));
    // In a real app, you would call an API to mark as read
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
                  <button onClick={() => deleteNotification(notif.id)} className="text-red-600 hover:text-red-800">
                    <XCircle size={20} />
                  </button>
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
