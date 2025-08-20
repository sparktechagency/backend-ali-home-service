import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLE } from '../user/user.constant';
import walletController, {
  providerTransactionController,
} from './wallet.controller';

const router = express.Router();
export const ProviderTransactionRoutes = express.Router();
router.get(
  '/',
  auth(USER_ROLE.sup_admin, USER_ROLE.sub_admin, USER_ROLE.provider),
  walletController.getWalletDataForprovider,
);
router.get(
  '/earning-overview',
  auth(USER_ROLE.sup_admin, USER_ROLE.sub_admin),
  walletController.findTotalAdminIncome,
);
router.patch(
  '/cash/received/:id',
  auth(USER_ROLE.sup_admin),
  walletController.updateCashTransaction,
);
router.get(
  '/:id',
  auth(USER_ROLE.sup_admin, USER_ROLE.sub_admin),
  walletController.findProviderWiseWallet,
);
router.get(
  '/earning-overview',
  auth(USER_ROLE.sup_admin, USER_ROLE.sub_admin),
  walletController.findTotalAdminIncome,
);
router.patch(
  '/percentage/:id',
  auth(USER_ROLE.sup_admin),
  walletController.updateWallet,
);
router.patch(
  '/:id',
  auth(USER_ROLE.sup_admin),
  walletController.updateTransaction,
);
ProviderTransactionRoutes.get(
  '/:id',
  providerTransactionController.getProviderTransactions,
);
ProviderTransactionRoutes;
const walletRoutes = router;
export default walletRoutes;
