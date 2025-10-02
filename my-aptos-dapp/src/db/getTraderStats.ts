import { getPostgresClient } from "@/lib/db";
import { TraderStat } from "@/lib/type/trader_stats";

export type GetTraderStatsProps = {
  page: number;
  limit: number;
  sortedBy: "points" | "total_volume" | "total_trades";
  order: "ASC" | "DESC";
};

export const getTraderStats = async ({
  page,
  limit,
  sortedBy,
  order,
}: GetTraderStatsProps): Promise<{
  traderStats: TraderStat[];
  total: number;
}> => {
  const rows = await getPostgresClient()(
    `SELECT * FROM trader_stats ORDER BY ${sortedBy} ${order} LIMIT ${limit} OFFSET ${
      (page - 1) * limit
    }`
  );

  const traderStats = rows.map((row) => {
    return {
      trader_addr: row.trader_addr,
      creation_timestamp: parseInt(row.creation_timestamp),
      last_update_timestamp: parseInt(row.last_update_timestamp),
      total_trades: parseInt(row.total_trades),
      completed_trades: parseInt(row.completed_trades),
      cancelled_trades: parseInt(row.cancelled_trades),
      total_buy_trades: parseInt(row.total_buy_trades),
      total_sell_trades: parseInt(row.total_sell_trades),
      total_swap_trades: parseInt(row.total_swap_trades),
      total_volume: parseInt(row.total_volume),
      points: parseInt(row.points),
    };
  });

  const rows2 = await getPostgresClient()(`SELECT COUNT(*) FROM trader_stats;`);
  const count = parseInt(rows2[0].count);

  return { traderStats, total: count };
};
