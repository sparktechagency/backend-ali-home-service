import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { reviewServices } from './review.service';

const insertReviewIntoDb = catchAsync(async (req: Request, res: Response) => {
  const data = { ...req.body };
  data['customer'] = req.user.profileId;
  const result = await reviewServices.insertReviewIntoDb(data);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Thank you for your valuable feedback',
    data: result,
  });
});

const getserviceWiseReview = catchAsync(async (req: Request, res: Response) => {
  const result = await reviewServices.getReviewsForService(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reviews retrieved successfully',
    data: result,
  });
});

export const reviewController = {
  insertReviewIntoDb,
  getserviceWiseReview,
};
