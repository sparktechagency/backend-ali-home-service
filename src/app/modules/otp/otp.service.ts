import httpStatus from "http-status";
import AppError from "../../error/AppError";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import config from "../../config";
import { User } from "../user/user.model";
import { generateOtp } from "../../utils/otpGenerator";
import moment from "moment";
import { sendEmail } from "../../utils/mailSender";

const verifyOtp = async (token: string, otp: string | number) => {
  console.log(otp, "otp");
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, "you are not authorized!");
  }
  let decode;
  try {
    decode = jwt.verify(
      token,
      config.jwt_access_secret as string
    ) as JwtPayload;
  } catch (err) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "session has expired.please try to submit otp withing 1 minute"
    );
  }
  const user = await User.findById(decode?.id).select("verification status");
  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, "user not found");
  }
  if (new Date() > user?.verification?.expiresAt) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "otp has expired. Please resend it"
    );
  }
  if (Number(otp) !== Number(user?.verification?.otp)) {
    throw new AppError(httpStatus.BAD_REQUEST, "otp did not match");
  }

  const updateUser = await User.findByIdAndUpdate(
    user?._id,
    {
      $set: {
        status: user?.status === "active" ? user?.status : "active",
        verification: {
          otp: 0,
          expiresAt: moment().add(2, "minute"),
          status: true,
        },
      },
    },
    { new: true }
  );
  const jwtPayload = {
    email: user?.email,
    id: user?._id,
  };
  const jwtToken = jwt.sign(jwtPayload, config.jwt_access_secret as Secret, {
    expiresIn: "2m",
  });
  return { user: updateUser, token: jwtToken };
};

const resendOtp = async (email: string) => {
  console.log(email);
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError(httpStatus.BAD_REQUEST, "user not found");
  }
  const otp = generateOtp();
  const expiresAt = moment().add(2, "minute");
  const updateOtp = await User.findByIdAndUpdate(user?._id, {
    $set: {
      verification: {
        otp,
        expiresAt,
        status: false,
      },
    },
  });
  if (!updateOtp) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "failed to resend otp. please try again later"
    );
  }
  const jwtPayload = {
    email: user?.email,
    id: user?._id,
  };
  const token = jwt.sign(jwtPayload, config.jwt_access_secret as Secret, {
    expiresIn: "2m",
  });
  await sendEmail(
    user?.email,
    "Your One Time Otp",
    `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #4CAF50;">Your One Time OTP</h2>
    <div style="background-color: #f2f2f2; padding: 20px; border-radius: 5px;">
      <p style="font-size: 16px;">Your OTP Is: <strong>${otp}</strong></p>
      <p style="font-size: 14px; color: #666;">This OTP is valid until: ${expiresAt.toLocaleString()}</p>
    </div>
  </div>`
  );
  return { token };
};

export const otpServices = {
  verifyOtp,
  resendOtp,
};
