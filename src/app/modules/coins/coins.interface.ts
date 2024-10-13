import { ObjectId } from 'mongoose';

export interface Icoin {
  customer: ObjectId;
  coins: number;
  isDeleted: boolean;
}
