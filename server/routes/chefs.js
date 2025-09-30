import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect, authorize } from '../middleware/auth.js';
import multer from 'multer';
import Chef from '../models/Chef.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import path from 'path';

const router = express.Router();

// Multer for local document storage
const docStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const uploadDoc = multer({
  storage: docStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and images are allowed.'), false);
    }
  }
});

// Multer for image upload to memory (for Cloudinary)
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'), false);
    }
  }
});

// @desc    Get all chefs with filtering and pagination
// @route   GET /api/chefs
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      city,
      cuisineType,
      serviceType,
      minPrice,
      maxPrice,
      rating,
      sortBy = 'rating.average',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    let query = { 'verification.status': 'approved', isActive: true };

    // Location filter
    if (city) {
      query['serviceAreas.city'] = new RegExp(city, 'i');
    }

    // Cuisine type filter
    if (cuisineType) {
      query.cuisineTypes = { $in: [cuisineType] };
    }

    // Service type filter
    if (serviceType) {
      query.serviceTypes = { $in: [serviceType] };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.hourlyRate = {};
      if (minPrice) query.hourlyRate.$gte = parseInt(minPrice);
      if (maxPrice) query.hourlyRate.$lte = parseInt(maxPrice);
    }

    // Rating filter
    if (rating) {
      query['rating.average'] = { $gte: parseFloat(rating) };
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const chefs = await Chef.find(query)
      .populate('user', 'name email avatar')
      .select('-documents -bankDetails')
      .sort(sortOptions)
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
    console.error('Get chefs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chefs'
    });
  }
});

// @desc    Get chef's own profile
// @route   GET /api/chefs/me/profile
// @access  Private (Chef)
router.get('/me/profile', protect, authorize('chef'), async (req, res) => {
  try {
    const chef = await Chef.findOne({ user: req.user.id })
      .populate('user', 'name email phone avatar')
      .populate('reviews.user', 'name avatar')
      .select('+documents');

    if (!chef) {
      return res.status(404).json({
        success: false,
        message: 'Chef profile not found'
      });
    }

    console.log('--- Chef Profile Data from DB ---');
    console.log(chef);

    res.json({
      success: true,
      chef
    });

  } catch (error) {
    console.error('Get chef profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chef profile'
    });
  }
});

// @desc    Create/Update chef profile
// @route   PUT /api/chefs/me/profile
// @access  Private (Chef)
router.put('/me/profile', protect, authorize('chef'), [
  body('specialty').notEmpty().withMessage('Specialty is required'),
  body('experience').optional().isInt({ min: 0 }).withMessage('Experience must be a positive number'),
  body('hourlyRate').optional().isFloat({ min: 20 }).withMessage('Hourly rate must be at least 20€'),
  body('description').optional().isLength({ min: 50, max: 1000 }).withMessage('Description must be 50-1000 characters')
], async (req, res) => {
  try {
    console.log('--- Update Chef Profile Debug ---');
    console.log('Request Body:', req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation Errors:', errors.array());
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, email, phone, address, city, zipCode, specialty, experience, hourlyRate, description } = req.body;

    let chef = await Chef.findOne({ user: req.user.id });
    
    if (!chef) {
      console.log('Chef profile not found, creating new one.');
      // Create new chef profile
      chef = await Chef.create({
        user: req.user.id,
        specialty,
        experience,
        hourlyRate,
        description,
      });
    } else {
      console.log('Updating existing chef profile.');
      // Update existing chef profile fields
      if (specialty) chef.specialty = specialty;
      if (experience) chef.experience = experience;
      if (hourlyRate) chef.hourlyRate = hourlyRate;
      if (description) chef.description = description;
      await chef.save();
      console.log('Chef profile saved.');
    }

    // Update user details
    const user = await User.findById(req.user.id);
    if (user) {
      console.log('Updating user details.');
      if (name) user.name = name;
      if (email) user.email = email;
      if (phone) user.phone = phone;
      if (address || city || zipCode) {
        user.address = {
          ...user.address,
          street: address,
          city: city,
          zipCode: zipCode,
        };
      }
      await user.save();
      console.log('User details saved.');
    }

    await chef.populate('user', 'name email phone avatar');
    console.log('Chef populated with user data.');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      chef
    });

  } catch (error) {
    console.error('--- Update Chef Profile Error ---');
    console.error('Detailed Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating chef profile'
    });
  }
});

