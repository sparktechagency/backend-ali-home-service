import { Router } from 'express';
import auth from '../../middleware/auth';
import upload from '../../middleware/fileUpload';
import parseData from '../../middleware/parseData';
import validateRequest from '../../middleware/validateRequest';
import { USER_ROLE } from '../user/user.constant';
import { hireRequestController } from './hireRequest.controller';
import { hireRequestValidation } from './hireRequest.validation';

const router = Router();
router.post(
  '/',
  upload.fields([{ name: 'files', maxCount: 5 }]),
  parseData(),
  auth(USER_ROLE.customer),
  validateRequest(hireRequestValidation.insertHireRequestSchema),
  hireRequestController.insertHireRequestIntoDb,
);
router.get(
  '/provider',
  auth(USER_ROLE.provider),

  hireRequestController.getAllMyHireRequest,
);
router.get(
  '/',
  auth(USER_ROLE.provider, USER_ROLE.customer, USER_ROLE.sup_admin),
  hireRequestController.getAllHireRequests,
);
router.get(
  '/:id',
  auth(USER_ROLE.provider, USER_ROLE.customer, USER_ROLE.sup_admin),
  hireRequestController.getSingleHireRequest,
);
router.patch(
  '/:id',
  auth(USER_ROLE.provider, USER_ROLE.customer, USER_ROLE.sup_admin),
  hireRequestController.updateHireRequest,
);

export const hireRequestRoutes = router;
