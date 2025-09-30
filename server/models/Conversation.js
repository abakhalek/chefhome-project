import mongoose from 'mongoose';
import applyToJSONTransform from '../utils/toJSON.js';

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  type: {
    type: String,
    enum: ['booking', 'support', 'general'],
    default: 'booking'
  },
  metadata: {
    subject: String,
    tags: [String]
  }
}, {
  timestamps: true
});

applyToJSONTransform(conversationSchema);

// Indexes
conversationSchema.index({ participants: 1, lastActivity: -1 });
conversationSchema.index({ booking: 1 });
conversationSchema.index({ lastActivity: -1 });

// Find conversation between two users
conversationSchema.statics.findBetweenUsers = function(user1Id, user2Id, bookingId = null) {
  const query = {
    participants: { $all: [user1Id, user2Id] }
  };
  
  if (bookingId) {
    query.booking = bookingId;
  }
  
  return this.findOne(query);
};

export default mongoose.model('Conversation', conversationSchema);