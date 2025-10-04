import { NextRequest, NextResponse } from 'next/server';
import {
  getPoolSwapHistory,
  getPoolVolumeTimeSeries,
  getPoolLiquidityChanges,
  getMostActivePoolsByVolume,
} from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || 'swaps';
    const poolAddress = searchParams.get('pool');

    switch (action) {
      case 'swaps': {
        if (!poolAddress) {
          return NextResponse.json(
            { error: 'Pool address is required for swap history' },
            { status: 400 }
          );
        }

        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const offset = parseInt(searchParams.get('offset') || '0', 10);

        const swaps = await getPoolSwapHistory(poolAddress, limit, offset);

        const swapsWithMetrics = swaps.map((swap) => ({
          transactionHash: swap.transaction_hash,
          sender: swap.sender,
          poolAddress: swap.pool_address,
          amountIn: parseFloat(String(swap.amount_in)),
          amountOut: parseFloat(String(swap.amount_out)),
          tokenIn: swap.token_in,
          tokenOut: swap.token_out,
          timestamp: parseInt(String(swap.timestamp)),
          blockHeight: parseInt(String(swap.block_height)),
          date: new Date(parseInt(String(swap.timestamp)) * 1000).toISOString(),
        }));

        const totalVolumeIn = swapsWithMetrics.reduce(
          (sum, swap) => sum + swap.amountIn,
          0
        );

        const totalVolumeOut = swapsWithMetrics.reduce(
          (sum, swap) => sum + swap.amountOut,
          0
        );

        const uniqueTraders = new Set(swapsWithMetrics.map((s) => s.sender))
          .size;

        return NextResponse.json({
          swaps: swapsWithMetrics,
          count: swapsWithMetrics.length,
          poolAddress,
          pagination: {
            limit,
            offset,
            hasMore: swapsWithMetrics.length === limit,
          },
          metrics: {
            totalVolumeIn,
            totalVolumeOut,
            uniqueTraders,
            avgSwapSize:
              swapsWithMetrics.length > 0
                ? totalVolumeIn / swapsWithMetrics.length
                : 0,
          },
        });
      }

      case 'volume-timeseries': {
        if (!poolAddress) {
          return NextResponse.json(
            { error: 'Pool address is required for volume timeseries' },
            { status: 400 }
          );
        }

        const intervalMinutes = parseInt(
          searchParams.get('interval') || '60',
          10
        );
        const hours = parseInt(searchParams.get('hours') || '24', 10);

        const timeSeries = await getPoolVolumeTimeSeries(
          poolAddress,
          intervalMinutes,
          hours
        );

        const timeSeriesData = timeSeries.map((bucket) => ({
          timestamp: parseInt(String(bucket.time_bucket)),
          date: new Date(
            parseInt(String(bucket.time_bucket)) * 1000
          ).toISOString(),
          swapCount: parseInt(String(bucket.swap_count)),
          volumeIn: parseFloat(String(bucket.volume_in)),
          volumeOut: parseFloat(String(bucket.volume_out)),
          totalVolume:
            parseFloat(String(bucket.volume_in)) +
            parseFloat(String(bucket.volume_out)),
        }));

        const totalVolume = timeSeriesData.reduce(
          (sum, bucket) => sum + bucket.totalVolume,
          0
        );

        const totalSwaps = timeSeriesData.reduce(
          (sum, bucket) => sum + bucket.swapCount,
          0
        );

        const peakVolumeBucket = timeSeriesData.reduce(
          (max, bucket) =>
            bucket.totalVolume > max.totalVolume ? bucket : max,
          timeSeriesData[0] || { totalVolume: 0, timestamp: 0 }
        );

        return NextResponse.json({
          timeSeries: timeSeriesData,
          count: timeSeriesData.length,
          poolAddress,
          interval: `${intervalMinutes}m`,
          timeframe: `${hours}h`,
          metrics: {
            totalVolume,
            totalSwaps,
            avgVolumePerBucket:
              timeSeriesData.length > 0
                ? totalVolume / timeSeriesData.length
                : 0,
            peakVolume: peakVolumeBucket.totalVolume,
            peakVolumeTime: peakVolumeBucket.timestamp,
          },
        });
      }

      case 'liquidity-changes': {
        if (!poolAddress) {
          return NextResponse.json(
            { error: 'Pool address is required for liquidity changes' },
            { status: 400 }
          );
        }

        const hours = parseInt(searchParams.get('hours') || '24', 10);

        const liquidityChanges = await getPoolLiquidityChanges(
          poolAddress,
          hours
        );

        const liquidityData = liquidityChanges.map((change) => ({
          timestamp: parseInt(String(change.timestamp)),
          date: new Date(
            parseInt(String(change.timestamp)) * 1000
          ).toISOString(),
          liquidity: parseFloat(String(change.liquidity)),
          tvlUsd: parseFloat(String(change.tvl_usd)),
        }));

        const currentLiquidity =
          liquidityData.length > 0
            ? liquidityData[liquidityData.length - 1].liquidity
            : 0;

        const initialLiquidity =
          liquidityData.length > 0 ? liquidityData[0].liquidity : 0;

        const liquidityChange =
          initialLiquidity > 0
            ? ((currentLiquidity - initialLiquidity) / initialLiquidity) * 100
            : 0;

        const currentTVL =
          liquidityData.length > 0
            ? liquidityData[liquidityData.length - 1].tvlUsd
            : 0;

        const initialTVL =
          liquidityData.length > 0 ? liquidityData[0].tvlUsd : 0;

        const tvlChange =
          initialTVL > 0 ? ((currentTVL - initialTVL) / initialTVL) * 100 : 0;

        return NextResponse.json({
          liquidityChanges: liquidityData,
          count: liquidityData.length,
          poolAddress,
          timeframe: `${hours}h`,
          metrics: {
            currentLiquidity,
            initialLiquidity,
            liquidityChange,
            currentTVL,
            initialTVL,
            tvlChange,
          },
        });
      }

      case 'most-active': {
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        const hours = parseInt(searchParams.get('hours') || '24', 10);

        const activePools = await getMostActivePoolsByVolume(limit, hours);

        const poolsData = activePools.map((pool) => ({
          poolAddress: pool.pool_address,
          token0: pool.token0_symbol,
          token1: pool.token1_symbol,
          pair: `${pool.token0_symbol}/${pool.token1_symbol}`,
          swapCount: parseInt(String(pool.swap_count)),
          uniqueTraders: parseInt(String(pool.unique_traders)),
          totalVolume: parseFloat(String(pool.total_volume)),
          avgVolumePerSwap:
            parseInt(String(pool.swap_count)) > 0
              ? parseFloat(String(pool.total_volume)) /
                parseInt(String(pool.swap_count))
              : 0,
        }));

        const totalVolume = poolsData.reduce(
          (sum, pool) => sum + pool.totalVolume,
          0
        );

        const totalSwaps = poolsData.reduce(
          (sum, pool) => sum + pool.swapCount,
          0
        );

        const totalUniqueTraders = poolsData.reduce(
          (sum, pool) => sum + pool.uniqueTraders,
          0
        );

        return NextResponse.json({
          pools: poolsData,
          count: poolsData.length,
          timeframe: `${hours}h`,
          metrics: {
            totalVolume,
            totalSwaps,
            totalUniqueTraders,
            avgVolumePerPool:
              poolsData.length > 0 ? totalVolume / poolsData.length : 0,
          },
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in pool history API:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch pool history',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
