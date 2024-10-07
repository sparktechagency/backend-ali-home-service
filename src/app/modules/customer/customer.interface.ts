import { ObjectId } from 'mongoose';

export interface name {
  firstName: string;
  lastName: string;
}
enum gender {
  Male = 'Male',
  Female = 'Female',
  OtherS = 'Others',
}
interface location {
  coordiantes: [number];
  type: string;
}

export interface Iimage {
  id: string;
  url: string;
}

export interface Icustomer {
  name: name;
  address: string;
  user: ObjectId;
  location: location;
  image: string;
  isDeleted: boolean;
  dateOfBirth: string;
  gender: gender;
}
