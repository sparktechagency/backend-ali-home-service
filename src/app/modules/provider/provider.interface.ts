import { ObjectId } from 'mongoose';
import { Iimage } from '../customer/customer.interface';

export interface Iname {
  firstName: string;
  lastName: string;
}

export interface IServiceProvider {
  name: Iname;
  user: ObjectId;
  address: string;
  phoneNumber1: string;
  countryCode: string;
  helpLineNumber: string;
  image: Iimage;
  isDeleted: boolean;
}
