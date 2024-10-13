import { Router } from 'express';
import auth from '../../middleware/auth';
import upload from '../../middleware/fileUpload';
import parseData from '../../middleware/parseData';
import { USER_ROLE } from './user.constant';
import { userControllers } from './user.controller';

const router = Router();
router.post(
  '/create-customers',
  upload.single('file'),
  parseData(),
  userControllers.insertCustomerIntoDb,
);
router.post(
  '/create-provider',
  upload.single('file'),
  parseData(),
  userControllers.insertProviderintoDb,
);
router.post(
  '/create-employee',
  upload.single('file'),
  parseData(),
  auth(USER_ROLE.provider),
  // validateRequest(employeeValidation.insertEmployeeSchema),
  userControllers.insertEmployeeIntoDb,
);
router.patch(
  '/',
  auth(USER_ROLE.provider, USER_ROLE.customer, USER_ROLE.employee),
  upload.single('file'),
  userControllers.updateProfile,
);
router.patch(
  '/update/:id',
  auth(USER_ROLE.provider, USER_ROLE.customer, USER_ROLE.employee),
  upload.single('file'),
  parseData(),
  userControllers.updateUser,
);
router.get(
  '/profile',
  auth(USER_ROLE.sup_admin, USER_ROLE.customer, USER_ROLE.provider),
  userControllers.getme,
);

router.get(
  '/all',
  auth(USER_ROLE.vendor, USER_ROLE.admin),
  userControllers.getAllUsers,
);

router.get(
  '/:id',
  auth(USER_ROLE.vendor, USER_ROLE.admin),
  userControllers.getsingleUser,
);
router.patch(
  '/update/:id',
  auth(USER_ROLE.admin),
  parseData(),
  userControllers.updateUser,
);
router.patch(
  '/:id',
  auth(USER_ROLE.user),
  parseData(),
  userControllers.updateProfile,
);
router.delete(
  '/',
  auth(USER_ROLE.vendor, USER_ROLE.user),
  userControllers.deleteAccount,
);
export const userRoutes = router;
