import { body, param, query } from 'express-validator';

// Common validation rules
export const commonValidations = {
  mongoId: param('id').isMongoId().withMessage('Invalid ID format'),
  email: body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  password: body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  phone: body('phone').isMobilePhone().withMessage('Valid phone number is required'),
  name: body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  
  // Pagination
  pagination: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100')
  ]
};

// User validation rules
export const userValidations = {
  register: [
    commonValidations.name,
    commonValidations.email,
    commonValidations.password,
    commonValidations.phone,
    body('role').isIn(['client', 'chef', 'b2b']).withMessage('Invalid role')
  ],
  
  login: [
    commonValidations.email,
    body('password').notEmpty().withMessage('Password is required')
  ],
  
  updateProfile: [
    body('name').optional().trim().isLength({ min: 2, max: 50 }),
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().isMobilePhone()
  ]
};

// Chef validation rules
export const chefValidations = {
  createProfile: [
    body('specialty').notEmpty().withMessage('Specialty is required'),
    body('experience').isInt({ min: 0 }).withMessage('Experience must be a positive number'),
    body('hourlyRate').isFloat({ min: 20 }).withMessage('Hourly rate must be at least 20€'),
    body('description').isLength({ min: 50, max: 1000 }).withMessage('Description must be 50-1000 characters'),
    body('cuisineTypes').isArray({ min: 1 }).withMessage('At least one cuisine type is required'),
    body('serviceTypes').isArray({ min: 1 }).withMessage('At least one service type is required')
  ],
  
  createMenu: [
    body('name').notEmpty().withMessage('Menu name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
    body('type').isIn(['forfait', 'horaire']).withMessage('Invalid menu type'),
    body('courses').isArray({ min: 1 }).withMessage('At least one course is required')
  ],
  
  updateAvailability: [
    body('schedule').isObject().withMessage('Schedule object is required'),
    body('minimumBookingHours').optional().isInt({ min: 1 }).withMessage('Minimum booking hours must be positive'),
    body('maximumGuests').optional().isInt({ min: 1 }).withMessage('Maximum guests must be positive')
  ]
};

// Booking validation rules
export const bookingValidations = {
  create: [
    body('chefId').isMongoId().withMessage('Valid chef ID is required'),
    body('serviceType').isIn(['home-dining', 'private-events', 'cooking-classes', 'catering']),
    body('eventDetails.date').isISO8601().withMessage('Valid date is required'),
    body('eventDetails.startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format required'),
    body('eventDetails.duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 hour'),
    body('eventDetails.guests').isInt({ min: 1 }).withMessage('At least 1 guest required'),
    body('location.address').notEmpty().withMessage('Address is required'),
    body('location.city').notEmpty().withMessage('City is required'),
    body('location.zipCode').notEmpty().withMessage('Zip code is required')
  ],
  
  updateStatus: [
    body('status').isIn(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
    body('note').optional().isLength({ max: 500 }).withMessage('Note cannot exceed 500 characters')
  ],
  
  addReview: [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters')
  ]
};

// B2B validation rules
export const b2bValidations = {
  createMission: [
    body('title').notEmpty().withMessage('Mission title is required'),
    body('description').notEmpty().withMessage('Mission description is required'),
    body('type').isIn(['event', 'replacement', 'consulting', 'training']).withMessage('Invalid mission type'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('budget').isFloat({ min: 100 }).withMessage('Budget must be at least 100€'),
    body('location').notEmpty().withMessage('Location is required'),
    body('requirements').isArray().withMessage('Requirements must be an array')
  ]
};

// Admin validation rules
export const adminValidations = {
  verifyChef: [
    body('status').isIn(['approved', 'rejected']).withMessage('Invalid verification status'),
    body('rejectionReason').optional().isLength({ max: 500 }).withMessage('Rejection reason too long')
  ],
  
  updateUserStatus: [
    body('status').isIn(['active', 'suspended']).withMessage('Invalid user status'),
    body('reason').optional().isLength({ max: 500 }).withMessage('Reason too long')
  ],
  
  resolveDispute: [
    body('resolution').notEmpty().withMessage('Resolution is required'),
    body('refundAmount').optional().isFloat({ min: 0 }).withMessage('Refund amount must be positive'),
    body('note').optional().isLength({ max: 1000 }).withMessage('Note too long')
  ]
};

// Payment validation rules
export const paymentValidations = {
  createIntent: [
    body('bookingId').isMongoId().withMessage('Valid booking ID is required'),
    body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least 1€')
  ],
  
  confirmPayment: [
    body('paymentIntentId').notEmpty().withMessage('Payment intent ID is required'),
    body('bookingId').isMongoId().withMessage('Valid booking ID is required')
  ],
  
  processRefund: [
    body('bookingId').isMongoId().withMessage('Valid booking ID is required'),
    body('amount').isFloat({ min: 1 }).withMessage('Refund amount must be positive'),
    body('reason').notEmpty().withMessage('Refund reason is required')
  ]
};

export default {
  commonValidations,
  userValidations,
  chefValidations,
  bookingValidations,
  b2bValidations,
  adminValidations,
  paymentValidations
};