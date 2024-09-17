import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { uploadToS3 } from '../../utils/fileHelper';
import sendResponse from '../../utils/sendResponse';
import { shopservices } from './shop.service';

const insertShopintoDb = catchAsync(async (req: Request, res: Response) => {
  let image;
  if (req?.file) {
    image = await uploadToS3(req?.file, 'shop/');
  }
  const result = await shopservices.insertShopintoDb({ ...req.body, image });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Shop created successfully',
    data: result,
  });
});
const getAllShops = catchAsync(async (req: Request, res: Response) => {
  const result = await shopservices.getAllShops(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Shops retrieved successfully',
    data: result,
  });
});
const getSingleShop = catchAsync(async (req: Request, res: Response) => {
  const result = await shopservices.getSingleShop(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Shop retrived successfully',
    data: result,
  });
});
const getmyshop = catchAsync(async (req: Request, res: Response) => {
  const result = await shopservices.getmyshop(req.user.profileId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Shop retrived successfully',
    data: result,
  });
});
const updateAshop = catchAsync(async (req: Request, res: Response) => {
  const data = { ...req.body };

  let image;
  if (req?.file) {
    image = await uploadToS3(req?.file, 'shop/');
    data['image'] = image;
  }
  const result = await shopservices.insertShopintoDb(data);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Shop updated successfully',
    data: result,
  });
});
const deleteAShop = catchAsync(async (req: Request, res: Response) => {
  const result = await shopservices.deleteShop(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Shop deleted successfully',
    data: result,
  });
});

export const shopController = {
  insertShopintoDb,
  getAllShops,
  getSingleShop,
  updateAshop,
  deleteAShop,
  getmyshop,
};
