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
const checkout = catchAsync(async (req: Request, res: Response) => {
  const data = { ...req.body };
  data['customer'] = req.user.profileId;
  const result = await paymentServices.checkout(data);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment checkout created successfully',
    data: result,
  });
});
const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentServices.confirmPayment(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Thank you for your payment',
    data: result,
  });
});
const getPaymentsByProvider = catchAsync(
  async (req: Request, res: Response) => {
    const query = { ...req.query };
    query['shop'] = req.user.shop;
    console.log(query);
    const result = await paymentServices.getPaymentsByProvider(query);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Payment Information Retrived successfully',
      data: result?.data,
      meta: result?.meta,
    });
  },
);
const completePaymentByHandCash = catchAsync(
  async (req: Request, res: Response) => {
    const data = { ...req.body };
    data['customer'] = req.user.profileId;
    const result = await paymentServices.completePaymentByHandCash(data);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Payment is done.',
      data: result,
    });
  },
);
const showTransactions = catchAsync(async (req: Request, res: Response) => {
  console.log(req.query);
  const result = await paymentServices.showTransactions(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Transactions retrieved successfully',
    data: result?.data,
    meta: result?.meta,
  });
});
const transactionOverview = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentServices.transactionOverview();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Transactions retrieved successfully',
    data: result,
  });
});

export const paymentControllers = {
  createPaymentIntent,
  insertPaymentIntoDb,
  checkout,
  confirmPayment,
  getPaymentsByProvider,
  completePaymentByHandCash,
  showTransactions,
  transactionOverview,
};
