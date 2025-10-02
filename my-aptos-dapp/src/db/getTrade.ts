import { getPostgresClient } from "@/lib/db";
import { Trade } from "@/lib/type/trade";

export type GetTradeProps = {
  tradeObjAddr: string;
};

export const getTrade = async ({
  tradeObjAddr,
}: GetTradeProps): Promise<{
  trade: Trade;
}> => {
  const rows = await getPostgresClient()(
    `SELECT * FROM trades WHERE trade_obj_addr = $1`,
    [tradeObjAddr]
  );

  if (rows.length === 0) {
    throw new Error(`Trade not found: ${tradeObjAddr}`);
  }

  const row = rows[0];
  const trade: Trade = {
    trade_obj_addr: row.trade_obj_addr,
    trader_addr: row.trader_addr,
    trade_type: parseInt(row.trade_type),
    token_from: row.token_from,
    token_to: row.token_to,
    amount_from: parseInt(row.amount_from),
    amount_to: parseInt(row.amount_to),
    price: parseInt(row.price),
    status: parseInt(row.status),
    creation_timestamp: parseInt(row.creation_timestamp),
    last_update_timestamp: parseInt(row.last_update_timestamp),
    last_update_event_idx: parseInt(row.last_update_event_idx),
    notes: row.notes,
  };

  return { trade };
};
