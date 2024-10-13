import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { coinServices } from './coins.service';

const getMyCoin = catchAsync(async (req: Request, res: Response) => {
  const result = await coinServices.getmyCoins(req?.user?.profileId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Coins retrieved successfully',
    data: result,
  });
});

export const coinController = {
  getMyCoin,
};
