import { apiClient } from './apiClient';

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
}

export interface CreateBookingResponse {
  success: boolean;
  message: string;
  booking: any;
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