// Hyperion CLMM Liquidity Pool Analytics

import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { HyperionPool } from './types';

// Hyperion CLMM Pool Addresses on Aptos Mainnet
// These are real pool addresses from Hyperion DEX
// Source: Aptos Explorer & GeckoTerminal
const HYPERION_POOLS: Record<string, string> = {
  // USDC/APT pool (~$10M TVL) - verified on Aptos Explorer
  'APT/USDC': '0x925660b8618394809f89f8002e2926600c775221f43bf1919782b297a79400d8',
  'USDC/APT': '0x925660b8618394809f89f8002e2926600c775221f43bf1919782b297a79400d8',
};

let aptosClient: Aptos | null = null;

export function getAptosClient(): Aptos {
  if (!aptosClient) {
    // Use MAINNET for real Hyperion pools
    const config = new AptosConfig({ network: Network.MAINNET });
    aptosClient = new Aptos(config);
  }
  return aptosClient;
}

export async function getPoolReserves(poolAddress: string): Promise<{ reserve0: bigint; reserve1: bigint } | null> {
  const aptos = getAptosClient();

  try {
    const result = await aptos.view({
      payload: {
        function: `${poolAddress}::pool::get_reserves`,
        functionArguments: [],
      },
    });

    return {
      reserve0: BigInt(result[0] as string),
      reserve1: BigInt(result[1] as string),
    };
  } catch (error) {
    console.error(`Error fetching reserves for pool ${poolAddress}:`, error);
    return null;
  }
}

export function calculateTVL(reserve0: bigint, reserve1: bigint, price0: number, price1: number): number {
  const tvl0 = Number(reserve0) / 1e8 * price0;
  const tvl1 = Number(reserve1) / 1e8 * price1;
  return tvl0 + tvl1;
}

export function calculateAPR(volume24h: number, tvl: number, fee: number): number {
  if (tvl === 0) return 0;
  const dailyFees = volume24h * fee;
  const apr = (dailyFees * 365) / tvl * 100;
  return apr;
}

/**
 * Get pool address by symbol pair
 */
export function getPoolAddressBySymbol(symbol: string): string | null {
  return HYPERION_POOLS[symbol] || null;
}

export async function getHyperionPoolData(poolAddress: string): Promise<HyperionPool | null> {
  try {
    // Fetch pool data from indexer API
    const response = await fetch(`/api/hyperion/pools?address=${poolAddress}`);

    if (!response.ok) {
      console.error('Failed to fetch pool from API:', response.statusText);
      return null;
    }

    const data = await response.json();
    const pool = data.pool;

    if (!pool) {
      return null;
    }

    // Transform database schema to HyperionPool type
    return {
      poolAddress: pool.pool_address as string,
      token0: pool.token0_symbol as string,
      token1: pool.token1_symbol as string,
      reserve0: BigInt(String(pool.liquidity || '0')),
      reserve1: BigInt(String(pool.liquidity || '0')),
      tvl: parseFloat(String(pool.tvl_usd || '0')),
      volume24h: parseFloat(String(pool.volume_24h || '0')),
      apr: parseFloat(String(pool.apr || '0')),
      fee: (pool.fee_tier as number) / 1000000, // Convert from basis points
      priceChange24h: parseFloat(String(pool.price_change_24h || '0')),
    };
  } catch (error) {
    console.error(`Error fetching pool data for ${poolAddress}:`, error);
    return null;
  }
}

