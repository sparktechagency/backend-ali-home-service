import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { notificationServices } from './notification.service';

const getAllNotification = catchAsync(async (req: Request, res: Response) => {
  const query = { ...req.query };
  query['receiver'] = req.user.profileId;
  const result = await notificationServices.getNotificationFromDb(query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Notifications retrieved successfully',
    data: result,
  });
});

const notificationController = {
  getAllNotification,
};

export default notificationController;
