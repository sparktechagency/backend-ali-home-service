import { model, Schema } from 'mongoose';
import { Iimage } from '../../interface/common';
import { IserviceCategory } from './serviceCategory.interface';
const ImageSchema = new Schema<Iimage>({
  id: { type: String, required: true },
  url: { type: String, required: true },
});

const serviceCategorySchema = new Schema<IserviceCategory>(
  {
    title: {
      type: String,
      required: true,
    },
    image: ImageSchema,
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// filter out deleted documents
serviceCategorySchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

serviceCategorySchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

serviceCategorySchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

const ServiceCategory = model<IserviceCategory>(
  'Category',
  serviceCategorySchema,
);
export default ServiceCategory;