// @desc    Upload chef documents
// @route   POST /api/chefs/me/documents
// @access  Private (Chef)
router.post('/me/documents', protect, authorize('chef'), uploadDoc.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      console.error('Document upload error: No file uploaded.');
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { type } = req.body;
    if (!type) {
      console.error('Document upload error: Document type is required.');
      return res.status(400).json({
        success: false,
        message: 'Document type is required'
      });
    }

    const documentUrl = `/uploads/${req.file.filename}`;
    console.log(`Attempting to save document: type=${type}, url=${documentUrl}`);

    // Update chef profile with document URL
    const chef = await Chef.findOne({ user: req.user.id });
    if (!chef) {
      console.error('Document upload error: Chef profile not found for user ID:', req.user.id);
      return res.status(404).json({
        success: false,
        message: 'Chef profile not found'
      });
    }

    // Ensure documents object exists before assigning
    if (!chef.documents) {
      chef.documents = {};
    }
    // Ensure the specific document type object exists before assigning
    if (!chef.documents[type]) {
      chef.documents[type] = {};
    }

    chef.documents[type].url = documentUrl;
    chef.documents[type].uploadedAt = new Date();
    
    console.log('Chef document object before save:', chef.documents);
    await chef.save();
    console.log('Chef document saved successfully.');

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      url: documentUrl
    });

  } catch (error) {
    console.error('--- Document Upload Error ---');
    console.error('Detailed Error during document upload:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading document'
    });
  }
});

// @desc    Get chef's menus
// @route   GET /api/chefs/me/menus
// @access  Private (Chef)
router.get('/me/menus', protect, authorize('chef'), async (req, res) => {
  try {
    const chef = await Chef.findOne({ user: req.user.id });
    if (!chef) {
      return res.status(404).json({
        success: false,
        message: 'Chef profile not found'
      });
    }

    res.json({
      success: true,
      menus: chef.portfolio.menus || []
    });

  } catch (error) {
    console.error('Get menus error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching menus'
    });
  }
});

// @desc    Create new menu
// @route   POST /api/chefs/me/menus
// @access  Private (Chef)
router.post('/me/menus', protect, authorize('chef'), [
  body('name').notEmpty().withMessage('Menu name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('type').isIn(['forfait', 'horaire']).withMessage('Invalid menu type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const chef = await Chef.findOne({ user: req.user.id });
    if (!chef) {
      return res.status(404).json({
        success: false,
        message: 'Chef profile not found'
      });
    }

    const newMenu = {
      ...req.body,
      createdAt: new Date(),
      isActive: true
    };

    if (!chef.portfolio.menus) {
      chef.portfolio.menus = [];
    }
    
    chef.portfolio.menus.push(newMenu);
    await chef.save();

    res.status(201).json({
      success: true,
      message: 'Menu created successfully',
      menu: newMenu
    });

  } catch (error) {
    console.error('Create menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating menu'
    });
  }
});

// @desc    Update menu
// @route   PUT /api/chefs/me/menus/:menuId
// @access  Private (Chef)
router.put('/me/menus/:menuId', protect, authorize('chef'), async (req, res) => {
  try {
    const chef = await Chef.findOne({ user: req.user.id });
    if (!chef) {
      return res.status(404).json({
        success: false,
        message: 'Chef profile not found'
      });
    }

    const menuIndex = chef.portfolio.menus.findIndex(menu => menu._id === req.params.menuId);
    if (menuIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }

    chef.portfolio.menus[menuIndex] = {
      ...chef.portfolio.menus[menuIndex],
      ...req.body,
      updatedAt: new Date()
    };

    await chef.save();

    res.json({
      success: true,
      message: 'Menu updated successfully',
      menu: chef.portfolio.menus[menuIndex]
    });

  } catch (error) {
    console.error('Update menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating menu'
    });
  }
});

