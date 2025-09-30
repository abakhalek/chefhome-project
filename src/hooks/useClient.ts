import { useState, useEffect } from 'react';
import { clientService, ClientBooking, FavoriteChef, ClientNotification } from '../services/clientService';

export const useClient = () => {
  const [bookings, setBookings] = useState<ClientBooking[]>([]);
  const [favoriteChefs, setFavoriteChefs] = useState<FavoriteChef[]>([]);
  const [notifications, setNotifications] = useState<ClientNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Booking Management
  const loadBookings = async (params?: any) => {
    try {
      setLoading(true);
      const { bookings: bookingData } = await clientService.getBookings(params);
      setBookings(bookingData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (bookingData: any) => {
    try {
      setLoading(true);
      const newBooking = await clientService.createBooking(bookingData);
      setBookings(prev => [...prev, newBooking]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string, reason: string) => {
    try {
      await clientService.cancelBooking(bookingId, reason);
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'cancelled' as const }
          : booking
      ));
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Chef Discovery
  const searchChefs = async (filters: any) => {
    try {
      setLoading(true);
      const result = await clientService.searchChefs(filters);
      return result;
    } catch (err: any) {
      setError(err.message);
      return { chefs: [], pagination: {} };
    } finally {
      setLoading(false);
    }
  };

  // Favorites Management
  const loadFavoriteChefs = async () => {
    try {
      const favorites = await clientService.getFavoriteChefs();
      setFavoriteChefs(favorites);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const addToFavorites = async (chefId: string) => {
    try {
      await clientService.addToFavorites(chefId);
      await loadFavoriteChefs();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Reviews
  const submitReview = async (bookingId: string, rating: number, comment: string) => {
    try {
      await clientService.submitReview(bookingId, rating, comment);
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, rating, review: comment }
          : booking
      ));
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Notifications
  const loadNotifications = async () => {
    try {
      const notificationsData = await clientService.getNotifications();
      setNotifications(notificationsData);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await clientService.markNotificationAsRead(notificationId);
      setNotifications(prev => prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      ));
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Payments
  const createPayment = async (bookingId: string, amount: number) => {
    try {
      setLoading(true);
      const paymentIntent = await clientService.createPaymentIntent(bookingId, amount);
      return paymentIntent;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async (paymentIntentId: string, bookingId: string) => {
    try {
      await clientService.confirmPayment(paymentIntentId, bookingId);
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'confirmed' as const }
          : booking
      ));
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadBookings();
    loadFavoriteChefs();
    loadNotifications();
  }, []);

  return {
    // State
    bookings,
    favoriteChefs,
    notifications,
    loading,
    error,
    
    // Booking actions
    loadBookings,
    createBooking,
    cancelBooking,
    
    // Chef discovery
    searchChefs,
    
    // Favorites
    addToFavorites,
    
    // Reviews
    submitReview,
    
    // Notifications
    markNotificationAsRead,
    
    // Payments
    createPayment,
    confirmPayment
  };
};