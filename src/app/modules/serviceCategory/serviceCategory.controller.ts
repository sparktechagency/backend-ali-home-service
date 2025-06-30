import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import { uploadToS3 } from '../../utils/fileHelper';
import sendResponse from '../../utils/sendResponse';
import { categoryServices } from './serviceCategory.service';

const insertCategoryIntoDb = catchAsync(async (req: Request, res: Response) => {
  let image;
  if (req?.file) {
    image = await uploadToS3(req?.file, 'category/');
  }
  const result = await categoryServices.insertCategoryIntoDb({
    ...req.body,
    image,
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Category created successfully',
    data: result,
  });
});
const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await categoryServices.getAllCategories(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Categories retrived successfully',
    data: result,
  });
});
const getSingleCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await categoryServices.getSingleCategory(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Category retrived successfully',
    data: result,
  });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const data = { ...req.body };
  if (req?.file) {
    data['image'] = await uploadToS3(req?.file, 'category/');
  }
  const result = await categoryServices.updateCategory(req.params.id, data);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Category updated successfully',
    data: result,
  });
});

export const categoryControllers = {
  insertCategoryIntoDb,
  getAllCategories,
  getSingleCategory,
  updateCategory,
};
