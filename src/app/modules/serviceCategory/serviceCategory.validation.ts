import z from 'zod';

const insertCategorySchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'title is required' }),
  }),
});
const updateCategorySchema = z.object({
  body: z.object({
    title: z.string().optional(),
  }),
});

export const categoryValidation = {
  insertCategorySchema,
  updateCategorySchema,
};
