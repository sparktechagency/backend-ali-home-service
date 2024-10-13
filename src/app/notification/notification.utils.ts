/* eslint-disable @typescript-eslint/no-explicit-any */
import admin from 'firebase-admin';
import httpStatus from 'http-status';
import AppError from '../error/AppError';
import { IsendNotification } from './notification.inerface';
import Notification from './notification.model';
admin.initializeApp({
  credential: admin.credential.cert(
    '../../../../public/apurbo-fe31d-firebase-adminsdk-7ghcm-043fab9265.json',
  ),
  // credential: admin.credential.cert(clinicaSericeAccountFile),
});

export const sendNotification = async (
  fcmToken: string[],
  payload: IsendNotification,
): Promise<unknown> => {
  try {
    const response = await admin.messaging().sendEachForMulticast({
      tokens: fcmToken,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      apns: {
        headers: {
          'apns-push-type': 'alert',
        },
        payload: {
          aps: {
            badge: 1,
            sound: 'default',
          },
        },
      },
    });

    if (response.successCount) {
      fcmToken?.map(async (token) => {
        await Notification.create({
          title: payload.title,
          fcmToken: token,
          link: payload?.data?.link,
          message: payload?.body,
          date: new Date(),
          time: new Date().getTime,
          type: payload?.data?.type,
        });
      });
    }

    return response;
  } catch (error: any) {
    console.error('Error sending message:', error);
    if (error?.code === 'messaging/third-party-auth-error') {
      return null;
    } else {
      console.error('Error sending message:', error);
      throw new AppError(
        httpStatus.NOT_IMPLEMENTED,
        error.message || 'Failed to send notification',
      );
    }
  }
};
