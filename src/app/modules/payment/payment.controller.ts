import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { paymentServices } from './payment.service';

const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentServices.createPaymentIntent(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment intent created successfully',
    data: result,
  });
});
const insertPaymentIntoDb = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentServices.insertPaymentIntoDb(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment inserted successfully',
    data: result,
  });
});

export const paymentControllers = {
  createPaymentIntent,
  insertPaymentIntoDb,
};
