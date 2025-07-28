/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import moment from 'moment';
import mongoose, { startSession } from 'mongoose';
import Stripe from 'stripe';
import config from '../../config';
import AppError from '../../error/AppError';
import { Coin } from '../coins/coins.model';
import { QuotestatusEnum } from '../quotes/quotes.constant';
import { Quotes } from '../quotes/quotes.model';
import Service from '../services/service.model';
import { Wallet } from '../wallet/wallet.model';
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
  const result = await createCheckoutSession(payload);
  return result;
};

const confirmPayment = async (query: Record<string, any>) => {
  const { sessionId, quote, amountPaidWithCoins, coins, service, customer } =
    query;
  const session = await startSession();
  const PaymentSession = await stripe.checkout.sessions.retrieve(sessionId);
  const paymentIntentId = PaymentSession.payment_intent as string;

  try {
    session.startTransaction();

    if (PaymentSession?.status === 'complete') {
      const result = await Payment.create(
        [
          {
            quote,
            gateway: 'online',
            amountPaidWithCoins: amountPaidWithCoins,
            coins: coins,
            transactionId: PaymentSession?.id,
            serviceFee: Math.round(
              (Number(PaymentSession?.amount_total) / 100) * 0.03,
            ),
            service: service,
            customer: customer,
            amount: Number(PaymentSession?.amount_total) / 100,
          },
        ],
        { session },
      );
      if (!result[0]) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Something went wrong');
      }
      // Update booking route status to "paid"
      //  10 ehd to 1 coin
      const updateQuote = await Quotes.findByIdAndUpdate(
        quote,
        { isPaid: true, status: QuotestatusEnum.ACCEPTED },
        { session },
      );
      if (!updateQuote) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Something went wrong');
      }

      if (Number(PaymentSession?.amount_total) / 100 >= 30) {
        const coinsToAdd = Math.floor(Number(updateQuote?.fee) / 10);
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

      const findProvider: any = await Service.findById(service).populate({
        path: 'shop',
        select: 'provider',
      });
      const totalAmount = Number(PaymentSession?.amount_total) / 100;
      const serviceFee = Number(result[0]?.serviceFee || 0);
      const netAmount = totalAmount - serviceFee;

      let walletData = await Wallet.findOne({
        provider: findProvider?.shop?.provider,
      });

      if (walletData) {
        const percentage = walletData.percentage || 30;
        const adminCommissionToAdd = Math.round(
          (totalAmount * percentage) / 100,
        );
        walletData.amount += netAmount;
        walletData.adminComission =
          Number(walletData.adminComission || 0) + adminCommissionToAdd;

        await walletData.save({ session });
      } else {
        const percentage = findProvider?.shop?.percentage || 30;
        const adminCommissionToAdd = Math.round(
          (totalAmount * percentage) / 100,
        );

        await Wallet.create(
          [
            {
              shop: findProvider?.shop,
              provider: findProvider?.shop?.provider,
              amount: netAmount,
              adminComission: adminCommissionToAdd,
            },
          ],
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
      { isPaid: true, status: QuotestatusEnum.ACCEPTED },

      { session },
    );
    if (Number(updateQuote?.fee) >= 30) {
      const coinsToAdd = Math.floor(Number(updateQuote?.fee) / 10);

      await Coin.findOneAndUpdate(
        { customer: updateQuote?.customer },
        {
          $inc: {
            coins: coinsToAdd,
          },
        },
        {
          session,
          upsert: true, // Insert a new document if one doesn't exist
          new: true, // Return the modified document (after the update/insert)
        },
      );
    }
    const baseAmount = Number(updateQuote?.fee); // in dollars
    const serviceFee = Math.round(baseAmount * 0.03); // 3% service fee
    const totalAmount = baseAmount + serviceFee;
    const result = await Payment.create(
      [
        {
          quote: payload?.quote,
          service: updateQuote?.service,
          customer: payload?.customer,
          gateway: 'cash',
          amount: Number(totalAmount),
          serviceFee: serviceFee,
          coins: payload?.coins,
          amountPaidWithCoins: payload?.amountPaidWithCoins,
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
        {
          session,
          upsert: true, // Insert a new document if one doesn't exist
          new: true,
        }, // Return the modified document (after the update/insert) },
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

const showTransactions = async (query: Record<string, any>) => {
  const { page: pageQuery, limit: limitQuery, date, ...filters } = query;
  if (date) {
    const [startDate, endDate] = date.split(',');
    filters.date = {
      $gte: startDate,
      $lte: endDate,
    };
  }
  const page = parseInt(pageQuery, 10) || 1;
  const limit = parseInt(limitQuery, 10) || 10;
  const skip = (page - 1) * limit;

  const pipeline: any = [
    {
      $match: {
        ...filters,
      },
    },
    {
      $lookup: {
        from: 'customers',
        localField: 'customer',
        foreignField: '_id',
        as: 'customerDetails',
        pipeline: [
          {
            $project: {
              name: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: '$customerDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'services',
        localField: 'service',
        foreignField: '_id',
        as: 'serviceDetails',
        pipeline: [
          {
            $project: {
              serviceName: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: '$serviceDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        createdAt: 1,
        transactionId: 1,
        amount: 1,
        serviceFee: 1,
        gateway: 1,
        customerName: '$customerDetails.name',
        serviceName: '$serviceDetails.serviceName',
      },
    },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
  ];

  const transactions = await Payment.aggregate(pipeline);
  const total = await Payment.countDocuments(filters);

  return {
    data: transactions,
    meta: {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
    },
  };
};

const transactionOverview = async () => {
  const today = moment().format('YYYY-MM-DD');

  const stats = await Payment.aggregate([
    {
      $group: {
        _id: null,
        totalIncome: { $sum: '$amount' },
        cashIncome: {
          $sum: {
            $cond: [{ $eq: ['$gateway', 'cash'] }, '$amount', 0],
          },
        },
        onlineIncome: {
          $sum: {
            $cond: [{ $eq: ['$gateway', 'online'] }, '$amount', 0],
          },
        },
      },
    },
  ]);

  const todayStats = await Payment.aggregate([
    {
      $match: { date: today },
    },
    {
      $group: {
        _id: null,
        todayIncome: { $sum: '$amount' },
      },
    },
  ]);

  return {
    totalIncome: stats[0]?.totalIncome || 0,
    cashIncome: stats[0]?.cashIncome || 0,
    onlineIncome: stats[0]?.onlineIncome || 0,
    todayIncome: todayStats[0]?.todayIncome || 0,
  };
};

export const paymentServices = {
  insertPaymentIntoDb,
  createPaymentIntent,
  checkout,
  completePaymentByHandCash,
  confirmPayment,
  getPaymentsByProvider,
  showTransactions,
  transactionOverview,
};
