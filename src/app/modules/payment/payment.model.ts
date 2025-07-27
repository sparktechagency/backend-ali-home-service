import { model, Schema } from 'mongoose';
import { Ipayment } from './payment.interface';
import moment from 'moment';

const paymentSchema = new Schema<Ipayment>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    quote: {
      type: Schema.Types.ObjectId,
      ref: 'Quote',
      required: true,
    },
    // shop: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'Shop',
    //   required: true,
    // },
    // provider: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'Provider',
    //   required: true,
    // },
    amount: {
      type: Number,
      required: true,
    },
    coins: {
      type: Number,
      default: 0,
    },
    serviceFee: {
      type: Number,
      default: 0,
    },
    amountPaidWithCoins: {
      type: Number,
      default: 0,
    },
    // time: {
    //   type: String,
    //   required: true,
    // },
    gateway: {
      type: String,
      enum: ['online', 'cash'],
      required: true,
    },
    date:{
      type:String,
      default: moment(Date.now()).format('YYYY-MM-DD'),
    },
    transactionId: {
      type: String,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  },
);

// Export the payment model
export const Payment = model<Ipayment>('Payment', paymentSchema);
