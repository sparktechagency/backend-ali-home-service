import { Router } from 'express';
import auth from '../../middleware/auth';
import upload from '../../middleware/fileUpload';
import parseData from '../../middleware/parseData';
import validateRequest from '../../middleware/validateRequest';
import { USER_ROLE } from '../user/user.constant';
import { ServiceController } from './service.controller';
import { serviceValidation } from './service.validation';

const router = Router();

router.post(
  '/',
  upload.fields([{ name: 'files', maxCount: 5 }]),
  parseData(),
  validateRequest(serviceValidation.InsertserviceSchema),
  auth(USER_ROLE.provider),
  ServiceController.InserServiceIntodb,
);

router.get('/', ServiceController.getAllServices);
router.get('/:id', ServiceController.getSingleService);
router.patch(
  '/:id',
  upload.fields([{ name: 'files', maxCount: 5 }]),
  parseData(),
  validateRequest(serviceValidation.UpdateserviceSchema),
  auth(USER_ROLE.provider),
  ServiceController.InserServiceIntodb,
);

export const serviceRoutes = router;
