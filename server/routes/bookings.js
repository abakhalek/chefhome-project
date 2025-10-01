import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect, authorize } from '../middleware/auth.js';
import Booking from '../models/Booking.js';
import Chef from '../models/Chef.js';
import User from '../models/User.js';

const router = express.Router();

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (Client)
router.post('/', protect, [
  body('chefId').isMongoId().withMessage('Valid chef ID is required'),
  body('serviceType').isIn(['home-dining', 'private-events', 'cooking-classes', 'catering']),
  body('eventDetails.date').isISO8601().withMessage('Valid date is required'),
  body('eventDetails.startTime')
    .matches(/^\d{2}:\d{2}$/)
    .withMessage('Valid start time is required (HH:mm)'),
  body('eventDetails.duration')
    .isInt({ min: 1, max: 12 })
    .withMessage('Duration must be between 1 and 12 hours'),
  body('eventDetails.guests').isInt({ min: 1 }).withMessage('At least 1 guest required'),
  body('location.address').notEmpty().withMessage('Address is required'),
  body('location.city').notEmpty().withMessage('City is required'),
  body('location.zipCode').notEmpty().withMessage('Zip code is required'),
  body('menu.dietaryRestrictions').optional().isArray().withMessage('dietaryRestrictions must be an array'),
  body('menu.dietaryRestrictions.*').optional().isString(),
  body('menu.allergies').optional().isArray().withMessage('allergies must be an array'),
  body('menu.allergies.*').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { chefId, serviceType, eventDetails, location, menu = {}, specialRequests } = req.body;

    // Verify chef exists and is available
    const chef = await Chef.findById(chefId).populate('user');
    if (!chef || chef.verification.status !== 'approved') {
      return res.status(404).json({
        success: false,
        message: 'Chef not found or not available'
      });
    }

    // Calculate pricing
    const eventDate = new Date(eventDetails.date);
    const basePrice = chef.hourlyRate * eventDetails.duration;
    const serviceFee = Math.round(basePrice * 0.1); // 10% service fee
    const totalAmount = basePrice + serviceFee;
    const depositAmount = Math.round(totalAmount * 0.2); // 20% deposit as per business rules

    // Create booking
    const dietaryRestrictions = Array.isArray(menu?.dietaryRestrictions)
      ? menu.dietaryRestrictions.map(item => item?.toString().trim()).filter(Boolean)
      : [];
    const allergies = Array.isArray(menu?.allergies)
      ? menu.allergies.map(item => item?.toString().trim()).filter(Boolean)
      : [];

    const bookingMenu = {
      customRequests: specialRequests,
      dietaryRestrictions,
      allergies
    };

    if (menu?.selectedMenu && mongoose.Types.ObjectId.isValid(menu.selectedMenu)) {
      bookingMenu.selectedMenu = menu.selectedMenu;
    }

    const booking = await Booking.create({
      client: req.user.id,
      chef: chefId,
      serviceType,
      eventDetails: {
        ...eventDetails,
        date: eventDate,
        eventType: eventDetails.eventType || 'dinner'
      },
      location,
      menu: bookingMenu,
      pricing: {
        basePrice,
        serviceFee,
        totalAmount
      },
      payment: {
        status: 'pending',
        depositAmount
      },
      timeline: [{
        status: 'pending',
        note: 'Booking created',
        timestamp: new Date()
      }]
    });

    // Populate booking for response
    await booking.populate('chef client', 'name email phone');

    // Send notification to chef
    const io = req.app.get('io');
    io.to(`user-${chef.user._id}`).emit('booking-notification', {
      type: 'new_booking',
      bookingId: booking._id,
      message: `New booking request from ${req.user.name}`
    });

    const quote = {
      reference: `Q-${booking._id.toString().slice(-6).toUpperCase()}`,
      generatedAt: new Date().toISOString(),
      basePrice,
      serviceFee,
      totalAmount,
      depositAmount,
      remainingBalance: Math.max(totalAmount - depositAmount, 0)
    };
    
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking
    });

  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating booking'
    });
  }
});

// @desc    Get user's bookings
// @route   GET /api/bookings
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Filter by user role
    if (req.user.role === 'client') {
      query.client = req.user.id;
    } else if (req.user.role === 'chef') {
      // Find chef profile
      const chef = await Chef.findOne({ user: req.user.id });
      if (chef) {
        query.chef = chef._id;
      }
    }

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('client', 'name email phone')
      .populate({
        path: 'chef',
        populate: { path: 'user', select: 'name email phone' }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings'
    });
  }
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('client', 'name email phone avatar')
      .populate({
        path: 'chef',
        populate: { path: 'user', select: 'name email phone avatar' }
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user has access to this booking
    const hasAccess = 
      booking.client._id.toString() === req.user.id ||
      (booking.chef.user && booking.chef.user._id.toString() === req.user.id) ||
      req.user.role === 'admin';

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.json({
      success: true,
      booking
    });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking'
    });
  }
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status, note } = req.body;
    
    const booking = await Booking.findById(req.params.id)
      .populate('chef client', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    const isChef = booking.chef.user && booking.chef.user.toString() === req.user.id;
    const isClient = booking.client._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isChef && !isClient && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    // Update status
    booking.status = status;
    booking.timeline.push({
      status,
      note: note || `Status updated to ${status}`,
      updatedBy: req.user.id,
      timestamp: new Date()
    });

    await booking.save();

    // Send notification
    const io = req.app.get('io');
    const notificationTarget = isChef ? booking.client._id : booking.chef.user;
    
    io.to(`user-${notificationTarget}`).emit('booking-notification', {
      type: 'status_update',
      bookingId: booking._id,
      status,
      message: `Booking status updated to ${status}`
    });

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      booking
    });

  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating booking status'
    });
  }
});

// @desc    Add review to booking
// @route   POST /api/bookings/:id/review
// @access  Private
router.post('/:id/review', protect, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { rating, comment } = req.body;
    
    const booking = await Booking.findById(req.params.id)
      .populate('chef client');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed bookings'
      });
    }

    // Determine if user is client or chef
    const isClient = booking.client._id.toString() === req.user.id;
    const isChef = booking.chef.user && booking.chef.user.toString() === req.user.id;

    if (!isClient && !isChef) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this booking'
      });
    }

    // Add review
    if (isClient) {
      if (booking.review.clientReview.rating) {
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this booking'
        });
      }
      
      booking.review.clientReview = {
        rating,
        comment,
        date: new Date()
      };

      // Add review to chef's profile
      const chef = await Chef.findById(booking.chef._id);
      chef.reviews.push({
        user: req.user.id,
        booking: booking._id,
        rating,
        comment,
        date: new Date()
      });
      
      chef.calculateAverageRating();
      await chef.save();

    } else if (isChef) {
      if (booking.review.chefReview.rating) {
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this booking'
        });
      }
      
      booking.review.chefReview = {
        rating,
        comment,
        date: new Date()
      };
    }

    await booking.save();

    res.json({
      success: true,
      message: 'Review added successfully',
      booking
    });

  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding review'
    });
  }
});

export default router;