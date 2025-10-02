import { apiClient } from './apiClient';
import { Booking } from '../types';

export type BookingServiceType = 'home-dining' | 'private-events' | 'cooking-classes' | 'catering';

export interface CreateBookingPayload {
  chefId: string;
  serviceType: BookingServiceType;
  eventDetails: {
    date: string;
    startTime: string;
    duration: number;
    guests: number;
    eventType?: string;
  };
  location: {
    address: string;
    city: string;
    zipCode: string;
    country?: string;
    accessInstructions?: string;
  };
  menu?: {
    selectedMenu?: string;
    dietaryRestrictions?: string[];
    allergies?: string[];
  };
  specialRequests?: string;
}

export interface BookingQuote {
  reference: string;
  generatedAt: string;
  basePrice: number;
  serviceFee: number;
  totalAmount: number;
  depositAmount: number;
  remainingBalance: number;
  menu?: null | {
    id: string;
    name: string;
    type: 'forfait' | 'horaire';
    unitPrice: number;
  };
  calculation?: {
    method: 'menu' | 'hourly';
    menu?: {
      id: string;
      name: string;
      type: 'forfait' | 'horaire';
      unitPrice: number;
      durationHours: number;
      guests: number;
    };
    hourlyRate?: number;
    durationHours?: number;
    guests?: number;
  };
}

export interface CreateBookingResponse {
  success: boolean;
  message: string;
  booking: Booking;
  quote: BookingQuote;
}

export interface PaymentIntentResponse {
  success: boolean;
  clientSecret: string;
  paymentIntentId: string;
  mock?: boolean;
}

export interface ConfirmPaymentResponse {
  success: boolean;
  message: string;
  mock?: boolean;
}

export const bookingService = {
  async createBooking(payload: CreateBookingPayload): Promise<CreateBookingResponse> {
    const response = await apiClient.post('/bookings', payload);
    return response.data;
  },

  async createDepositIntent(bookingId: string, amount: number): Promise<PaymentIntentResponse> {
    const response = await apiClient.post('/payments/create-intent', { bookingId, amount });
    return response.data;
  },

  async confirmDeposit(paymentIntentId: string, bookingId: string): Promise<ConfirmPaymentResponse> {
    const response = await apiClient.post('/payments/confirm', { paymentIntentId, bookingId });
    return response.data;
  }
};
