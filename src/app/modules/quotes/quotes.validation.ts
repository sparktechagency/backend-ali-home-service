import { z } from 'zod';

const InsertQuotesSchema = z.object({
  body: z.object({
    service: z.string({ required_error: 'service is required' }),
    request: z.string().optional(),
    customer: z.string({ required_error: 'customer is required' }),
    fee: z.number({ required_error: 'fee is required' }),
    date: z.string({ required_error: 'date is required' }),
  }),
});

export const QuotesValidation = {
  InsertQuotesSchema,
};
