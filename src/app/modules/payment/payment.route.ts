import { Router } from 'express';

import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constant';
import { paymentControllers } from './payment.controller';
const router = Router();

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

export const paymentRoutes = router;
