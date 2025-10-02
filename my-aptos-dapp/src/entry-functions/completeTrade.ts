import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { MODULE_ADDRESS } from "@/constants";

export type CompleteTradeArguments = {
  tradeObjAddr: string;
};

export const completeTrade = (
  args: CompleteTradeArguments
): InputTransactionData => {
  const { tradeObjAddr } = args;
  return {
    data: {
      function: `${MODULE_ADDRESS}::trade_radar::complete_trade`,
      functionArguments: [tradeObjAddr],
    },
  };
};
