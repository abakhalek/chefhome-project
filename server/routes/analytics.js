import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import Booking from '../models/Booking.js';
import Chef from '../models/Chef.js';
import User from '../models/User.js';

const router = express.Router();

// @desc    Get platform analytics
// @route   GET /api/analytics/platform
// @access  Private (Admin)
router.get('/platform', protect, authorize('admin'), async (req, res) => {
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
      totalRevenue,
      totalBookings,
      averageOrderValue,
      userGrowth,
      chefPerformance,
      satisfactionMetrics,
      revenueByType,
      geographicDistribution
    ] = await Promise.all([
      // Total revenue
      Booking.aggregate([
        { $match: { status: 'completed', createdAt: dateFilter } },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$pricing.totalAmount' },
            commission: { $sum: '$pricing.serviceFee' },
            count: { $sum: 1 }
          }
        }
      ]),

      // Total bookings
      Booking.countDocuments({ createdAt: dateFilter }),

      // Average order value
      Booking.aggregate([
        { $match: { status: 'completed', createdAt: dateFilter } },
        { $group: { _id: null, avg: { $avg: '$pricing.totalAmount' } } }
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

      // Chef performance
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
            completedBookings: {
              $size: {
                $filter: {
                  input: '$bookings',
                  cond: { $eq: ['$$this.status', 'completed'] }
                }
              }
            },
            totalRevenue: {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: '$bookings',
                      cond: { $eq: ['$$this.status', 'completed'] }
                    }
                  },
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
        { 
          $match: { 
            'review.clientReview.rating': { $exists: true },
            createdAt: dateFilter 
          } 
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$review.clientReview.rating' },
            totalReviews: { $sum: 1 },
            ratingDistribution: { $push: '$review.clientReview.rating' }
          }
        }
      ]),

      // Revenue by service type
      Booking.aggregate([
        { $match: { status: 'completed', createdAt: dateFilter } },
        {
          $group: {
            _id: '$serviceType',
            revenue: { $sum: '$pricing.totalAmount' },
            count: { $sum: 1 }
          }
        }
      ]),

      // Geographic distribution
      Booking.aggregate([
        { $match: { status: 'completed', createdAt: dateFilter } },
        {
          $group: {
            _id: '$location.city',
            count: { $sum: 1 },
            revenue: { $sum: '$pricing.totalAmount' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      success: true,
      analytics: {
        overview: {
          totalRevenue: totalRevenue[0]?.revenue || 0,
          totalCommission: totalRevenue[0]?.commission || 0,
          totalBookings,
          averageOrderValue: averageOrderValue[0]?.avg || 0
        },
        growth: {
          users: userGrowth,
          bookings: totalRevenue[0]?.count || 0
        },
        performance: {
          topChefs: chefPerformance,
          satisfaction: satisfactionMetrics[0] || { averageRating: 0, totalReviews: 0 }
        },
        distribution: {
          byServiceType: revenueByType,
          byLocation: geographicDistribution
        }
      }
    });

  } catch (error) {
    console.error('Get platform analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching platform analytics'
    });
  }
});

// @desc    Get chef analytics
// @route   GET /api/analytics/chef
// @access  Private (Chef)
router.get('/chef', protect, authorize('chef'), async (req, res) => {
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
      earningsData,
      bookingStats,
      ratingTrends,
      clientRetention,
      serviceTypePerformance
    ] = await Promise.all([
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
            earnings: { $sum: '$pricing.basePrice' },
            commission: { $sum: '$pricing.serviceFee' },
            bookings: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Booking status distribution
      Booking.aggregate([
        { $match: { chef: chef._id, createdAt: dateFilter } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      // Rating trends
      Booking.aggregate([
        { 
          $match: { 
            chef: chef._id, 
            'review.clientReview.rating': { $exists: true },
            createdAt: dateFilter 
          } 
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            averageRating: { $avg: '$review.clientReview.rating' },
            reviewCount: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Client retention
      Booking.aggregate([
        { $match: { chef: chef._id, status: 'completed' } },
        {
          $group: {
            _id: '$client',
            bookingCount: { $sum: 1 },
            totalSpent: { $sum: '$pricing.totalAmount' }
          }
        },
        {
          $group: {
            _id: null,
            totalClients: { $sum: 1 },
            repeatClients: { $sum: { $cond: [{ $gt: ['$bookingCount', 1] }, 1, 0] } },
            averageSpentPerClient: { $avg: '$totalSpent' }
          }
        }
      ]),

      // Performance by service type
      Booking.aggregate([
        { $match: { chef: chef._id, status: 'completed', createdAt: dateFilter } },
        {
          $group: {
            _id: '$serviceType',
            revenue: { $sum: '$pricing.basePrice' },
            count: { $sum: 1 },
            averageRating: { $avg: '$review.clientReview.rating' }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      analytics: {
        earnings: earningsData,
        bookings: bookingStats,
        ratings: ratingTrends,
        retention: clientRetention[0] || { totalClients: 0, repeatClients: 0 },
        serviceTypes: serviceTypePerformance
      }
    });

  } catch (error) {
    console.error('Get chef analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chef analytics'
    });
  }
});

export default router;