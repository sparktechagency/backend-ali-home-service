import { Router } from 'express';

import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constant';
import notificationController from './notification.controller';

const router = Router();

router.get(
  '/',
  auth(USER_ROLE.customer, USER_ROLE.provider),
  notificationController.getAllNotification,
);

const notificationRoutes = router;

export default notificationRoutes;
