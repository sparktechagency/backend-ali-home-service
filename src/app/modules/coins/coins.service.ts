import { Coin } from './coins.model';

const getmyCoins = async (customerId: string) => {
  const result = await Coin.findOne({ customer: customerId });
  return result;
};

export const coinServices = {
  getmyCoins,
};
