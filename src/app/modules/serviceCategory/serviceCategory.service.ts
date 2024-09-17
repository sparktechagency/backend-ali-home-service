/* eslint-disable @typescript-eslint/no-explicit-any */
import { IserviceCategory } from './serviceCategory.interface';
import ServiceCategory from './serviceCategory.model';

const insertCategoryIntoDb = async (payload: IserviceCategory) => {
  const result = await ServiceCategory.create(payload);
  return result;
};

const getAllCategories = async (query: Record<string, any>) => {
  const result = await ServiceCategory.find(query);
  return result;
};
const getSingleCategory = async (id: string) => {
  const result = await ServiceCategory.findById(id);
  return result;
};

const updateCategory = async (
  id: string,
  payload: Partial<IserviceCategory>,
) => {
  const result = await ServiceCategory.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

export const categoryServices = {
  insertCategoryIntoDb,
  getAllCategories,
  getSingleCategory,
  updateCategory,
};
