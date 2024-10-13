import { Router } from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constant';
import { coinController } from './coins.controller';

const router = Router();

router.get('/', auth(USER_ROLE.customer), coinController.getMyCoin);

export const coinRoutes = router;
