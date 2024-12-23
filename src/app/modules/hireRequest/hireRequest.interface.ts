import { ObjectId } from 'mongoose';
import { Iimage } from '../../interface/common';

export interface IhireRequest {
  customer: ObjectId;
  service: ObjectId;
  address: string;
  description: string;
  provider: string;
  images: Iimage[];
  status: 'pending' | 'quote_sent' | 'rejected';
  priority: 'yes' | 'no';
  isDeleted: boolean;
}
