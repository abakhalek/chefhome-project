import mongoose from 'mongoose';
import applyToJSONTransform from '../utils/toJSON.js';

const appointmentTimeSchema = new mongoose.Schema({
  start: { type: String, required: true, trim: true },
  end: { type: String, required: true, trim: true }
}, { _id: false });

const chefHomeAppointmentSchema = new mongoose.Schema({
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChefHomeLocation',
    required: true
  },
  chef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chef',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestedDate: {
    type: Date,
    required: true
  },
  requestedTime: {
    type: appointmentTimeSchema,
    required: true
  },
  guests: {
    type: Number,
    required: true,
    min: 1
  },
  message: {
    type: String,
    default: '',
    maxlength: 2000
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'cancelled'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

applyToJSONTransform(chefHomeAppointmentSchema);

chefHomeAppointmentSchema.index({ chef: 1, status: 1 });
chefHomeAppointmentSchema.index({ client: 1, status: 1 });
chefHomeAppointmentSchema.index({ location: 1, requestedDate: 1 });

export default mongoose.model('ChefHomeAppointment', chefHomeAppointmentSchema);