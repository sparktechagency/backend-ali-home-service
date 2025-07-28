import express from 'express';
import walletController, {
  providerTransactionController,
} from './wallet.controller';

const router = express.Router();
export const ProviderTransactionRoutes = express.Router();
router.get(
  '/:id',
  // auth(USER_ROLE.sup_admin),
  walletController.findProviderWiseWallet,
);
router.patch(
  '/percentage/:id',
  // auth(USER_ROLE.sup_admin),
  walletController.updateWallet,
);
router.patch(
  '/:id',
  // auth(USER_ROLE.sup_admin),
  walletController.updateTransaction,
);
ProviderTransactionRoutes.get(
  '/:id',
  providerTransactionController.getProviderTransactions,
);
ProviderTransactionRoutes;
const walletRoutes = router;
export default walletRoutes;
