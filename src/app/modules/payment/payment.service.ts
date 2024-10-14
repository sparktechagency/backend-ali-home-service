/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import Stripe from 'stripe';
import config from '../../config';
import AppError from '../../error/AppError';
import { Quotes } from '../quotes/quotes.model';
import Service from '../services/service.model';
import { Ipayment } from './payment.interface';
import { Payment } from './payment.model';
import { calculateAmount } from './payment.utils';
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
    return result;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error(error as any);
  }
};

export const paymentServices = {
  insertPaymentIntoDb,
  createPaymentIntent,
};
