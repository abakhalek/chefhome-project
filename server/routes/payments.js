import express from 'express';
import Stripe from 'stripe';
import { protect } from '../middleware/auth.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
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

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update booking payment status
      const booking = await Booking.findById(bookingId);
      if (booking) {
        booking.payment.status = 'deposit_paid';
        booking.payment.depositPaidAt = new Date();
        booking.status = 'confirmed';
        
        // Add to timeline
        booking.timeline.push({
          status: 'confirmed',
          note: 'Deposit payment confirmed',
          timestamp: new Date()
        });

        await booking.save();

        // Send notification to chef via Socket.io
        const io = req.app.get('io');
        io.to(`user-${booking.chef}`).emit('booking-notification', {
          type: 'booking_confirmed',
          bookingId: booking._id,
          message: 'New booking confirmed with deposit payment'
        });
      }

      res.json({
        success: true,
        message: 'Payment confirmed successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment not successful'
      });
    }

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
    const refund = await stripe.refunds.create({
      payment_intent: booking.payment.stripePaymentIntentId,
      amount: Math.round(amount * 100), // Convert to cents
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