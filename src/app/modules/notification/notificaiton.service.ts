import { FilterQuery } from "mongoose";
import { emitMessage } from "../../utils/socket";
import { TNotification } from "./notification.interface";
import { Notification } from "./notification.model";
import QueryBuilder from "../../builder/QueryBuilder";
import { notification } from "antd";
import moment from "moment";

const insertNotificationIntoDb = async (payload: any) => {
  console.log(payload);
  const result = await Notification.insertMany(payload);
  // @ts-ignore
  payload?.forEach((element) => {
    emitMessage(element?.receiver, {
      ...element,
      createdAt: moment().format("YYYY-MM-DD"),
    });
  });
  return result;
};

const getAllNotifications = async (query: Record<string, any>) => {
  const notificationModel = new QueryBuilder(Notification.find(), query)
    .search([])
    .filter()
    .paginate()
    .sort()
    .fields();

  const data = await notificationModel.modelQuery;
  const meta = await notificationModel.countTotal();
  return {
    data,
    meta,
  };
};

const markAsDone = async (id: string) => {
  const result = await Notification.updateMany(
    { receiver: id },
    {
      $set: {
        read: true,
      },
    },
    { new: true }
  );
  return result;
};

export const notificationServices = {
  insertNotificationIntoDb,
  getAllNotifications,
  markAsDone,
};
