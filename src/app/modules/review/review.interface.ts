import { ObjectId } from 'mongoose';

export interface Ireview {
  service: ObjectId;
  order: ObjectId;
  quote: ObjectId;
  comment: string;
  rating: number;
  customer: ObjectId;
  isDeleted: boolean;
}
