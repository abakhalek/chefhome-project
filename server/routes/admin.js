import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import User from '../models/User.js';
import Chef from '../models/Chef.js';
import Booking from '../models/Booking.js';
import { sendEmail, emailTemplates } from '../utils/email.js';

const router = express.Router();

// All routes require admin authorization
router.use(protect, authorize('admin'));

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalChefs,
      pendingChefs,
      totalBookings,
      monthlyBookings,
      monthlyRevenue,
      activeDisputes,
      userGrowth
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Chef.countDocuments({ 'verification.status': 'approved' }),
      Chef.countDocuments({ 'verification.status': 'pending' }),
      Booking.countDocuments(),
      Booking.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }),
      Booking.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$pricing.totalAmount' }
          }
        }
      ]),
      Booking.countDocuments({ status: 'disputed' }),
      User.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: -1 } },
        { $limit: 6 }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalChefs,
        pendingChefs,
        totalBookings,
        monthlyBookings,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        activeDisputes,
        userGrowth
      }
    });

  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin statistics'
    });
  }
});

// @desc    Get all users with filtering
// @route   GET /api/admin/users
// @access  Private (Admin)
router.get('/users', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      role, 
      status,
      search 
    } = req.query;

    let query = {};
    
    if (role) {
      query.role = role;
    }

    if (status) {
      query.isActive = status === 'active';
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    // Get additional stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const userObj = user.toObject();
        
        if (user.role === 'chef') {
          const chef = await Chef.findOne({ user: user._id });
          if (chef) {
            userObj.chefStats = {
              verificationStatus: chef.verification.status,
              rating: chef.rating.average,
              totalBookings: chef.stats.totalBookings
            };
          }
        } else if (user.role === 'client' || user.role === 'b2b') {
          const bookingStats = await Booking.aggregate([
            { $match: { client: user._id } },
            {
              $group: {
                _id: null,
                totalBookings: { $sum: 1 },
                totalSpent: { $sum: '$pricing.totalAmount' }
              }
            }
          ]);
          
          userObj.bookingStats = bookingStats[0] || { totalBookings: 0, totalSpent: 0 };
        }
        
        return userObj;
      })
    );

    res.json({
      success: true,
      users: usersWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// @desc    Get pending chef applications
// @route   GET /api/admin/chefs/pending
// @access  Private (Admin)
router.get('/chefs/pending', async (req, res) => {
  try {
    const pendingChefs = await Chef.find({ 'verification.status': 'pending' })
      .populate('user', 'name email phone createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      chefs: pendingChefs
    });

  } catch (error) {
    console.error('Get pending chefs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending chef applications'
    });
  }
});

// @desc    Approve/Reject chef application
// @route   PUT /api/admin/chefs/:id/verify
// @access  Private (Admin)
router.put('/chefs/:id/verify', async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification status'
      });
    }

    const chef = await Chef.findById(req.params.id).populate('user');

    if (!chef) {
      return res.status(404).json({
        success: false,
        message: 'Chef not found'
      });
    }

    chef.verification.status = status;
    chef.verification.verifiedAt = new Date();
    chef.verification.verifiedBy = req.user.id;

    if (status === 'rejected' && rejectionReason) {
      chef.verification.rejectionReason = rejectionReason;
    }

    await chef.save();

    // Send notification email
    try {
      if (status === 'approved') {
        await sendEmail({
          email: chef.user.email,
          subject: 'Votre profil chef a été approuvé !',
          html: emailTemplates.chefApproval(chef)
        });
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
    }

    // Send real-time notification
    const io = req.app.get('io');
    io.to(`user-${chef.user._id}`).emit('verification-update', {
      status,
      message: status === 'approved' 
        ? 'Your chef application has been approved!' 
        : 'Your chef application has been rejected.'
    });

    res.json({
      success: true,
      message: `Chef application ${status} successfully`,
      chef
    });

  } catch (error) {
    console.error('Verify chef error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing chef verification'
    });
  }
});

// @desc    Get all bookings with filters
// @route   GET /api/admin/bookings
// @access  Private (Admin)
router.get('/bookings', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      dateFrom, 
      dateTo,
      search 
    } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const bookings = await Booking.find(query)
      .populate('client', 'name email')
      .populate({
        path: 'chef',
        populate: { path: 'user', select: 'name email' }
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
    console.error('Get admin bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings'
    });
  }
});

// @desc    Get all disputes
// @route   GET /api/admin/disputes
// @access  Private (Admin)
router.get('/disputes', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const query = { status: 'disputed' };

    const disputes = await Booking.find(query)
      .populate('client', 'name email')
      .populate({
        path: 'chef',
        populate: { path: 'user', select: 'name email' }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      disputes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get disputes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching disputes'
    });
  }
});

