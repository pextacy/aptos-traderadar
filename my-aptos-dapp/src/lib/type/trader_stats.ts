export type TraderStat = {
  trader_addr: string;
  creation_timestamp: number;
  last_update_timestamp: number;
  total_trades: number;
  completed_trades: number;
  cancelled_trades: number;
  total_buy_trades: number;
  total_sell_trades: number;
  total_swap_trades: number;
  total_volume: number;
  points: number;
};