export async function getAllHyperionPools(): Promise<HyperionPool[]> {
  try {
    // Fetch from indexer API instead of querying blockchain directly
    const response = await fetch('/api/hyperion/pools');

    if (!response.ok) {
      console.error('Failed to fetch pools from API:', response.statusText);
      return [];
    }

    const data = await response.json();

    // Transform database schema to HyperionPool type
    return data.pools.map((pool: Record<string, unknown>) => ({
      poolAddress: pool.pool_address as string,
      token0: pool.token0_symbol as string,
      token1: pool.token1_symbol as string,
      reserve0: BigInt(String(pool.liquidity || '0')),
      reserve1: BigInt(String(pool.liquidity || '0')),
      tvl: parseFloat(String(pool.tvl_usd || '0')),
      volume24h: parseFloat(String(pool.volume_24h || '0')),
      apr: parseFloat(String(pool.apr || '0')),
      fee: 0.003,
      priceChange24h: parseFloat(String(pool.price_change_24h || '0')),
    }));
  } catch (error) {
    console.error('Error fetching Hyperion pools:', error);
    return [];
  }
}

export function detectLiquidityAlerts(pools: HyperionPool[]): Array<{ pool: string; reason: string; value: number }> {
  const alerts: Array<{ pool: string; reason: string; value: number }> = [];

  pools.forEach(pool => {
    // High APR alert (>100%)
    if (pool.apr > 100) {
      alerts.push({
        pool: `${pool.token0}/${pool.token1}`,
        reason: 'High APR opportunity',
        value: pool.apr,
      });
    }

    // Low liquidity alert (TVL < $100k)
    if (pool.tvl < 100000) {
      alerts.push({
        pool: `${pool.token0}/${pool.token1}`,
        reason: 'Low liquidity warning',
        value: pool.tvl,
      });
    }
  });

  return alerts;
}

interface TokenMetadata {
  symbol: string;
  name: string;
  decimals: number;
}

const HYPERION_MODULE_ADDRESS = '0x8b4a2c4bb53857c718a04c020b98f8c2e1f99a68b0f57389a8bf5434cd22e05c';

export async function queryPoolFromBlockchain(poolAddress: string): Promise<Record<string, unknown> | null> {
  const aptos = getAptosClient();

  try {
    const resource = await aptos.getAccountResource({
      accountAddress: poolAddress,
      resourceType: `${HYPERION_MODULE_ADDRESS}::pool_v3::LiquidityPoolV3`,
    });

    return resource as Record<string, unknown>;
  } catch (error) {
    console.error(`Error querying pool ${poolAddress} from blockchain:`, error);
    return null;
  }
}

export async function getTokenMetadata(tokenAddress: string): Promise<TokenMetadata | null> {
  const aptos = getAptosClient();

  try {
    const resource = await aptos.getAccountResource({
      accountAddress: tokenAddress,
      resourceType: '0x1::coin::CoinInfo',
    });

    const data = resource.data as Record<string, unknown>;

    return {
      symbol: (data.symbol as string) || 'UNKNOWN',
      name: (data.name as string) || 'Unknown Token',
      decimals: (data.decimals as number) || 8,
    };
  } catch (error) {
    console.error(`Error fetching token metadata for ${tokenAddress}:`, error);
    return null;
  }
}

export async function calculateTVLFromBlockchain(
  poolAddress: string,
  token0Price: number,
  token1Price: number
): Promise<number> {
  const poolData = await queryPoolFromBlockchain(poolAddress);

  if (!poolData) {
    return 0;
  }

  try {
    const data = poolData.data as Record<string, unknown>;
    const reserve0 = BigInt(String(data.reserve0 || '0'));
    const reserve1 = BigInt(String(data.reserve1 || '0'));

    return calculateTVL(reserve0, reserve1, token0Price, token1Price);
  } catch (error) {
    console.error('Error calculating TVL from blockchain:', error);
    return 0;
  }
}

export async function getPoolLiquidity(poolAddress: string): Promise<{ token0: bigint; token1: bigint } | null> {
  const poolData = await queryPoolFromBlockchain(poolAddress);

  if (!poolData) {
    return null;
  }

  try {
    const data = poolData.data as Record<string, unknown>;
    const token0Liquidity = BigInt(String(data.reserve0 || '0'));
    const token1Liquidity = BigInt(String(data.reserve1 || '0'));

    return {
      token0: token0Liquidity,
      token1: token1Liquidity,
    };
  } catch (error) {
    console.error('Error getting pool liquidity:', error);
    return null;
  }
}

