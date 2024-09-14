/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config/index';
import AppError from '../error/AppError';
import User from '../modules/user/user.model';
import catchAsync from '../utils/catchAsync';

const auth = (...userRoles: string[]) => {
  return catchAsync(async (req, res, next) => {
    const token = req?.headers?.authorization?.split(' ')[1];

    if (!token) {
      console.log('error from here', token);
      throw new AppError(httpStatus.UNAUTHORIZED, 'you are not authorized!');
    }
    let decode;
    try {
      decode = jwt.verify(
        token,
        config.jwt_access_secret as string,
      ) as JwtPayload;
    } catch (err) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'unauthorized');
    }
    const { role, userId } = decode;
    const isUserExist = User.IsUserExistbyId(userId);
    if (!isUserExist) {
      throw new AppError(httpStatus.NOT_FOUND, 'user not found');
    }
    if (userRoles && !userRoles.includes(role)) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
    }
    req.user = decode;
    next();
  });
};
export default auth;
