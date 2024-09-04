import { model, Schema } from 'mongoose';
import { Icustomer, name } from './customer.interface';

// Define the schema for the User model
const nameSchema = new Schema<name>({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
});
const CustomerSchema = new Schema<Icustomer>(
  {
    name: nameSchema,
    address: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    location: {
      coordiantes: [Number],
      type: {
        type: String,
        default: 'Point',
      },
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
CustomerSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

CustomerSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

CustomerSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});
// Create and export the User model
const Customer = model<Icustomer>('Customer', CustomerSchema);

export default Customer;
