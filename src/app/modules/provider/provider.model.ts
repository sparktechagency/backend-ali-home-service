import { model, Schema } from 'mongoose';
import { Ilocation } from '../../interface/common';
import { Iimage } from '../customer/customer.interface';
import { Iname, IServiceProvider } from './provider.interface';

const NameSchema = new Schema<Iname>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
});

const LocationSchema = new Schema<Ilocation>({
  coordiantes: { type: [Number], required: true },
  type: { type: String, enum: ['Point'], required: true },
});

const ImageSchema = new Schema<Iimage>({
  id: { type: String, required: true },
  url: { type: String, required: true },
});

const ProviderSchema = new Schema<IServiceProvider>({
  name: { type: NameSchema, required: true },
  address: { type: String, required: true },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  location: { type: LocationSchema, required: true },
  countryCode: { type: String, required: true },
  helpLineNumber: { type: String },
  image: { type: ImageSchema, required: true },
  isDeleted: { type: Boolean, default: false },
});

export const Provider = model<IServiceProvider>('Provider', ProviderSchema);
