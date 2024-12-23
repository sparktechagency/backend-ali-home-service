import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { chatService } from './chat.service';

const createChat = catchAsync(async (req: Request, res: Response) => {
  const chat = await chatService.createChat(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Chat created successfully',
    data: chat,
  });
});

const getMyChatList = catchAsync(async (req: Request, res: Response) => {
  const result = await chatService.getMyChatList(req.user.userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Chat retrieved successfully',
    data: result,
  });
});

const getChatById = catchAsync(async (req: Request, res: Response) => {
  const result = await chatService.getChatById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Chat retrieved successfully',
    data: result,
  });
});
const getChatIdByCustomer = catchAsync(async (req: Request, res: Response) => {
  console.log(req.params);
  const result = await chatService.getChatIdByCustomer(req.params.customer);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Chat retrieved successfully',
    data: result,
  });
});

const updateChat = catchAsync(async (req: Request, res: Response) => {
  const result = await chatService.updateChatList(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Chat updated successfully',
    data: result,
  });
});

const deleteChat = catchAsync(async (req: Request, res: Response) => {
  const result = await chatService.deleteChatList(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Chat deleted successfully',
    data: result,
  });
});
const getMyChatListv2 = catchAsync(async (req: Request, res: Response) => {
  const result = await chatService.getmychatListv2(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Chat retrieved successfully',
    data: result,
  });
});
const getMyChatListv2ForRestApi = catchAsync(
  async (req: Request, res: Response) => {
    const result = await chatService.getmychatListv2({
      user: req?.user?.profileId,
      role: req?.user?.role,
    });
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Chat retrieved successfully',
      data: result,
    });
  },
);
export const chatController = {
  createChat,
  getMyChatList,
  getChatById,
  updateChat,
  deleteChat,
  getMyChatListv2,
  getMyChatListv2ForRestApi,
  getChatIdByCustomer,
};
