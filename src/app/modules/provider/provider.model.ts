import { model, Schema } from 'mongoose';
import { Iimage } from '../customer/customer.interface';
import { IBank, Iname, IServiceProvider } from './provider.interface';

const NameSchema = new Schema<Iname>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
});

const ImageSchema = new Schema<Iimage>({
  id: { type: String, required: true },
  url: { type: String, required: true },
});

const BankSchema = new Schema<IBank>({
  iban: { type: String, required: true },
  accountHolderName: { type: String, required: true },
  accountNumber: { type: Number, required: true },
  bankName: { type: String, required: true },
});

const ProviderSchema = new Schema<IServiceProvider>({
  name: { type: NameSchema, required: true },
  address: { type: String, required: true },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'others'],
  },
  countryCode: { type: String, required: true },
  fcmToken: {
    type: String,
    default: ' ',
  },
  helpLineNumber: { type: String },
  image: { type: ImageSchema },
  bank: BankSchema,
  isDeleted: { type: Boolean, default: false },
});

export const Provider = model<IServiceProvider>('Provider', ProviderSchema);
