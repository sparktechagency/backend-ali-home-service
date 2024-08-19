import QueryBuilder from "../../builder/QueryBuilder";
import { TContent } from "./content.interface";
import { Content } from "./content.model";

const insertContentIntoDb = async (payload: Partial<TContent>) => {
  const existingContent = await Content.findOne();
  let result;
  if (existingContent) {
    result = await Content.findByIdAndUpdate(existingContent._id, payload, {
      new: true,
    });
  } else {
    result = await Content.create(payload);
  }
  return result;
};

const getContents = async (query: Record<string, any>) => {
  let selectFields: any = {};

  // Extract select fields from the query
  if (query.select) {
    const fields = query.select.split(",");
    fields.forEach((field: string) => {
      selectFields[field.trim()] = 1;
    });
  }
  const result = await Content.findOne({}, selectFields);
  return result;
};

export const contentServices = {
  insertContentIntoDb,
  getContents,
};
