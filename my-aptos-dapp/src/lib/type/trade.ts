export type Trade = {
  trade_obj_addr: string;
  trader_addr: string;
  trade_type: number;
  token_from: string;
  token_to: string;
  amount_from: number;
  amount_to: number;
  price: number;
  status: number;
  creation_timestamp: number;
  last_update_timestamp: number;
  last_update_event_idx: number;
  notes: string;
};

export enum TradeType {
  BUY = 1,
  SELL = 2,
  SWAP = 3,
}

export enum TradeStatus {
  PENDING = 1,
  COMPLETED = 2,
  CANCELLED = 3,
}

export const TradeTypeLabels: Record<number, string> = {
  [TradeType.BUY]: "Buy",
  [TradeType.SELL]: "Sell",
  [TradeType.SWAP]: "Swap",
};

export const TradeStatusLabels: Record<number, string> = {
  [TradeStatus.PENDING]: "Pending",
  [TradeStatus.COMPLETED]: "Completed",
  [TradeStatus.CANCELLED]: "Cancelled",
};
