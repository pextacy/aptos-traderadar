import { getPostgresClient } from "@/lib/db";
import { Trade } from "@/lib/type/trade";

export type GetTradesProps = {
  page: number;
  limit: number;
  sortedBy: "creation_timestamp" | "price" | "last_update_timestamp";
  order: "ASC" | "DESC";
  status?: number;
  tradeType?: number;
  traderAddr?: string;
};

export const getTrades = async ({
  page,
  limit,
  sortedBy,
  order,
  status,
  tradeType,
  traderAddr,
}: GetTradesProps): Promise<{
  trades: Trade[];
  total: number;
}> => {
  const whereConditions: string[] = [];
  const params: (number | string)[] = [];
  let paramIndex = 1;

  if (status !== undefined) {
    whereConditions.push(`status = $${paramIndex}`);
    params.push(status);
    paramIndex++;
  }

  if (tradeType !== undefined) {
    whereConditions.push(`trade_type = $${paramIndex}`);
    params.push(tradeType);
    paramIndex++;
  }

  if (traderAddr) {
    whereConditions.push(`trader_addr = $${paramIndex}`);
    params.push(traderAddr);
    paramIndex++;
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

  const rows = await getPostgresClient()(
    `SELECT * FROM trades ${whereClause} ORDER BY ${sortedBy} ${order} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, (page - 1) * limit]
  );

  const trades = rows.map((row) => {
    return {
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
  });

  const countRows = await getPostgresClient()(
    `SELECT COUNT(*) FROM trades ${whereClause}`,
    params
  );
  const count = parseInt(countRows[0].count);

  return { trades, total: count };
};
