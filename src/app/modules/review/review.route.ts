import { Router } from 'express';

import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { USER_ROLE } from '../user/user.constant';
import { reviewController } from './review.controller';
import { reviewValidation } from './review.validation';

const router = Router();

router.post(
  '/',
  auth(USER_ROLE.customer),
  validateRequest(reviewValidation.insertReviewSchema),
  reviewController.insertReviewIntoDb,
);
router.get(
  '/',
  auth(
    USER_ROLE.customer,
    USER_ROLE.provider,
    USER_ROLE.sup_admin,
    USER_ROLE.sub_admin,
  ),

  reviewController.getShopwisereview,
);
router.get(
  '/:id',
  auth(
    USER_ROLE.customer,
    USER_ROLE.provider,
    USER_ROLE.sup_admin,
    USER_ROLE.sub_admin,
  ),

  reviewController.getserviceWiseReview,
);

export const reviewRoutes = router;
