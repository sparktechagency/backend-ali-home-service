import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { uploadToS3 } from '../../utils/fileHelper';
import sendResponse from '../../utils/sendResponse';
import providerService from './provider.service';

const getSingleProviderWithShop = catchAsync(
  async (req: Request, res: Response) => {
    const result = await providerService.getSingleProviderWithShop(
      req.params.id,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Provider data retrieved successfully',
      data: result,
    });
  },
);

const updateProviderAndShop = catchAsync(
  async (req: Request, res: Response) => {
    let image;
    if (req?.file) {
      image = await uploadToS3(req?.file, 'shop/');
    }
    const result = await providerService.updateProviderAndShop(req.params.id, {
      ...req.body,
      image,
    });
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Provider data updated successfully',
      data: result,
    });
  },
);
const deleteProviderAndShop = catchAsync(
  async (req: Request, res: Response) => {
    const result = await providerService.deleteProviderAndShop(req.params.id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Provider data deleted successfully',
      data: result,
    });
  },
);
const blockUnblocProvider = catchAsync(async (req: Request, res: Response) => {
  const result = await providerService.blockUnblocProvider(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Provider data updated successfully',
    data: result,
  });
});

const providerController = {
  getSingleProviderWithShop,
  updateProviderAndShop,
  deleteProviderAndShop,
  blockUnblocProvider,
};

export default providerController;
