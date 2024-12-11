import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';

export interface IChat {
  _id?: ObjectId;
  participants: ObjectId[];
  status: 'accepted' | 'blocked';
  participantRoles: any[];
}

export type IChatModel = Model<IChat, Record<string, unknown>>;
