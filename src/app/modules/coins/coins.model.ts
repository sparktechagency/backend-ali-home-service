import { model, Schema } from 'mongoose';
import { Icoin } from './coins.interface';

const coinSchema = new Schema<Icoin>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer', // Assuming you have a Customer model
      required: true,
    },
    coins: {
      type: Number,
      required: true,
      min: 0, // Coins should not be negative
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Create and export the model
export const Coin = model<Icoin>('Coin', coinSchema);
coinSchema.statics.hasLessThan500Coins = async function (
  customerId: string,
): Promise<boolean> {
  const coinDocument = await this.findOne({
    customer: customerId,
  });
  if (!coinDocument) {
    return false; // or throw an error if no document is found
  }
  return coinDocument.coins < 500; // Check if coins are less than 500
};
