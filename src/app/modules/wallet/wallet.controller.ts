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

const walletController = {
  findProviderWiseWallet,
  updateWallet,
};

export const providerTransactionController = {
  getProviderTransactions,
};
export default walletController;
