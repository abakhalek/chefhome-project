import Stripe from 'stripe';

/*if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required');
}*/

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

// Create connected account for chef
export const createConnectedAccount = async (chefData) => {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'FR',
      email: chefData.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      individual: {
        first_name: chefData.firstName,
        last_name: chefData.lastName,
        email: chefData.email,
        phone: chefData.phone,
      },
      business_profile: {
        mcc: '5812', // Eating Places and Restaurants
        product_description: 'Chef services and culinary experiences',
      },
    });

    return account;
  } catch (error) {
    console.error('Error creating Stripe connected account:', error);
    throw error;
  }
};

// Create account link for onboarding
export const createAccountLink = async (accountId, refreshUrl, returnUrl) => {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return accountLink;
  } catch (error) {
    console.error('Error creating account link:', error);
    throw error;
  }
};

// Create payment intent
export const createPaymentIntent = async (amount, currency = 'eur', metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

// Create transfer to chef
export const createTransfer = async (amount, destination, metadata = {}) => {
  try {
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'eur',
      destination,
      metadata,
    });

    return transfer;
  } catch (error) {
    console.error('Error creating transfer:', error);
    throw error;
  }
};

// Process refund
export const processRefund = async (paymentIntentId, amount, reason = 'requested_by_customer') => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason,
    });

    return refund;
  } catch (error) {
    console.error('Error processing refund:', error);
    throw error;
  }
};

export default stripe;