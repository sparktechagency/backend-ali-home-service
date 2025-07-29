import { model, Schema, Types } from 'mongoose';

const WalletSchema = new Schema({
  provider: { type: Types.ObjectId, ref: 'Provider', required: true },
  shop: { type: Types.ObjectId, ref: 'Shop', required: true },
  percentage: { type: Number, default: 30 },
  totalPaid: { type: Number, default: 0 },
  adminComission: { type: Number, default: 0 },
  amount: { type: Number, default: 0 },
  totalCashPayment: { type: Number, default: 0 },
  totalCashPaymentComissionIncome: { type: Number, default: 0 },
  cashPaymentComissionDue: { type: Number, default: 0 },
  lastPaidAmount: { type: Number },
  lastPaidDate: { type: String },
  isDeleted: { type: Boolean, default: false },
});

const ProviderTransactionSchema = new Schema({
  wallet: { type: Types.ObjectId, ref: 'Wallet', required: true },
  provider: { type: Types.ObjectId, ref: 'Provider', required: true },
  amountPaid: { type: Number, required: true },
  paidDate: { type: Date, default: Date.now },
  paidVia: {
    type: String,
    enum: ['cash', 'bank', 'mobile'],
    required: true,
    default: 'bank',
  },
  type: {
    type: String,
    enum: ['paid', 'received'],
    required: true,
    default: 'paid',
  },
  remainingAmount: { type: Number },
  note: { type: String },
});

export const ProviderTransaction = model(
  'ProviderTransaction',
  ProviderTransactionSchema,
);
export const Wallet = model('Wallet', WalletSchema);
