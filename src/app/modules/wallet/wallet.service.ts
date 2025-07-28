import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../error/AppError';
import { ProviderTransaction, Wallet } from './wallet.model';

const findProviderWiseWallet = async (id: string) => {
  const result = await Wallet.findOne({ provider: id });
  return result;
};

const updateWallet = async (walletId: string, data: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Fetch the existing wallet
    const wallet = await Wallet.findById(walletId).session(session);
    if (!wallet) throw new Error('Wallet not found');

    const amountToPay = data?.amountPaid;
    if (amountToPay > wallet.amount) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Paid amount exceeds wallet balance',
      );
    }

    // Update wallet fields
    wallet.amount -= amountToPay;
    wallet.lastPaidAmount = amountToPay;
    wallet.lastPaidDate = new Date().toISOString();

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
//  get provider transaction

const getProviderTransactions = async (walletId: string) => {
  console.log(walletId);
  const result = await ProviderTransaction.find({ wallet: walletId }).populate(
    'provider',
    'name _id',
  );
  return result;
};

export const walletServices = {
  findProviderWiseWallet,
  updateWallet,
};

export const providerTransactionServices = {
  getProviderTransactions,
};
