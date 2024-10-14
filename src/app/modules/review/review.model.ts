import { model, Schema } from 'mongoose';
import { Ireview } from './review.interface';

const reviewSchema = new Schema<Ireview>(
  {
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Service', // Assuming you have a Service model
      required: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order', // Assuming you have an Order model
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
      min: 1, // Assuming rating is between 1 and 5
      max: 5,
    },
    customer: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }, // Automatically manage createdAt and updatedAt fields
);

// Create and export the model
export const Review = model<Ireview>('Review', reviewSchema);
