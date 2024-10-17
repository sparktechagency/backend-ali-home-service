/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/AppError';
import { Ishop } from './shop.interface';
import { Shop } from './shop.model';

const insertShopintoDb = async (payload: Ishop) => {
  // check if same shop exist with the same provider.
  const isShopExistWithSameProvider = await Shop.isShopExistUnderSameProvider(
    payload?.provider,
  );
  if (isShopExistWithSameProvider) {
    throw new AppError(
      httpStatus.CONFLICT,
      'Shop already exist with the same provider.',
    );
  }

  const result = await Shop.create(payload);
  return result;
};

const getAllShops = async (query: Record<string, any>) => {
  const Shopmodel = new QueryBuilder(Shop.find(), query)
    .filter()
    .search([])
    .fields()
    .sort()
    .paginate();
  const data = await Shopmodel.modelQuery;
  const meta = await Shopmodel.countTotal();
  return {
    data,
    meta,
  };
};

//
const getSingleShop = async (id: string) => {
  const result = await Shop.findById(id);

  return result;
};
// get my shop
const getmyshop = async (id: string) => {
  const result = await Shop.findById(id);
  return result;
};

const updateAshop = async (id: string, payload: Partial<Ishop>) => {
  const result = await Shop.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

const deleteShop = async (id: string) => {
  const result = await Shop.findByIdAndUpdate(
    id,
    { $set: { isDeleted: true } },
    { new: true },
  );
  return result;
};

export const shopservices = {
  insertShopintoDb,
  getAllShops,
  getSingleShop,
  deleteShop,
  updateAshop,
  getmyshop,
};
