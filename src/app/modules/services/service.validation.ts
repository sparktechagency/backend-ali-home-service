import { Types } from 'mongoose'; // Assuming ObjectId comes from Mongoose
import { z } from 'zod';

// Zod validation for ObjectId (can be a string or an actual ObjectId)
const objectIdSchema = z
  .instanceof(Types.ObjectId)
  .or(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'));

// Zod schema for IpriceDetails
const priceDetailsSchema = z.object({
  quote: z.boolean().optional(),
  range: z
    .object({
      min: z.number(),
      max: z.number(),
    })
    .optional(),
  fixedPrice: z.number().optional(),
});

// Zod schema for inserting a service (required fields)
const InsertserviceSchema = z.object({
  body: z.object({
    category: objectIdSchema,
    // shop: objectIdSchema.optional(),
    isRequestAccept: z.boolean(),
    serviceType: z.enum(['quote', 'range', 'fixedPrice']),
    priceDetails: priceDetailsSchema,
    totalReviews: z.number().int().optional(),
    avgReviews: z.number().min(0).max(5).optional(),
  }),
});

// Zod schema for updating a service (all fields optional)
const UpdateserviceSchema = z.object({
  body: z.object({
    category: objectIdSchema.optional(),
    shop: objectIdSchema.optional(),
    isRequestAccept: z.boolean().optional(),
    serviceType: z.enum(['quote', 'range', 'fixedPrice']).optional(),
    priceDetails: priceDetailsSchema.optional(),
    totalReviews: z.number().int().optional(),
    avgReviews: z.number().min(0).max(5).optional(),
  }),
});

export const serviceValidation = {
  InsertserviceSchema,
  UpdateserviceSchema,
};
