import mongoose from 'mongoose';
import applyToJSONTransform from '../utils/toJSON.js';

const timeSlotSchema = new mongoose.Schema({
  start: { type: String, required: true, trim: true },
  end: { type: String, required: true, trim: true }
}, { _id: false });

const chefHomeLocationSchema = new mongoose.Schema({
  chef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chef',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },
  description: {
    type: String,
    default: '',
    maxlength: 2000
  },
  heroImage: {
    type: String,
    default: null
  },
  address: {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    country: { type: String, default: 'France', trim: true },
    accessInstructions: { type: String, default: '' },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  capacity: {
    minGuests: { type: Number, default: 1, min: 1 },
    maxGuests: { type: Number, required: true, min: 1 }
  },
  amenities: {
    type: [String],
    default: []
  },
  pricing: {
    basePrice: { type: Number, required: true, min: 0 },
    pricePerGuest: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'EUR' }
  },
  availability: {
    daysOfWeek: {
      type: [String],
      default: []
    },
    timeSlots: {
      type: [timeSlotSchema],
      default: []
    },
    leadTimeDays: { type: Number, default: 3, min: 0 },
    advanceBookingLimitDays: { type: Number, default: 90, min: 0 },
    blackoutDates: {
      type: [Date],
      default: []
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

applyToJSONTransform(chefHomeLocationSchema);

chefHomeLocationSchema.index({ chef: 1, isActive: 1 });
chefHomeLocationSchema.index({ 'address.city': 1, isActive: 1 });

export default mongoose.model('ChefHomeLocation', chefHomeLocationSchema);