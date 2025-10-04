import { NextRequest, NextResponse } from 'next/server';
import { getPoolVolumeTimeSeries, getMostActivePoolsByVolume } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const poolAddress = searchParams.get('pool');
    const view = searchParams.get('view') || 'timeseries';
    const hours = parseInt(searchParams.get('hours') || '24', 10);
    const intervalMinutes = parseInt(searchParams.get('interval') || '60', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (view === 'top-pools') {
      const activePools = await getMostActivePoolsByVolume(limit, hours);

      return NextResponse.json({
        view: 'top-pools',
        pools: activePools.map((pool: Record<string, unknown>) => ({
          poolAddress: pool.pool_address,
          token0: pool.token0_symbol,
          token1: pool.token1_symbol,
          swapCount: Number(pool.swap_count || 0),
          uniqueTraders: Number(pool.unique_traders || 0),
          totalVolume: parseFloat(String(pool.total_volume || '0')),
        })),
        count: activePools.length,
      });
    }

    if (poolAddress) {
      const timeSeries = await getPoolVolumeTimeSeries(poolAddress, intervalMinutes, hours);

      return NextResponse.json({
        poolAddress,
        view: 'timeseries',
        intervalMinutes,
        hours,
        data: timeSeries.map((entry: Record<string, unknown>) => ({
          timestamp: Number(entry.time_bucket || 0),
          swapCount: Number(entry.swap_count || 0),
          volumeIn: parseFloat(String(entry.volume_in || '0')),
          volumeOut: parseFloat(String(entry.volume_out || '0')),
          totalVolume: parseFloat(String(entry.volume_in || '0')) + parseFloat(String(entry.volume_out || '0')),
        })),
        count: timeSeries.length,
      });
    }

    const activePools = await getMostActivePoolsByVolume(limit, hours);

    return NextResponse.json({
      view: 'top-pools',
      pools: activePools.map((pool: Record<string, unknown>) => ({
        poolAddress: pool.pool_address,
        token0: pool.token0_symbol,
        token1: pool.token1_symbol,
        swapCount: Number(pool.swap_count || 0),
        uniqueTraders: Number(pool.unique_traders || 0),
        totalVolume: parseFloat(String(pool.total_volume || '0')),
      })),
      count: activePools.length,
    });
  } catch (error) {
    console.error('Error in volume API:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch volume data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
