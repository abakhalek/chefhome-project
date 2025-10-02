import { useState, useEffect, useCallback } from 'react';
import {
  clientService,
  ClientBooking,
  FavoriteChef,
  ClientNotification,
  ChefSearchFilters,
  ClientPaymentIntent
} from '../services/clientService';

const getErrorMessage = (unknownError: unknown) => {
  if (unknownError instanceof Error) {
    return unknownError.message;
  }
  return 'Une erreur inattendue est survenue.';
};

export const useClient = () => {
  const [bookings, setBookings] = useState<ClientBooking[]>([]);
  const [favoriteChefs, setFavoriteChefs] = useState<FavoriteChef[]>([]);
  const [notifications, setNotifications] = useState<ClientNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((unknownError: unknown) => {
    setError(getErrorMessage(unknownError));
  }, []);

  type GetBookingsParams = Parameters<typeof clientService.getBookings>[0];

  const loadBookings = useCallback(async (params?: GetBookingsParams) => {
    try {
      setLoading(true);
      const { bookings: bookingData } = await clientService.getBookings(params);
      setBookings(bookingData);
    } catch (unknownError) {
      handleError(unknownError);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const createBooking = useCallback(async (bookingData: Record<string, unknown>) => {
    try {
      setLoading(true);
      const newBooking = await clientService.createBooking(bookingData);
      setBookings(prev => [...prev, newBooking]);
    } catch (unknownError) {
      handleError(unknownError);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const cancelBooking = useCallback(async (bookingId: string, reason: string) => {
    try {
      await clientService.cancelBooking(bookingId, reason);
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'cancelled' as const }
          : booking
      ));
    } catch (unknownError) {
      handleError(unknownError);
    }
  }, [handleError]);

  // Chef Discovery
  const searchChefs = useCallback(async (filters?: ChefSearchFilters) => {
    try {
      setLoading(true);
      const result = await clientService.searchChefs(filters);
      return result;
    } catch (unknownError) {
      handleError(unknownError);
      return { chefs: [], pagination: {} };
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Favorites Management
  const loadFavoriteChefs = useCallback(async () => {
    try {
      const favorites = await clientService.getFavoriteChefs();
      setFavoriteChefs(favorites);
    } catch (unknownError) {
      handleError(unknownError);
    }
  }, [handleError]);

  const addToFavorites = useCallback(async (chefId: string) => {
    try {
      await clientService.addToFavorites(chefId);
      await loadFavoriteChefs();
    } catch (unknownError) {
      handleError(unknownError);
    }
  }, [handleError, loadFavoriteChefs]);

  // Reviews
  const submitReview = useCallback(async (bookingId: string, rating: number, comment: string) => {
    try {
      await clientService.submitReview(bookingId, rating, comment);
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, rating, review: comment }
          : booking
      ));
    } catch (unknownError) {
      handleError(unknownError);
    }
  }, [handleError]);

  // Notifications
  const loadNotifications = useCallback(async () => {
    try {
      const notificationsData = await clientService.getNotifications();
      setNotifications(notificationsData);
    } catch (unknownError) {
      handleError(unknownError);
    }
  }, [handleError]);

  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    try {
      await clientService.markNotificationAsRead(notificationId);
      setNotifications(prev => prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      ));
    } catch (unknownError) {
      handleError(unknownError);
    }
  }, [handleError]);

  // Payments
  const createPayment = useCallback(async (bookingId: string, amount: number): Promise<ClientPaymentIntent> => {
    try {
      setLoading(true);
      const paymentIntent = await clientService.createPaymentIntent(bookingId, amount);
      return paymentIntent;
    } catch (unknownError) {
      const message = getErrorMessage(unknownError);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmPayment = useCallback(async (paymentIntentId: string, bookingId: string) => {
    try {
      await clientService.confirmPayment(paymentIntentId, bookingId);
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'confirmed' as const }
          : booking
      ));
    } catch (unknownError) {
      handleError(unknownError);
    }
  }, [handleError]);

  useEffect(() => {
    loadBookings();
    loadFavoriteChefs();
    loadNotifications();
  }, [loadBookings, loadFavoriteChefs, loadNotifications]);

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
