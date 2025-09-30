
import { apiClient } from './apiClient';

export interface ClientBooking {
  id: string;
  chef: { name: string; email: string };
  date: string;
  time: string;
  serviceType: string;
  status: string;
  totalAmount: number;
}

export interface ClientProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: { street: string; city: string; zipCode: string; country: string };
  preferences: { dietary: string[]; allergies: string[]; cuisineTypes: string[] };
}

const normaliseId = (value: any): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value.id) return String(value.id);
  if (value._id) return String(value._id);
  return String(value);
};

const mapClientProfileFromApi = (user: any): ClientProfile => {
  const address = user?.address || {};
  const preferences = user?.preferences || {};

  return {
    id: normaliseId(user),
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: {
      street: address?.street || '',
      city: address?.city || '',
      zipCode: address?.zipCode || '',
      country: address?.country || 'France'
    },
    preferences: {
      dietary: Array.isArray(preferences?.dietary) ? preferences.dietary : [],
      allergies: Array.isArray(preferences?.allergies) ? preferences.allergies : [],
      cuisineTypes: Array.isArray(preferences?.cuisineTypes) ? preferences.cuisineTypes : []
    }
  };
};

const mapClientBookingFromApi = (booking: any): ClientBooking => {
  const chef = booking?.chef || {};
  const chefUser = chef?.user || chef;
  const eventDetails = booking?.eventDetails || {};
  const pricing = booking?.pricing || {};

  return {
    id: normaliseId(booking),
    chef: {
      name: chefUser?.name || '',
      email: chefUser?.email || ''
    },
    date: eventDetails?.date ? new Date(eventDetails.date).toISOString() : '',
    time: eventDetails?.startTime || '',
    serviceType: booking?.serviceType || '',
    status: booking?.status || '',
    totalAmount: Number(pricing?.totalAmount ?? 0)
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
    pagination: any;
  }> {
    const response = await apiClient.get('/bookings', { params });
    return {
      bookings: Array.isArray(response.data.bookings)
        ? response.data.bookings.map(mapClientBookingFromApi)
        : [],
      pagination: response.data.pagination
    };
  },

  async cancelBooking(bookingId: string): Promise<void> {
    await apiClient.put(`/bookings/${bookingId}/status`, {
      status: 'cancelled',
      note: 'Cancelled by client'
    });
  }
};
