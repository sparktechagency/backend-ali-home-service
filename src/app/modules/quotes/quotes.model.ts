import { Schema, model } from 'mongoose';
import { USER_ROLE } from '../user/user.constant';
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
      ref: 'HireRequest',
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
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
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      required: true,
      default: 'pending',
    },
    cancellation: {
      cancelledBy: {
        type: String,
        enum: [USER_ROLE.provider, USER_ROLE.customer],
      },
      reason: {
        type: String,
      },
      cancelledAt: {
        type: Date,
        default: new Date(),
      },
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    isProviderAccept: {
      type: Boolean,
      default: false,
    },
    rejectionReason: {
      type: String,
      default: '',
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
