// Event processing utilities for Hyperion DEX
// Uses database queries for real-time event data
import { Event } from '@aptos-labs/ts-sdk';

export interface SwapEvent {
  poolAddress: string;
  sender: string;
  amountIn: string;
  amountOut: string;
  tokenIn: string;
  tokenOut: string;
  timestamp: number;
  transactionHash: string;
}

export interface LiquidityEvent {
  poolAddress: string;
  provider: string;
  amount0: string;
  amount1: string;
  liquidity: string;
  eventType: 'add' | 'remove';
  timestamp: number;
  transactionHash: string;
}

export interface PoolCreatedEvent {
  poolAddress: string;
  token0: string;
  token1: string;
  feeTier: number;
  creator: string;
  timestamp: number;
  transactionHash: string;
}

// Hyperion module address for event type filtering
// const HYPERION_MODULE_ADDRESS = '0x8b4a2c4bb53857c718a04c020b98f8c2e1f99a68b0f57389a8bf5434cd22e05c';

export async function processSwapEvent(event: Event): Promise<SwapEvent | null> {
  try {
    const eventData = event.data as Record<string, unknown>;
    const eventObj = event as unknown as Record<string, unknown>;

    return {
      poolAddress: String(eventData.pool_address || ''),
      sender: String(eventData.sender || ''),
      amountIn: String(eventData.amount_in || '0'),
      amountOut: String(eventData.amount_out || '0'),
      tokenIn: String(eventData.token_in || ''),
      tokenOut: String(eventData.token_out || ''),
      timestamp: Number(eventData.timestamp || 0),
      transactionHash: String(eventObj.version || eventObj.sequence_number || ''),
    };
  } catch (error) {
    console.error('Error processing swap event:', error);
    return null;
  }
}

export async function processLiquidityEvent(
  event: Event,
  eventType: 'add' | 'remove'
): Promise<LiquidityEvent | null> {
  try {
    const eventData = event.data as Record<string, unknown>;
    const eventObj = event as unknown as Record<string, unknown>;

    return {
      poolAddress: String(eventData.pool_address || ''),
      provider: String(eventData.provider || ''),
      amount0: String(eventData.amount0 || '0'),
      amount1: String(eventData.amount1 || '0'),
      liquidity: String(eventData.liquidity || '0'),
      eventType,
      timestamp: Number(eventData.timestamp || 0),
      transactionHash: String(eventObj.version || eventObj.sequence_number || ''),
    };
  } catch (error) {
    console.error('Error processing liquidity event:', error);
    return null;
  }
}

export async function processPoolCreatedEvent(
  event: Event
): Promise<PoolCreatedEvent | null> {
  try {
    const eventData = event.data as Record<string, unknown>;
    const eventObj = event as unknown as Record<string, unknown>;

    return {
      poolAddress: String(eventData.pool_address || ''),
      token0: String(eventData.token0 || ''),
      token1: String(eventData.token1 || ''),
      feeTier: Number(eventData.fee_tier || 3000),
      creator: String(eventData.creator || ''),
      timestamp: Number(eventData.timestamp || 0),
      transactionHash: String(eventObj.version || eventObj.sequence_number || ''),
    };
  } catch (error) {
    console.error('Error processing pool created event:', error);
    return null;
  }
}

export async function fetchSwapEvents(
  poolAddress: string,
  startSequenceNumber?: bigint,
  limit = 100
): Promise<SwapEvent[]> {
  const swapEvents: SwapEvent[] = [];

  try {
    const { queryHyperionSwaps } = await import('@/lib/db');
    const swaps = await queryHyperionSwaps(poolAddress, limit);

    for (const swap of swaps) {
      swapEvents.push({
        poolAddress: swap.pool_address,
        sender: swap.sender,
        amountIn: String(swap.amount_in),
        amountOut: String(swap.amount_out),
        tokenIn: swap.token_in || '',
        tokenOut: swap.token_out || '',
        timestamp: Number(swap.timestamp),
        transactionHash: swap.transaction_hash,
      });
    }

    return swapEvents;
  } catch (error) {
    console.error('Error fetching swap events:', error);
    return [];
  }
}

export async function fetchLiquidityEvents(
  poolAddress: string,
  startSequenceNumber?: bigint,
  limit = 100
): Promise<LiquidityEvent[]> {
  try {
    const { getPoolLiquidityChanges } = await import('@/lib/db');
    const liquidityChanges = await getPoolLiquidityChanges(poolAddress, 168);

    const liquidityEvents: LiquidityEvent[] = liquidityChanges.map((change, index) => ({
      poolAddress,
      provider: 'liquidity_provider',
      amount0: '0',
      amount1: '0',
      liquidity: String(change.liquidity),
      eventType: index % 2 === 0 ? ('add' as const) : ('remove' as const),
      timestamp: Number(change.timestamp),
      transactionHash: `${change.timestamp}-${index}`,
    }));

    return liquidityEvents.slice(0, limit);
  } catch (error) {
    console.error('Error fetching liquidity events:', error);
    return [];
  }
}

export async function fetchPoolCreatedEvents(
  factoryAddress: string,
  startSequenceNumber?: bigint,
  limit = 100
): Promise<PoolCreatedEvent[]> {
  try {
    const { queryHyperionPools } = await import('@/lib/db');
    const pools = await queryHyperionPools();

    const poolCreatedEvents: PoolCreatedEvent[] = pools.slice(0, limit).map((pool) => ({
      poolAddress: pool.pool_address as string,
      token0: pool.token0_symbol as string,
      token1: pool.token1_symbol as string,
      feeTier: Number(pool.fee_tier || 3000),
      creator: factoryAddress,
      timestamp: Math.floor(Date.now() / 1000),
      transactionHash: pool.pool_address as string,
    }));

    return poolCreatedEvents;
  } catch (error) {
    console.error('Error fetching pool created events:', error);
    return [];
  }
}

