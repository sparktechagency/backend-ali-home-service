import { z } from 'zod';

const insertHireRequestSchema = z.object({
  body: z.object({
    service: z
      .string({
        required_error: 'Service ID is required',
      })
      .regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId format for service'), // Validates MongoDB ObjectId

    address: z.string({
      required_error: 'Address is required',
    }),

    description: z.string({
      required_error: 'Description is required',
    }),

    //   images: z
    //     .array(
    //       z.object({
    //         url: z
    //           .string({ required_error: 'Image URL is required' })
    //           .url('Invalid URL format'), // Example for image schema validation
    //         caption: z.string().optional(), // Optional caption for image
    //       }),
    //     )
    //     .optional(),

    status: z
      .enum(['pending', 'accepted', 'rejected'], {
        required_error: 'Status is required',
      })
      .default('pending'),

    priority: z
      .enum(['yes', 'no'], {
        required_error: 'Priority is required',
      })
      .default('no'),
  }),
});

export const hireRequestValidation = {
  insertHireRequestSchema,
};
