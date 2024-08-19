import { Model } from "mongoose";
export interface TUser {
  [x: string]: any;
  id: string;
  email: string;
  password: string;
  phoneNumber: string;
  userName?: string;
  fullName: string;
  needsPasswordChange: boolean;
  passwordChangedAt?: Date;
  role: "admin" | "vendor" | "user";
  status: "pending" | "active" | "blocked";
  isDeleted: boolean;
  image?: string;
  verification: {
    otp: string | number;
    expiresAt: Date;
    status: boolean;
  };
}

export interface UserModel extends Model<TUser> {
  isUserExist(email: string): Promise<TUser>;
  IsUserExistbyId(id: string): Promise<TUser>;

  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string
  ): Promise<boolean>;
}
