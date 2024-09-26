import { ObjectId } from 'mongoose';
import { Iimage } from '../../interface/common';

export interface IhireRequest {
  customer: ObjectId;
  service: ObjectId;
  address: string;
  description: string;
  images: Iimage[];
  status: 'pending' | 'accepted' | 'rejected';
  priority: 'yes' | 'no';
  isDeleted: boolean;
}
