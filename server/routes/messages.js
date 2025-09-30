import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';

const router = express.Router();

// @desc    Get user conversations
// @route   GET /api/messages/conversations
// @access  Private
router.get('/conversations', protect, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id
    })
    .populate('participants', 'name avatar role')
    .populate('lastMessage')
    .populate('booking', 'eventDetails status')
    .sort({ lastActivity: -1 });

    res.json({
      success: true,
      conversations
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations'
    });
  }
});

// @desc    Get messages in a conversation
// @route   GET /api/messages/conversations/:id
// @access  Private
router.get('/conversations/:id', protect, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation || !conversation.participants.includes(req.user.id)) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const messages = await Message.find({ conversation: req.params.id })
      .populate('sender', 'name avatar role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Mark messages as read
    await Message.updateMany(
      { 
        conversation: req.params.id,
        recipient: req.user.id,
        read: false
      },
      { 
        read: true,
        readAt: new Date()
      }
    );

    res.json({
      success: true,
      messages: messages.reverse(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages'
    });
  }
});

// @desc    Send message
// @route   POST /api/messages
// @access  Private
router.post('/', protect, [
  body('recipientId').isMongoId().withMessage('Valid recipient ID is required'),
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Message content is required (1-1000 characters)'),
  body('bookingId').optional().isMongoId().withMessage('Valid booking ID required if provided')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { recipientId, content, bookingId, type = 'text' } = req.body;

    // Verify recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    // Find or create conversation
    let conversation = await Conversation.findBetweenUsers(req.user.id, recipientId, bookingId);
    
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user.id, recipientId],
        booking: bookingId || null,
        type: bookingId ? 'booking' : 'general'
      });
    }

    // Create message
    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user.id,
      recipient: recipientId,
      content,
      type,
      booking: bookingId || null
    });

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.lastActivity = new Date();
    await conversation.save();

    // Populate message for response
    await message.populate('sender', 'name avatar role');

    // Send real-time notification
    const io = req.app.get('io');
    io.to(`user-${recipientId}`).emit('new-message', {
      conversationId: conversation._id,
      message: message,
      sender: {
        id: req.user.id,
        name: req.user.name,
        avatar: req.user.avatar
      }
    });

    res.status(201).json({
      success: true,
      message: message,
      conversationId: conversation._id
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message'
    });
  }
});

// @desc    Mark conversation as read
// @route   PUT /api/messages/conversations/:id/read
// @access  Private
router.put('/conversations/:id/read', protect, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation || !conversation.participants.includes(req.user.id)) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    await Message.updateMany(
      { 
        conversation: req.params.id,
        recipient: req.user.id,
        read: false
      },
      { 
        read: true,
        readAt: new Date()
      }
    );

    res.json({
      success: true,
      message: 'Messages marked as read'
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking messages as read'
    });
  }
});

export default router;