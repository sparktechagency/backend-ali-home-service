import { Schema, model } from 'mongoose';
import { IChat, IChatModel } from './chat.interface';

const chatSchema = new Schema<IChat>(
  {
    participants: [
      {
        type: Schema.Types.Mixed,
      },
    ],
    status: {
      type: String,
      enum: ['accepted', 'blocked'],
      default: 'accepted',
    },
  },
  { timestamps: true },
);

const Chat = model<IChat, IChatModel>('Chat', chatSchema);
export default Chat;
