import { Schema } from 'mongoose';

export type TNotification = {
  receiver?: Schema.Types.ObjectId;
  fcmToken: string;
  type?: 'hireRequest' | 'accept' | 'reject' | 'cancelled' | 'payment';
  title?: string;
  message: string;
  isRead: boolean;
  link?: string;
  date?: Date;
  time?: string;
};

export interface IsendNotification {
  title: string;
  body: string;
  data?: { [key: string]: any };
}
