import { Router } from 'express';
import auth from '../../middleware/auth';
import upload from '../../middleware/fileUpload';
import parseData from '../../middleware/parseData';
import validateRequest from '../../middleware/validateRequest';
import { USER_ROLE } from '../user/user.constant';
import { employeeControllers } from './employee.controller';
import { employeeValidation } from './employee.validation';

const router = Router();

router.get(
  '/',
  auth(USER_ROLE.provider, USER_ROLE.sup_admin, USER_ROLE.sub_admin),
  employeeControllers.GetAllMyEmployees,
);
router.get(
  '/:id',
  auth(USER_ROLE.provider, USER_ROLE.sup_admin, USER_ROLE.sub_admin),
  employeeControllers.getSingleEmployee,
);
router.patch(
  '/:id',
  upload.single('file'),
  parseData(),
  auth(USER_ROLE.provider),
  validateRequest(employeeValidation.updateEmployeeSchema),
  auth(USER_ROLE.provider),
  employeeControllers.updateEmployee,
);

export const employeeRoutes = router;
