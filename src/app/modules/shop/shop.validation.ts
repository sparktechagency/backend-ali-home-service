/* eslint-disable @typescript-eslint/no-unused-vars */
import { z } from 'zod';

// Define ObjectId as a string with a regex pattern matching MongoDB ObjectId format
const ObjectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');

const IimageSchema = z.object({
  url: z.string().url(),
  id: z.string().optional(),
});

const InsertShopSchema = z.object({
  body: z.object({
    provider: ObjectIdSchema,
    name: z.string(),
    license: z.string().optional(),
    // file: IimageSchema,
  }),
});
const updateAshopSchema = z.object({
  name: z.string().optional(),
  license: z.string().optional(),
  //   file: IimageSchema.optional(),
});

export const shopValidation = {
  InsertShopSchema,
  updateAshopSchema,
};