export async function getCurrentPrice(poolAddress: string): Promise<number> {
  const liquidity = await getPoolLiquidity(poolAddress);

  if (!liquidity || liquidity.token0 === BigInt(0)) {
    return 0;
  }

  const price = Number(liquidity.token1) / Number(liquidity.token0);
  return price;
}

export async function getPoolTokenAddresses(poolAddress: string): Promise<{ token0: string; token1: string } | null> {
  const poolData = await queryPoolFromBlockchain(poolAddress);

  if (!poolData) {
    return null;
  }

  try {
    const data = poolData.data as Record<string, unknown>;

    return {
      token0: String(data.token0_address || ''),
      token1: String(data.token1_address || ''),
    };
  } catch (error) {
    console.error('Error getting pool token addresses:', error);
    return null;
  }
}

export async function getPoolFee(poolAddress: string): Promise<number> {
  const poolData = await queryPoolFromBlockchain(poolAddress);

  if (!poolData) {
    return 0.003;
  }

  try {
    const data = poolData.data as Record<string, unknown>;
    const feeTier = Number(data.fee_tier || 3000);

    return feeTier / 1000000;
  } catch (error) {
    console.error('Error getting pool fee:', error);
    return 0.003;
  }
}

export async function getAllPoolAddresses(): Promise<string[]> {
  const aptos = getAptosClient();

  try {
    const result = await aptos.view({
      payload: {
        function: `${HYPERION_MODULE_ADDRESS}::factory::get_all_pools`,
        functionArguments: [],
      },
    });

    if (Array.isArray(result) && result.length > 0) {
      return result[0] as string[];
    }

    return Object.values(HYPERION_POOLS);
  } catch (error) {
    console.error('Error fetching all pool addresses:', error);
    return Object.values(HYPERION_POOLS);
  }
}

export async function getPoolCreationTimestamp(poolAddress: string): Promise<number> {
  const aptos = getAptosClient();

  try {
    const resource = await aptos.getAccountResource({
      accountAddress: poolAddress,
      resourceType: `${HYPERION_MODULE_ADDRESS}::pool_v3::LiquidityPoolV3`,
    });

    const data = resource.data as Record<string, unknown>;
    const createdAt = Number(data.created_at || 0);

    return createdAt;
  } catch (error) {
    console.error('Error getting pool creation timestamp:', error);
    return 0;
  }
}

export function calculatePriceImpact(
  reserveIn: bigint,
  reserveOut: bigint,
  amountIn: bigint,
  fee: number
): number {
  if (reserveIn === BigInt(0) || reserveOut === BigInt(0) || amountIn === BigInt(0)) {
    return 0;
  }

  const feeMultiplier = 1 - fee;
  const amountInWithFee = Number(amountIn) * feeMultiplier;
  const numerator = amountInWithFee * Number(reserveOut);
  const denominator = Number(reserveIn) + amountInWithFee;

  const amountOut = numerator / denominator;
  const spotPrice = Number(reserveOut) / Number(reserveIn);
  const executionPrice = amountOut / Number(amountIn);

  const priceImpact = ((spotPrice - executionPrice) / spotPrice) * 100;

  return Math.abs(priceImpact);
}

