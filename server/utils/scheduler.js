import cron from 'node-cron';
import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';
import { sendEmail, emailTemplates } from './email.js';
import { sendNotification, NOTIFICATION_TYPES } from './notifications.js';

// Schedule reminder notifications
export const scheduleBookingReminders = (io) => {
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('Running booking reminder scheduler...');
      
      // Find bookings happening in 24 hours
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      const upcomingBookings = await Booking.find({
        'eventDetails.date': {
          $gte: tomorrow,
          $lt: dayAfterTomorrow
        },
        status: 'confirmed'
      })
      .populate('client', 'name email preferences')
      .populate({
        path: 'chef',
        populate: { path: 'user', select: 'name email preferences' }
      });

      for (const booking of upcomingBookings) {
        // Check if reminder already sent
        const existingReminder = await Notification.findOne({
          recipient: booking.chef.user._id,
          type: NOTIFICATION_TYPES.BOOKING_REMINDER,
          'data.bookingId': booking._id,
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        if (!existingReminder) {
          // Send reminder to chef
          await sendNotification(
            booking.chef.user._id,
            NOTIFICATION_TYPES.BOOKING_REMINDER,
            {
              bookingId: booking._id,
              clientName: booking.client.name,
              date: booking.eventDetails.date,
              time: booking.eventDetails.startTime,
              location: booking.location.address,
              guests: booking.eventDetails.guests
            },
            io
          );

          // Send reminder to client
          await sendNotification(
            booking.client._id,
            NOTIFICATION_TYPES.BOOKING_REMINDER,
            {
              bookingId: booking._id,
              chefName: booking.chef.user.name,
              date: booking.eventDetails.date,
              time: booking.eventDetails.startTime,
              location: booking.location.address
            },
            io
          );
        }
      }

      console.log(`Processed ${upcomingBookings.length} upcoming bookings for reminders`);

    } catch (error) {
      console.error('Booking reminder scheduler error:', error);
    }
  });
};

// Schedule review requests
export const scheduleReviewRequests = (io) => {
  // Run daily at 10 AM
  cron.schedule('0 10 * * *', async () => {
    try {
      console.log('Running review request scheduler...');
      
      // Find completed bookings from yesterday without reviews
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      
      const today = new Date(yesterday);
      today.setDate(today.getDate() + 1);

      const completedBookings = await Booking.find({
        'eventDetails.date': {
          $gte: yesterday,
          $lt: today
        },
        status: 'completed',
        'review.clientReview.rating': { $exists: false }
      })
      .populate('client', 'name email preferences')
      .populate({
        path: 'chef',
        populate: { path: 'user', select: 'name' }
      });

      for (const booking of completedBookings) {
        // Send review request to client
        await sendNotification(
          booking.client._id,
          NOTIFICATION_TYPES.REVIEW_REQUEST,
          {
            bookingId: booking._id,
            chefName: booking.chef.user.name,
            date: booking.eventDetails.date
          },
          io
        );
      }

      console.log(`Sent ${completedBookings.length} review requests`);

    } catch (error) {
      console.error('Review request scheduler error:', error);
    }
  });
};

// Schedule payment reminders
export const schedulePaymentReminders = (io) => {
  // Run daily at 9 AM
  cron.schedule('0 9 * * *', async () => {
    try {
      console.log('Running payment reminder scheduler...');
      
      // Find bookings with pending payments due in 3 days
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      
      const pendingPayments = await Booking.find({
        'eventDetails.date': { $lte: threeDaysFromNow },
        'payment.status': 'pending',
        status: 'confirmed'
      })
      .populate('client', 'name email preferences');

      for (const booking of pendingPayments) {
        await sendNotification(
          booking.client._id,
          'payment_reminder',
          {
            bookingId: booking._id,
            amount: booking.pricing.totalAmount,
            dueDate: booking.eventDetails.date
          },
          io
        );
      }

      console.log(`Sent ${pendingPayments.length} payment reminders`);

    } catch (error) {
      console.error('Payment reminder scheduler error:', error);
    }
  });
};

// Initialize all schedulers
export const initializeSchedulers = (io) => {
  console.log('Initializing schedulers...');
  scheduleBookingReminders(io);
  scheduleReviewRequests(io);
  schedulePaymentReminders(io);
  console.log('All schedulers initialized');
};

export default {
  scheduleBookingReminders,
  scheduleReviewRequests,
  schedulePaymentReminders,
  initializeSchedulers
};