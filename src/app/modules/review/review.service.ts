import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../error/AppError';
import { Quotes } from '../quotes/quotes.model';
import Service from '../services/service.model';
import { Shop } from '../shop/shop.model';
import { Ireview } from './review.interface';
import { Review } from './review.model';

const insertReviewIntoDb = async (payload: Partial<Ireview>) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { service: serviceId, rating, quote } = payload;
    if (!serviceId || !rating) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid payload');
    }

    const service = await Service.findById(serviceId).session(session);
    if (!service) {
      throw new AppError(httpStatus.NOT_FOUND, 'Service not found');
    }

    // Calculate the new average rating and total reviews
    const totalReviews = Number(service.totalReviews) || 0;
    const currentAvgRating = Number(service.avgReviews) || 0;
    const newTotalReviews = totalReviews + 1;
    const newAvgRating = (
      (currentAvgRating * totalReviews + Number(rating)) /
      newTotalReviews
    ).toFixed(1);

    // Perform updates in parallel
    const updates = [
      Service.findByIdAndUpdate(
        serviceId,
        {
          $set: {
            totalReviews: newTotalReviews,
            avgReviews: newAvgRating,
          },
        },
        { new: true, session },
      ),
      Quotes.findByIdAndUpdate(
        quote,
        { $set: { isReviewed: true } },
        { new: true, session },
      ),
      Shop.findByIdAndUpdate(
        service.shop,
        { $inc: { totalReviews: 1 } },
        { new: true, session },
      ),
    ];

    const [updatedService] = await Promise.all(updates);

    if (!updatedService) {
      throw new AppError(httpStatus.NOT_ACCEPTABLE, 'Error updating service');
    }

    // Create the review
    const [review] = await Review.create(
      [{ ...payload, shop: service?.shop }],
      { session },
    );

    await session.commitTransaction();
    await session.endSession();

    return review;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

const getReviewsForService = async (serviceId: string) => {
  const result = await Review.find({ service: serviceId }).populate({
    path: 'customer',
    select: 'name image',
  });
  return result;
};
const getShopwisereview = async (query: any) => {
  const result = await Review.find(query).populate({
    path: 'customer',
    select: 'name image email',
  });
  return result;
};

export const reviewServices = {
  insertReviewIntoDb,
  getReviewsForService,
  getShopwisereview,
};
