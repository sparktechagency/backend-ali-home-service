/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import mongoose, { PipelineStage } from 'mongoose';
import AppError from '../../error/AppError';

import config from '../../config';
import calculatePagination from '../../shared/paginationHelper';
import { createToken } from '../auth/auth.utils';
import { Icustomer } from '../customer/customer.interface';
import Customer from '../customer/customer.model';
import { IEmployee } from '../employee/employee.interface';
import Employee from '../employee/employee.model';
import { IServiceProvider } from '../provider/provider.interface';
import { Provider } from '../provider/provider.model';
import { USER_ROLE } from './user.constant';
import { TUser, UserQuery, UserRole } from './user.interface';
import User, { Admin } from './user.model';

// customer
const insertCustomerIntoDb = async (
  payload: Icustomer & TUser,
): Promise<Icustomer | null> => {
  // check if same number exist
  const isExistUser = await User.findOne({ email: payload?.email });
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
const insertAdminIntoDb = async (payload: any): Promise<any | null> => {
  // check if same email exists
  const isExistUser = await User.findOne({ email: payload?.email });
  if (isExistUser) {
    throw new AppError(
      httpStatus.CONFLICT,
      'User already exists with this email!',
    );
  }
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Create user (directly verified, no OTP)
    const insertUser = await User.create([{ ...payload, isVerified: true }], {
      session,
    });
    if (!insertUser[0]) {
      throw new AppError(httpStatus.BAD_REQUEST, 'User not created');
    }

    // Create admin profile (name, image in admin model)
    const adminData = {
      fullName: payload.fullName,
      image: payload.image,
      user: insertUser[0]?._id,
    };
    const result = await Admin.create([adminData], { session });

    await session.commitTransaction();
    await session.endSession();
    return result[0];
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error(error as any);
  }
};

// login with google customer

