import { Router } from 'express';

import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constant';
import { paymentControllers } from './payment.controller';
const router = Router();
router.get(
  '/',
  auth(USER_ROLE.provider),
  paymentControllers.getPaymentsByProvider,
);
router.get(
  '/history',
  auth(USER_ROLE.provider),
  paymentControllers.getPaymentsByProvider,
);
router.post(
  '/',
  auth(USER_ROLE.customer),
  paymentControllers.insertPaymentIntoDb,
);
router.post(
  '/payment-intent',
  auth(USER_ROLE.customer),
  paymentControllers.createPaymentIntent,
);
router.post('/checkout', auth(USER_ROLE.customer), paymentControllers.checkout);
router.get(
  '/confirm-payment',
  // auth(USER_ROLE.customer),
  paymentControllers.confirmPayment,
);
router.post(
  '/pay-by-cash',
  auth(USER_ROLE.customer),
  paymentControllers.completePaymentByHandCash,
);
router.get(
  '/transactions',
  // auth(USER_ROLE.sup_admin, USER_ROLE.admin),
  paymentControllers.showTransactions,
);
router.get(
  '/transactionsOverview',
  // auth(USER_ROLE.sup_admin, USER_ROLE.admin),
  paymentControllers.transactionOverview,
);
router.get(
  '/stats/transactions',
  // auth(USER_ROLE.sup_admin, USER_ROLE.admin),
  paymentControllers.getMonthlyPaymentStats,
);

export const paymentRoutes = router;
