import mongoose, { model, Schema } from 'mongoose';
import { ImageSchema } from '../../../common/schemas/image.schema';
import { IpriceDetails, Iservice } from './service.interface';

const PriceDetailsSchema: Schema = new Schema<IpriceDetails>({
  quote: { type: Boolean, default: false },
  range: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
  },
  fixedPrice: { type: Number },
});

const ServiceSchema = new Schema<Iservice>(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    isRequestAccept: { type: Boolean, required: true },
    serviceType: {
      type: String,
      enum: ['quote', 'range', 'fixedPrice'],
      required: true,
    },
    priceDetails: PriceDetailsSchema,
    totalReviews: { type: Number, default: 0 },
    avgReviews: { type: Number, default: 0 },
    images: [ImageSchema],
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

const Service = model<Iservice>('Service', ServiceSchema);

export default Service;
