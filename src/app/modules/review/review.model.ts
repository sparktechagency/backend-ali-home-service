import { model, Schema } from 'mongoose';
import { Ireview } from './review.interface';

const reviewSchema = new Schema<Ireview>(
  {
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Service', // Assuming you have a Service model
      required: true,
    },
    quote: {
      type: Schema.Types.ObjectId,
      ref: 'Quote', // Assuming you have an Order model
      required: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true, // Trim whitespace
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Create and export the model
export const Review = model<Ireview>('Review', reviewSchema);
