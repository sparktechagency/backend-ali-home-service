import { ObjectId } from 'mongoose';
import { Iimage } from '../../interface/common';

export interface Iname {
  firstName: string;
  lastName: string;
}
export interface IEmployee {
  owner: ObjectId;
  shop: ObjectId;
  name: Iname;
  user: ObjectId;
  phoneNumber: string;
  password: string;
  department: string;
  fcmToken: string;
  isDeleted: boolean;
  image: Iimage;
}
