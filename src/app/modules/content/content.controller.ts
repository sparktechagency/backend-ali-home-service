import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { contentServices } from "./content.service";
import { Request, Response } from "express";
const insertContentIntoDb = catchAsync(async (req: Request, res: Response) => {
  console.log(req.body);
  const result = await contentServices.insertContentIntoDb(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Content inserted successfully",
    data: result,
  });
});
const getContent = catchAsync(async (req: Request, res: Response) => {
  const result = await contentServices.getContents(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Content retrived successfully",
    data: result,
  });
});

export const contentControllers = {
  insertContentIntoDb,
  getContent,
};
