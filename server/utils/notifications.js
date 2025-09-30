import { sendEmail } from './email.js';

// Notification types
export const NOTIFICATION_TYPES = {
  BOOKING_CREATED: 'booking_created',
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_CANCELLED: 'booking_cancelled',
  BOOKING_REMINDER: 'booking_reminder',
  CHEF_APPROVED: 'chef_approved',
  CHEF_REJECTED: 'chef_rejected',
  PAYMENT_RECEIVED: 'payment_received',
  REVIEW_REQUEST: 'review_request',
  DISPUTE_CREATED: 'dispute_created',
  DISPUTE_RESOLVED: 'dispute_resolved'
};

// Send notification via multiple channels
export const sendNotification = async (userId, type, data, io) => {
  try {
    // Send real-time notification via Socket.io
    if (io) {
      io.to(`user-${userId}`).emit('notification', {
        type,
        data,
        timestamp: new Date()
      });
    }

    // Send email notification based on type
    await sendEmailNotification(userId, type, data);

    console.log(`Notification sent to user ${userId}: ${type}`);
  } catch (error) {
    console.error('Notification sending error:', error);
  }
};

// Send email notifications
const sendEmailNotification = async (userId, type, data) => {
  try {
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(userId);
    
    if (!user || !user.preferences?.notifications?.email) {
      return; // User doesn't want email notifications
    }

    let emailData = {};

    switch (type) {
      case NOTIFICATION_TYPES.BOOKING_CREATED:
        emailData = {
          subject: 'Nouvelle demande de réservation',
          html: `
            <h2>Nouvelle demande de réservation</h2>
            <p>Bonjour ${user.name},</p>
            <p>Vous avez reçu une nouvelle demande de réservation pour le ${data.date}.</p>
            <p>Connectez-vous à votre espace chef pour accepter ou refuser cette demande.</p>
          `
        };
        break;

      case NOTIFICATION_TYPES.BOOKING_CONFIRMED:
        emailData = {
          subject: 'Réservation confirmée',
          html: `
            <h2>Réservation confirmée</h2>
            <p>Bonjour ${user.name},</p>
            <p>Votre réservation pour le ${data.date} a été confirmée.</p>
            <p>Détails: ${data.details}</p>
          `
        };
        break;

      case NOTIFICATION_TYPES.BOOKING_REMINDER:
        emailData = {
          subject: 'Rappel de prestation - Demain',
          html: `
            <h2>Rappel de prestation</h2>
            <p>Bonjour ${user.name},</p>
            <p>Nous vous rappelons que vous avez une prestation prévue demain à ${data.time}.</p>
            <p>Lieu: ${data.location}</p>
            <p>Client: ${data.clientName}</p>
          `
        };
        break;

      case NOTIFICATION_TYPES.CHEF_APPROVED:
        emailData = {
          subject: 'Félicitations ! Votre profil chef a été approuvé',
          html: `
            <h2>Profil chef approuvé</h2>
            <p>Bonjour ${user.name},</p>
            <p>Excellente nouvelle ! Votre candidature pour devenir chef partenaire a été approuvée.</p>
            <p>Vous pouvez maintenant recevoir des demandes de réservation.</p>
          `
        };
        break;

      case NOTIFICATION_TYPES.REVIEW_REQUEST:
        emailData = {
          subject: 'Évaluez votre expérience culinaire',
          html: `
            <h2>Comment s'est passée votre expérience ?</h2>
            <p>Bonjour ${user.name},</p>
            <p>Nous espérons que vous avez passé un excellent moment avec ${data.chefName}.</p>
            <p>Prenez quelques instants pour évaluer cette expérience.</p>
          `
        };
        break;

      default:
        return;
    }

    await sendEmail({
      email: user.email,
      ...emailData
    });

  } catch (error) {
    console.error('Email notification error:', error);
  }
};

// Schedule reminder notifications
export const scheduleReminders = async (io) => {
  try {
    const Booking = (await import('../models/Booking.js')).default;
    
    // Find bookings happening in 24 hours
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const upcomingBookings = await Booking.find({
      'eventDetails.date': {
        $gte: new Date(tomorrow.toDateString()),
        $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
      },
      status: 'confirmed'
    }).populate('client chef');

    // Send reminders
    for (const booking of upcomingBookings) {
      // Remind chef
      await sendNotification(
        booking.chef.user,
        NOTIFICATION_TYPES.BOOKING_REMINDER,
        {
          time: booking.eventDetails.startTime,
          location: booking.location.address,
          clientName: booking.client.name
        },
        io
      );

      // Remind client
      await sendNotification(
        booking.client._id,
        NOTIFICATION_TYPES.BOOKING_REMINDER,
        {
          time: booking.eventDetails.startTime,
          chefName: booking.chef.user.name,
          location: booking.location.address
        },
        io
      );
    }

  } catch (error) {
    console.error('Schedule reminders error:', error);
  }
};

export default {
  sendNotification,
  scheduleReminders,
  NOTIFICATION_TYPES
};