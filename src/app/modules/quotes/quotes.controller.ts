import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { quotesServices } from './quotes.service';
const sendQuoteToCustomer = catchAsync(async (req: Request, res: Response) => {
  const data = { ...req.body };
  data['customer'] = req.user.profileId;

  const result = await quotesServices.insertQuotesintoDb(data);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Quote sent successfully',
    data: result,
  });
});
const getProviderWiseQuotes = catchAsync(
  async (req: Request, res: Response) => {
    const result = await quotesServices.getProviderWiseQuotes(req.query);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Quotes retrieved successfully',
      data: result,
    });
  },
);
const getAllQuotes = catchAsync(async (req: Request, res: Response) => {
  const result = await quotesServices.getAllQuotes(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Quotes retrieved successfully',
    data: result,
  });
});
const getSingleQuotes = catchAsync(async (req: Request, res: Response) => {
  const result = await quotesServices.getSingleQuotes(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Quotes updated successfully',
    data: result,
  });
});
const updateQuotes = catchAsync(async (req: Request, res: Response) => {
  const result = await quotesServices.updateQuotes(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Quotes updated successfully',
    data: result,
  });
});

export const quotesController = {
  sendQuoteToCustomer,
  getProviderWiseQuotes,
  getAllQuotes,
  getSingleQuotes,
  updateQuotes,
};
