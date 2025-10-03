import express from 'express';
import Stripe from 'stripe';
import { protect } from '../middleware/auth.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Chef from '../models/Chef.js';
import { sendNotification } from '../utils/notificationService.js';

const router = express.Router();
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;
const isStripeConfigured = Boolean(stripeSecretKey);

// @desc    Create payment intent for booking deposit
// @route   POST /api/payments/create-intent
// @access  Private
router.post('/create-intent', protect, async (req, res) => {
  try {
    const { bookingId, amount } = req.body;

    // Verify booking belongs to user
    const booking = await Booking.findById(bookingId).populate('client chef');
    if (!booking || booking.client._id.toString() !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Create payment intent
    const depositAmount = Math.round(amount * 100);

    if (!isStripeConfigured || !stripe) {
      const mockPaymentIntentId = `mock_pi_${Date.now()}`;
      booking.payment = booking.payment || {};
      booking.payment.stripePaymentIntentId = mockPaymentIntentId;
      booking.payment.depositAmount = amount;
      await booking.save();

      return res.json({
        success: true,
        clientSecret: `mock_client_secret_${mockPaymentIntentId}`,
        paymentIntentId: mockPaymentIntentId,
        mock: true
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: depositAmount,
      currency: 'eur',
      metadata: {
        bookingId: booking._id.toString(),
        clientId: booking.client._id.toString(),
        chefId: booking.chef._id.toString(),
        type: 'booking_deposit'
      },
      description: `Chef@Home - Booking deposit for ${booking.chef.user.name}`
    });

    // Update booking with payment intent
    booking.payment.stripePaymentIntentId = paymentIntent.id;
    booking.payment.depositAmount = amount;
    await booking.save();

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment intent'
    });
  }
});

// @desc    Confirm payment
// @route   POST /api/payments/confirm
// @access  Private
router.post('/confirm', protect, async (req, res) => {
  try {
    const { paymentIntentId, bookingId } = req.body;

    if (!isStripeConfigured || !stripe) {
      // Update booking payment status
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      booking.payment = booking.payment || {};
      booking.payment.status = 'deposit_paid';
      booking.payment.depositPaidAt = new Date();
      booking.status = 'confirmed';
      booking.timeline.push({
        status: 'confirmed',
        note: 'Deposit payment confirmed (sandbox mode)',
        timestamp: new Date()
      });
      await booking.save();

      return res.json({
        success: true,
        message: 'Payment confirmed in sandbox mode',
        mock: true
      });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment not successful'
      });
    }
    const booking = await Booking.findById(bookingId);
    if (booking) {
      booking.payment.status = 'deposit_paid';
      booking.payment.depositPaidAt = new Date();
      booking.status = 'confirmed';

      booking.timeline.push({
        status: 'confirmed',
        note: 'Deposit payment confirmed',
        timestamp: new Date()
      });

      await booking.save();

      await booking.populate([
        { path: 'client', select: 'name' },
        { path: 'chef', populate: { path: 'user', select: 'name' } }
      ]);

      const io = req.app.get('io');
      const chefUserId = booking.chef?.user?._id || booking.chef?.user;
      const clientUserId = booking.client?._id;

      if (chefUserId) {
        await sendNotification({
          io,
          recipient: chefUserId,
          sender: req.user.id,
          type: 'payment_received',
          title: 'Acompte reçu',
          message: `Un acompte a été reçu pour la réservation de ${booking.client?.name || 'votre client'}.`,
          data: {
            bookingId: booking._id.toString(),
            status: booking.status,
            paymentStatus: booking.payment.status
          },
          actionUrl: '/chef-dashboard/bookings',
          priority: 'high'
        });

        io.to(`user-${chefUserId}`).emit('booking-notification', {
          type: 'booking_confirmed',
          bookingId: booking._id,
          message: 'New booking confirmed with deposit payment'
        });
      }

      if (clientUserId) {
        await sendNotification({
          io,
          recipient: clientUserId,
          sender: req.user.id,
          type: 'payment_received',
          title: 'Paiement confirmé',
          message: 'Votre acompte a été reçu et la réservation est confirmée.',
          data: {
            bookingId: booking._id.toString(),
            status: booking.status,
            paymentStatus: booking.payment.status
          },
          actionUrl: '/client-dashboard/bookings',
          priority: 'high'
        });
      }
    }

    res.json({
      success: true,
      message: 'Payment confirmed successfully'
    });

  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming payment'
    });
  }
});

// @desc    Process refund
// @route   POST /api/payments/refund
// @access  Private
router.post('/refund', protect, async (req, res) => {
  try {
    const { bookingId, amount, reason } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user has permission to refund
    if (req.user.role !== 'admin' && booking.client.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to process refund'
      });
    }

    // Create refund in Stripe
    if (!isStripeConfigured || !stripe) {
      booking.payment.status = 'refunded';
      booking.payment.refundAmount = amount;
      booking.payment.refundedAt = new Date();
      booking.status = 'cancelled';
      booking.cancellation = {
        reason: reason,
        cancelledAt: new Date(),
        refundAmount: amount
      };

      await booking.save();

      return res.json({
        success: true,
        message: 'Refund processed in sandbox mode',
        mock: true
      });
    }

    const refund = await stripe.refunds.create({
      payment_intent: booking.payment.stripePaymentIntentId,
      amount: Math.round(amount * 100),
      reason: 'requested_by_customer',
      metadata: {
        bookingId: booking._id.toString(),
        reason: reason
      }
    });

    // Update booking
    booking.payment.status = 'refunded';
    booking.payment.refundAmount = amount;
    booking.payment.refundedAt = new Date();
    booking.status = 'cancelled';
    booking.cancellation = {
      reason: reason,
      cancelledAt: new Date(),
      refundAmount: amount
    };

    await booking.save();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      refundId: refund.id
    });

  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing refund'
    });
  }
});

// @desc    Stripe webhook handler
// @route   POST /api/payments/webhook
// @access  Public
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!isStripeConfigured || !stripe) {
    return res.json({ received: true, mock: true });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      
      // Update booking status
      const booking = await Booking.findOne({
        'payment.stripePaymentIntentId': paymentIntent.id
      });
      
      if (booking) {
        booking.payment.status = 'deposit_paid';
        booking.payment.depositPaidAt = new Date();
        booking.status = 'confirmed';
        await booking.save();
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      
      // Update booking status
      const failedBooking = await Booking.findOne({
        'payment.stripePaymentIntentId': failedPayment.id
      });
      
      if (failedBooking) {
        failedBooking.payment.status = 'failed';
        await failedBooking.save();
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({
      $or: [
        { client: req.user.id },
        { chef: req.user.id }
      ]
    })
    .populate('client chef', 'name email')
    .select('eventDetails pricing payment status createdAt')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      payments: bookings
    });

  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment history'
    });
  }
});

export default router;