// @desc    Handle dispute
// @route   PUT /api/admin/bookings/:id/dispute
// @access  Private (Admin)
router.put('/bookings/:id/dispute', async (req, res) => {
  try {
    const { resolution, refundAmount, note } = req.body;

    const booking = await Booking.findById(req.params.id)
      .populate('client chef');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Update booking status based on resolution
    booking.status = resolution === 'resolved' ? 'completed' : 'cancelled';
    
    booking.timeline.push({
      status: booking.status,
      note: `Dispute ${resolution}: ${note}`,
      updatedBy: req.user.id,
      timestamp: new Date()
    });

    // Handle refund if specified
    if (refundAmount > 0) {
      booking.payment.refundAmount = refundAmount;
      booking.payment.status = 'refunded';
      booking.payment.refundedAt = new Date();
    }

    await booking.save();

    // Notify involved parties
    const io = req.app.get('io');
    [booking.client._id, booking.chef.user].forEach(userId => {
      io.to(`user-${userId}`).emit('dispute-resolved', {
        bookingId: booking._id,
        resolution,
        message: `Dispute has been ${resolution}`
      });
    });

    res.json({
      success: true,
      message: 'Dispute handled successfully',
      booking
    });

  } catch (error) {
    console.error('Handle dispute error:', error);
    res.status(500).json({
      success: false,
      message: 'Error handling dispute'
    });
  }
});

// @desc    Suspend/Activate user
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
router.put('/users/:id/status', async (req, res) => {
  try {
    const { status, reason } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = status === 'active';
    await user.save();

    // Log admin action
    console.log(`Admin ${req.user.id} ${status === 'active' ? 'activated' : 'suspended'} user ${user._id}. Reason: ${reason}`);

    // Send notification
    const io = req.app.get('io');
    io.to(`user-${user._id}`).emit('account-status-change', {
      status: status === 'active' ? 'activated' : 'suspended',
      reason
    });

    res.json({
      success: true,
      message: `User ${status === 'active' ? 'activated' : 'suspended'} successfully`
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user status'
    });
  }
});

// @desc    Send message to user
// @route   POST /api/admin/users/:id/message
// @access  Private (Admin)
router.post('/users/:id/message', async (req, res) => {
  try {
    const { subject, message } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Send email
    await sendEmail({
      email: user.email,
      subject: `Chef@Home - ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #F59E0B;">Message de l'équipe Chef@Home</h1>
          <p>Bonjour ${user.name},</p>
          <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px;">
            ${message}
          </div>
          <p>Cordialement,<br>L'équipe Chef@Home</p>
        </div>
      `
    });

    // Send real-time notification
    const io = req.app.get('io');
    io.to(`user-${user._id}`).emit('admin-message', {
      subject,
      message,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Message sent successfully'
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message'
    });
  }
});

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
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
      case '1y':
        dateFilter = { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) };
        break;
    }

    const [
      bookingTrends,
      revenueTrends,
      userGrowth,
      chefPerformance,
      satisfactionMetrics
    ] = await Promise.all([
      // Booking trends
      Booking.aggregate([
        { $match: { createdAt: dateFilter } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
            revenue: { $sum: "$pricing.totalAmount" }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      
      // Revenue by service type
      Booking.aggregate([
        { $match: { status: 'completed', createdAt: dateFilter } },
        {
          $group: {
            _id: "$serviceType",
            revenue: { $sum: "$pricing.totalAmount" },
            count: { $sum: 1 }
          }
        }
      ]),
      
      // User growth
      User.aggregate([
        { $match: { createdAt: dateFilter } },
        {
          $group: {
            _id: { 
              date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              role: "$role"
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.date": 1 } }
      ]),
      
      // Top performing chefs
      Chef.aggregate([
        { $match: { 'verification.status': 'approved' } },
        {
          $lookup: {
            from: 'bookings',
            localField: '_id',
            foreignField: 'chef',
            as: 'bookings'
          }
        },
        {
          $project: {
            user: 1,
            rating: 1,
            totalBookings: { $size: '$bookings' },
            totalRevenue: {
              $sum: {
                $map: {
                  input: { $filter: { input: '$bookings', cond: { $eq: ['$$this.status', 'completed'] } } },
                  as: 'booking',
                  in: '$$booking.pricing.basePrice'
                }
              }
            }
          }
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 10 }
      ]),

      // Satisfaction metrics
      Booking.aggregate([
        { $match: { 'review.clientReview.rating': { $exists: true } } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$review.clientReview.rating' },
            totalReviews: { $sum: 1 },
            ratingDistribution: {
              $push: '$review.clientReview.rating'
            }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      analytics: {
        bookingTrends,
        revenueTrends,
        userGrowth,
        chefPerformance,
        satisfactionMetrics: satisfactionMetrics[0] || { averageRating: 0, totalReviews: 0 }
      }
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics'
    });
  }
});

// @desc    Export data
// @route   GET /api/admin/export/:type
// @access  Private (Admin)
router.get('/export/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { format = 'csv' } = req.query;

    let data = [];
    let filename = '';

    switch (type) {
      case 'users':
        data = await User.find({}).select('-password').lean();
        filename = `users_export_${Date.now()}.${format}`;
        break;
      case 'bookings':
        data = await Booking.find({})
          .populate('client', 'name email')
          .populate('chef', 'user specialty')
          .lean();
        filename = `bookings_export_${Date.now()}.${format}`;
        break;
      case 'chefs':
        data = await Chef.find({})
          .populate('user', 'name email')
          .select('-documents')
          .lean();
        filename = `chefs_export_${Date.now()}.${format}`;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type'
        });
    }

    res.json({
      success: true,
      message: 'Export generated successfully',
      data,
      filename
    });

  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting data'
    });
  }
});

export default router;