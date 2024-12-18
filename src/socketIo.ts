/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// socketIO.js
import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';

import httpStatus from 'http-status';
import { Types } from 'mongoose';
import AppError from './app/error/AppError';

import getUserDetailsFromToken from './app/helper/getUserDetails';
import { IChat } from './app/modules/chat/chat.interface';
import Chat from './app/modules/chat/chat.models';
import { chatService } from './app/modules/chat/chat.service';
import Customer from './app/modules/customer/customer.model';
import Message from './app/modules/messages/messages.models';
import { Provider } from './app/modules/provider/provider.model';
import { UserRole } from './app/modules/user/user.interface';
import { callbackFn } from './app/utils/CallbackFn';

const initializeSocketIO = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  // Online users
  const onlineUser = new Set();

  io.on('connection', async (socket) => {
    console.log('connected', socket?.id);

    try {
      //----------------------user token get from front end-------------------------//
      const token =
        socket.handshake.auth?.token || socket.handshake.headers?.token;
      //----------------------check Token and return user details-------------------------//
      const user: any = await getUserDetailsFromToken(token);

      // if (!user) {
      //   // io.emit('io-error', {success:false, message:'invalid Token'});
      //   throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid token');
      // }

      socket.join(user?.profileId?.toString());

      //----------------------user id set in online array-------------------------//
      onlineUser.add(user?.profileId?.toString());

      socket.on('check', (data, callback) => {
        console.log(data);

        callbackFn(callback, { success: true });
      });

      //----------------------online array send for front end------------------------//
      io.emit('onlineUser', Array.from(onlineUser));

      //----------------------user details and messages send for front end -->(as need to use)------------------------//
      socket.on('message-page', async ({ receiverId }, callback) => {
        console.log(receiverId);
        if (!receiverId) {
          callbackFn(callback, {
            success: false,
            message: 'userId is required',
          });
        }

        try {
          // check the if receiver provider or customer
          // receiverId = receiverId.trim();
          let receiver;
          // IF USER IS PROVIDER THAT MEANS WE NEED TO RETRIVE CUSTOMER ELSE PROVIDER
          switch (user?.role) {
            case UserRole.customer:
              receiver =
                await Provider.findById(receiverId).select('name image');

              break;
            case UserRole.provider:
              receiver =
                await Customer.findById(receiverId).select('name image');

              break;

            default:
              break;
          }

          const userData = {
            _id: receiver?._id,
            image: receiver?.image,
            name: receiver?.name,
          };

          socket.emit('user-details', userData);

          const getPreMessage = await Message.find({
            $or: [
              { sender: user?.profileId, receiver: receiverId.toString() },
              { sender: receiverId.toString(), receiver: user?.profileId },
            ],
          }).sort({ updatedAt: 1 });

          socket.emit('message', getPreMessage || []);
        } catch (error: any) {
          callbackFn(callback, {
            success: false,
            message: error.message,
          });
          io.emit('io-error', { success: false, message: error });
          console.error('Error in message-page event:', error);
        }
      });

      //----------------------chat list------------------------//
      socket.on('my-chat-list', async (data, callback) => {
        try {
          const chatList = await chatService.getmychatListv2({
            user: user?.profileId,
            role: user?.role,
          });
          const myChat = 'chat-list::' + user?.profileId;

          const chatDetails = {
            statusCode: 200,
            success: true,
            message: 'chat retrived successfully!',
            data: chatList,
          };
          io.emit(myChat, chatDetails);

          callbackFn(callback, { success: true, data: chatList });
        } catch (error: any) {
          callbackFn(callback, {
            success: false,
            message: error.message,
          });
          io.emit('io-error', { success: false, message: error.message });
        }
      });

      //----------------------seen message-----------------------//
      socket.on('seen', async ({ chatId }, callback) => {
        if (!chatId) {
          callbackFn(callback, {
            success: false,
            message: 'chatId id is required',
          });
          io.emit('io-error', {
            success: false,
            message: 'chatId id is required',
          });
        }

        try {
          const chatList: IChat | null = await Chat.findById(chatId);
          if (!chatList) {
            callbackFn(callback, {
              success: false,
              message: 'chat id is not valid',
            });
            io.emit('io-error', {
              success: false,
              message: 'chat id is not valid',
            });
            throw new AppError(httpStatus.BAD_REQUEST, 'chat id is not valid');
          }

          const messageIdList = await Message.aggregate([
            {
              $match: {
                chat: new Types.ObjectId(chatId),
                seen: false,
                sender: { $ne: user?.profileId },
              },
            },
            { $group: { _id: null, ids: { $push: '$_id' } } },
            { $project: { _id: 0, ids: 1 } },
          ]);
          const unseenMessageIdList =
            messageIdList.length > 0 ? messageIdList[0].ids : [];

          const updateMessages = await Message.updateMany(
            { _id: { $in: unseenMessageIdList } },
            { $set: { seen: true } },
          );

          const user1 = chatList.participants[0];
          const user2 = chatList.participants[1];
          // //----------------------ChatList------------------------//
          const ChatListUser1 = await chatService.getMyChatList(
            user1.toString(),
          );

          const ChatListUser2 = await chatService.getMyChatList(
            user2.toString(),
          );

          const user1Chat = 'chat-list::' + user1;

          const user2Chat = 'chat-list::' + user2;

          const allUnReaddMessage = await Message.countDocuments({
            receiver: user1,
            seen: false,
          });
          const variable = 'new-notifications::' + user1;
          io.emit(variable, allUnReaddMessage);

          const allUnReaddMessage2 = await Message.countDocuments({
            receiver: user2,
            seen: false,
          });
          const variable2 = 'new-notifications::' + user2;
          io.emit(variable2, allUnReaddMessage2);

          const getPreMessage = await Message.find({
            $or: [
              { sender: user1, receiver: user2 },
              { sender: user2, receiver: user1 },
            ],
          }).sort({ updatedAt: 1 });

          socket.emit('message', getPreMessage || []);

          io.emit(user1Chat, ChatListUser1);
          io.emit(user2Chat, ChatListUser2);
        } catch (error: any) {
          callbackFn(callback, {
            success: false,
            message: error.message,
          });
          console.error('Error in seen event:', error);
          socket.emit('error', { message: error.message });
        }
      });

      socket.on('send-message', async (payload, callback) => {
        payload.sender = user?.profileId;
        // --------------------------------------------not needed  -------------------------------

        // const payload  ={
        //   receiver:"",
        //   text:"",
        //   image:"",
        //   chat:"chatId"
        // }

        // --------------------------
        const result = await Message.create(payload);

        if (!result) {
          callbackFn(callback, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: 'Message sent failed',
          });
        }

        const senderMessage = 'new-message::' + result.chat.toString();
        // need to handle from frontend developer
        io.emit(senderMessage, result);

        // //----------------------ChatList------------------------//
        // const ChatListSender = await chatService.getMyChatList(
        //   result?.sender.toString(),
        // );
        const ChatListSender = await chatService.getmychatListv2({
          user: result?.sender,
          role: user?.role,
        });
        const chatDetailsSender = {
          statusCode: 200,
          success: true,
          message: 'chat retrived successfully!',
          data: ChatListSender,
        };
        const senderChat = 'chat-list::' + result.sender.toString();
        io.emit(senderChat, chatDetailsSender);
        const ChatListReceiver = await chatService.getmychatListv2({
          user: result?.receiver,
          role:
            user?.role === UserRole.provider
              ? UserRole.customer
              : UserRole.provider,
        });
        const chatDetailsReceiver = {
          statusCode: 200,
          success: true,
          message: 'chat retrived successfully!',
          data: ChatListReceiver,
        };
        const receiverChat = 'chat-list::' + result.receiver.toString();
        io.emit(receiverChat, chatDetailsReceiver);

        // Notification
        // const allUnReaddMessage = await Message.countDocuments({
        //   receiver: result.sender,
        //   seen: false,
        // });
        // const variable = 'new-notifications::' + result.sender;
        // io.emit(variable, allUnReaddMessage);
        // const allUnReaddMessage2 = await Message.countDocuments({
        //   receiver: result.receiver,
        //   seen: false,
        // });
        // const variable2 = 'new-notifications::' + result.receiver;
        // io.emit(variable2, allUnReaddMessage2);

        //end Notification//
        callbackFn(callback, {
          statusCode: httpStatus.OK,
          success: true,
          message: 'Message sent successfully!',
          data: result,
        });
      });

      //-----------------------Typing------------------------//
      socket.on('typing', function (payload) {
        const chat = payload?.chat.toString();
        const message = payload?.userName + ' is typing...';
        socket.emit(chat, { message: message });
      });

      //-----------------------Seen All------------------------//
      socket.on('message-notification', async ({}, callback) => {
        try {
          const allUnReaddMessage = await Message.countDocuments({
            receiver: user?._id,
            seen: false,
          });
          const variable = 'new-notifications::' + user?._id;
          io.emit(variable, allUnReaddMessage);
          callbackFn(callback, { success: true, message: allUnReaddMessage });
        } catch (error) {
          callbackFn(callback, {
            statusCode: httpStatus.INTERNAL_SERVER_ERROR,
            success: false,
            message: 'Failed to retrieve notifications',
          });
        }
      });

      //-----------------------Disconnect------------------------//
      socket.on('disconnect', () => {
        onlineUser.delete(user?.profileId?.toString());
        io.emit('onlineUser', Array.from(onlineUser));
        console.log('disconnect user ', socket.id);
      });
    } catch (error) {
      console.error('-- socket.io connection error --', error);
    }
  });

  return io;
};

export default initializeSocketIO;
