import express from 'express';

import auth from '../../middleware/auth';
import upload from '../../middleware/fileUpload';
import parseData from '../../middleware/parseData';
import { USER_ROLE } from '../user/user.constant';
import providerController from './provider.controlller';

const router = express.Router();
router.get(
  '/:id',
  auth(USER_ROLE.sup_admin),
  providerController.getSingleProviderWithShop,
);
router.patch(
  '/:id',
  auth(USER_ROLE.sup_admin),
  upload.single('file'),
  parseData(),
  providerController.updateProviderAndShop,
);

router.delete(
  '/:id',
  auth(USER_ROLE.sup_admin),
  providerController.deleteProviderAndShop,
);

const ProviderRoutes = router;
export default ProviderRoutes;
