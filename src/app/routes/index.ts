import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.route';
import { otpRoutes } from '../modules/otp/otp.routes';
import { userRoutes } from '../modules/user/user.route';

import { coinRoutes } from '../modules/coins/coins.route';
import { contentRoues } from '../modules/content/content.route';
import { employeeRoutes } from '../modules/employee/employee.route';
import { hireRequestRoutes } from '../modules/hireRequest/hireRequest.route';

import notificationRoutes from '../modules/notification/notification.route';
import { paymentRoutes } from '../modules/payment/payment.route';
import { quotesRoutes } from '../modules/quotes/quotes.route';
import { reviewRoutes } from '../modules/review/review.route';
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
    path: '/employees',
    route: employeeRoutes,
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
    path: '/hireRequests',
    route: hireRequestRoutes,
  },
  {
    path: '/coins',
    route: coinRoutes,
  },
  {
    path: '/quotes',
    route: quotesRoutes,
  },
  {
    path: '/reviews',
    route: reviewRoutes,
  },
  {
    path: '/payments',
    route: paymentRoutes,
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
