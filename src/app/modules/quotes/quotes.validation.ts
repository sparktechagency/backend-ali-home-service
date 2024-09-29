import { Types } from 'mongoose';
import { z } from 'zod';

const InsertQuotesSchema = z.object({
  service: z.instanceof(Types.ObjectId),
  request: z.instanceof(Types.ObjectId).optional(),
  customer: z.instanceof(Types.ObjectId),
  fee: z.number({ required_error: 'fee is required' }),
  date: z.string({ required_error: 'date is required' }),
});

export const QuotesValidation = {
  InsertQuotesSchema,
};
