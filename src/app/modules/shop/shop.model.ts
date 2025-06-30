import { model, Schema } from 'mongoose';
import { ImageSchema } from '../../../common/schemas/image.schema';
import { Ishop, ShopModel } from './shop.interface';

const ShopSchema = new Schema<Ishop, ShopModel>(
  {
    provider: { type: Schema.Types.ObjectId, ref: 'Provider', required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    totalReviews: {
      type: Number,
      default: 0,
    },
    helpLineNumber: { type: Number, required: true },
    license: { type: String, required: true },
    location: {
      coordinates: [Number],
      type: {
        type: String,
        default: 'Point',
      },
    },
    image: ImageSchema, // Use the imported ImageSchema
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

ShopSchema.statics.isShopExistUnderSameProvider = async function (
  provider: string,
): Promise<Ishop | null> {
  return this.findOne({ provider });
};
// filter out deleted documents
ShopSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

ShopSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

// ShopSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
//   next();
// });

export const Shop = model<Ishop, ShopModel>('Shop', ShopSchema);
