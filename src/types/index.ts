// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'client' | 'chef' | 'admin' | 'b2b';
  avatar?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  preferences?: {
    dietary: string[];
    allergies: string[];
    cuisineTypes: string[];
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
  address?: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  company?: {
    name: string;
    siret: string;
    address: string;
    contactPerson: string;
  };
}

// Chef Types
export interface Chef {
  id: string;
  user: User;
  specialty: string;
  experience: number;
  hourlyRate: number;
  description: string;
  cuisineTypes: string[];
  serviceTypes: string[];
  serviceAreas: Array<{
    city: string;
    zipCodes: string[];
    maxDistance: number;
  }>;
  availability: {
    schedule: Record<string, {
      available: boolean;
      hours: Array<{ start: string; end: string }>;
    }>;
    blackoutDates: string[];
    minimumBookingHours: number;
    maximumGuests: number;
  };
  portfolio: {
    images: string[];
    videos: string[];
    menus: Menu[];
  };
  certifications: Array<{
    name: string;
    issuer: string;
    dateObtained: string;
    expiryDate?: string;
    documentUrl?: string;
  }>;
  documents: {
    cv?: string;
    insurance?: string;
    healthCertificate?: string;
    businessLicense?: string;
  };
  rating: {
    average: number;
    count: number;
  };
  reviews: Review[];
  stats: {
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    totalEarnings: number;
    averageResponseTime: number;
    repeatCustomers: number;
  };
  verification: {
    status: 'pending' | 'approved' | 'rejected' | 'suspended';
    verifiedAt?: string;
    verifiedBy?: string;
    rejectionReason?: string;
  };
  bankDetails?: {
    iban: string;
    bic: string;
    accountHolder: string;
    stripeAccountId?: string;
  };
  isActive: boolean;
  featured: boolean;
}

// Menu Types
export interface Menu {
  id: string;
  chef: string;
  name: string;
  description: string;
  category: string;
  type: 'forfait' | 'horaire';
  price: number;
  duration: string;
  minGuests: number;
  maxGuests: number;
  courses: Array<{
    name: string;
    description: string;
    order: number;
  }>;
  ingredients: string[];
  allergens: string[];
  dietaryOptions: string[];
  images: string[];
  isActive: boolean;
  bookingCount: number;
  averageRating: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Booking Types
export interface Booking {
  id: string;
  client: User;
  chef: Chef;
  serviceType: 'home-dining' | 'private-events' | 'cooking-classes' | 'catering';
  eventDetails: {
    date: string;
    startTime: string;
    duration: number;
    guests: number;
    eventType: string;
  };
  location: {
    address: string;
    city: string;
    zipCode: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    accessInstructions?: string;
  };
  menu: {
    selectedMenu?: string;
    customRequests?: string;
    dietaryRestrictions: string[];
    allergies: string[];
  };
  pricing: {
    basePrice: number;
    serviceFee: number;
    taxes: number;
    discount: number;
    totalAmount: number;
  };
  payment: {
    method: 'card' | 'bank_transfer';
    status: 'pending' | 'deposit_paid' | 'fully_paid' | 'refunded' | 'failed';
    depositAmount?: number;
    depositPaidAt?: string;
    fullPaymentAt?: string;
    stripePaymentIntentId?: string;
    refundAmount?: number;
    refundedAt?: string;
  };
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
  communication: Message[];
  timeline: Array<{
    status: string;
    timestamp: string;
    note?: string;
    updatedBy?: string;
  }>;
  review?: {
    clientReview?: {
      rating: number;
      comment: string;
      date: string;
    };
    chefReview?: {
      rating: number;
      comment: string;
      date: string;
    };
  };
  cancellation?: {
    cancelledBy: string;
    reason: string;
    cancelledAt: string;
    refundAmount?: number;
  };
  isB2B: boolean;
  company?: {
    name: string;
    contactPerson: string;
    billingAddress: string;
  };
  invoice?: {
    number: string;
    issuedAt: string;
    dueDate: string;
    paidAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Review Types
export interface Review {
  id: string;
  user: User;
  booking: Booking;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  verified: boolean;
}

// Message Types
export interface Message {
  id: string;
  conversation: string;
  sender: User;
  recipient: User;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  attachments?: Array<{
    type: string;
    url: string;
    filename: string;
    size: number;
  }>;
  read: boolean;
  readAt?: string;
  booking?: string;
  isSystemMessage: boolean;
  createdAt: string;
  updatedAt: string;
}

// Conversation Types
export interface Conversation {
  id: string;
  participants: User[];
  booking?: Booking;
  lastMessage?: Message;
  lastActivity: string;
  isActive: boolean;
  type: 'booking' | 'support' | 'general';
  metadata?: {
    subject: string;
    tags: string[];
  };
  createdAt: string;
  updatedAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  recipient: User;
  sender?: User;
  type: string;
  title: string;
  message: string;
  data: any;
  read: boolean;
  readAt?: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channels: Array<'email' | 'sms' | 'push' | 'in_app'>;
  scheduledFor?: string;
  sentAt?: string;
  emailSent: boolean;
  smsSent: boolean;
  pushSent: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Filter Types
export interface SearchFilters {
  query?: string;
  location?: string;
  cuisineType?: string;
  serviceType?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  availability?: string;
  experience?: number;
  dietaryOptions?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Dashboard Types
export interface DashboardStats {
  [key: string]: number | string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivity?: any[];
  upcomingEvents?: any[];
  alerts?: any;
  [key: string]: any;
}