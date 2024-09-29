import { Router } from 'express';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { USER_ROLE } from '../user/user.constant';
import { QuotesValidation } from './quotes.validation';

const router = Router();

router.post(
  '/',
  auth(USER_ROLE.customer, USER_ROLE.provider),
  validateRequest(QuotesValidation.InsertQuotesSchema),
);

export const quotesRoutes = router;
