import { ObjectId } from 'mongoose';

export interface Ipayment {
  customer: ObjectId;
  service: ObjectId;
  quote: ObjectId;
  shop: ObjectId;
  provider: ObjectId;
  amount: number;
  time: string;
  gateway: 'online' | 'cash';
  transactionId?: string;
  isDeleted: boolean;
}
