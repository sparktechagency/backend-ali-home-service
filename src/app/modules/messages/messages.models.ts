import { Schema, Types, model } from 'mongoose';
import { IMessages, IMessagesModel } from './messages.interface';

const messageSchema = new Schema<IMessages>(
  {
    text: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    seen: {
      type: Boolean,
      default: false,
    },
    sender: {
      type: Schema.Types.Mixed,
      required: true,
    },
    receiver: {
      type: Schema.Types.Mixed,
      required: true,
    },
    chat: {
      type: Types.ObjectId,
      required: true,
      ref: 'Chat',
    },
  },
  {
    timestamps: true,
  },
);

const Message = model<IMessages, IMessagesModel>('Messages', messageSchema);

export default Message;
