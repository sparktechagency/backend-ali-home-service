import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.route';
import { otpRoutes } from '../modules/otp/otp.routes';
import { userRoutes } from '../modules/user/user.route';

import { contentRoues } from '../modules/content/content.route';
import { notificationRoutes } from '../modules/notification/notificaiton.route';
import { serviceCategoryRoutes } from '../modules/serviceCategory/serviceCategory.route';
import { serviceRoutes } from '../modules/services/service.route';
import { shopRoutes } from '../modules/shop/shop.route';

const router = Router();
const moduleRoutes = [
  {
    path: '/users',
    route: userRoutes,
  },
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/otp',
    route: otpRoutes,
  },

  {
    path: '/shop',
    route: shopRoutes,
  },
  {
    path: '/categories',
    route: serviceCategoryRoutes,
  },
  {
    path: '/notifications',
    route: notificationRoutes,
  },
  {
    path: '/content',
    route: contentRoues,
  },
  {
    path: '/services',
    route: serviceRoutes,
  },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