const SignupWithGoogleForCustomer = async (payload: Icustomer & TUser) => {
  const { email } = payload;
  const user: any = await User.findOne({ email });
  let needPhoneNumber = false;
  let profile: any = {};
  // if account is found
  if (user) {
    if (!user?.isActive) {
      throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked !');
    }
    if (user?.isDeleted) {
      throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !');
    }
    if (!user?.isVerified) {
      throw new AppError(httpStatus.BAD_REQUEST, 'User is not verified !');
    }

    profile = await Customer.findOne({ user: user?._id });
    await Customer.updateOne(
      { _id: profile?._id },
      { fcmToken: payload?.fcmToken },
    );

    // Generate tokens
    const jwtPayload = {
      userId: user?._id,
      profileId: profile?._id,
      role: user.role,
    };
    const accessToken = createToken(
      jwtPayload,
      config.jwt_access_secret as string,
      config.jwt_access_expires_in as string,
    );

    const refreshToken = createToken(
      jwtPayload,
      config.jwt_refresh_secret as string,
      config.jwt_refresh_expires_in as string,
    );

    if (!user?.phoneNumber) {
      needPhoneNumber = true;
    }

    return {
      user: {},
      accessToken,
      refreshToken,
      needPhoneNumber,
    };
  }

  // if account is not found
  const session = await mongoose.startSession();

  const otp = {
    otp: 123456,
    expiresAt: '2024-09-11T08:30:00.000Z',
    status: true,
  };

  try {
    session.startTransaction();

    // Create user
    const data = {
      ...payload,
      phoneNumber: '',
      couontryCode: '',
      verification: otp,
    };
    const insertUser = await User.create([data], {
      session,
    });

    if (!insertUser[0]) {
      throw new AppError(httpStatus.BAD_REQUEST, 'User not created');
    }

    // Create customer profile
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
    session.endSession();

    // Generate tokens
    const jwtPayload: any = {
      userId: insertUser[0]?._id,
      profileId: result[0]?._id,
      role: insertUser[0]?.role,
    };

    const accessToken = createToken(
      jwtPayload,
      config.jwt_access_secret as string,
      config.jwt_access_expires_in as string,
    );

    const refreshToken = createToken(
      jwtPayload,
      config.jwt_refresh_secret as string,
      config.jwt_refresh_expires_in as string,
    );

    return {
      user: {},
      accessToken,
      refreshToken,
      needPhoneNumber: !insertUser[0]?.phoneNumber,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
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
// employee
const insertEmployeeIntoDb = async (
  payload: IEmployee & TUser,
): Promise<IEmployee | null> => {
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
    const result = await Employee.create(
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
    case UserRole.employee:
      result = await Employee.findOne({ user }).populate('user');
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

const updatePhoneNumber = async (id: string, payload: any) => {
  const result = await User.findByIdAndUpdate(id, payload);
  return result;
};
const getUserStaticsData = async () => {
  const totalCustomer = await User.countDocuments({ role: USER_ROLE.customer });
  const totalProviders = await User.countDocuments({
    role: USER_ROLE.provider,
  });

  return {
    totalCustomer,
    totalProviders,
  };
};

export const getAllUsers = async (query: UserQuery) => {
  const { searchTerm, role, ...otherFilters } = query;
  const { page, limit } = calculatePagination(query);
  const skip = (page - 1) * limit;
  const andConditions: any[] = [];

  // Search condition (name, email, phoneNumber)
  if (searchTerm) {
    andConditions.push({
      $or: ['fullName', 'email', 'phoneNumber'].map((field) => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    });
  }
  if (role) {
    andConditions.push({ role });
  }
  // Additional filters
  if (Object.keys(otherFilters).length) {
    andConditions.push({
      $and: Object.entries(otherFilters).map(([key, value]) => ({
        [key]: value,
      })),
    });
  }

  // Always exclude deleted users
  andConditions.push({ isDeleted: false });

  const matchCondition =
    andConditions.length > 0 ? { $and: andConditions } : {};

  // Base pipeline
  const pipeline: PipelineStage[] = [{ $match: matchCondition }];

  // Role-specific lookup and projection
  if (role === USER_ROLE.customer) {
    pipeline.push(
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: 'user',
          as: 'customerInfo',
        },
      },
      {
        $project: {
          _id: 1,
          email: 1,
          role: 1,
          isActive: 1,
          isDeleted: 1,
          createdAt: 1,
          fullName: { $arrayElemAt: ['$customerInfo.name', 0] },
          image: { $arrayElemAt: ['$customerInfo.image', 0] },
          address: { $arrayElemAt: ['$customerInfo.address', 0] },
          countryCode: 1,
          phoneNumber: 1,
        },
      },
    );
  } else if (role === USER_ROLE.provider) {
    pipeline.push(
      {
        $lookup: {
          from: 'providers',
          localField: '_id',
          foreignField: 'user',
          as: 'providerInfo',
        },
      },
      {
        $addFields: {
          providerId: { $arrayElemAt: ['$providerInfo._id', 0] },
        },
      },
      {
        $lookup: {
          from: 'shops',
          localField: 'providerId',
          foreignField: 'provider',
          as: 'shopInfo',
        },
      },
      {
        $project: {
          _id: 1,
          email: 1,
          role: 1,
          isActive: 1,
          isDeleted: 1,
          createdAt: 1,
          fullName: { $arrayElemAt: ['$providerInfo.name', 0] },
          providerId: 1,
          image: { $arrayElemAt: ['$providerInfo.image', 0] },
          // address: { $arrayElemAt: ['$providerInfo.address', 0] },
          countryCode: 1,
          phoneNumber: 1,
          shop: {
            name: { $arrayElemAt: ['$shopInfo.name', 0] },
            address: { $arrayElemAt: ['$shopInfo.address', 0] },
            helpLineNumber: { $arrayElemAt: ['$shopInfo.helpLineNumber', 0] },
            license: { $arrayElemAt: ['$shopInfo.license', 0] },
            _id: { $arrayElemAt: ['$shopInfo._id', 0] },
          },
        },
      },
    );
  } else {
    pipeline.push({
      $project: {
        _id: 1,
        email: 1,
        role: 1,

        isActive: 1,
        isDeleted: 1,
        createdAt: 1,
      },
    });
  }

  // Sorting, pagination
  pipeline.push(
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
  );

  // Query database
  const users = await User.aggregate(pipeline);
  const total = await User.countDocuments(matchCondition);

  return {
    data: users,
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};

const updateUser = async (id: string, payload: Partial<TUser>) => {
  const user = await User.findByIdAndUpdate(id, payload, { new: true });
  return user;
};
export const userServices = {
  insertEmployeeIntoDb,
  insertCustomerIntoDb,
  SignupWithGoogleForCustomer,
  insertProviderIntoDb,
  getme,
  updateProfile,
  getSingleUser,
  deleteAccount,
  updatePhoneNumber,
  insertAdminIntoDb,
  getUserStaticsData,
  getAllUsers,
  updateUser,
};
