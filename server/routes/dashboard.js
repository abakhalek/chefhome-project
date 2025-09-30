import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import User from '../models/User.js';
import Chef from '../models/Chef.js';
import Booking from '../models/Booking.js';

const router = express.Router();

// @desc    Get chef dashboard data
// @route   GET /api/dashboard/chef
// @access  Private (Chef)
router.get('/chef', protect, authorize('chef'), async (req, res) => {
  try {
    const chef = await Chef.findOne({ user: req.user.id }).populate('user');
    
    if (!chef) {
      return res.status(404).json({
        success: false,
        message: 'Chef profile not found'
      });
    }

    // Get current month stats
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const [
      monthlyBookings,
      monthlyEarnings,
      pendingMissions,
      upcomingMissions,
      recentReviews,
      totalStats
    ] = await Promise.all([
      // Monthly bookings count
      Booking.countDocuments({
        chef: chef._id,
        createdAt: { $gte: currentMonth },
        status: { $in: ['confirmed', 'completed'] }
      }),

      // Monthly earnings
      Booking.aggregate([
        {
          $match: {
            chef: chef._id,
            status: 'completed',
            createdAt: { $gte: currentMonth }
          }
        },
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: '$pricing.basePrice' },
            totalCommission: { $sum: '$pricing.serviceFee' }
          }
        }
      ]),

      // Pending missions
      Booking.find({
        chef: chef._id,
        status: 'pending'
      }).populate('client', 'name email phone').limit(5),

      // Upcoming confirmed missions
      Booking.find({
        chef: chef._id,
        status: 'confirmed',
        'eventDetails.date': { $gte: new Date() }
      }).populate('client', 'name email phone').sort({ 'eventDetails.date': 1 }).limit(5),

      // Recent reviews
      Booking.find({
        chef: chef._id,
        'review.clientReview.rating': { $exists: true }
      }).populate('client', 'name avatar').sort({ createdAt: -1 }).limit(5),

      // Total stats
      Booking.aggregate([
        { $match: { chef: chef._id, status: 'completed' } },
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: '$pricing.basePrice' },
            totalMissions: { $sum: 1 },
            averageRating: { $avg: '$review.clientReview.rating' }
          }
        }
      ])
    ]);

    const earnings = monthlyEarnings[0] || { totalEarnings: 0, totalCommission: 0 };
    const stats = totalStats[0] || { totalEarnings: 0, totalMissions: 0, averageRating: 0 };

    res.json({
      success: true,
      dashboard: {
        chef: {
          name: chef.user.name,
          specialty: chef.specialty,
          rating: chef.rating.average,
          reviewCount: chef.rating.count,
          verificationStatus: chef.verification.status
        },
        stats: {
          monthlyMissions: monthlyBookings,
          monthlyEarnings: earnings.totalEarnings,
          averageRating: stats.averageRating,
          totalMissions: stats.totalMissions,
          acceptanceRate: chef.stats.totalBookings > 0 ? 
            ((chef.stats.completedBookings / chef.stats.totalBookings) * 100).toFixed(1) : 0
        },
        missions: {
          pending: pendingMissions,
          upcoming: upcomingMissions
        },
        recentReviews,
        earnings: {
          monthly: earnings.totalEarnings,
          commission: earnings.totalCommission,
          net: earnings.totalEarnings - earnings.totalCommission
        }
      }
    });

  } catch (error) {
    console.error('Get chef dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chef dashboard data'
    });
  }
});

