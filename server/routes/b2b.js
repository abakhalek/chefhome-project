import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect, authorize } from '../middleware/auth.js';
import Booking from '../models/Booking.js';
import Chef from '../models/Chef.js';
import User from '../models/User.js';
import { sendNotification } from '../utils/notificationService.js';

const router = express.Router();

// All routes require B2B authorization
router.use(protect, authorize('b2b'));

// @desc    Get B2B user profile
// @route   GET /api/b2b/profile
// @access  Private (B2B)
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user || !user.company) {
      return res.status(404).json({ success: false, message: 'B2B profile not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error('Get B2B profile error:', error);
    res.status(500).json({ success: false, message: 'Error fetching B2B profile' });
  }
});

// @desc    Update B2B user profile
// @route   PUT /api/b2b/profile
// @access  Private (B2B)
router.put('/profile', [
  body('company.name').optional().notEmpty().withMessage('Company name is required'),
  body('company.siret').optional().notEmpty().withMessage('SIRET is required'),
  body('company.address').optional().notEmpty().withMessage('Company address is required'),
  body('company.contactPerson').optional().notEmpty().withMessage('Contact person is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { company, name, email } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (company) user.company = { ...user.company, ...company };
    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.json({ success: true, message: 'B2B profile updated successfully', user });
  } catch (error) {
    console.error('Update B2B profile error:', error);
    res.status(500).json({ success: false, message: 'Error updating B2B profile' });
  }
});

// @desc    Create B2B mission/booking
// @route   POST /api/b2b/missions
// @access  Private (B2B)
router.post('/missions', [
  body('title').notEmpty().withMessage('Mission title is required'),
  body('description').notEmpty().withMessage('Mission description is required'),
  body('serviceType').isIn(['home-dining', 'private-events', 'cooking-classes', 'catering']),
  body('eventDetails.date').isISO8601().withMessage('Valid date is required'),
  body('budget').isFloat({ min: 100 }).withMessage('Budget must be at least 100€'),
  body('requirements').isArray().withMessage('Requirements must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      serviceType,
      eventDetails,
      location,
      budget,
      requirements,
      duration
    } = req.body;

    // Create B2B booking/mission
    const mission = await Booking.create({
      client: req.user.id,
      serviceType,
      eventDetails: {
        ...eventDetails,
        duration: duration || 8 // Default 8 hours for B2B missions
      },
      location,
      pricing: {
        basePrice: budget,
        serviceFee: Math.round(budget * 0.05), // 5% service fee for B2B
        totalAmount: budget + Math.round(budget * 0.05)
      },
      isB2B: true,
      company: {
        name: req.user.company?.name,
        contactPerson: req.user.name,
        billingAddress: req.user.company?.address
      },
      // Store B2B specific data in communication field temporarily
      communication: [{
        sender: req.user.id,
        message: JSON.stringify({
          title,
          description,
          requirements,
          type: 'mission_details'
        }),
        type: 'system'
      }]
    });

    const io = req.app.get('io');
    await sendNotification({
      io,
      recipient: req.user.id,
      sender: req.user.id,
      type: 'mission_created',
      title: 'Mission B2B créée',
      message: `Votre mission "${title}" a été créée.`,
      data: {
        missionId: mission._id.toString(),
        serviceType,
        budget
      },
      actionUrl: '/b2b-dashboard/missions',
      priority: 'medium'
    });

    res.status(201).json({
      success: true,
      message: 'B2B mission created successfully',
      mission
    });

  } catch (error) {
    console.error('Create B2B mission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating B2B mission'
    });
  }
});

// @desc    Get B2B missions
// @route   GET /api/b2b/missions
// @access  Private (B2B)
router.get('/missions', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = { client: req.user.id, isB2B: true };
    
    if (status) {
      query.status = status;
    }

    const missions = await Booking.find(query)
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
      missions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get B2B missions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching B2B missions'
    });
  }
});