// @desc    Delete menu
// @route   DELETE /api/chefs/me/menus/:menuId
// @access  Private (Chef)
router.delete('/me/menus/:menuId', protect, authorize('chef'), async (req, res) => {
  try {
    const chef = await Chef.findOne({ user: req.user.id });
    if (!chef) {
      return res.status(404).json({
        success: false,
        message: 'Chef profile not found'
      });
    }

    chef.portfolio.menus = chef.portfolio.menus.filter(menu => menu._id !== req.params.menuId);
    await chef.save();

    res.json({
      success: true,
      message: 'Menu deleted successfully'
    });

  } catch (error) {
    console.error('Delete menu error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting menu'
    });
  }
});

// @desc    Upload menu image
// @route   POST /api/chefs/me/menus/:menuId/image
// @access  Private (Chef)
router.post('/me/menus/:menuId/image', protect, authorize('chef'), imageUpload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const chef = await Chef.findOne({ user: req.user.id });
    if (!chef) {
      return res.status(404).json({
        success: false,
        message: 'Chef profile not found'
      });
    }

    const menuIndex = chef.portfolio.menus.findIndex(menu => menu._id.toString() === req.params.menuId);
    if (menuIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found'
      });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: `chef-menus/${req.user.id}`,
      resource_type: 'image'
    });

    chef.portfolio.menus[menuIndex].image = result.secure_url;
    await chef.save();

    res.json({
      success: true,
      message: 'Menu image uploaded successfully',
      url: result.secure_url
    });

  } catch (error) {
    console.error('Menu image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading menu image'
    });
  }
});

// @desc    Get chef's bookings/missions
// @route   GET /api/chefs/me/bookings
// @access  Private (Chef)
router.get('/me/bookings', protect, authorize('chef'), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const chef = await Chef.findOne({ user: req.user.id });
    if (!chef) {
      return res.status(404).json({
        success: false,
        message: 'Chef profile not found'
      });
    }

    let query = { chef: chef._id };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('client', 'name email phone avatar')
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
    console.error('Get chef bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings'
    });
  }
});

// @desc    Update chef availability
// @route   PUT /api/chefs/me/availability
// @access  Private (Chef)
router.put('/me/availability', protect, authorize('chef'), async (req, res) => {
  try {
    const chef = await Chef.findOne({ user: req.user.id });

    if (!chef) {
      return res.status(404).json({
        success: false,
        message: 'Chef profile not found'
      });
    }

    chef.availability = { ...chef.availability, ...req.body };
    await chef.save();

    res.json({
      success: true,
      message: 'Availability updated successfully',
      availability: chef.availability
    });

  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating availability'
    });
  }
});