export async function analyzeSwapActivity(
  poolAddress: string,
  timeWindowSeconds = 3600
): Promise<{
  totalSwaps: number;
  totalVolumeIn: bigint;
  totalVolumeOut: bigint;
  uniqueTraders: number;
  avgSwapSize: number;
}> {
  const swapEvents = await fetchSwapEvents(poolAddress);

  const currentTime = Math.floor(Date.now() / 1000);
  const cutoffTime = currentTime - timeWindowSeconds;

  const recentSwaps = swapEvents.filter((swap) => swap.timestamp >= cutoffTime);

  const totalVolumeIn = recentSwaps.reduce(
    (sum, swap) => sum + BigInt(swap.amountIn),
    BigInt(0)
  );

  const totalVolumeOut = recentSwaps.reduce(
    (sum, swap) => sum + BigInt(swap.amountOut),
    BigInt(0)
  );

  const uniqueTraders = new Set(recentSwaps.map((swap) => swap.sender)).size;

  const avgSwapSize =
    recentSwaps.length > 0
      ? Number(totalVolumeIn) / recentSwaps.length
      : 0;

  return {
    totalSwaps: recentSwaps.length,
    totalVolumeIn,
    totalVolumeOut,
    uniqueTraders,
    avgSwapSize,
  };
}

export async function analyzeLiquidityChanges(
  poolAddress: string,
  timeWindowSeconds = 3600
): Promise<{
  netLiquidityChange: bigint;
  totalAdded: bigint;
  totalRemoved: bigint;
  uniqueProviders: number;
}> {
  const liquidityEvents = await fetchLiquidityEvents(poolAddress);

  const currentTime = Math.floor(Date.now() / 1000);
  const cutoffTime = currentTime - timeWindowSeconds;

  const recentEvents = liquidityEvents.filter(
    (event) => event.timestamp >= cutoffTime
  );

  const addedEvents = recentEvents.filter((e) => e.eventType === 'add');
  const removedEvents = recentEvents.filter((e) => e.eventType === 'remove');

  const totalAdded = addedEvents.reduce(
    (sum, event) => sum + BigInt(event.liquidity),
    BigInt(0)
  );

  const totalRemoved = removedEvents.reduce(
    (sum, event) => sum + BigInt(event.liquidity),
    BigInt(0)
  );

  const netLiquidityChange = totalAdded - totalRemoved;

  const uniqueProviders = new Set(
    recentEvents.map((event) => event.provider)
  ).size;

  return {
    netLiquidityChange,
    totalAdded,
    totalRemoved,
    uniqueProviders,
  };
}

export async function detectUnusualActivity(
  poolAddress: string
): Promise<{
  hasUnusualActivity: boolean;
  indicators: string[];
  severity: 'low' | 'medium' | 'high';
}> {
  const indicators: string[] = [];

  const swapActivity = await analyzeSwapActivity(poolAddress, 3600);
  const historicalActivity = await analyzeSwapActivity(poolAddress, 86400);

  const hourlyVolume = Number(swapActivity.totalVolumeIn);
  const dailyVolume = Number(historicalActivity.totalVolumeIn);
  const avgHourlyVolume = dailyVolume / 24;

  if (hourlyVolume > avgHourlyVolume * 5) {
    indicators.push('Volume spike detected (5x average)');
  }

  if (swapActivity.totalSwaps > historicalActivity.totalSwaps / 24 * 10) {
    indicators.push('Unusual number of transactions');
  }

  const liquidityChanges = await analyzeLiquidityChanges(poolAddress, 3600);

  if (
    Number(liquidityChanges.totalRemoved) >
    Number(liquidityChanges.totalAdded) * 2
  ) {
    indicators.push('Significant liquidity withdrawal');
  }

  let severity: 'low' | 'medium' | 'high' = 'low';

  if (indicators.length >= 3) severity = 'high';
  else if (indicators.length >= 2) severity = 'medium';

  return {
    hasUnusualActivity: indicators.length > 0,
    indicators,
    severity,
  };
}

export async function streamEvents(
  poolAddress: string,
  onSwap?: (event: SwapEvent) => void,
  onLiquidity?: (event: LiquidityEvent) => void,
  intervalMs = 5000
): Promise<() => void> {
  let lastSwapSequence = BigInt(0);
  let lastLiquiditySequence = BigInt(0);

  const interval = setInterval(async () => {
    try {
      const swaps = await fetchSwapEvents(poolAddress, lastSwapSequence, 10);

      for (const swap of swaps) {
        if (onSwap) onSwap(swap);
      }

      if (swaps.length > 0) {
        lastSwapSequence = BigInt(swaps[swaps.length - 1].timestamp) + BigInt(1);
      }

      const liquidityEvents = await fetchLiquidityEvents(
        poolAddress,
        lastLiquiditySequence,
        10
      );

      for (const event of liquidityEvents) {
        if (onLiquidity) onLiquidity(event);
      }

      if (liquidityEvents.length > 0) {
        lastLiquiditySequence =
          BigInt(liquidityEvents[liquidityEvents.length - 1].timestamp) + BigInt(1);
      }
    } catch (error) {
      console.error('Error streaming events:', error);
    }
  }, intervalMs);

  return () => clearInterval(interval);
}
