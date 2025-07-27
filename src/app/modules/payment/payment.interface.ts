import { ObjectId } from 'mongoose';

export interface Ipayment {
  customer: ObjectId;
  service: ObjectId;
  quote: ObjectId;
  shop: ObjectId;
  provider: ObjectId;
  amount: number;
  date: string;
  coins?: number;
  amountPaidWithCoins?: number;
  time: string;
  gateway: 'online' | 'cash';
  serviceFee: number;
  transactionId?: string;
  isDeleted: boolean;
}
