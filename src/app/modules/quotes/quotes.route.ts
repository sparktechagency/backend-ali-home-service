import { Router } from 'express';
import auth from '../../middleware/auth';
import upload from '../../middleware/fileUpload';
import validateRequest from '../../middleware/validateRequest';
import { USER_ROLE } from '../user/user.constant';
import { quotesController } from './quotes.controller';
import { QuotesValidation } from './quotes.validation';

const router = Router();

router.post(
  '/',
  upload.fields([{ name: 'files', maxCount: 5 }]),
  auth(USER_ROLE.customer, USER_ROLE.provider),
  validateRequest(QuotesValidation.InsertQuotesSchema),
  quotesController.sendQuoteToCustomer,
);
router.get(
  '/provider',
  auth(USER_ROLE.customer, USER_ROLE.provider),
  quotesController.getProviderWiseQuotes,
);
router.get(
  '/',
  auth(USER_ROLE.customer, USER_ROLE.provider),
  quotesController.getAllQuotes,
);
router.get(
  '/:id',
  auth(USER_ROLE.customer, USER_ROLE.provider),
  quotesController.getSingleQuotes,
);
router.get(
  '/:id',
  auth(USER_ROLE.customer, USER_ROLE.provider),
  quotesController.getSingleQuotes,
);
router.get(
  '/:id',
  auth(USER_ROLE.customer, USER_ROLE.provider),
  quotesController.updateQuotes,
);

export const quotesRoutes = router;
