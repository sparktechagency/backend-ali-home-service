export const calculateAmount = (amount: number) => {
  return Number(amount) * 100;
};
import Stripe from 'stripe';
import config from '../../config';
interface IPayload {
  categoryName: string;
  amount: number;
  // customerId: string;
  paymentId: string;
}
const stripe: Stripe = new Stripe(config.stripe_secret as string, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

export const createCheckoutSession = async (payload: any) => {
  const paymentGatewayData = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: payload?.categoryName,
            description: payload.description,
            images: payload.images,
          },
          unit_amount: payload.amount * 100,
        },
        quantity: 1,
      },
    ],

    // success_url: `https://google.com`,
    success_url: `${config.server_url}/payments/confirm-payment?sessionId={CHECKOUT_SESSION_ID}&quote=${payload?.quote}`,
    cancel_url: `${config.server_url}/payments/cancel?paymentId=${payload?.paymentId}`,
    mode: 'payment',

    invoice_creation: {
      enabled: true,
    },

    payment_method_types: ['card'],
  });

  return paymentGatewayData;
};
