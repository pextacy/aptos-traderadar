import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { MODULE_ADDRESS } from "@/constants";

export type UpdateTradeArguments = {
  tradeObjAddr: string;
  amountFrom: number;
  amountTo: number;
  price: number;
  notes: string;
};

export const updateTrade = (
  args: UpdateTradeArguments
): InputTransactionData => {
  const { tradeObjAddr, amountFrom, amountTo, price, notes } = args;
  return {
    data: {
      function: `${MODULE_ADDRESS}::trade_radar::update_trade`,
      functionArguments: [tradeObjAddr, amountFrom, amountTo, price, notes],
    },
  };
};