export async function calculateMarketMetrics(pools: HyperionPool[]): Promise<{
  totalTVL: number;
  total24hVolume: number;
  totalPools: number;
  avgAPR: number;
  topPoolByTVL: HyperionPool | null;
  topPoolByVolume: HyperionPool | null;
}> {
  if (pools.length === 0) {
    return {
      totalTVL: 0,
      total24hVolume: 0,
      totalPools: 0,
      avgAPR: 0,
      topPoolByTVL: null,
      topPoolByVolume: null,
    };
  }

  const totalTVL = pools.reduce((sum, pool) => sum + pool.tvl, 0);
  const total24hVolume = pools.reduce((sum, pool) => sum + pool.volume24h, 0);
  const avgAPR = pools.reduce((sum, pool) => sum + pool.apr, 0) / pools.length;

  const topPoolByTVL = pools.reduce((max, pool) => pool.tvl > max.tvl ? pool : max, pools[0]);
  const topPoolByVolume = pools.reduce((max, pool) => pool.volume24h > max.volume24h ? pool : max, pools[0]);

  return {
    totalTVL,
    total24hVolume,
    totalPools: pools.length,
    avgAPR,
    topPoolByTVL,
    topPoolByVolume,
  };
}

export async function getPoolPerformanceMetrics(poolAddress: string): Promise<{
  currentPrice: number;
  liquidity: { token0: bigint; token1: bigint } | null;
  fee: number;
  estimatedAPR: number;
} | null> {
  try {
    const [currentPrice, liquidity, fee] = await Promise.all([
      getCurrentPrice(poolAddress),
      getPoolLiquidity(poolAddress),
      getPoolFee(poolAddress),
    ]);

    const poolData = await getHyperionPoolData(poolAddress);
    const estimatedAPR = poolData?.apr || 0;

    return {
      currentPrice,
      liquidity,
      fee,
      estimatedAPR,
    };
  } catch (error) {
    console.error('Error calculating pool performance metrics:', error);
    return null;
  }
}

export async function detectVolumeSurges(pools: HyperionPool[], threshold: number = 2.0): Promise<HyperionPool[]> {
  const poolsWithVolume = pools.filter(pool => pool.volume24h > 0);

  if (poolsWithVolume.length === 0) {
    return [];
  }

  const avgVolume = poolsWithVolume.reduce((sum, pool) => sum + pool.volume24h, 0) / poolsWithVolume.length;

  const surges = poolsWithVolume.filter(pool => pool.volume24h > avgVolume * threshold);

  return surges.sort((a, b) => b.volume24h - a.volume24h);
}

export async function getTopPoolsByMetric(
  pools: HyperionPool[],
  metric: 'tvl' | 'volume24h' | 'apr',
  limit: number = 10
): Promise<HyperionPool[]> {
  const sorted = [...pools].sort((a, b) => {
    switch (metric) {
      case 'tvl':
        return b.tvl - a.tvl;
      case 'volume24h':
        return b.volume24h - a.volume24h;
      case 'apr':
        return b.apr - a.apr;
      default:
        return 0;
    }
  });

  return sorted.slice(0, limit);
}

export function calculateVolatility(priceChanges: number[]): number {
  if (priceChanges.length === 0) return 0;

  const mean = priceChanges.reduce((sum, change) => sum + change, 0) / priceChanges.length;
  const variance = priceChanges.reduce((sum, change) => sum + Math.pow(change - mean, 2), 0) / priceChanges.length;

  return Math.sqrt(variance);
}

export async function getPoolHealthScore(pool: HyperionPool): Promise<number> {
  let score = 100;

  if (pool.tvl < 100000) score -= 30;
  else if (pool.tvl < 1000000) score -= 10;

  if (pool.volume24h < 10000) score -= 20;
  else if (pool.volume24h < 100000) score -= 10;

  if (pool.apr > 200) score -= 15;
  else if (pool.apr > 100) score -= 5;

  const priceChange = Math.abs(pool.priceChange24h || 0);
  if (priceChange > 20) score -= 20;
  else if (priceChange > 10) score -= 10;

  if (pool.volume24h > 0 && pool.tvl > 0) {
    const volumeToTVLRatio = pool.volume24h / pool.tvl;
    if (volumeToTVLRatio > 2) score += 10;
  }

  return Math.max(0, Math.min(100, score));
}
