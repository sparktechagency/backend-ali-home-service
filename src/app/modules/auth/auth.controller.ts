/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import config from '../../config';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { authServices } from './auth.service';
const login = catchAsync(async (req: Request, res: Response) => {
  const result = await authServices.login(req.body);
  const { refreshToken } = result;
  const cookieOptions = {
    secure: false,
    httpOnly: true,
    // maxAge: parseInt(config.jwt.refresh_expires_in || '31536000000'),
    maxAge: 31536000000,
  };

  if (config.NODE_ENV === 'production') {
    //@ts-ignore
    cookieOptions.sameSite = 'none';
  }
  res.cookie('refreshToken', refreshToken, cookieOptions);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Logged in successfully',
    data: result,
  });
});

const adminLogin = catchAsync(async (req: Request, res: Response) => {
  const result = await authServices.adminLogin(req.body);
  const { refreshToken } = result;
  const cookieOptions = {
    secure: false,
    httpOnly: true,
    maxAge: 31536000000,
  };

  if (config.NODE_ENV === 'production') {
    // @ts-ignore
    cookieOptions.sameSite = 'none';
  }
  res.cookie('refreshToken', refreshToken, cookieOptions);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin logged in successfully',
    data: result,
  });
});
const changePassword = catchAsync(async (req: Request, res: Response) => {
  const result = await authServices.changePassword(req?.user?.userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'password changed successfully',
    data: result,
  });
});
const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await authServices.forgotPassword(req?.body?.email);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'An otp sent to your email!',
    data: result,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  console.log(req.body);
  const result = await authServices.resetPassword(
    req?.headers?.token as string,
    req?.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password changed successfully',
    data: result,
  });
});
const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  console.log(refreshToken);
  const result = await authServices.refreshToken(refreshToken);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Access token is retrieved successfully',
    data: result,
  });
});

const verifyPassword = catchAsync(async (req, res) => {
  const result = await authServices.verifyPassword(
    req.user.userId,
    req.body?.password,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'password verified',
    data: result,
  });
});
export const authControllers = {
  login,
  changePassword,
  forgotPassword,
  resetPassword,
  refreshToken,
  adminLogin,
  verifyPassword,
};
