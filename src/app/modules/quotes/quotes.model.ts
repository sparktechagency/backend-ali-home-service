import { Schema, model } from 'mongoose';
import { IQuotes } from './quotes.interface';

const QuotesSchema = new Schema<IQuotes>(
  {
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    request: {
      type: Schema.Types.ObjectId,
      ref: 'Request',
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    fee: {
      type: Number,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    isReviewed: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'canceled'],
      required: true,
      default: 'pending',
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    isProviderAccept: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

QuotesSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

QuotesSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

QuotesSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});
export const Quotes = model('Quotes', QuotesSchema);
