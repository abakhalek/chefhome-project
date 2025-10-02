
import { apiClient } from './apiClient';

type ApiRecord = Record<string, unknown>;

const toObject = (value: unknown): ApiRecord => (typeof value === 'object' && value !== null ? value as ApiRecord : {});
const toArray = (value: unknown): ApiRecord[] => (Array.isArray(value) ? value as ApiRecord[] : []);

export interface ClientBooking {
  id: string;
  chef: { name: string; email: string };
  date: string;
  time: string;
  serviceType: string;
  status: string;
  totalAmount: number;
  depositAmount?: number;
  paymentStatus?: string;
  menu?: {
    name?: string;
    type?: 'forfait' | 'horaire' | 'custom';
    price?: number;
    customRequests?: string | null;
  };
  rating?: number;
  review?: string;
}

export interface ClientProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: { street: string; city: string; zipCode: string; country: string };
  preferences: { dietary: string[]; allergies: string[]; cuisineTypes: string[] };
}

export interface FavoriteChef {
  id: string;
  name: string;
  specialty?: string;
  rating?: number;
  city?: string;
}

export interface ClientNotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ClientPaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
  mock?: boolean;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ChefSearchFilters {
  city?: string;
  cuisineType?: string;
  serviceType?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  page?: number;
  limit?: number;
  [key: string]: string | number | boolean | undefined;
}

const normaliseId = (value: unknown): string => {
  if (!value) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  const valueObj = toObject(value);
  if (typeof valueObj.id === 'string' || typeof valueObj.id === 'number') {
    return String(valueObj.id);
  }
  if (typeof valueObj._id === 'string' || typeof valueObj._id === 'number') {
    return String(valueObj._id);
  }
  return JSON.stringify(valueObj);
};

const mapClientProfileFromApi = (user: unknown): ClientProfile => {
  const userObj = toObject(user);
  const addressObj = toObject(userObj.address);
  const preferencesObj = toObject(userObj.preferences);

  return {
    id: normaliseId(userObj.id ?? userObj),
    name: typeof userObj.name === 'string' ? userObj.name : '',
    email: typeof userObj.email === 'string' ? userObj.email : '',
    phone: typeof userObj.phone === 'string' ? userObj.phone : '',
    address: {
      street: typeof addressObj.street === 'string' ? addressObj.street : '',
      city: typeof addressObj.city === 'string' ? addressObj.city : '',
      zipCode: typeof addressObj.zipCode === 'string' ? addressObj.zipCode : '',
      country: typeof addressObj.country === 'string' ? addressObj.country : 'France'
    },
    preferences: {
      dietary: Array.isArray(preferencesObj.dietary) ? preferencesObj.dietary as string[] : [],
      allergies: Array.isArray(preferencesObj.allergies) ? preferencesObj.allergies as string[] : [],
      cuisineTypes: Array.isArray(preferencesObj.cuisineTypes) ? preferencesObj.cuisineTypes as string[] : []
    }
  };
};

const mapClientBookingFromApi = (booking: unknown): ClientBooking => {
  const bookingObj = toObject(booking);
  const chefObj = toObject(bookingObj.chef);
  const chefUser = toObject(chefObj.user ?? chefObj);
  const eventDetails = toObject(bookingObj.eventDetails);
  const pricing = toObject(bookingObj.pricing);
  const payment = toObject(bookingObj.payment);
  const menu = toObject(bookingObj.menu);

  const totalAmount = Number(pricing.totalAmount ?? 0);
  const depositAmount = payment.depositAmount !== undefined ? Number(payment.depositAmount) : undefined;

  return {
    id: normaliseId(bookingObj.id ?? bookingObj),
    chef: {
      name: typeof chefUser.name === 'string' ? chefUser.name : '',
      email: typeof chefUser.email === 'string' ? chefUser.email : ''
    },
    date: typeof eventDetails.date === 'string' ? new Date(eventDetails.date).toISOString() : '',
    time: typeof eventDetails.startTime === 'string' ? eventDetails.startTime : '',
    serviceType: typeof bookingObj.serviceType === 'string' ? bookingObj.serviceType : '',
    status: typeof bookingObj.status === 'string' ? bookingObj.status : '',
    totalAmount: Number.isFinite(totalAmount) ? totalAmount : 0,
    depositAmount: Number.isFinite(depositAmount || 0) ? depositAmount : undefined,
    paymentStatus: typeof payment.status === 'string' ? payment.status : undefined,
    menu: menu && (menu.name || menu.type || menu.customRequests || menu.selectedMenu)
      ? {
          name: typeof menu.name === 'string'
            ? menu.name
            : (menu.type === 'custom' ? 'Menu personnalisé' : undefined),
          type: (menu.type as ClientBooking['menu'] extends undefined ? never : ClientBooking['menu']['type']) || undefined,
          price: typeof menu.price === 'number' ? menu.price : undefined,
          customRequests: typeof menu.customRequests === 'string' ? menu.customRequests : null
        }
      : undefined,
    rating: typeof bookingObj.rating === 'number' ? bookingObj.rating : undefined,
    review: typeof bookingObj.review === 'string' ? bookingObj.review : undefined
  };
};

