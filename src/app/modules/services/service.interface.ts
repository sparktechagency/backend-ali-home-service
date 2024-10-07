/* eslint-disable @typescript-eslint/no-empty-object-type */
import { Model, ObjectId } from 'mongoose';
import { Iimage } from '../../interface/common';
export interface IpriceDetails {
  quote?: boolean;
  range?: {
    min: number;
    max: number;
  };
  fixedPrice?: number;
}
export interface Iservice {
  category: ObjectId;
  shop: ObjectId;
  isRequestAccept: boolean;
  serviceType: 'quote' | 'range' | 'fixedPrice';
  priceDetails: IpriceDetails;
  totalReviews: number;
  duration: number;
  description: string;
  avgReviews: number;
  images: Iimage[];
  isDeleted: boolean;
}
export interface ServiceModel extends Model<Iservice> {}
