import mongoose from 'mongoose';

const menuSchema = new mongoose.Schema({
  chef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chef',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Menu name is required'],
    trim: true,
    maxlength: [100, 'Menu name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    enum: ['Gastronomique', 'Traditionnel', 'Moderne', 'Fusion', 'Formation', 'Événementiel'],
    required: true
  },
  type: {
    type: String,
    enum: ['forfait', 'horaire'],
    required: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  duration: {
    type: String,
    required: true
  },
  minGuests: {
    type: Number,
    required: true,
    min: 1
  },
  maxGuests: {
    type: Number,
    required: true,
    min: 1
  },
  courses: [{
    name: String,
    description: String,
    order: Number
  }],
  ingredients: [String],
  allergens: [String],
  dietaryOptions: [String],
  images: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  bookingCount: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0
  },
  tags: [String]
}, {
  timestamps: true
});

// Indexes
menuSchema.index({ chef: 1, isActive: 1 });
menuSchema.index({ category: 1, type: 1 });
menuSchema.index({ price: 1 });

export default mongoose.model('Menu', menuSchema);