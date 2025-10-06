import type { Chef, User } from './index';

export type ChefHomeAppointmentStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';

export interface ChefHomeTimeSlot {
  start: string;
  end: string;
}

export interface ChefHomeLocationAddress {
  street: string;
  city: string;
  zipCode: string;
  country: string;
  accessInstructions?: string;
  coordinates?: {
    lat?: number;
    lng?: number;
  };
}

export interface ChefHomeLocationCapacity {
  minGuests: number;
  maxGuests: number;
}

export interface ChefHomeLocationPricing {
  basePrice: number;
  pricePerGuest?: number;
  currency: string;
}

export interface ChefHomeLocationAvailability {
  daysOfWeek: string[];
  timeSlots: ChefHomeTimeSlot[];
  leadTimeDays: number;
  advanceBookingLimitDays: number;
  blackoutDates?: string[];
}

export interface ChefHomeLocation {
  id?: string;
  _id?: string;
  chef: Chef | string;
  title: string;
  description?: string;
  heroImage?: string | null;
  address: ChefHomeLocationAddress;
  capacity: ChefHomeLocationCapacity;
  amenities: string[];
  pricing: ChefHomeLocationPricing;
  availability: ChefHomeLocationAvailability;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChefHomeLocationFormValues {
  title: string;
  description: string;
  heroImage?: string | null;
  address: ChefHomeLocationAddress;
  capacity: ChefHomeLocationCapacity;
  amenities: string[];
  pricing: ChefHomeLocationPricing;
  availability: ChefHomeLocationAvailability;
  isActive: boolean;
}

export interface ChefHomeLocationPayload extends ChefHomeLocationFormValues {}

export interface ChefHomeAppointment {
  id?: string;
  _id?: string;
  location: ChefHomeLocation | string;
  chef: Chef | string;
  client: User | string;
  requestedDate: string;
  requestedTime: ChefHomeTimeSlot;
  guests: number;
  message?: string;
  status: ChefHomeAppointmentStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChefHomeAppointmentRequestPayload {
  requestedDate: string;
  requestedTime: ChefHomeTimeSlot;
  guests: number;
  message?: string;
}