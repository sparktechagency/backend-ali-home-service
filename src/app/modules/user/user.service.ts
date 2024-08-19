import httpStatus from "http-status";
import AppError from "../../error/AppError";
import { TUser } from "./user.interface";
import { User } from "./user.model";
import { generateOtp } from "../../utils/otpGenerator";
import moment from "moment";
import { deleteFile } from "../../utils/fileHelper";
import config from "../../config";
import jwt, { Secret } from "jsonwebtoken";
import { sendEmail } from "../../utils/mailSender";
import QueryBuilder from "../../builder/QueryBuilder";
import bcrypt from "bcrypt";
const insertUserIntoDb = async (
  payload: Partial<TUser>
): Promise<{ user: TUser; token: string }> => {
  console.log(payload);
  const user = await User.isUserExist(payload.email as string);
  if (user) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "user already exist with this email"
    );
  }
  const otp = generateOtp();
  const expiresAt = moment().add(1, "minute");
  const formatedData = {
    ...payload,
    role: "user",
    status: "pending",
    verification: {
      otp,
      expiresAt,
    },
  };

  const result = await User.create(formatedData);
  const jwtPayload = {
    email: payload?.email,
    id: result?._id,
  };
  const token = jwt.sign(jwtPayload, config.jwt_access_secret as Secret, {
    expiresIn: "1m",
  });
  await sendEmail(
    payload?.email!,
    "Your Otp Is",
    `<div><h5>your otp is: ${otp}</h5>
    <p>valid for:${expiresAt.toLocaleString()}</p>
    </div>`
  );
  return {
    user: result,
    token: token,
  };
};

const insertVendorIntoDb = async (payload: Partial<TUser>): Promise<TUser> => {
  const user = await User.isUserExist(payload.email as string);
  if (user) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "user already exist with this email"
    );
  }
  const formatedData = {
    ...payload,
    needsPasswordChange: true,
  };
  console.log(formatedData);
  const result = await User.create(formatedData);
  console.log(result);
  await sendEmail(
    result?.email,
    "Your Gmail And Password Is:",
    `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #4CAF50;">Your One Time OTP</h2>
    <div style="background-color: #f2f2f2; padding: 20px; border-radius: 5px;">
      <p style="font-size: 16px;">Your Gmail Is: <strong>${result.email}</strong></p>
      <p style="font-size: 14px; color: #666;">Your Login Password Is: ${payload?.password}</p>
    </div>
  </div>`
  );
  return result;
};

const getme = async (id: string): Promise<TUser | null> => {
  const result = await User.findById(id);
  return result;
};

const updateProfile = async (
  id: string,
  payload: Partial<TUser>
): Promise<TUser | null> => {
  const user = await User.findById(id);
  //  email update lagbe na
  if (payload?.email) {
    throw new AppError(httpStatus?.BAD_REQUEST, "email is not for update");
  }
  if (payload?.role) {
    throw new AppError(httpStatus?.BAD_REQUEST, "role is not for update");
  }
  const result = await User.findByIdAndUpdate(id, payload, { new: true });

  if (result && payload?.image) {
    await deleteFile(user?.image!);
  }
  return result;
};

const getAllusers = async (query: Record<string, any>) => {
  const userModel = new QueryBuilder(User.find(), query)
    .search(["email", "fullName"])
    .filter()
    .paginate()
    .sort()
    .fields();
  const data = await userModel.modelQuery;
  const meta = await userModel.countTotal();
  return {
    data,
    meta,
  };
};

const getSingleUser = async (id: string) => {
  const result = await User.findById(id);
  return result;
};
const updateUser = async (
  id: string,
  payload: Partial<TUser>
): Promise<TUser | null> => {
  const user = await User.findById(id);
  //  email update lagbe na
  if (payload?.email) {
    throw new AppError(httpStatus?.BAD_REQUEST, "email is not for update");
  }
  if (payload?.role) {
    throw new AppError(httpStatus?.BAD_REQUEST, "role is not for update");
  }
  const result = await User.findByIdAndUpdate(id, payload, { new: true });

  if (result && payload?.image) {
    await deleteFile(user?.image!);
  }
  return result;
};

const deleteAccount = async (id: string, password: string) => {
  console.log(id);
  const user = await User.IsUserExistbyId(id);
  console.log(user);
  const isPasswordMatched = await bcrypt.compare(password, user?.password);
  if (!isPasswordMatched) {
    throw new AppError(httpStatus.NOT_ACCEPTABLE, "Password does not match!");
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
    }
  );
  return result;
};

export const userServices = {
  insertUserIntoDb,
  insertVendorIntoDb,
  getme,
  updateProfile,
  getAllusers,
  updateUser,
  getSingleUser,
  deleteAccount,
};
