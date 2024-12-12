/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import mongoose, { startSession } from 'mongoose';
import Stripe from 'stripe';
import config from '../../config';
import AppError from '../../error/AppError';
import { Coin } from '../coins/coins.model';
import { QuotestatusEnum } from '../quotes/quotes.constant';
import { Quotes } from '../quotes/quotes.model';
import Service from '../services/service.model';
import { Ipayment } from './payment.interface';
import { Payment } from './payment.model';
import { calculateAmount, createCheckoutSession } from './payment.utils';
const stripe = new Stripe(config.stripe_secret as string);
const createPaymentIntent = async (payload: any) => {
  const { amount } = payload;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateAmount(amount),
    currency: 'aed',
    payment_method_types: ['card'],
  });

  return paymentIntent?.client_secret;
};

const insertPaymentIntoDb = async (payload: Ipayment) => {
  const { service } = payload;
  const data = { ...payload };
  const getService: any = await Service.findById(service).populate({
    path: 'shop',
    select: 'provider',
  });
  data['shop'] = getService?.shop?._id;
  data['provider'] = getService?.shop?.provider;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    //    update quotes

    const updateQuotes = await Quotes.findOneAndUpdate(
      {
        _id: payload?.quote,
        isProviderAccept: true,
      },
      {
        isPaid: true,
      },
      {
        new: true,
        session,
      },
    );

    if (!updateQuotes) {
      throw new AppError(httpStatus.NOT_ACCEPTABLE, 'Something went wrong');
    }

    const result = await Payment.create([payload], { session });
    await session.commitTransaction();
    await session.endSession();
    return result[0];
  } catch (error) {
    await session.endSession();
    await session.abortTransaction();

    throw new Error(error as any);
  }
};

const checkout = async (payload: any) => {
  console.log('payload', payload);
  const result = await createCheckoutSession(payload);
  return result;
};

const confirmPayment = async (query: Record<string, any>) => {
  const { sessionId, quote } = query;
  const session = await startSession();
  const PaymentSession = await stripe.checkout.sessions.retrieve(sessionId);
  console.log(PaymentSession?.status);
  const paymentIntentId = PaymentSession.payment_intent as string;

  try {
    session.startTransaction();

    if (PaymentSession?.status === 'complete') {
      // Update payment status to "paid" in MongoDB
      console.log('being hitted');
      const result = await Payment.create(
        [
          {
            quote,
            gateway: 'online',
            transactionId: PaymentSession?.id,
            amount: Number(PaymentSession?.amount_total) / 100,
          },
        ],
        { session },
      );
      if (!result[0]) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Something went wrong');
      }
      // Update booking route status to "paid"
      const updateQuote = await Quotes.findByIdAndUpdate(
        quote,
        { isPaid: true, status: QuotestatusEnum.COMPLETED },
        { session },
      );
      if (!updateQuote) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Something went wrong');
      }

      if (Number(PaymentSession?.amount_total) / 100 >= 30) {
        const coinsToAdd = Math.floor(
          Number(PaymentSession?.amount_total) / 100 / 10,
        );
        await Coin.findOneAndUpdate(
          { customer: updateQuote?.customer },
          {
            $inc: {
              coins: coinsToAdd,
            },
          },
          { session },
        );
      }
      await session.commitTransaction();
      await session.endSession();
      return result;
    }
  } catch (error: any) {
    console.log(error);
    if (paymentIntentId) {
      await stripe.refunds.create({
        payment_intent: paymentIntentId,
      });
    }
    await session.abortTransaction();
    await session.endSession();
  }
};

//get  total income monthly income etc.

const getPaymentsByProvider = async (query: Record<string, any>) => {
  const { shop, page: pageQuery, limit: limitQuery, ...filters } = query;

  const page = parseInt(pageQuery, 10) || 1;
  const limit = parseInt(limitQuery, 10) || 10;
  const skip = (page - 1) * limit;

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const pipeline = [
    {
      $match: {
        isDeleted: false,
        ...filters,
      },
    },
    {
      $lookup: {
        from: 'quotes',
        localField: 'quote',
        foreignField: '_id',
        as: 'quoteDetails',
        pipeline: [
          {
            $lookup: {
              from: 'services',
              localField: 'service',
              foreignField: '_id',
              as: 'serviceDetails',
              pipeline: [
                {
                  $match: {
                    shop: new mongoose.Types.ObjectId(shop),
                  },
                },
              ],
            },
          },
          {
            $unwind: {
              path: '$serviceDetails',
              preserveNullAndEmptyArrays: false,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: '$quoteDetails',
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $project: {
        _id: 1,
        amount: 1,
        gateway: 1,
        transactionId: 1,
        createdAt: 1,
      },
    },
    {
      $facet: {
        paginatedData: [{ $skip: skip }, { $limit: limit }],
        total: [{ $count: 'total' }],
        currentMonthIncome: [
          {
            $match: {
              createdAt: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' },
            },
          },
        ],
        overallIncome: [
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' },
            },
          },
        ],
      },
    },
  ];

  const result = await Payment.aggregate(pipeline);

  const total = result?.[0]?.total?.[0]?.total || 0;
  const data = result?.[0]?.paginatedData || [];
  const currentMonthTotalIncome =
    result?.[0]?.currentMonthIncome?.[0]?.total || 0;
  const overallTotalIncome = result?.[0]?.overallIncome?.[0]?.total || 0;

  return {
    data: {
      overview: {
        totalIncome: overallTotalIncome,
        currentMonthIncome: currentMonthTotalIncome,
      },
      transactions: data,
    },
    meta: {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
    },
  };
};

const completePaymentByHandCash = async (payload: any) => {
  const session = await mongoose.startSession();

  try {
    // Start a transaction
    session.startTransaction();
    const updateQuote: any = await Quotes.findByIdAndUpdate(
      payload?.quote,
      { isPaid: true, status: QuotestatusEnum.COMPLETED },

      { session },
    );
    // Create a payment record
    const result = await Payment.create(
      [
        {
          quote: payload?.quote,
          gateway: 'cash',
          amount: updateQuote?.fee,
        },
      ],
      { session },
    );

    // Check if payment record creation was successful
    if (!result[0]) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Something went wrong');
    }

    // Update the quote's payment status

    // Check if the quote update was successful
    if (!updateQuote) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Something went wrong');
    }
    if (Number(updateQuote?.fee) / 100 >= 30) {
      const coinsToAdd = Math.floor(Number(updateQuote?.fee) / 100 / 10);
      await Coin.findOneAndUpdate(
        { customer: updateQuote?.customer },
        {
          $inc: {
            coins: coinsToAdd,
          },
        },
        { session },
      );
    }
    // Commit the transaction
    await session.commitTransaction();

    // End the session
    await session.endSession();

    return result;
  } catch (error) {
    // Rollback the transaction on error
    await session.abortTransaction();
    await session.endSession();

    // Rethrow the error for handling elsewhere
    throw error;
  }
};

export const paymentServices = {
  insertPaymentIntoDb,
  createPaymentIntent,
  checkout,
  completePaymentByHandCash,
  confirmPayment,
  getPaymentsByProvider,
};
