import { model, Schema } from 'mongoose';
import { ImageSchema } from '../../../common/schemas/image.schema';

// Hire Request schema
const hireRequestSchema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Service', // Replace with the actual service model
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: [ImageSchema], // Embedding the image schema
    status: {
      type: String,
      enum: ['pending', 'quote_sent', 'rejected'],
      default: 'pending',
      required: true,
    },
    priority: {
      type: String,
      enum: ['yes', 'no'],
      default: 'no',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

hireRequestSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

hireRequestSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

hireRequestSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

const HireRequest = model('HireRequest', hireRequestSchema);

export default HireRequest;
