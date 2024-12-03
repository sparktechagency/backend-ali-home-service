import { model, Schema } from 'mongoose';
import { TNotification } from './notification.inerface';
const NotificationSchema = new Schema<TNotification>(
  {
    receiver: {
      type: Schema.Types.ObjectId,
      // ref: 'User',
      required: [true, 'user is required'],
    },
    type: {
      type: String,
      default: null,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
      default: null,
    },
    date: {
      type: Date,
      default: new Date(),
    },
    time: {
      type: String,
      required: true,
    },
    fcmToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const Notification = model<TNotification>('Notification', NotificationSchema);
export default Notification;
