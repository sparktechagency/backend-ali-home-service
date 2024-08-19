import jwt, { JwtPayload, Secret } from "jsonwebtoken";

import httpStatus from "http-status";
import AppError from "../../error/AppError";
import { User } from "../user/user.model";
import { TchangePassword, Tlogin, TresetPassword } from "./auth.interface";
import config from "../../config";
import { createToken, verifyToken } from "./auth.utils";
import { generateOtp } from "../../utils/otpGenerator";
import moment from "moment";
import { sendEmail } from "../../utils/mailSender";
import bcrypt from "bcrypt";

const login = async (payload: Tlogin) => {
  const user = await User.isUserExist(payload?.email);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }
  if (user?.status === "blocked") {
    throw new AppError(httpStatus.FORBIDDEN, "This user is blocked ! !");
  }
  if (user?.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, "This user is deleted !");
  }
  if (user?.status === "pending") {
    throw new AppError(httpStatus.BAD_REQUEST, "user is not verified");
  }
  if (!(await User.isPasswordMatched(payload.password, user.password))) {
    throw new AppError(httpStatus.BAD_REQUEST, "password do not match");
  }
  const jwtPayload = {
    userId: user?._id,
    role: user.role,
  };
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string
  );
  return {
    user,
    accessToken,
    refreshToken,
  };
};
// change password

const changePassword = async (id: string, payload: TchangePassword) => {
  console.log(payload);
  const user = await User.IsUserExistbyId(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "user not found");
  }

  if (!(await User.isPasswordMatched(payload?.oldPassword, user.password))) {
    throw new AppError(httpStatus.FORBIDDEN, "old password do not match!");
  }
  if (payload?.newPassword !== payload?.confirmPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "old password and new password do not match"
    );
  }
  const hashedPassword = await bcrypt.hash(
    payload?.newPassword,
    Number(config.bcrypt_salt_rounds)
  );
  const result = await User.findByIdAndUpdate(
    id,
    {
      $set: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
      },
    },
    { new: true }
  );
  return result;
};
// forgot password

const forgotPassword = async (email: string) => {
  const user = await User.isUserExist(email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "user not found ");
  }
  if (user?.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "user not found");
  }
  if (user?.status === "blocked") {
    throw new AppError(httpStatus.FORBIDDEN, "your account is inactive");
  }
  const jwtPayload = {
    email: email,
    id: user?._id,
  };
  const token = jwt.sign(jwtPayload, config.jwt_access_secret as Secret, {
    expiresIn: "2m",
  });
  const currentTime = new Date();
  const otp = generateOtp();
  const expiresAt = moment(currentTime).add(2, "minute");
  await User.findByIdAndUpdate(user?._id, {
    verification: {
      otp,
      expiresAt,
    },
  });
  await sendEmail(
    email,
    "your reset password otp is:",
    `<div><h5>your otp is: ${otp}</h5>
    <p>valid for:${expiresAt.toLocaleString()}</p>
    </div>`
  );
  // send the mail here
  return { email, token };
};

const resetPassword = async (token: string, payload: TresetPassword) => {
  console.log(token, payload);
  let decode;
  try {
    decode = jwt.verify(
      token,
      config.jwt_access_secret as string
    ) as JwtPayload;
  } catch (err) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Session has exipired. please try again"
    );
  }
  const user = await User.findById(decode?.id).select("isDeleted verification");

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "user not found");
  }
  if (new Date() > user?.verification?.expiresAt) {
    throw new AppError(httpStatus.FORBIDDEN, "sessions expired");
  }
  if (!user?.verification?.status) {
    throw new AppError(httpStatus.FORBIDDEN, "Otp is not verified yet!");
  }
  if (payload?.newPassword !== payload?.confirmPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "New password and Confirm password do not match!"
    );
  }
  const hashedPassword = await bcrypt.hash(
    payload?.newPassword,
    Number(config.bcrypt_salt_rounds)
  );
  const result = await User.findByIdAndUpdate(decode?.id, {
    password: hashedPassword,
    passwordChangedAt: new Date(),
    verification: {
      otp: 0,
      status: false,
    },
  });
  return result;
};

const refreshToken = async (token: string) => {
  // checking if the given token is valid
  console.log("hitted");
  const decoded = verifyToken(token, config.jwt_refresh_secret as string);
  const { userId } = decoded;
  console.log(decoded);
  const user = await User.IsUserExistbyId(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "This user is not found !");
  }
  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, "This user is deleted !");
  }
  // checking if the user is blocked
  const userStatus = user?.status;

  if (userStatus === "blocked") {
    throw new AppError(httpStatus.FORBIDDEN, "This user is blocked ! !");
  }

  const jwtPayload = {
    userId: user.id,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  return {
    accessToken,
  };
};
export const authServices = {
  login,
  changePassword,
  forgotPassword,
  resetPassword,
  refreshToken,
};
