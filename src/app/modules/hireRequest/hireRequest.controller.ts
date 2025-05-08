/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { uploadManyToS3 } from '../../utils/fileHelper';
import sendResponse from '../../utils/sendResponse';
import { QuotestatusEnum } from '../quotes/quotes.constant';
import { USER_ROLE } from '../user/user.constant';
import { hirRequestServices } from './hireRequest.service';

const insertHireRequestIntoDb = catchAsync(
  async (req: Request, res: Response) => {
    const data = { ...req.body, customer: req.user.profileId };
    if (req?.files) {
      // Casting req.files to Express.Multer.File[]
      // @ts-ignore
      const filesArray = req?.files?.files as Express.Multer.File[];
      data['images'] = await uploadManyToS3(
        filesArray.map((file: Express.Multer.File) => ({
          file,
          path: 'hire/',
        })),
      );
    }

    const result = await hirRequestServices.insertHireRequestIntoDb(data);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Request has been sent',
      data: result,
    });
  },
);
// provider
const getAllMyHireRequest = catchAsync(async (req: Request, res: Response) => {
  const query = {
    ...req.query,
    isDeleted: false,
    status: QuotestatusEnum.PENDING,
    profileId: req.user.profileId,
  };
  const result = await hirRequestServices.getAllMyHireRequest(query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Hire Requests Retrieved successfully',
    data: result?.data,
    meta: result?.meta,
  });
});

// customer
const getAllHireRequests = catchAsync(async (req: Request, res: Response) => {
  const query = {
    ...req.query,
    ...(req.user.role === USER_ROLE.customer && {
      customer: req.user.profileId,
    }),
    isDeleted: false,
  };

  const result = await hirRequestServices.getAllHireRequests(query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Hire Requests Retrieved successfully',
    data: result,
  });
});
const getSingleHireRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await hirRequestServices.getSingleHireReuqest(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Hire Request Retrieved successfully',
    data: result,
  });
});
const updateHireRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await hirRequestServices.updateHireRequest(
    req.params.id,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Hire Request Retrieved successfully',
    data: result,
  });
});

export const hireRequestController = {
  insertHireRequestIntoDb,
  getAllHireRequests,
  getAllMyHireRequest,
  getSingleHireRequest,
  updateHireRequest,
};
