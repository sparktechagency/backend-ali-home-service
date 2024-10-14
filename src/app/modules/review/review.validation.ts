import { z } from 'zod';

const insertReviewSchema = z.object({
  body: z.object({
    quote: z.string().length(24, {
      message: 'Invalid quote ID. Must be a 24-character hex string.',
    }), // Validating as MongoDB ObjectId
    service: z.string().length(24, {
      message: 'Invalid service ID. Must be a 24-character hex string.',
    }), // Validating as MongoDB ObjectId
    comment: z
      .string()
      .min(1, { message: 'Comment cannot be empty.' })
      .max(500, { message: 'Comment cannot exceed 500 characters.' }),
    rating: z
      .number()
      .int({ message: 'Rating must be an integer.' })
      .min(1, { message: 'Rating must be at least 1.' })
      .max(5, { message: 'Rating must be at most 5.' }),
  }),
});

export const reviewValidation = {
  insertReviewSchema,
};
