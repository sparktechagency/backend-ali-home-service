import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../error/AppError';
import { Quotes } from '../quotes/quotes.model';
import Service from '../services/service.model';
import { Ireview } from './review.interface';
import { Review } from './review.model';

const insertReviewIntoDb = async (payload: Partial<Ireview>) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const service = await Service.findById(payload?.service);
    if (!service) throw new AppError(httpStatus.NOT_FOUND, 'Service not found');

    // Calculate the new average rating
    const totalReviews = Number(service.totalReviews) || 0;
    const currentAvgRating = Number(service.avgReviews) || 0;
    const newTotalReviews = totalReviews + 1;
    const newAvgRating =
      (currentAvgRating * totalReviews + Number(payload?.rating)) /
      newTotalReviews;
    // Update the service with the new rating and total reviews
    const updatedService = await Service.findByIdAndUpdate(
      payload?.service,
      {
        $set: {
          totalReviews: newTotalReviews,
          avgReviews: newAvgRating.toFixed(1),
        },
      },
      { new: true, session },
    );

    if (!updatedService) {
      throw new AppError(
        httpStatus.NOT_ACCEPTABLE,
        'Something went wrong updating service',
      );
    }

    // Update the quote as reviewed
    await Quotes.findByIdAndUpdate(
      payload?.quote,
      { $set: { isReviewed: true } },
      { new: true, session },
    );

    const result = await Review.create([payload], { session });
    await session.commitTransaction();
    await session.endSession();
    return result[0];
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

export const reviewServices = {
  insertReviewIntoDb,
  getReviewsForService,
};
