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
  '/google/create-customers',
  // upload.single('file'),
  // parseData(),
  userControllers.SignupWithGoogleForCustomer,
);
router.post(
  '/create-admin',
  upload.single('file'),
  parseData(),
  userControllers.insertAdminIntoDb,
);
router.post(
  '/create-provider',
  upload.single('file'),
  parseData(),
  auth(USER_ROLE.sup_admin),
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
  auth(USER_ROLE.sup_admin, USER_ROLE.admin),
  // upload.single('file'),
  // parseData(),
  userControllers.updateUser,
);
router.patch(
  '/phone/update',
  auth(USER_ROLE.provider, USER_ROLE.customer, USER_ROLE.employee),

  userControllers.updatePhoneNumber,
);
router.get(
  '/profile',
  auth(
    USER_ROLE.sup_admin,
    USER_ROLE.customer,
    USER_ROLE.provider,
    USER_ROLE.employee,
  ),
  userControllers.getme,
);
router.get('/', userControllers.getAllUser);
router.get(
  '/:id',
  auth(USER_ROLE.vendor, USER_ROLE.admin),
  userControllers.getsingleUser,
);
router.get(
  '/admin/statics',
  auth(USER_ROLE.sup_admin, USER_ROLE.admin),
  userControllers.getUserStaticsData,
);

router.patch(
  '/:id',
  auth(USER_ROLE.user),
  upload.single('file'),
  parseData(),
  auth(
    USER_ROLE.sup_admin,
    USER_ROLE.customer,
    USER_ROLE.provider,
    USER_ROLE.employee,
  ),
  userControllers.updateProfile,
);
router.delete(
  '/',
  auth(
    USER_ROLE.sup_admin,
    USER_ROLE.customer,
    USER_ROLE.provider,
    USER_ROLE.employee,
  ),
  userControllers.deleteAccount,
);
export const userRoutes = router;
