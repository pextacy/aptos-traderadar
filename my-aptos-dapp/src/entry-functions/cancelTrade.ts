import { InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { MODULE_ADDRESS } from "@/constants";

export type CancelTradeArguments = {
  tradeObjAddr: string;
};

export const cancelTrade = (
  args: CancelTradeArguments
): InputTransactionData => {
  const { tradeObjAddr } = args;
  return {
    data: {
      function: `${MODULE_ADDRESS}::trade_radar::cancel_trade`,
      functionArguments: [tradeObjAddr],
    },
  };
};
