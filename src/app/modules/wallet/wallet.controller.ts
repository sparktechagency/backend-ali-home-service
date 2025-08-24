import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { providerTransactionServices, walletServices } from './wallet.service';

const findProviderWiseWallet = catchAsync(
  async (req: Request, res: Response) => {
    const result = await walletServices.findProviderWiseWallet(req.params.id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Wallet data retreived successfully',
      data: result,
    });
  },
);
const updateTransaction = catchAsync(async (req: Request, res: Response) => {
  console.log(req.body);
  const result = await walletServices.updateTransaction(
    req.params.id,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Wallet data updated successfully',
    data: result,
  });
});
const updateWallet = catchAsync(async (req: Request, res: Response) => {
  const result = await walletServices.updateWallet(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Wallet data updated successfully',
    data: result,
  });
});
const getProviderTransactions = catchAsync(
  async (req: Request, res: Response) => {
    const result = await providerTransactionServices.getProviderTransactions(
      req.params.id,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Transactions data retrieved successfully',
      data: result,
    });
  },
);
const findTotalAdminIncome = catchAsync(async (req: Request, res: Response) => {
  const result = await walletServices.findTotalAdminIncome();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Transactions data retrieved successfully',
    data: result,
  });
});

const updateCashTransaction = catchAsync(
  async (req: Request, res: Response) => {
    const result = await walletServices.updateCashTransaction(req.params.id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Transactions data retrieved successfully',
      data: result,
    });
  },
);
const getWalletDataForprovider = catchAsync(
  async (req: Request, res: Response) => {
    const result = await walletServices.getWalletDataForprovider(
      req.user.profileId,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Wallet data retrieved successfully',
      data: result,
    });
  },
);
const walletController = {
  findProviderWiseWallet,
  updateTransaction,
  updateWallet,
  findTotalAdminIncome,
  getWalletDataForprovider,
  updateCashTransaction,
};

export const providerTransactionController = {
  getProviderTransactions,
};
export default walletController;
