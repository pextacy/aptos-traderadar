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

export const getHyperionPoolsOnServer = async (): Promise<{
  pools: Array<{
    poolAddress: string;
    token0Symbol: string;
    token1Symbol: string;
    tvlUsd: number;
    volume24h: number;
    apr: number;
    priceChange24h: number;
  }>;
  total: number;
}> => {
  try {
    const { queryHyperionPools } = await import("@/lib/db");
    const pools = await queryHyperionPools();

    return {
      pools: pools.map((pool) => ({
        poolAddress: pool.pool_address as string,
        token0Symbol: pool.token0_symbol as string,
        token1Symbol: pool.token1_symbol as string,
        tvlUsd: parseFloat(String(pool.tvl_usd || 0)),
        volume24h: parseFloat(String(pool.volume_24h || 0)),
        apr: parseFloat(String(pool.apr || 0)),
        priceChange24h: parseFloat(String(pool.price_change_24h || 0)),
      })),
      total: pools.length,
    };
  } catch (error) {
    console.error("Error fetching Hyperion pools:", error);
    return { pools: [], total: 0 };
  }
};

export const getPoolMetricsOnServer = async (poolAddress: string, hours = 24): Promise<{
  swapCount: number;
  uniqueTraders: number;
  volumeIn: number;
  volumeOut: number;
} | null> => {
  try {
    const { calculatePoolMetrics } = await import("@/lib/db");
    const metrics = await calculatePoolMetrics(poolAddress, hours);

    if (!metrics) return null;

    return {
      swapCount: parseInt(String(metrics.swap_count || 0)),
      uniqueTraders: parseInt(String(metrics.unique_traders || 0)),
      volumeIn: parseFloat(String(metrics.total_volume_in || 0)),
      volumeOut: parseFloat(String(metrics.total_volume_out || 0)),
    };
  } catch (error) {
    console.error("Error calculating pool metrics:", error);
    return null;
  }
};

export const getAggregatedMetricsOnServer = async (): Promise<{
  totalPools: number;
  totalTvl: number;
  totalVolume24h: number;
  totalFees24h: number;
  avgApr: number;
  uniqueTraders24h: number;
}> => {
  try {
    const { getAggregatedPoolMetrics } = await import("@/lib/db");
    const metrics = await getAggregatedPoolMetrics();

    if (!metrics) {
      return {
        totalPools: 0,
        totalTvl: 0,
        totalVolume24h: 0,
        totalFees24h: 0,
        avgApr: 0,
        uniqueTraders24h: 0,
      };
    }

    return {
      totalPools: parseInt(String(metrics.total_pools || 0)),
      totalTvl: parseFloat(String(metrics.total_tvl || 0)),
      totalVolume24h: parseFloat(String(metrics.total_volume_24h || 0)),
      totalFees24h: parseFloat(String(metrics.total_fees_24h || 0)),
      avgApr: parseFloat(String(metrics.avg_apr || 0)),
      uniqueTraders24h: parseInt(String(metrics.unique_traders_24h || 0)),
    };
  } catch (error) {
    console.error("Error fetching aggregated metrics:", error);
    return {
      totalPools: 0,
      totalTvl: 0,
      totalVolume24h: 0,
      totalFees24h: 0,
      avgApr: 0,
      uniqueTraders24h: 0,
    };
  }
};

export const getTopTradersOnServer = async (limit = 10, hours = 24): Promise<{
  traders: Array<{
    address: string;
    swapCount: number;
    totalVolume: number;
    poolsTraded: number;
  }>;
}> => {
  try {
    const { getTopTraders } = await import("@/lib/db");
    const traders = await getTopTraders(limit, hours);

    return {
      traders: traders.map((trader) => ({
        address: trader.sender,
        swapCount: parseInt(String(trader.swap_count)),
        totalVolume: parseFloat(String(trader.total_volume)),
        poolsTraded: parseInt(String(trader.pools_traded)),
      })),
    };
  } catch (error) {
    console.error("Error fetching top traders:", error);
    return { traders: [] };
  }
};

export const getMostActivePoolsOnServer = async (limit = 10, hours = 24): Promise<{
  pools: Array<{
    poolAddress: string;
    token0: string;
    token1: string;
    swapCount: number;
    uniqueTraders: number;
    totalVolume: number;
  }>;
}> => {
  try {
    const { getMostActivePoolsByVolume } = await import("@/lib/db");
    const pools = await getMostActivePoolsByVolume(limit, hours);

    return {
      pools: pools.map((pool) => ({
        poolAddress: pool.pool_address,
        token0: pool.token0_symbol,
        token1: pool.token1_symbol,
        swapCount: parseInt(String(pool.swap_count)),
        uniqueTraders: parseInt(String(pool.unique_traders)),
        totalVolume: parseFloat(String(pool.total_volume)),
      })),
    };
  } catch (error) {
    console.error("Error fetching most active pools:", error);
    return { pools: [] };
  }
};

export const getPoolVolumeTimeSeriesOnServer = async (
  poolAddress: string,
  intervalMinutes = 60,
  hours = 24
): Promise<{
  data: Array<{
    timestamp: number;
    swapCount: number;
    volumeIn: number;
    volumeOut: number;
  }>;
}> => {
  try {
    const { getPoolVolumeTimeSeries } = await import("@/lib/db");
    const timeSeries = await getPoolVolumeTimeSeries(poolAddress, intervalMinutes, hours);

    return {
      data: timeSeries.map((bucket) => ({
        timestamp: parseInt(String(bucket.time_bucket)),
        swapCount: parseInt(String(bucket.swap_count)),
        volumeIn: parseFloat(String(bucket.volume_in)),
        volumeOut: parseFloat(String(bucket.volume_out)),
      })),
    };
  } catch (error) {
    console.error("Error fetching pool volume time series:", error);
    return { data: [] };
  }
};

export const getRecentLargeTradesOnServer = async (minVolume = 1000, limit = 20): Promise<{
  trades: Array<{
    transactionHash: string;
    trader: string;
    poolAddress: string;
    token0: string;
    token1: string;
    amountIn: number;
    amountOut: number;
    timestamp: number;
  }>;
}> => {
  try {
    const { getRecentLargeTrades } = await import("@/lib/db");
    const trades = await getRecentLargeTrades(minVolume, limit);

    return {
      trades: trades.map((trade) => ({
        transactionHash: trade.transaction_hash,
        trader: trade.sender,
        poolAddress: trade.pool_address,
        token0: trade.token0_symbol,
        token1: trade.token1_symbol,
        amountIn: parseFloat(String(trade.amount_in)),
        amountOut: parseFloat(String(trade.amount_out)),
        timestamp: parseInt(String(trade.timestamp)),
      })),
    };
  } catch (error) {
    console.error("Error fetching recent large trades:", error);
    return { trades: [] };
  }
};