// @desc    Get client dashboard data
// @route   GET /api/dashboard/client
// @access  Private (Client)
router.get('/client', protect, authorize('client'), async (req, res) => {
  try {
    const [
      activeBookings,
      pastBookings,
      favoriteChefs,
      totalSpent,
      upcomingBookings
    ] = await Promise.all([
      // Active bookings
      Booking.find({
        client: req.user.id,
        status: { $in: ['pending', 'confirmed', 'in_progress'] }
      }).populate({
        path: 'chef',
        populate: { path: 'user', select: 'name avatar' }
      }).sort({ 'eventDetails.date': 1 }),

      // Past bookings
      Booking.find({
        client: req.user.id,
        status: 'completed'
      }).populate({
        path: 'chef',
        populate: { path: 'user', select: 'name avatar' }
      }).sort({ createdAt: -1 }).limit(5),

      // Favorite chefs (based on repeat bookings)
      Booking.aggregate([
        { $match: { client: req.user.id, status: 'completed' } },
        {
          $group: {
            _id: '$chef',
            bookingCount: { $sum: 1 },
            lastBooking: { $max: '$createdAt' },
            averageRating: { $avg: '$review.clientReview.rating' }
          }
        },
        { $match: { bookingCount: { $gte: 2 } } },
        { $sort: { bookingCount: -1, lastBooking: -1 } },
        { $limit: 3 }
      ]),

      // Total spent
      Booking.aggregate([
        { $match: { client: req.user.id, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$pricing.totalAmount' } } }
      ]),

      // Upcoming bookings count
      Booking.countDocuments({
        client: req.user.id,
        status: { $in: ['confirmed', 'in_progress'] },
        'eventDetails.date': { $gte: new Date() }
      })
    ]);

    // Populate favorite chefs
    const populatedFavorites = await Chef.populate(favoriteChefs, {
      path: '_id',
      populate: { path: 'user', select: 'name avatar' }
    });

    res.json({
      success: true,
      dashboard: {
        user: {
          name: req.user.name,
          email: req.user.email,
          memberSince: req.user.createdAt
        },
        stats: {
          totalBookings: pastBookings.length + activeBookings.length,
          totalSpent: totalSpent[0]?.total || 0,
          upcomingBookings,
          favoriteChefs: favoriteChefs.length
        },
        bookings: {
          active: activeBookings,
          past: pastBookings
        },
        favoriteChefs: populatedFavorites
      }
    });

  } catch (error) {
    console.error('Get client dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching client dashboard data'
    });
  }
});

// @desc    Get admin dashboard data
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
router.get('/admin', protect, authorize('admin'), async (req, res) => {
  try {
    const [
      totalUsers,
      totalChefs,
      pendingChefs,
      totalBookings,
      monthlyRevenue,
      activeDisputes,
      recentActivity
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Chef.countDocuments({ 'verification.status': 'approved' }),
      Chef.countDocuments({ 'verification.status': 'pending' }),
      Booking.countDocuments(),
      
      // Monthly revenue
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
            revenue: { $sum: '$pricing.totalAmount' },
            commission: { $sum: '$pricing.serviceFee' }
          }
        }
      ]),

      // Active disputes
      Booking.countDocuments({ status: 'disputed' }),

      // Recent activity
      Booking.find({})
        .populate('client', 'name')
        .populate({
          path: 'chef',
          populate: { path: 'user', select: 'name' }
        })
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    const revenue = monthlyRevenue[0] || { revenue: 0, commission: 0 };

    res.json({
      success: true,
      dashboard: {
        stats: {
          totalUsers,
          totalChefs,
          pendingChefs,
          totalBookings,
          monthlyRevenue: revenue.revenue,
          monthlyCommission: revenue.commission,
          activeDisputes
        },
        recentActivity,
        alerts: {
          pendingChefs,
          activeDisputes
        }
      }
    });

  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin dashboard data'
    });
  }
});

// @desc    Get B2B dashboard data
// @route   GET /api/dashboard/b2b
// @access  Private (B2B)
router.get('/b2b', protect, authorize('b2b'), async (req, res) => {
  try {
    const [
      activeMissions,
      completedMissions,
      totalSpent,
      partnerChefs,
      upcomingEvents
    ] = await Promise.all([
      // Active missions
      Booking.countDocuments({
        client: req.user.id,
        isB2B: true,
        status: { $in: ['pending', 'confirmed', 'in_progress'] }
      }),

      // Completed missions
      Booking.countDocuments({
        client: req.user.id,
        isB2B: true,
        status: 'completed'
      }),

      // Total spent
      Booking.aggregate([
        { $match: { client: req.user.id, isB2B: true, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$pricing.totalAmount' } } }
      ]),

      // Partner chefs (chefs worked with)
      Booking.aggregate([
        { $match: { client: req.user.id, isB2B: true, status: 'completed' } },
        { $group: { _id: '$chef', missionCount: { $sum: 1 } } },
        { $count: 'totalPartners' }
      ]),

      // Upcoming events
      Booking.find({
        client: req.user.id,
        isB2B: true,
        status: 'confirmed',
        'eventDetails.date': { $gte: new Date() }
      }).populate({
        path: 'chef',
        populate: { path: 'user', select: 'name' }
      }).sort({ 'eventDetails.date': 1 }).limit(5)
    ]);

    res.json({
      success: true,
      dashboard: {
        company: {
          name: req.user.company?.name || req.user.name,
          type: 'B2B Professional'
        },
        stats: {
          activeMissions,
          completedMissions,
          totalSpent: totalSpent[0]?.total || 0,
          partnerChefs: partnerChefs[0]?.totalPartners || 0
        },
        upcomingEvents
      }
    });

  } catch (error) {
    console.error('Get B2B dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching B2B dashboard data'
    });
  }
});

export default router;