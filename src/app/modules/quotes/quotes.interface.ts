import { ObjectId } from 'mongoose';

export interface IQuotes {
  service: ObjectId;
  request?: ObjectId;
  customer: ObjectId;
  fee: number;
  date: string;
  isDeleted: boolean;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'canceled';
}
