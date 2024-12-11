import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import Message from '../messages/messages.models';
import User from '../user/user.model';
import { IChat } from './chat.interface';
import Chat from './chat.models';

// Create chat
const createChat = async (payload: IChat) => {
  const user1 = await User.findById(payload?.participants[0]);

  if (!user1) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid user');
  }

  const user2 = await User.findById(payload?.participants[1]);

  if (!user2) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid user');
  }

  const alreadyExists = await Chat.findOne({
    participants: { $all: payload.participants },
  }).populate(['participants']);

  if (alreadyExists) {
    return alreadyExists;
  }

  const result = Chat.create(payload);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Chat creation failed');
  }
  return result;
};

// Get my chat list
const getMyChatList = async (userId: string) => {
  const chats = await Chat.find({
    participants: { $all: userId },
  }).populate({
    path: 'participants',
    select: 'name  image  _id',
    match: { _id: { $ne: userId } },
  });

  if (!chats) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Chat list not found');
  }

  const data = [];
  for (const chatItem of chats) {
    const chatId = chatItem?._id;

    // Find the latest message in the chat
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const message: any = await Message.findOne({ chat: chatId }).sort({
      updatedAt: -1,
    });

    const unreadMessageCount = await Message.countDocuments({
      chat: chatId,
      seen: false,
      sender: { $ne: userId },
    });

    if (message) {
      data.push({ chat: chatItem, message: message, unreadMessageCount });
    }
  }
  data.sort((a, b) => {
    const dateA = (a.message && a.message.createdAt) || 0;
    const dateB = (b.message && b.message.createdAt) || 0;
    return dateB - dateA;
  });

  return data;
};

// Get chat by ID
const getChatById = async (id: string) => {
  const result = await Chat.findById(id).populate({
    path: 'participants',
    select: 'name email image role _id phoneNumber ',
  });

  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Chat not found');
  }
  return result;
};

// Update chat list
const updateChatList = async (id: string, payload: Partial<IChat>) => {
  const result = await Chat.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Chat not found');
  }
  return result;
};

// Delete chat list
const deleteChatList = async (id: string) => {
  // await deleteFromS3(`images/messages/${id}`);
  const result = await Chat.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Chat not found');
  }
  return result;
};

// get my all chatlist

const getmychatListv2 = async (userData: any) => {
  const { user, role } = userData;

  // Convert `user` to ObjectId
  const chatList = await Chat.aggregate([
    // Match chats where the user is a participant
    {
      $match: {
        participants: { $all: [user] },
      },
    },
    // Add a field to convert participant strings to ObjectIds
    {
      $addFields: {
        participantsObjectId: {
          $map: {
            input: '$participants',
            as: 'participant',
            in: { $toObjectId: '$$participant' },
          },
        },
      },
    },
    // Lookup to find the last message for each chat
    {
      $lookup: {
        from: 'messages', // Collection name for messages
        let: { chatId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$chat', '$$chatId'] } } }, // Match messages for the current chat
          { $sort: { updatedAt: -1 } }, // Sort by updatedAt in descending order
          { $limit: 1 }, // Get only the latest message
        ],
        as: 'lastMessage',
      },
    },
    // Unwind the lastMessage array to simplify the structure
    {
      $unwind: {
        path: '$lastMessage',
        preserveNullAndEmptyArrays: true, // Handle chats without messages
      },
    },
    // Add a field to determine the participant to fetch additional data for
    {
      $addFields: {
        targetParticipant: {
          $arrayElemAt: [
            {
              $filter: {
                input: '$participantsObjectId',
                cond: { $ne: ['$$this', user] }, // Find the other participant
              },
            },
            0,
          ],
        },
      },
    },
    // Lookup data from Customer or Provider based on role
    {
      $lookup: {
        from: role === 'provider' ? 'customers' : 'providers', // Dynamic collection lookup
        localField: 'targetParticipant',
        foreignField: '_id',
        as: 'participantDetails',
      },
    },
    // Unwind participantDetails to simplify structure
    {
      $unwind: {
        path: '$participantDetails',
        preserveNullAndEmptyArrays: true, // Handle cases where no participant details are found
      },
    },
    // Add unread message count
    {
      $lookup: {
        from: 'messages', // Collection name for messages
        let: { chatId: '$_id', userId: user },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$chat', '$$chatId'] }, // Match messages for this chat
                  { $eq: ['$seen', false] }, // Only unseen messages
                  { $ne: ['$sender', '$$userId'] }, // Messages not sent by the user
                ],
              },
            },
          },
          { $count: 'unreadCount' }, // Count the unseen messages
        ],
        as: 'unreadMessages',
      },
    },
    // Extract the unread message count
    {
      $addFields: {
        unreadMessageCount: {
          $arrayElemAt: ['$unreadMessages.unreadCount', 0], // Get the count or default to 0
        },
      },
    },
    // Project the desired fields
    {
      $project: {
        _id: 1,
        participants: 1,
        lastMessage: 1,
        unreadMessageCount: { $ifNull: ['$unreadMessageCount', 0] }, // Default to 0 if null
        participantDetails: {
          name: '$participantDetails.name',
          image: '$participantDetails.image',
        },
      },
    },
  ]);

  return chatList;
};

export const chatService = {
  createChat,
  getMyChatList,
  getChatById,
  updateChatList,
  deleteChatList,
  getmychatListv2,
};
