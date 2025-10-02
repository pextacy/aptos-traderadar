import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { MODULE_ADDRESS } from "@/constants";

export type CreateTradeArguments = {
  tradeType: number;  // 1=BUY, 2=SELL, 3=SWAP
  tokenFrom: string;
  tokenTo: string;
  amountFrom: number;
  amountTo: number;
  price: number;
  notes: string;
};

export const createTrade = (
  args: CreateTradeArguments
): InputTransactionData => {
  const { tradeType, tokenFrom, tokenTo, amountFrom, amountTo, price, notes } = args;
  return {
    data: {
      function: `${MODULE_ADDRESS}::trade_radar::create_trade`,
      functionArguments: [tradeType, tokenFrom, tokenTo, amountFrom, amountTo, price, notes],
    },
  };
};
