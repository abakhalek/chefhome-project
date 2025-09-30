
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

export const clientService = {
  async getProfile(): Promise<ClientProfile> {
    const response = await apiClient.get('/users/profile');
    return response.data.user;
  },

  async updateProfile(profileData: Partial<ClientProfile>): Promise<ClientProfile> {
    const response = await apiClient.put('/users/profile', profileData);
    return response.data.user;
  },

  async getBookings(params?: { status?: string; page?: number; limit?: number }): Promise<{
    bookings: ClientBooking[];
    pagination: any;
  }> {
    const response = await apiClient.get('/bookings', { params });
    return response.data;
  },

  async cancelBooking(bookingId: string): Promise<void> {
    await apiClient.put(`/bookings/${bookingId}/status`, { status: 'cancelled', note: 'Cancelled by client' });
  },
};