// @desc    Get chef earnings and statistics
// @route   GET /api/chefs/me/earnings
// @access  Private (Chef)
router.get('/me/earnings', protect, authorize('chef'), async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const chef = await Chef.findOne({ user: req.user.id });
    if (!chef) {
      return res.status(404).json({
        success: false,
        message: 'Chef profile not found'
      });
    }

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
      case '1y':
        dateFilter = { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) };
        break;
    }

    const [earnings, totalStats, monthlyBreakdown] = await Promise.all([
      // Daily earnings
      Booking.aggregate([
        {
          $match: {
            chef: chef._id,
            status: 'completed',
            createdAt: dateFilter
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            totalEarnings: { $sum: "$pricing.basePrice" },
            commission: { $sum: "$pricing.serviceFee" },
            bookingCount: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Total stats
      Booking.aggregate([
        {
          $match: {
            chef: chef._id,
            status: 'completed',
            createdAt: dateFilter
          }
        },
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: "$pricing.basePrice" },
            totalCommission: { $sum: "$pricing.serviceFee" },
            totalBookings: { $sum: 1 },
            averageRating: { $avg: "$review.clientReview.rating" }
          }
        }
      ]),

      // Monthly breakdown
      Booking.aggregate([
        {
          $match: {
            chef: chef._id,
            status: 'completed'
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            earnings: { $sum: "$pricing.basePrice" },
            missions: { $sum: 1 },
            avgRating: { $avg: "$review.clientReview.rating" }
          }
        },
        { $sort: { _id: -1 } },
        { $limit: 6 }
      ])
    ]);

    res.json({
      success: true,
      earnings: {
        daily: earnings,
        total: totalStats[0] || { totalEarnings: 0, totalCommission: 0, totalBookings: 0, averageRating: 0 },
        monthly: monthlyBreakdown
      }
    });

  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching earnings'
    });
  }
});

// @desc    Get chef statistics
// @route   GET /api/chefs/me/statistics
// @access  Private (Chef)
router.get('/me/statistics', protect, authorize('chef'), async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const chef = await Chef.findOne({ user: req.user.id });
    if (!chef) {
      return res.status(404).json({
        success: false,
        message: 'Chef profile not found'
      });
    }

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
      bookingStats,
      revenueByType,
      clientRetention,
      performanceMetrics
    ] = await Promise.all([
      // Booking statistics
      Booking.aggregate([
        { $match: { chef: chef._id, createdAt: dateFilter } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]),

      // Revenue by service type
      Booking.aggregate([
        { $match: { chef: chef._id, status: 'completed', createdAt: dateFilter } },
        {
          $group: {
            _id: "$serviceType",
            revenue: { $sum: "$pricing.basePrice" },
            count: { $sum: 1 }
          }
        }
      ]),

      // Client retention
      Booking.aggregate([
        { $match: { chef: chef._id, status: 'completed' } },
        {
          $group: {
            _id: "$client",
            bookingCount: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: null,
            repeatClients: { $sum: { $cond: [{ $gt: ["$bookingCount", 1] }, 1, 0] } },
            totalClients: { $sum: 1 }
          }
        }
      ]),

      // Performance metrics
      Booking.aggregate([
        { $match: { chef: chef._id } },
        {
          $group: {
            _id: null,
            totalRequests: { $sum: 1 },
            acceptedRequests: { $sum: { $cond: [{ $ne: ["$status", "cancelled"] }, 1, 0] } },
            avgResponseTime: { $avg: { $subtract: ["$updatedAt", "$createdAt"] } }
          }
        }
      ])
    ]);

    // Update chef stats
    await chef.updateStats();
    await chef.save();

    res.json({
      success: true,
      statistics: {
        bookingStats,
        revenueByType,
        clientRetention: clientRetention[0] || { repeatClients: 0, totalClients: 0 },
        performanceMetrics: performanceMetrics[0] || { totalRequests: 0, acceptedRequests: 0, avgResponseTime: 0 },
        chefStats: chef.stats
      }
    });

  } catch (error) {
    console.error('Get chef statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chef statistics'
    });
  }
});

// @desc    Get chef reviews
// @route   GET /api/chefs/me/reviews
// @access  Private (Chef)
router.get('/me/reviews', protect, authorize('chef'), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const chef = await Chef.findOne({ user: req.user.id });
    if (!chef) {
      return res.status(404).json({
        success: false,
        message: 'Chef profile not found'
      });
    }

    const reviews = await Booking.find({
      chef: chef._id,
      'review.clientReview.rating': { $exists: true }
    })
    .populate('client', 'name avatar')
    .select('client review eventDetails createdAt')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Booking.countDocuments({
      chef: chef._id,
      'review.clientReview.rating': { $exists: true }
    });

    res.json({
      success: true,
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get chef reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews'
    });
  }
});

export default router;