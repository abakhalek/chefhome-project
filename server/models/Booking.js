import mongoose from 'mongoose';
import applyToJSONTransform from '../utils/toJSON.js';
const bookingSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  chef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chef',
    required: true
  },
  serviceType: {
    type: String,
    enum: ['home-dining', 'private-events', 'cooking-classes', 'catering'],
    required: true
  },
  eventDetails: {
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    duration: { type: Number, required: true }, // in hours
    guests: { type: Number, required: true, min: 1 },
    eventType: {
      type: String,
      enum: ['dinner', 'lunch', 'breakfast', 'cocktail', 'birthday', 'anniversary', 'business', 'other'],
      default: 'dinner'
    }
  },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'France' },
    coordinates: {
      lat: Number,
      lng: Number
    },
    accessInstructions: String
  },
  menu: {
    selectedMenu: { type: mongoose.Schema.Types.ObjectId },
    customRequests: String,
    dietaryRestrictions: [String],
    allergies: [String]
  },
  pricing: {
    basePrice: { type: Number, required: true },
    serviceFee: { type: Number, required: true },
    taxes: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true }
  },
  payment: {
    method: { type: String, enum: ['card', 'bank_transfer'], default: 'card' },
    status: {
      type: String,
      enum: ['pending', 'deposit_paid', 'fully_paid', 'refunded', 'failed'],
      default: 'pending'
    },
    depositAmount: Number,
    depositPaidAt: Date,
    fullPaymentAt: Date,
    stripePaymentIntentId: String,
    refundAmount: Number,
    refundedAt: Date
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed'],
    default: 'pending'
  },
  communication: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    timestamp: { type: Date, default: Date.now },
    type: { type: String, enum: ['message', 'system', 'booking_update'], default: 'message' }
  }],
  timeline: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  review: {
    clientReview: {
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      date: Date
    },
    chefReview: {
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      date: Date
    }
  },
  cancellation: {
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: String,
    cancelledAt: Date,
    refundAmount: Number
  },
  // B2B specific fields
  isB2B: { type: Boolean, default: false },
  company: {
    name: String,
    contactPerson: String,
    billingAddress: String
  },
  invoice: {
    number: String,
    issuedAt: Date,
    dueDate: Date,
    paidAt: Date
  }
}, {
  timestamps: true
});

applyToJSONTransform(bookingSchema);

// Middleware to update timeline on status change
bookingSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date(),
      note: `Status changed to ${this.status}`
    });
  }
  next();
});

// Calculate total amount
bookingSchema.methods.calculateTotal = function() {
  this.totalAmount = this.pricing.basePrice + this.pricing.serviceFee + this.pricing.taxes - this.pricing.discount;
  this.pricing.depositAmount = Math.round(this.totalAmount * 0.3); // 30% deposit
};

// Indexes
bookingSchema.index({ client: 1, createdAt: -1 });
bookingSchema.index({ chef: 1, createdAt: -1 });
bookingSchema.index({ 'eventDetails.date': 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ 'payment.status': 1 });

export default mongoose.model('Booking', bookingSchema);