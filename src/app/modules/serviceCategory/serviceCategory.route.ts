import { Router } from 'express';
import auth from '../../middleware/auth';
import upload from '../../middleware/fileUpload';
import parseData from '../../middleware/parseData';
import validateRequest from '../../middleware/validateRequest';
import { USER_ROLE } from '../user/user.constant';
import { categoryControllers } from './serviceCategory.controller';
import { categoryValidation } from './serviceCategory.validation';

const router = Router();

router.post(
  '/',
  upload.single('file'),
  parseData(),
  validateRequest(categoryValidation.insertCategorySchema),
  // auth(USER_ROLE.sup_admin, USER_ROLE.admin),
  categoryControllers.insertCategoryIntoDb,
);

router.get('/', categoryControllers.getAllCategories);
router.get('/:id', categoryControllers.getSingleCategory);
router.patch(
  '/:id',
  upload.single('file'),
  parseData(),
  validateRequest(categoryValidation.updateCategorySchema),
  auth(USER_ROLE.sup_admin, USER_ROLE.admin),
  categoryControllers.updateCategory,
);

export const serviceCategoryRoutes = router;
