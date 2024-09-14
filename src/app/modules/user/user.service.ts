/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../error/AppError';

import { Icustomer } from '../customer/customer.interface';
import Customer from '../customer/customer.model';
import { IServiceProvider } from '../provider/provider.interface';
import { Provider } from '../provider/provider.model';
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

  const otp = {
    otp: 123456,
    expiresAt: '2024-09-11T08:30:00.000Z',
    status: true,
  };
  try {
    session.startTransaction();
    const insertUser = await User.create([{ ...payload, verification: otp }], {
      session,
    });
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
    console.log('==================result', result[0]);
    return result[0];
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error(error as any);
  }
};
// provider
const insertProviderIntoDb = async (
  payload: IServiceProvider & TUser,
): Promise<IServiceProvider | null> => {
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

  const otp = {
    otp: 123456,
    expiresAt: '2024-09-11T08:30:00.000Z',
    status: true,
  };
  try {
    session.startTransaction();
    const insertUser = await User.create([{ ...payload, verification: otp }], {
      session,
    });
    if (!insertUser[0]) {
      throw new AppError(httpStatus.BAD_REQUEST, 'User not created');
    }
    const result = await Provider.create(
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
    console.log('==================result', result[0]);
    return result[0];
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error(error as any);
  }
};
const getme = async (id: string) => {
  const user = await User.findById(id);
  let result;
  switch (user?.role) {
    case UserRole.customer:
      result = await Customer.findOne({ user }).populate('user');
      break;
    case UserRole.provider:
      result = await Provider.findOne({ user }).populate('user');
      break;
    default:
      break;
  }
  return result;
};

const updateProfile = async (
  id: string,
  payload: Partial<TUser & Icustomer>,
) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found !!');
  }
  //  email update lagbe na
  if (payload?.phoneNumber) {
    throw new AppError(
      httpStatus?.BAD_REQUEST,
      'phoneNumber is not for update',
    );
  }
  if (payload?.role) {
    throw new AppError(httpStatus?.BAD_REQUEST, 'role is not for update');
  }
  let result;
  switch (user?.role) {
    case UserRole.customer:
      result = await Customer.findOneAndUpdate({ user: id }, payload, {
        new: true,
      });
      break;
    case UserRole.provider:
      result = await Provider.findOneAndUpdate({ user: id }, payload, {
        new: true,
      });
      break;

    default:
      break;
  }

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
  insertProviderIntoDb,
  getme,
  updateProfile,
  getSingleUser,
  deleteAccount,
};
