import { ObjectId } from 'mongoose';

export interface IQuotes {
  service: ObjectId;
  isReviewed: boolean;
  request?: ObjectId;
  customer: ObjectId;
  fee: number;
  date: string;
  employee: ObjectId;
  isPaid: boolean;
  paymentGateway: 'cash' | 'online';
  isProviderAccept?: boolean;
  isDeleted: boolean;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'canceled';
}
