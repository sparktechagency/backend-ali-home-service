import catchAsync from "../../utils/catchAsync";
import { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { notificationServices } from "./notificaiton.service";
const insertNotificatonIntoDb = catchAsync(
  async (req: Request, res: Response) => {
    const result = await notificationServices.insertNotificationIntoDb(
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Notification added  successfully",
      data: result,
    });
  }
);
const getAllNotification = catchAsync(async (req: Request, res: Response) => {
  const query = { ...req.query };
  query["receiver"] = req?.user?.userId;
  const result = await notificationServices.getAllNotifications(query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notifications retrived successfully",
    data: result?.data,
    meta: result?.meta,
  });
});
const markAsDone = catchAsync(async (req: Request, res: Response) => {
  const result = await notificationServices.markAsDone(req?.user?.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notification mark as read successfully",
    data: result,
  });
});

export const notificationControllers = {
  insertNotificatonIntoDb,
  getAllNotification,
  markAsDone,
};
