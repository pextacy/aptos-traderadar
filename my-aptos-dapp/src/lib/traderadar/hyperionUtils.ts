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
