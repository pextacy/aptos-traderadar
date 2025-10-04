import { neon } from "@neondatabase/serverless";

export const getPostgresClient = () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl || databaseUrl.trim() === '') {
    throw new Error('DATABASE_URL environment variable is not configured. Please set up your database connection.');
  }

  return neon(databaseUrl);
};

export const isDatabaseConfigured = (): boolean => {
  const databaseUrl = process.env.DATABASE_URL;
  return !!(databaseUrl && databaseUrl.trim() !== '');
};

// Query helpers for Hyperion data
export async function queryHyperionPools() {
  const sql = getPostgresClient();

  const pools = await sql`
    SELECT
      p.*,
      s.tvl_usd,
      s.volume_24h,
      s.volume_7d,
      s.fees_24h,
      s.apr,
      s.swap_count_24h,
      s.last_price,
      s.price_change_24h
    FROM hyperion_pools p
    LEFT JOIN hyperion_pool_stats s ON p.pool_address = s.pool_address
    ORDER BY CAST(s.tvl_usd AS NUMERIC) DESC NULLS LAST
  `;

  return pools;
}

export async function queryHyperionPoolByAddress(poolAddress: string) {
  const sql = getPostgresClient();

  const result = await sql`
    SELECT
      p.*,
      s.tvl_usd,
      s.volume_24h,
      s.volume_7d,
      s.fees_24h,
      s.apr,
      s.swap_count_24h,
      s.unique_traders_24h,
      s.last_price,
      s.price_change_24h
    FROM hyperion_pools p
    LEFT JOIN hyperion_pool_stats s ON p.pool_address = s.pool_address
    WHERE p.pool_address = ${poolAddress}
  `;

  return result[0] || null;
}

export async function queryHyperionSwaps(poolAddress?: string, limit = 100) {
  const sql = getPostgresClient();

  if (poolAddress) {
    const swaps = await sql`
      SELECT *
      FROM hyperion_swaps
      WHERE pool_address = ${poolAddress}
      ORDER BY timestamp DESC
      LIMIT ${limit}
    `;
    return swaps;
  }

  const swaps = await sql`
    SELECT *
    FROM hyperion_swaps
    ORDER BY timestamp DESC
    LIMIT ${limit}
  `;

  return swaps;
}

export async function queryHyperionPoolStats() {
  const sql = getPostgresClient();

  const stats = await sql`
    SELECT *
    FROM hyperion_pool_stats
    ORDER BY CAST(tvl_usd AS NUMERIC) DESC
  `;

  return stats;
}

export async function calculatePoolMetrics(poolAddress: string, hours = 24) {
  const sql = getPostgresClient();

  const now = Math.floor(Date.now() / 1000);
  const startTime = now - (hours * 3600);

  const metrics = await sql`
    SELECT
      COUNT(*) as swap_count,
      COUNT(DISTINCT sender) as unique_traders,
      SUM(CAST(amount_in AS NUMERIC)) as total_volume_in,
      SUM(CAST(amount_out AS NUMERIC)) as total_volume_out
    FROM hyperion_swaps
    WHERE pool_address = ${poolAddress}
      AND timestamp >= ${startTime}
  `;

  return metrics[0] || null;
}

export async function getAggregatedPoolMetrics() {
  const sql = getPostgresClient();

  const aggregated = await sql`
    SELECT
      COUNT(DISTINCT p.pool_address) as total_pools,
      SUM(CAST(s.tvl_usd AS NUMERIC)) as total_tvl,
      SUM(CAST(s.volume_24h AS NUMERIC)) as total_volume_24h,
      SUM(CAST(s.fees_24h AS NUMERIC)) as total_fees_24h,
      AVG(CAST(s.apr AS NUMERIC)) as avg_apr,
      COUNT(DISTINCT sw.sender) as unique_traders_24h
    FROM hyperion_pools p
    LEFT JOIN hyperion_pool_stats s ON p.pool_address = s.pool_address
    LEFT JOIN hyperion_swaps sw ON p.pool_address = sw.pool_address
      AND sw.timestamp >= ${Math.floor(Date.now() / 1000) - 86400}
  `;

  return aggregated[0] || null;
}