// @desc    Search chefs for B2B missions
// @route   GET /api/b2b/chefs/search
// @access  Private (B2B)
router.get('/chefs/search', async (req, res) => {
  try {
    const {
      specialty,
      experience,
      location,
      availability,
      serviceType,
      page = 1,
      limit = 20
    } = req.query;

    let query = { 
      'verification.status': 'approved', 
      isActive: true 
    };

    // Add B2B specific filters
    if (specialty) {
      query.$or = [
        { specialty: new RegExp(specialty, 'i') },
        { cuisineTypes: { $in: [new RegExp(specialty, 'i')] } }
      ];
    }

    if (experience) {
      query.experience = { $gte: parseInt(experience) };
    }

    if (location) {
      query['serviceAreas.city'] = new RegExp(location, 'i');
    }

    if (serviceType) {
      query.serviceTypes = { $in: [serviceType] };
    }

    const chefs = await Chef.find(query)
      .populate('user', 'name email phone avatar')
      .select('-documents -bankDetails')
      .sort({ 'rating.average': -1, experience: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Chef.countDocuments(query);

    res.json({
      success: true,
      chefs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('B2B chef search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching chefs'
    });
  }
});

// @desc    Assign chef to B2B mission
// @route   PUT /api/b2b/missions/:id/assign
// @access  Private (B2B)
router.put('/missions/:id/assign', async (req, res) => {
  try {
    const { chefId } = req.body;

    const mission = await Booking.findById(req.params.id);

    if (!mission || mission.client.toString() !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Mission not found'
      });
    }

    // Verify chef exists and is available
    const chef = await Chef.findById(chefId).populate('user');
    if (!chef || chef.verification.status !== 'approved') {
      return res.status(404).json({
        success: false,
        message: 'Chef not found or not available'
      });
    }

    // Assign chef to mission
    mission.chef = chefId;
    mission.status = 'confirmed';
    mission.timeline.push({
      status: 'confirmed',
      note: `Chef ${chef.user.name} assigned to mission`,
      updatedBy: req.user.id,
      timestamp: new Date()
    });

    await mission.save();

    // Notify chef
    const io = req.app.get('io');
    const missionDetailsEntry = Array.isArray(mission.communication)
      ? mission.communication.find((entry) => entry?.type === 'system')
      : null;
    let missionDetails = {};
    if (missionDetailsEntry && missionDetailsEntry.message) {
      try {
        missionDetails = JSON.parse(missionDetailsEntry.message);
      } catch (_error) {
        missionDetails = {};
      }
    }
    const missionTitle = missionDetails.title || 'Mission B2B';

    await sendNotification({
      io,
      recipient: chef.user._id,
      sender: req.user.id,
      type: 'mission_assigned',
      title: 'Nouvelle mission B2B',
      message: `Vous avez été assigné à la mission "${missionTitle}" de ${req.user.company?.name || 'un client B2B'}.`,
      data: {
        missionId: mission._id.toString(),
        serviceType: mission.serviceType,
        eventDate: mission.eventDetails?.date || null,
        company: req.user.company?.name || null
      },
      actionUrl: '/chef-dashboard/planning',
      priority: 'high'
    });

    io.to(`user-${chef.user._id}`).emit('b2b-assignment', {
      missionId: mission._id,
      company: req.user.company?.name,
      message: 'You have been assigned to a new B2B mission'
    });

    res.json({
      success: true,
      message: 'Chef assigned to mission successfully',
      mission
    });

  } catch (error) {
    console.error('Assign chef to B2B mission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning chef to mission'
    });
  }
});

// @desc    Get B2B analytics
// @route   GET /api/b2b/analytics
// @access  Private (B2B)
router.get('/analytics', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case '7d':
        dateFilter = { $gte: new Date(now.setDate(now.getDate() - 7)) };
        break;
      case '30d':
        dateFilter = { $gte: new Date(now.setDate(now.getDate() - 30)) };
        break;
      case '90d':
        dateFilter = { $gte: new Date(now.setDate(now.getDate() - 90)) };
        break;
    }

    const [
      totalMissions,
      completedMissions,
      totalSpent,
      averageRating,
      missionsByType,
      monthlySpending
    ] = await Promise.all([
      Booking.countDocuments({ client: req.user.id, isB2B: true }),
      Booking.countDocuments({ client: req.user.id, isB2B: true, status: 'completed' }),
      Booking.aggregate([
        { $match: { client: req.user.id, isB2B: true, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$pricing.totalAmount' } } }
      ]),
      Booking.aggregate([
        { $match: { client: req.user.id, isB2B: true, 'review.clientReview.rating': { $exists: true } } },
        { $group: { _id: null, avgRating: { $avg: '$review.clientReview.rating' } } }
      ]),
      Booking.aggregate([
        { $match: { client: req.user.id, isB2B: true } },
        { $group: { _id: '$serviceType', count: { $sum: 1 } } }
      ]),
      Booking.aggregate([
        { $match: { client: req.user.id, isB2B: true, createdAt: dateFilter } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            spent: { $sum: '$pricing.totalAmount' },
            missions: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      success: true,
      analytics: {
        totalMissions,
        completedMissions,
        totalSpent: totalSpent[0]?.total || 0,
        averageRating: averageRating[0]?.avgRating || 0,
        missionsByType,
        monthlySpending
      }
    });

  } catch (error) {
    console.error('Get B2B analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching B2B analytics'
    });
  }
});

// @desc    Generate B2B invoice
// @route   POST /api/b2b/missions/:id/invoice
// @access  Private (B2B)
router.post('/missions/:id/invoice', async (req, res) => {
  try {
    const mission = await Booking.findById(req.params.id)
      .populate('chef', 'user specialty')
      .populate('client', 'name company');

    if (!mission || mission.client._id.toString() !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Mission not found'
      });
    }

    if (mission.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only generate invoice for completed missions'
      });
    }

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${mission._id.toString().slice(-6)}`;
    
    mission.invoice = {
      number: invoiceNumber,
      issuedAt: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    };

    await mission.save();

    res.json({
      success: true,
      message: 'Invoice generated successfully',
      invoice: {
        number: invoiceNumber,
        mission: mission,
        issuedAt: mission.invoice.issuedAt,
        dueDate: mission.invoice.dueDate
      }
    });

  } catch (error) {
    console.error('Generate B2B invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating invoice'
    });
  }
});

// @desc    Get B2B invoices
// @route   GET /api/b2b/invoices
// @access  Private (B2B)
router.get('/invoices', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = { client: req.user.id, 'invoice.number': { $exists: true } };
    
    if (status) {
      // Assuming status can be 'paid', 'pending', 'overdue' based on invoice.dueDate and payment status
      // This logic might need to be more complex based on actual payment tracking
      if (status === 'paid') {
        query['invoice.paidAt'] = { $exists: true };
      } else if (status === 'pending') {
        query['invoice.paidAt'] = { $exists: false };
        query['invoice.dueDate'] = { $gte: new Date() };
      } else if (status === 'overdue') {
        query['invoice.paidAt'] = { $exists: false };
        query['invoice.dueDate'] = { $lt: new Date() };
      }
    }

    const invoices = await Booking.find(query)
      .populate('chef', 'user specialty')
      .populate('client', 'name company')
      .sort({ 'invoice.issuedAt': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      invoices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get B2B invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invoices'
    });
  }
});

export default router;
