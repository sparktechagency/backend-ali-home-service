import { ObjectId } from 'mongoose';
import { Iimage } from '../customer/customer.interface';

export interface Iname {
  firstName: string;
  lastName: string;
}

export interface IBank {
  accountHolderName: string;
  accountNumber: number;
  iban: string;
  bankName: string;
}
enum gender {
  Male = 'Male',
  Female = 'Female',
  OtherS = 'Others',
}
export interface IServiceProvider {
  name: Iname;
  user: ObjectId;
  address: string;
  phoneNumber1: string;
  countryCode: string;
  helpLineNumber: string;
  image: Iimage;
  gender: gender;
  fcmToken: string;
  isDeleted: boolean;
  bank: IBank;
}
