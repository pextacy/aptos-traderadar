"use server";

import { getLastSuccessVersion } from "@/db/getLastSuccessVersion";
import { GetMessageProps, getMessage } from "@/db/getMessage";
import { GetMessagesProps, getMessages } from "@/db/getMessages";
import { getUserStats, GetUserStatsProps } from "@/db/getUserStats";
import { GetTradeProps, getTrade } from "@/db/getTrade";
import { GetTradesProps, getTrades } from "@/db/getTrades";
import { GetTraderStatsProps, getTraderStats } from "@/db/getTraderStats";
import { Message } from "@/lib/type/message";
import { UserStat } from "@/lib/type/user_stats";
import { Trade, TradeStatus } from "@/lib/type/trade";
import { TraderStat } from "@/lib/type/trader_stats";

export const getMessagesOnServer = async ({
  page,
  limit,
  sortedBy,
  order,
}: GetMessagesProps): Promise<{
  messages: Message[];
  total: number;
}> => {
  return getMessages({ page, limit, sortedBy, order });
};

export const getMessageOnServer = async ({
  messageObjAddr,
}: GetMessageProps): Promise<{
  message: Message;
}> => {
  return getMessage({ messageObjAddr });
};

export const getLastVersionOnServer = async (): Promise<number> => {
  return getLastSuccessVersion();
};

export const getUserStatsOnServer = async ({
  page,
  limit,
  sortedBy,
  order,
}: GetUserStatsProps): Promise<{
  userStats: UserStat[];
  total: number;
}> => {
  return getUserStats({ page, limit, sortedBy, order });
};

export const getTradesOnServer = async ({
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
  return getTrades({ page, limit, sortedBy, order, status, tradeType, traderAddr });
};

export const getTradeOnServer = async ({
  tradeObjAddr,
}: GetTradeProps): Promise<{
  trade: Trade;
}> => {
  return getTrade({ tradeObjAddr });
};

export const getTraderStatsOnServer = async ({
  page,
  limit,
  sortedBy,
  order,
}: GetTraderStatsProps): Promise<{
  traderStats: TraderStat[];
  total: number;
}> => {
  return getTraderStats({ page, limit, sortedBy, order });
};

// New: Get dashboard statistics from real database
export const getDashboardStatsOnServer = async (): Promise<{
  totalTrades: number;
  activeTrades: number;
  totalVolume: number;
  totalTraders: number;
  volumeChange24h: number;
  tradesChange24h: number;
}> => {
  try {
    const { getPostgresClient } = await import("@/lib/db");
    const sql = getPostgresClient();

    // Get total trades count
    const totalTradesResult = await sql(`SELECT COUNT(*) as count FROM trades`);
    const totalTrades = parseInt(totalTradesResult[0].count);

    // Get active trades (status = PENDING)
    const activeTradesResult = await sql(
      `SELECT COUNT(*) as count FROM trades WHERE status = $1`,
      [TradeStatus.PENDING]
    );
    const activeTrades = parseInt(activeTradesResult[0].count);

    // Get total volume (sum of all trade prices)
    const volumeResult = await sql(
      `SELECT COALESCE(SUM(price), 0) as total_volume FROM trades WHERE status != $1`,
      [TradeStatus.CANCELLED]
    );
    const totalVolume = parseInt(volumeResult[0].total_volume);

    // Get total unique traders
    const tradersResult = await sql(
      `SELECT COUNT(DISTINCT trader_addr) as count FROM trades`
    );
    const totalTraders = parseInt(tradersResult[0].count);

    // Get 24h volume change
    const oneDayAgo = Math.floor(Date.now() / 1000) - 86400;
    const volume24hAgoResult = await sql(
      `SELECT COALESCE(SUM(price), 0) as volume FROM trades
       WHERE creation_timestamp <= $1 AND status != $2`,
      [oneDayAgo, TradeStatus.CANCELLED]
    );
    const volume24hAgo = parseInt(volume24hAgoResult[0].volume);
    const volumeChange24h = volume24hAgo > 0
      ? ((totalVolume - volume24hAgo) / volume24hAgo) * 100
      : 0;

    // Get 24h trades change
    const trades24hAgoResult = await sql(
      `SELECT COUNT(*) as count FROM trades WHERE creation_timestamp <= $1`,
      [oneDayAgo]
    );
    const trades24hAgo = parseInt(trades24hAgoResult[0].count);
    const tradesChange24h = trades24hAgo > 0
      ? ((totalTrades - trades24hAgo) / trades24hAgo) * 100
      : 0;

    return {
      totalTrades,
      activeTrades,
      totalVolume,
      totalTraders,
      volumeChange24h,
      tradesChange24h,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    // Return zeros if database is not configured
    return {
      totalTrades: 0,
      activeTrades: 0,
      totalVolume: 0,
      totalTraders: 0,
      volumeChange24h: 0,
      tradesChange24h: 0,
    };
  }
};
