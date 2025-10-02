// Hyperion CLMM Liquidity Pool Analytics

import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import { HyperionPool } from './types';

// Hyperion pool addresses on Aptos testnet
const HYPERION_POOLS = {
  'APT/USDC': '0x5c4ada4b7d57ba1deb6c6e5bb4bc7f0fb5e3e8cf4dd5a1e8f8f1dc6e8a9d1c5f',
  'BTC/USD': '0x7d3c8a5f9e6b2c4a8f1d9e5c7a3b6f8e2d4c9a1f5e7b3d6a8c2e4f9a1c5b7d3',
  'ETH/USD': '0x9a2f1e5d8c4b7a6f3e1d9c5a7b2f4e8c6d1a9f5e3b7c2a6d8f4e1c9a5b3d7f',
};

let aptosClient: Aptos | null = null;

export function getAptosClient(): Aptos {
  if (!aptosClient) {
    const config = new AptosConfig({ network: Network.TESTNET });
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

export async function getHyperionPoolData(symbol: string): Promise<HyperionPool | null> {
  const poolAddress = HYPERION_POOLS[symbol as keyof typeof HYPERION_POOLS];

  if (!poolAddress) {
    console.warn(`No Hyperion pool found for symbol: ${symbol}`);
    return null;
  }

  const reserves = await getPoolReserves(poolAddress);
  if (!reserves) return null;

  // Mock price data - in production, fetch from oracle or API
  const mockPrices = {
    'APT/USDC': [8.5, 1.0],
    'BTC/USD': [65000, 1.0],
    'ETH/USD': [3200, 1.0],
  };

  const [price0, price1] = mockPrices[symbol as keyof typeof mockPrices] || [1, 1];
  const tvl = calculateTVL(reserves.reserve0, reserves.reserve1, price0, price1);

  // Mock volume - in production, fetch from indexer
  const volume24h = tvl * 0.15; // Assume 15% daily volume/TVL ratio
  const fee = 0.003; // 0.3% swap fee
  const apr = calculateAPR(volume24h, tvl, fee);

  return {
    poolAddress,
    token0: symbol.split('/')[0],
    token1: symbol.split('/')[1],
    reserve0: reserves.reserve0,
    reserve1: reserves.reserve1,
    tvl,
    volume24h,
    apr,
    fee,
  };
}

export async function getAllHyperionPools(): Promise<HyperionPool[]> {
  const poolPromises = Object.keys(HYPERION_POOLS).map(symbol => getHyperionPoolData(symbol));
  const pools = await Promise.all(poolPromises);
  return pools.filter((pool): pool is HyperionPool => pool !== null);
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
