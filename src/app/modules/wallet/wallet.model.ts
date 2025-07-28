import { model, Schema, Types } from 'mongoose';

const WalletSchema = new Schema({
  provider: { type: Types.ObjectId, ref: 'Provider' },
  shop: { type: Types.ObjectId, ref: 'Shop' },
  percentage: { type: Number, default: 30 },
  totalPaid: { type: Number, default: 0 },
  adminComission: { type: Number, default: 0 },
  amount: { type: Number, required: true },
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
  remainingAmount: { type: Number, required: true },
  note: { type: String },
});

export const ProviderTransaction = model(
  'ProviderTransaction',
  ProviderTransactionSchema,
);
export const Wallet = model('Wallet', WalletSchema);
