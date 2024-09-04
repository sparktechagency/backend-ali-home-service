/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../error/AppError';

import { Icustomer } from '../customer/customer.interface';
import Customer from '../customer/customer.model';
import { TUser, UserRole } from './user.interface';
import User from './user.model';
// customer
const insertCustomerIntoDb = async (
  payload: Icustomer & TUser,
): Promise<Icustomer | null> => {
  // check if same number exist
  const isExistUser = await User.isUserExistByNumber(
    payload?.countryCode,
    payload?.phoneNumber,
  );
  if (isExistUser) {
    throw new AppError(
      httpStatus.CONFLICT,
      'User already exist with this same number!',
    );
  }
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const insertUser = await User.create([payload], { session });
    if (!insertUser[0]) {
      throw new AppError(httpStatus.BAD_REQUEST, 'User not created');
    }
    const result = await Customer.create(
      [
        {
          ...payload,
          user: insertUser[0]?._id,
        },
      ],
      { session },
    );
    await session.commitTransaction();
    await session.endSession();
    return result[0];
  } catch (error) {
    await session.commitTransaction();
    await session.abortTransaction();
    throw new Error(error as any);
  }
};
const getme = async (id: string) => {
  const user = await User.findById(id);
  let result;

  switch (user?.role) {
    case UserRole.customer:
      result = await Customer.findOne({ user });
      break;
    default:
      break;
  }
  return result;
};

const updateProfile = async (
  id: string,
  payload: Partial<TUser>,
): Promise<TUser | null> => {
  const user = await User.findById(id);
  //  email update lagbe na
  if (payload?.email) {
    throw new AppError(httpStatus?.BAD_REQUEST, 'email is not for update');
  }
  if (payload?.role) {
    throw new AppError(httpStatus?.BAD_REQUEST, 'role is not for update');
  }
  const result = await User.findByIdAndUpdate(id, payload, { new: true });

  return result;
};

const getSingleUser = async (id: string) => {
  const result = await User.findById(id);
  return result;
};
const deleteAccount = async (id: string, password: string) => {
  console.log(id);
  const user = await User.IsUserExistbyId(id);
  console.log(user);
  const isPasswordMatched = await bcrypt.compare(password, user?.password);
  if (!isPasswordMatched) {
    throw new AppError(httpStatus.NOT_ACCEPTABLE, 'Password does not match!');
  }
  const result = await User.findByIdAndUpdate(
    id,
    {
      $set: {
        isDeleted: true,
      },
    },
    {
      new: true,
    },
  );
  return result;
};

export const userServices = {
  insertCustomerIntoDb,
  getme,
  updateProfile,
  getSingleUser,
  deleteAccount,
};
