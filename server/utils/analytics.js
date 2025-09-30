import Booking from '../models/Booking.js';
import Chef from '../models/Chef.js';
import User from '../models/User.js';

// Calculate platform analytics
export const calculatePlatformAnalytics = async (period = '30d') => {
  try {
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
      conversionRate,
      chefUtilization,
      customerSatisfaction
    ] = await Promise.all([
      // Total revenue
      Booking.aggregate([
        { $match: { status: 'completed', createdAt: dateFilter } },
        { $group: { _id: null, total: { $sum: '$pricing.totalAmount' } } }
      ]),

      // Total bookings
      Booking.countDocuments({ createdAt: dateFilter }),

      // Average order value
      Booking.aggregate([
        { $match: { status: 'completed', createdAt: dateFilter } },
        { $group: { _id: null, avg: { $avg: '$pricing.totalAmount' } } }
      ]),

      // Conversion rate (confirmed vs total requests)
      Booking.aggregate([
        { $match: { createdAt: dateFilter } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            confirmed: { $sum: { $cond: [{ $ne: ['$status', 'cancelled'] }, 1, 0] } }
          }
        }
      ]),

      // Chef utilization rate
      Chef.aggregate([
        { $match: { 'verification.status': 'approved', isActive: true } },
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
            hasBookings: { $gt: [{ $size: '$bookings' }, 0] }
          }
        },
        {
          $group: {
            _id: null,
            totalChefs: { $sum: 1 },
            activeChefs: { $sum: { $cond: ['$hasBookings', 1, 0] } }
          }
        }
      ]),

      // Customer satisfaction
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
            totalReviews: { $sum: 1 }
          }
        }
      ])
    ]);

    return {
      revenue: {
        total: totalRevenue[0]?.total || 0,
        average: averageOrderValue[0]?.avg || 0
      },
      bookings: {
        total: totalBookings,
        conversionRate: conversionRate[0] ? 
          (conversionRate[0].confirmed / conversionRate[0].total * 100).toFixed(1) : 0
      },
      chefs: {
        utilization: chefUtilization[0] ? 
          (chefUtilization[0].activeChefs / chefUtilization[0].totalChefs * 100).toFixed(1) : 0
      },
      satisfaction: {
        rating: customerSatisfaction[0]?.averageRating || 0,
        reviewCount: customerSatisfaction[0]?.totalReviews || 0
      }
    };

  } catch (error) {
    console.error('Analytics calculation error:', error);
    throw error;
  }
};

// Calculate chef performance metrics
export const calculateChefMetrics = async (chefId, period = '30d') => {
  try {
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
      earnings,
      bookingStats,
      ratings,
      responseTime
    ] = await Promise.all([
      // Earnings
      Booking.aggregate([
        { $match: { chef: chefId, status: 'completed', createdAt: dateFilter } },
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: '$pricing.basePrice' },
            totalCommission: { $sum: '$pricing.serviceFee' },
            bookingCount: { $sum: 1 }
          }
        }
      ]),

      // Booking statistics
      Booking.aggregate([
        { $match: { chef: chefId, createdAt: dateFilter } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),

      // Rating statistics
      Booking.aggregate([
        { 
          $match: { 
            chef: chefId, 
            'review.clientReview.rating': { $exists: true },
            createdAt: dateFilter 
          } 
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$review.clientReview.rating' },
            ratingCount: { $sum: 1 },
            ratingDistribution: { $push: '$review.clientReview.rating' }
          }
        }
      ]),

      // Average response time
      Booking.aggregate([
        { $match: { chef: chefId, createdAt: dateFilter } },
        {
          $group: {
            _id: null,
            avgResponseTime: { $avg: { $subtract: ['$updatedAt', '$createdAt'] } }
          }
        }
      ])
    ]);

    return {
      earnings: earnings[0] || { totalEarnings: 0, totalCommission: 0, bookingCount: 0 },
      bookingStats,
      ratings: ratings[0] || { averageRating: 0, ratingCount: 0 },
      responseTime: responseTime[0]?.avgResponseTime || 0
    };

  } catch (error) {
    console.error('Chef metrics calculation error:', error);
    throw error;
  }
};

// Generate reports
export const generateReport = async (type, period, filters = {}) => {
  try {
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'week':
        dateFilter = { $gte: new Date(now.setDate(now.getDate() - 7)) };
        break;
      case 'month':
        dateFilter = { $gte: new Date(now.setDate(now.getDate() - 30)) };
        break;
      case 'quarter':
        dateFilter = { $gte: new Date(now.setDate(now.getDate() - 90)) };
        break;
      case 'year':
        dateFilter = { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) };
        break;
    }

    switch (type) {
      case 'revenue':
        return await generateRevenueReport(dateFilter, filters);
      case 'chef-performance':
        return await generateChefPerformanceReport(dateFilter, filters);
      case 'customer-satisfaction':
        return await generateSatisfactionReport(dateFilter, filters);
      default:
        throw new Error('Invalid report type');
    }

  } catch (error) {
    console.error('Report generation error:', error);
    throw error;
  }
};

const generateRevenueReport = async (dateFilter, filters) => {
  const pipeline = [
    { $match: { status: 'completed', createdAt: dateFilter } }
  ];

  if (filters.serviceType) {
    pipeline[0].$match.serviceType = filters.serviceType;
  }

  pipeline.push(
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: '$pricing.totalAmount' },
        commission: { $sum: '$pricing.serviceFee' },
        bookings: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  );

  return await Booking.aggregate(pipeline);
};

const generateChefPerformanceReport = async (dateFilter, filters) => {
  return await Chef.aggregate([
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
        specialty: 1,
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
    { $sort: { totalRevenue: -1 } }
  ]);
};

const generateSatisfactionReport = async (dateFilter, filters) => {
  return await Booking.aggregate([
    { 
      $match: { 
        'review.clientReview.rating': { $exists: true },
        createdAt: dateFilter 
      } 
    },
    {
      $group: {
        _id: '$serviceType',
        averageRating: { $avg: '$review.clientReview.rating' },
        reviewCount: { $sum: 1 },
        ratingDistribution: {
          $push: '$review.clientReview.rating'
        }
      }
    },
    { $sort: { averageRating: -1 } }
  ]);
};