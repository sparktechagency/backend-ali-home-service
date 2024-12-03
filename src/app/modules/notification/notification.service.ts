import { TNotification } from './notification.inerface';
import Notification from './notification.model';

const getNotificationFromDb = async (query: Record<string, any>) => {
  const result = await Notification.find(query);
  return result;
};

const updateNotification = async (
  id: string,
  payload: Partial<TNotification>,
) => {
  const result = await Notification.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

export const notificationServices = {
  getNotificationFromDb,
  updateNotification,
};
