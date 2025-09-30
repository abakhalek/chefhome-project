// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
};

// User Roles
export const USER_ROLES = {
  CLIENT: 'client',
  CHEF: 'chef',
  ADMIN: 'admin',
  B2B: 'b2b'
} as const;

// Booking Statuses
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed'
} as const;

// Payment Statuses
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  DEPOSIT_PAID: 'deposit_paid',
  FULLY_PAID: 'fully_paid',
  REFUNDED: 'refunded',
  FAILED: 'failed'
} as const;

// Service Types
export const SERVICE_TYPES = {
  HOME_DINING: 'home-dining',
  PRIVATE_EVENTS: 'private-events',
  COOKING_CLASSES: 'cooking-classes',
  CATERING: 'catering'
} as const;

// Cuisine Types
export const CUISINE_TYPES = [
  'Française',
  'Italienne',
  'Japonaise',
  'Chinoise',
  'Indienne',
  'Mexicaine',
  'Méditerranéenne',
  'Fusion',
  'Végétarienne',
  'Vegan',
  'Sans gluten'
];

// Dietary Options
export const DIETARY_OPTIONS = [
  'Végétarien',
  'Vegan',
  'Sans gluten',
  'Sans lactose',
  'Halal',
  'Casher',
  'Paléo',
  'Cétogène',
  'Diabétique',
  'Hypocalorique'
];

// Common Allergens
export const ALLERGENS = [
  'Gluten',
  'Lactose',
  'Œufs',
  'Fruits à coque',
  'Arachides',
  'Soja',
  'Poisson',
  'Crustacés',
  'Mollusques',
  'Céleri',
  'Moutarde',
  'Sésame'
];

// Notification Types
export const NOTIFICATION_TYPES = {
  BOOKING_CREATED: 'booking_created',
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_CANCELLED: 'booking_cancelled',
  BOOKING_REMINDER: 'booking_reminder',
  CHEF_APPROVED: 'chef_approved',
  CHEF_REJECTED: 'chef_rejected',
  PAYMENT_RECEIVED: 'payment_received',
  REVIEW_REQUEST: 'review_request',
  DISPUTE_CREATED: 'dispute_created',
  DISPUTE_RESOLVED: 'dispute_resolved',
  MESSAGE_RECEIVED: 'message_received'
} as const;

// File Upload Limits
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
  MAX_PORTFOLIO_IMAGES: 10
};

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  DESCRIPTION_MIN_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 1000,
  HOURLY_RATE_MIN: 20,
  HOURLY_RATE_MAX: 500,
  EXPERIENCE_MIN: 0,
  EXPERIENCE_MAX: 50
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'dd/MM/yyyy',
  API: 'yyyy-MM-dd',
  DATETIME: 'dd/MM/yyyy HH:mm'
};

// Commission Rates
export const COMMISSION_RATES = {
  STANDARD: 0.10, // 10%
  B2B: 0.05, // 5%
  PREMIUM: 0.08 // 8%
};

// Default Values
export const DEFAULTS = {
  PAGINATION_LIMIT: 20,
  SEARCH_DEBOUNCE: 300,
  NOTIFICATION_DURATION: 5000,
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  BOOKING_REMINDER_HOURS: 24,
  REVIEW_REQUEST_DELAY_HOURS: 24
};