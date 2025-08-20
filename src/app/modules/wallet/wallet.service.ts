import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../error/AppError';
import { Payment } from '../payment/payment.model';
import { ProviderTransaction, Wallet } from './wallet.model';

const findProviderWiseWallet = async (id: string) => {
  const result = await Wallet.findOne({ provider: id });
  return result;
};

const updateWallet = async (id: string, payload: any) => {
  const result = await Wallet.findByIdAndUpdate(id, payload, { new: true });
  return result;
};
const updateTransaction = async (walletId: string, data: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Fetch the existing wallet
    const wallet: any = await Wallet.findById(walletId);

    const amountToPay = data?.amountPaid;

    if (wallet && Number(amountToPay) > Number(wallet?.amount)) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Paid amount exceeds wallet balance',
      );
    }

    // Update wallet fields
    wallet.amount -= amountToPay;
    wallet.lastPaidAmount = amountToPay;
    wallet.lastPaidDate = new Date().toISOString();
    wallet.totalPaid = Number(wallet.totalPaid || 0) + Number(amountToPay);

    await wallet.save({ session });

    // Create new transaction entry
    const transaction = new ProviderTransaction({
      wallet: wallet._id,
      provider: wallet.provider,
      amountPaid: amountToPay,
      paidDate: new Date(),
      remainingAmount: wallet.amount,
      note: data.note || '',
    });

    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();
    return wallet;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

const updateCashTransaction = async (walletId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const wallet = await Wallet.findById(walletId);
  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, 'Wallet data not found');
  }
  try {
    const result = await Wallet.findByIdAndUpdate(
      walletId,
      {
        $set: {
          cashPaymentComissionDue: 0,
        },
        $inc: {
          totalCashPaymentComissionIncome: Number(
            wallet?.cashPaymentComissionDue,
          ),
        },
      },
      { new: true, session },
    );

    const transaction = new ProviderTransaction({
      wallet: walletId,
      provider: result?.provider,
      amountPaid: wallet?.cashPaymentComissionDue,
      paidDate: new Date(),
      type: 'received',
    });

    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();
    return result;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

//  get provider transaction

const getProviderTransactions = async (walletId: string) => {
  const result = await ProviderTransaction.find({ wallet: walletId }).populate(
    'provider',
    'name _id',
  );
  return result;
};

const findTotalAdminIncome = async () => {
  // Sum adminComission from Wallet
  const walletResult = await Wallet.aggregate([
    {
      $group: {
        _id: null,
        totalAdminCommission: { $sum: '$adminComission' },
      },
    },
  ]);

  // Sum serviceFee from Payment
  const paymentResult = await Payment.aggregate([
    {
      $group: {
        _id: null,
        totalServiceFee: { $sum: '$serviceFee' },
      },
    },
  ]);

  return {
    totalAdminCommission: walletResult[0]?.totalAdminCommission || 0,
    totalServiceFee: paymentResult[0]?.totalServiceFee || 0,
  };
};

const getWalletDataForprovider = async (providerId: string) => {
  const result = await Wallet.findOne({ provider: providerId });
};
export const walletServices = {
  findProviderWiseWallet,
  updateTransaction,
  updateWallet,
  findTotalAdminIncome,
  updateCashTransaction,
  getWalletDataForprovider,
};

export const providerTransactionServices = {
  getProviderTransactions,
};
