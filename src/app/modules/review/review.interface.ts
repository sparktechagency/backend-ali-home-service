import { ObjectId } from 'mongoose';

export interface Ireview {
  service: ObjectId;
  order: ObjectId;
  comment: string;
  rating: number;
  customer: string;
  isDeleted: boolean;
}
