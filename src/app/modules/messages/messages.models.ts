import { Schema, Types, model } from 'mongoose';
import { IMessages, IMessagesModel } from './messages.interface';

const messageSchema = new Schema<IMessages>(
  {
    text: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: [String],
      default: null, // Default to null if no value is provided
      set: function (value: any) {
        return Array.isArray(value) && value.length === 0 ? null : value;
      },
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