export async function getPoolSwapHistory(
  poolAddress: string,
  limit = 50,
  offset = 0
) {
  const sql = getPostgresClient();

  const swaps = await sql`
    SELECT
      transaction_hash,
      sender,
      pool_address,
      amount_in,
      amount_out,
      token_in,
      token_out,
      timestamp,
      block_height
    FROM hyperion_swaps
    WHERE pool_address = ${poolAddress}
    ORDER BY timestamp DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  return swaps;
}

export async function getTopTraders(limit = 10, hours = 24) {
  const sql = getPostgresClient();

  const startTime = Math.floor(Date.now() / 1000) - hours * 3600;

  const topTraders = await sql`
    SELECT
      sender,
      COUNT(*) as swap_count,
      SUM(CAST(amount_in AS NUMERIC)) as total_volume,
      COUNT(DISTINCT pool_address) as pools_traded
    FROM hyperion_swaps
    WHERE timestamp >= ${startTime}
    GROUP BY sender
    ORDER BY total_volume DESC
    LIMIT ${limit}
  `;

  return topTraders;
}

export async function getPoolVolumeTimeSeries(
  poolAddress: string,
  intervalMinutes = 60,
  hours = 24
) {
  const sql = getPostgresClient();

  const startTime = Math.floor(Date.now() / 1000) - hours * 3600;

  const timeSeries = await sql`
    SELECT
      (timestamp / ${intervalMinutes * 60}) * ${intervalMinutes * 60} as time_bucket,
      COUNT(*) as swap_count,
      SUM(CAST(amount_in AS NUMERIC)) as volume_in,
      SUM(CAST(amount_out AS NUMERIC)) as volume_out
    FROM hyperion_swaps
    WHERE pool_address = ${poolAddress}
      AND timestamp >= ${startTime}
    GROUP BY time_bucket
    ORDER BY time_bucket ASC
  `;

  return timeSeries;
}

export async function getMostActivePoolsByVolume(limit = 10, hours = 24) {
  const sql = getPostgresClient();

  const startTime = Math.floor(Date.now() / 1000) - hours * 3600;

  const activePools = await sql`
    SELECT
      sw.pool_address,
      p.token0_symbol,
      p.token1_symbol,
      COUNT(*) as swap_count,
      COUNT(DISTINCT sw.sender) as unique_traders,
      SUM(CAST(sw.amount_in AS NUMERIC)) as total_volume
    FROM hyperion_swaps sw
    JOIN hyperion_pools p ON sw.pool_address = p.pool_address
    WHERE sw.timestamp >= ${startTime}
    GROUP BY sw.pool_address, p.token0_symbol, p.token1_symbol
    ORDER BY total_volume DESC
    LIMIT ${limit}
  `;

  return activePools;
}

export async function getRecentLargeTrades(minVolume = 1000, limit = 20) {
  const sql = getPostgresClient();

  const largeTrades = await sql`
    SELECT
      sw.transaction_hash,
      sw.sender,
      sw.pool_address,
      p.token0_symbol,
      p.token1_symbol,
      sw.amount_in,
      sw.amount_out,
      sw.timestamp
    FROM hyperion_swaps sw
    JOIN hyperion_pools p ON sw.pool_address = p.pool_address
    WHERE CAST(sw.amount_in AS NUMERIC) >= ${minVolume}
    ORDER BY sw.timestamp DESC
    LIMIT ${limit}
  `;

  return largeTrades;
}

export async function getPoolLiquidityChanges(
  poolAddress: string,
  hours = 24
) {
  const sql = getPostgresClient();

  const startTime = Math.floor(Date.now() / 1000) - hours * 3600;

  const liquidityChanges = await sql`
    SELECT
      timestamp,
      CAST(liquidity AS NUMERIC) as liquidity,
      CAST(tvl_usd AS NUMERIC) as tvl_usd
    FROM hyperion_pool_stats
    WHERE pool_address = ${poolAddress}
      AND timestamp >= ${startTime}
    ORDER BY timestamp ASC
  `;

  return liquidityChanges;
}
