import { Router } from 'express';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { USER_ROLE } from '../user/user.constant';
import { quotesController } from './quotes.controller';
import { QuotesValidation } from './quotes.validation';

const router = Router();

router.post(
  '/',
  auth(USER_ROLE.customer, USER_ROLE.provider),
  validateRequest(QuotesValidation.InsertQuotesSchema),
  quotesController.sendQuoteToCustomer,
);
router.get(
  '/provider',
  auth(USER_ROLE.employee, USER_ROLE.provider),
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
router.patch(
  '/:id',
  auth(USER_ROLE.customer, USER_ROLE.provider),
  quotesController.updateQuotes,
);
router.patch(
  '/accept/:id',
  auth(USER_ROLE.customer, USER_ROLE.provider),
  quotesController.acceptQuote,
);
router.patch(
  '/reject/:id',
  auth(USER_ROLE.customer, USER_ROLE.provider),
  quotesController.rejectQuote,
);
router.patch(
  '/cancelled/:id',
  auth(USER_ROLE.customer, USER_ROLE.provider),
  quotesController.cancelledQuote,
);
router.patch(
  '/accept/:id',
  auth(USER_ROLE.customer, USER_ROLE.provider),
  quotesController.acceptCompletationRequest,
);

export const quotesRoutes = router;
