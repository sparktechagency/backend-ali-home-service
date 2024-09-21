/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { uploadManyToS3 } from '../../utils/fileHelper';
import sendResponse from '../../utils/sendResponse';
import { serviceServices } from './service.service';

const InserServiceIntodb = catchAsync(async (req: Request, res: Response) => {
  let images;

  if (req?.files) {
    // Casting req.files to Express.Multer.File[]
    // @ts-ignore
    const filesArray = req?.files?.files as Express.Multer.File[];
    images = await uploadManyToS3(
      filesArray.map((file: Express.Multer.File) => ({
        file,
        path: 'service/',
      })),
    );
  }
  const result = await serviceServices.insertServiceIntoDb({
    ...req.body,
    images,
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Service Created successfully',
    data: result,
  });
});
const getAllServices = catchAsync(async (req: Request, res: Response) => {
  const result = await serviceServices.getAllServices(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Services retrieved successfully',
    data: result?.data,
    meta: result?.meta,
  });
});
const getSingleService = catchAsync(async (req: Request, res: Response) => {
  const result = await serviceServices.getSingleService(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Service retrieved successfully',
    data: result,
  });
});
const updateService = catchAsync(async (req: Request, res: Response) => {
  const data = { ...req.body };
  if (req?.files) {
    // Casting req.files to Express.Multer.File[]
    // @ts-ignore
    const filesArray = req?.files?.files as Express.Multer.File[];
    data['images'] = await uploadManyToS3(
      filesArray.map((file: Express.Multer.File) => ({
        file,
        path: 'service/',
      })),
    );
  }
  const result = await serviceServices.updateService(req.params.id, data);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Service Created successfully',
    data: result,
  });
});

export const ServiceController = {
  InserServiceIntodb,
  getAllServices,
  updateService,
  getSingleService,
};
