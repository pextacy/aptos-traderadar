import { neon } from "@neondatabase/serverless";

export const getPostgresClient = () => {
  return neon(process.env.DATABASE_URL!);
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
