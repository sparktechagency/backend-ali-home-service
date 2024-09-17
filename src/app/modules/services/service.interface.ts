import { ObjectId } from 'mongoose';
import { Ilocation } from '../../interface/common';
interface priceDetails {
  quote?: boolean;
  range?: {
    min: number;
    max: number;
  };
  fixed?: number;
}
export interface Ishop {
  location: Ilocation;
  category: ObjectId;
  serviceType: 'quote' | 'range' | 'fixed';
  priceDetails: priceDetails;
  isDeleted: boolean;
}
