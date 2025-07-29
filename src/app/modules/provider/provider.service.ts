import httpStatus from 'http-status';
import mongoose from 'mongoose';
import AppError from '../../error/AppError';
import Service from '../services/service.model';
import { Shop } from '../shop/shop.model';
import User from '../user/user.model';
import { Provider } from './provider.model';

const getSingleProviderWithShop = async (id: string) => {
  const providerWithShop = await Provider.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    {
      $lookup: {
        from: 'shops',
        localField: '_id',
        foreignField: 'provider',
        as: 'shop',
      },
    },
    { $unwind: { path: '$shop', preserveNullAndEmptyArrays: true } },
  ]);

  return providerWithShop[0];
};

const updateProviderAndShop = async (id: string, payload: any) => {
  // Validate required provider fields
  const {
    name,
    address,
    shopName,
    shopAddress,
    helpLineNumber,
    location,
    bank,
    image,
  } = payload;
  if (!name || !address) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Provider name and address are required',
    );
  }

  // Prepare provider update data
  const providerUpdate = { name, address, bank };

  // Prepare shop update data
  const shopUpdate: any = {
    name: shopName,
    address: shopAddress,
    helpLineNumber,
    image,
  };
  if (location?.lng !== undefined && location?.lat !== undefined) {
    shopUpdate.location = {
      type: 'Point',
      coordinates: [location.lng, location.lat],
    };
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // Update provider
    const updatedProvider = await Provider.findByIdAndUpdate(
      id,
      providerUpdate,
      { new: true, session },
    );
    if (!updatedProvider) {
      throw new AppError(httpStatus.NOT_FOUND, 'Provider not found');
    }

    // Update shop
    const updatedShop = await Shop.findOneAndUpdate(
      { provider: updatedProvider._id },
      shopUpdate,
      { new: true, session },
    );
    if (!updatedShop) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Shop not found for this provider',
      );
    }

    await session.commitTransaction();
    return {
      provider: updatedProvider,
      shop: updatedShop,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const deleteProviderAndShop = async (id: string) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // Soft delete provider
    const provider = await Provider.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { session },
    );
    if (!provider) {
      throw new AppError(httpStatus.NOT_FOUND, 'Provider not found');
    }
    // Soft delete user
    const userId = provider?.user;
    if (userId) {
      await User.findByIdAndUpdate(userId, { isDeleted: true }, { session });
    }

    // Soft delete shop
    const shop = await Shop.findOneAndUpdate(
      { provider: provider._id },
      { isDeleted: true },
      { session, new: true },
    );

    // Soft delete services
    if (shop) {
      await Service.updateMany(
        { shop: shop._id },
        { isDeleted: true },
        { session },
      );
    }

    await session.commitTransaction();
    return { message: 'Provider and related entities deleted successfully' };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const blockUnblocProvider = async (providerId: string) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const findProvider: any =
      await Provider.findById(providerId).select('user');
    if (!findProvider) {
      throw new AppError(httpStatus.NOT_FOUND, 'Provider not found');
    }

    const user: any = await User.findById(findProvider.user).session(session);
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    // Toggle user active status
    const updatedUser = await User.findByIdAndUpdate(
      findProvider.user,
      { isActive: !user.isActive },
      { new: true, session },
    );

    // Find associated shop
    const findShop = await Shop.findOne({ provider: findProvider?._id })
      .select('_id')
      .session(session);
    if (!findShop) {
      throw new AppError(httpStatus.NOT_FOUND, 'Shop not found');
    }

    // Update all services under the shop
    await Service.updateMany(
      { shop: findShop?._id },
      { isVisible: !user.isVisible },
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return updatedUser;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error toggling user status:', error);
    throw error;
  }
};

const providerService = {
  getSingleProviderWithShop,
  updateProviderAndShop,
  deleteProviderAndShop,
  blockUnblocProvider,
};

export default providerService;
