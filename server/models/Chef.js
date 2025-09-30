import mongoose from 'mongoose';
import applyToJSONTransform from '../utils/toJSON.js';


const chefSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialty: {
    type: String,
    required: [true, 'Specialty is required'],
    trim: true
  },
  experience: {
    type: Number,
    required: [true, 'Years of experience is required'],
    min: [0, 'Experience cannot be negative']
  },
  hourlyRate: {
    type: Number,
    required: [true, 'Hourly rate is required'],
    min: [20, 'Hourly rate must be at least 20€']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  cuisineTypes: {
    type: [String],
    default: []
  },
  serviceTypes: {
    type: [{
      type: String,
      enum: ['home-dining', 'private-events', 'cooking-classes', 'catering']
    }],
    default: []
  },
  serviceAreas: {
    type: [{
      city: String,
      zipCodes: [String],
      maxDistance: { type: Number, default: 30 } // km
    }],
    default: []
  },
  availability: {
    schedule: {
      monday: { available: Boolean, hours: [{ start: String, end: String }] },
      tuesday: { available: Boolean, hours: [{ start: String, end: String }] },
      wednesday: { available: Boolean, hours: [{ start: String, end: String }] },
      thursday: { available: Boolean, hours: [{ start: String, end: String }] },
      friday: { available: Boolean, hours: [{ start: String, end: String }] },
      saturday: { available: Boolean, hours: [{ start: String, end: String }] },
      sunday: { available: Boolean, hours: [{ start: String, end: String }] }
    },
    blackoutDates: [Date],
    minimumBookingHours: { type: Number, default: 3 },
    maximumGuests: { type: Number, default: 12 }
  },
  portfolio: {
  images: { type: [String], default: [] },
    videos: { type: [String], default: [] },
    description: { type: String, default: '' },
    menus: {
      type: [{
        name: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        price: { type: Number, required: true, min: 0 },
        type: { type: String, enum: ['forfait', 'horaire'], default: 'forfait' },
        category: { type: String, default: 'Gastronomique' },
        courses: {
          type: [{
            name: { type: String, required: true, trim: true },
            order: { type: Number, default: 1 }
          }],
          default: []
        },
        ingredients: { type: [String], default: [] },
        dietaryOptions: { type: [String], default: [] },
        allergens: { type: [String], default: [] },
        duration: { type: String, default: '' },
        minGuests: { type: Number, default: 1 },
        maxGuests: { type: Number, default: 1 },
        image: { type: String, default: null },
        isActive: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date }
      }],
      default: []
    }
  },
  certifications: {
    type: [{
    name: String,
    issuer: String,
      dateObtained: Date,
      expiryDate: Date,
      documentUrl: String
    }],
    default: []
  },
  documents: {
    cv: { url: { type: String, default: null }, uploadedAt: { type: Date, default: null } },
    insurance: { url: { type: String, default: null }, uploadedAt: { type: Date, default: null } },
    healthCertificate: { url: { type: String, default: null }, uploadedAt: { type: Date, default: null } },
    businessLicense: { url: { type: String, default: null }, uploadedAt: { type: Date, default: null } }
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: String,
    date: { type: Date, default: Date.now }
  }],
  stats: {
    totalBookings: { type: Number, default: 0 },
    completedBookings: { type: Number, default: 0 },
    cancelledBookings: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    averageResponseTime: { type: Number, default: 0 }, // in hours
    repeatCustomers: { type: Number, default: 0 }
  },
  verification: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending'
    },
    verifiedAt: Date,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: String
  },
  bankDetails: {
    iban: String,
    bic: String,
    accountHolder: String,
    stripeAccountId: String
  },
  isActive: { type: Boolean, default: true },
  featured: { type: Boolean, default: false }
}, {
  timestamps: true
});

applyToJSONTransform(chefSchema);

// Calculate average rating
chefSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.rating.average = 0;
    this.rating.count = 0;
    return;
  }

  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  this.rating.average = Math.round((sum / this.reviews.length) * 10) / 10;
  this.rating.count = this.reviews.length;
};

// Update stats
chefSchema.methods.updateStats = async function() {
  const Booking = mongoose.model('Booking');
  
  const bookings = await Booking.find({ chef: this._id });
  
  this.stats.totalBookings = bookings.length;
  this.stats.completedBookings = bookings.filter(b => b.status === 'completed').length;
  this.stats.cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
  this.stats.totalEarnings = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + b.totalAmount, 0);
};

// Indexes for better query performance
chefSchema.index({ 'user': 1 });
chefSchema.index({ 'serviceAreas.city': 1 });
chefSchema.index({ 'cuisineTypes': 1 });
chefSchema.index({ 'hourlyRate': 1 });
chefSchema.index({ 'rating.average': -1 });
chefSchema.index({ 'verification.status': 1 });

export default mongoose.model('Chef', chefSchema);