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
  '/amount-popup',
  // auth(USER_ROLE.employee, USER_ROLE.provider),
  quotesController.openPaymentPopup,
);
router.get(
  '/provider',
  auth(USER_ROLE.employee, USER_ROLE.provider),
  quotesController.getProviderWiseQuotes,
);

router.get(
  '/',
  auth(USER_ROLE.customer, USER_ROLE.provider, USER_ROLE.employee),
  quotesController.getAllQuotes,
);
router.get(
  '/:id',
  auth(USER_ROLE.customer, USER_ROLE.provider, USER_ROLE.employee),
  quotesController.getSingleQuotes,
);
router.get(
  '/:id',
  auth(USER_ROLE.customer, USER_ROLE.provider, USER_ROLE.employee),
  quotesController.getSingleQuotes,
);
router.patch(
  '/accept',
  auth(USER_ROLE.customer, USER_ROLE.provider, USER_ROLE.employee),
  quotesController.acceptCompletationRequest,
);
router.patch(
  '/:id',
  auth(USER_ROLE.customer, USER_ROLE.provider),
  quotesController.updateQuotes,
);
router.patch(
  '/accept/:id',
  auth(USER_ROLE.customer, USER_ROLE.provider, USER_ROLE.employee),
  quotesController.acceptQuote,
);
router.patch(
  '/complete/:id',
  auth(USER_ROLE.customer, USER_ROLE.provider, USER_ROLE.employee),
  quotesController.acceptQuote,
);
router.patch(
  '/reject/:id',
  auth(USER_ROLE.customer, USER_ROLE.provider, USER_ROLE.employee),
  quotesController.rejectQuote,
);
router.patch(
  '/cancelled/:id',
  auth(USER_ROLE.customer, USER_ROLE.provider, USER_ROLE.employee),
  quotesController.cancelledQuote,
);

router.get(
  '/summery/count',
  auth(USER_ROLE.customer, USER_ROLE.provider, USER_ROLE.employee),
  quotesController.getQuotesStatusSummary,
);

export const quotesRoutes = router;
