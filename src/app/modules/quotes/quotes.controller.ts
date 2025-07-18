import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { quotesServices } from './quotes.service';
const sendQuoteToCustomer = catchAsync(async (req: Request, res: Response) => {
  const result = await quotesServices.insertQuotesintoDb(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Quote sent successfully',
    data: result,
  });
});
const getProviderWiseQuotes = catchAsync(
  async (req: Request, res: Response) => {
    const query = { ...req.query };
    query['shop'] = req.user.shop;
    const result = await quotesServices.getProviderWiseQuotes(query);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Quotes retrieved successfully',
      data: result?.data,
      meta: result?.meta,
    });
  },
);
const getAllQuotes = catchAsync(async (req: Request, res: Response) => {
  const query = { ...req.query };
  query['customer'] = req.user.profileId;
  const result = await quotesServices.getAllQuotes(query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Quotes retrieved successfully',
    data: result?.data,
    meta: result?.meta,
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
const acceptQuote = catchAsync(async (req: Request, res: Response) => {
  const result = await quotesServices.acceptQuote(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Quotes accepted successfully',
    data: result,
  });
});
const rejectQuote = catchAsync(async (req: Request, res: Response) => {
  const result = await quotesServices.rejectQuote(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Quotes rejected successfully',
    data: result,
  });
});
const cancelledQuote = catchAsync(async (req: Request, res: Response) => {
  const { role } = req.user;
  const cancellation = {
    ...req.body.cancellation,
    cancelledBy: role,
  };
  const result = await quotesServices.cancelledQuote(
    req.params.id,
    cancellation,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Quotes cancelled successfully',
    data: result,
  });
});
const acceptCompletationRequest = catchAsync(
  async (req: Request, res: Response) => {
    const data = { ...req.body };
    data['customer'] = req.user.profileId;
    const result = await quotesServices.acceptCompletationRequest(data);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Request accepted successfully',
      data: result,
    });
  },
);
const completeQuote = catchAsync(async (req: Request, res: Response) => {
  const result = await quotesServices.completeQuote(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Quotes rejected successfully',
    data: result,
  });
});
const getQuotesStatusSummary = catchAsync(
  async (req: Request, res: Response) => {
    const query = { ...req.query };
    query['shop'] = req.user.shop;
    const result = await quotesServices.getQuotesStatusSummary(query);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Quote summery retrieved successfully',
      data: result,
    });
  },
);
const openPaymentPopup = catchAsync(async (req: Request, res: Response) => {
  // const query = { ...req.query };
  // query['shop'] = req.user.shop;
  const result = await quotesServices.openPaymentPopup();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Quote summery retrieved successfully',
    data: result,
  });
});

export const quotesController = {
  sendQuoteToCustomer,
  getProviderWiseQuotes,
  getAllQuotes,
  getSingleQuotes,
  updateQuotes,
  acceptQuote,
  rejectQuote,
  cancelledQuote,
  acceptCompletationRequest,
  getQuotesStatusSummary,
  openPaymentPopup,
};
