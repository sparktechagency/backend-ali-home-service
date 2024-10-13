/* eslint-disable @typescript-eslint/no-explicit-any */
import { Model } from 'mongoose';
export enum UserRole {
  super_admin = 'super_admin',
  sub_admin = 'sub_admin',
  provider = 'provider',
  customer = 'customer',
  employee = 'employee',
}
export enum status {
  pending = 'pending',
  active = 'active',
  blocked = 'blocked',
}
interface Verification {
  otp: string | number;
  expiresAt: Date;
  status: boolean;
}
export interface TUser {
  [x: string]: any;
  id?: string;
  email?: string;
  password: string;
  phoneNumber: string;
  needsPasswordChange: boolean;
  passwordChangedAt?: Date;
  role: UserRole;
  status?: status;
  isVerified: boolean;
  isActive: boolean;
  isDeleted: boolean;
  verification: Verification;
  countryCode: string;
  fcmToken?: string;
}

export interface UserModel extends Model<TUser> {
  isUserExist(email: string): Promise<TUser>;
  isUserExistByNumber(countryCode: string, phoneNumber: string): Promise<TUser>;
  IsUserExistbyId(id: string): Promise<TUser>;
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
}