const mapFavoriteChefFromApi = (chef: unknown): FavoriteChef => {
  const chefObj = toObject(chef);
  return {
    id: normaliseId(chefObj.id ?? chefObj),
    name: typeof chefObj.name === 'string' ? chefObj.name : '',
    specialty: typeof chefObj.specialty === 'string' ? chefObj.specialty : undefined,
    rating: typeof chefObj.rating === 'number' ? chefObj.rating : undefined,
    city: typeof chefObj.city === 'string' ? chefObj.city : undefined
  };
};

const mapNotificationFromApi = (notification: unknown): ClientNotification => {
  const notificationObj = toObject(notification);
  return {
    id: normaliseId(notificationObj.id ?? notificationObj),
    title: typeof notificationObj.title === 'string' ? notificationObj.title : '',
    message: typeof notificationObj.message === 'string' ? notificationObj.message : '',
    read: Boolean(notificationObj.read),
    createdAt: typeof notificationObj.createdAt === 'string'
      ? new Date(notificationObj.createdAt).toISOString()
      : new Date().toISOString()
  };
};

export const clientService = {
  async getProfile(): Promise<ClientProfile> {
    const response = await apiClient.get('/users/profile');
    return mapClientProfileFromApi(response.data.user);
  },

  async updateProfile(profileData: Partial<ClientProfile>): Promise<ClientProfile> {
    const response = await apiClient.put('/users/profile', profileData);
    return mapClientProfileFromApi(response.data.user);
  },

  async getBookings(params?: { status?: string; page?: number; limit?: number }): Promise<{
    bookings: ClientBooking[];
    pagination: PaginationData | undefined;
  }> {
    const response = await apiClient.get('/bookings', { params });
    const data = toObject(response.data);
    return {
      bookings: toArray(data.bookings).map(mapClientBookingFromApi),
      pagination: data.pagination as PaginationData | undefined
    };
  },

  async createBooking(payload: Record<string, unknown>): Promise<ClientBooking> {
    const response = await apiClient.post('/bookings', payload);
    const data = toObject(response.data);
    return mapClientBookingFromApi(data.booking ?? data);
  },

  async cancelBooking(bookingId: string, reason?: string): Promise<void> {
    await apiClient.put(`/bookings/${bookingId}/status`, {
      status: 'cancelled',
      note: reason ?? 'Cancelled by client'
    });
  },

  async searchChefs(filters?: ChefSearchFilters): Promise<{ chefs: FavoriteChef[]; pagination: PaginationData | undefined }> {
    const response = await apiClient.get('/chefs', { params: filters });
    const data = toObject(response.data);
    const source = toArray(data.chefs?.length ? data.chefs : data.results);
    return {
      chefs: source.map(mapFavoriteChefFromApi),
      pagination: data.pagination as PaginationData | undefined
    };
  },

  async getFavoriteChefs(): Promise<FavoriteChef[]> {
    const response = await apiClient.get('/client/favorites');
    const data = toObject(response.data);
    return toArray(data.favorites ?? data).map(mapFavoriteChefFromApi);
  },

  async addToFavorites(chefId: string): Promise<void> {
    await apiClient.post('/client/favorites', { chefId });
  },

  async submitReview(bookingId: string, rating: number, comment: string): Promise<void> {
    await apiClient.post(`/bookings/${bookingId}/review`, { rating, comment });
  },

  async getNotifications(): Promise<ClientNotification[]> {
    const response = await apiClient.get('/notifications');
    const data = toObject(response.data);
    return toArray(data.notifications ?? data).map(mapNotificationFromApi);
  },

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await apiClient.put(`/notifications/${notificationId}/read`);
  },

  async createPaymentIntent(bookingId: string, amount: number): Promise<ClientPaymentIntent> {
    const response = await apiClient.post('/payments/create-intent', { bookingId, amount });
    const data = toObject(response.data);
    return {
      clientSecret: typeof data.clientSecret === 'string' ? data.clientSecret : '',
      paymentIntentId: typeof data.paymentIntentId === 'string' ? data.paymentIntentId : '',
      mock: Boolean(data.mock)
    };
  },

  async confirmPayment(paymentIntentId: string, bookingId: string): Promise<void> {
    await apiClient.post('/payments/confirm', { paymentIntentId, bookingId });
  }
};
