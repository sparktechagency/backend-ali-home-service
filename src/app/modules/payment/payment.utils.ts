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
  const baseAmount = payload.amount; // in USD
  const baseAmountCents = Math.round(baseAmount * 100);

  const serviceFeeAmount = Math.round(baseAmount * 0.03 * 100); // 3% in cents

  const paymentGatewayData = await stripe.checkout.sessions.create({
    payment_method_types: ['card', 'amazon_pay'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: payload?.categoryName,
            description: payload.description,
            images: payload.images,
          },
          unit_amount: baseAmountCents,
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Service Fee',
            description: '3% processing fee',
          },
          unit_amount: serviceFeeAmount,
        },
        quantity: 1,
      },
    ],

    success_url: `${config.server_url}/payments/confirm-payment?sessionId={CHECKOUT_SESSION_ID}&quote=${payload?.quote}&coins=${payload?.coins}&amountPaidWithCoins=${payload?.amountPaidWithCoins}&customer=${payload?.customer}&service=${payload?.service}`,
    cancel_url: `${config.server_url}/payments/cancel?paymentId=${payload?.quote}`,
    mode: 'payment',

    invoice_creation: {
      enabled: true,
    },
  });

  return paymentGatewayData;
};
