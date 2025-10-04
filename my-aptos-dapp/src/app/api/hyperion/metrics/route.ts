import { NextRequest, NextResponse } from 'next/server';
import {
  getAllHyperionPools,
  calculateMarketMetrics,
  getTopPoolsByMetric,
  detectVolumeSurges,
  getPoolHealthScore,
} from '@/lib/traderadar/hyperionUtils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const metric = searchParams.get('metric') || 'overview';
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const pools = await getAllHyperionPools();

    if (pools.length === 0) {
      return NextResponse.json({
        error: 'No pools available',
        metrics: null,
      });
    }

    switch (metric) {
      case 'overview': {
        const marketMetrics = await calculateMarketMetrics(pools);

        const poolsWithHealthScores = await Promise.all(
          pools.map(async (pool) => ({
            ...pool,
            healthScore: await getPoolHealthScore(pool),
          }))
        );

        return NextResponse.json({
          metrics: {
            totalTVL: marketMetrics.totalTVL,
            total24hVolume: marketMetrics.total24hVolume,
            totalPools: marketMetrics.totalPools,
            avgAPR: marketMetrics.avgAPR,
            topPoolByTVL: marketMetrics.topPoolByTVL
              ? {
                  address: marketMetrics.topPoolByTVL.poolAddress,
                  pair: `${marketMetrics.topPoolByTVL.token0}/${marketMetrics.topPoolByTVL.token1}`,
                  tvl: marketMetrics.topPoolByTVL.tvl,
                }
              : null,
            topPoolByVolume: marketMetrics.topPoolByVolume
              ? {
                  address: marketMetrics.topPoolByVolume.poolAddress,
                  pair: `${marketMetrics.topPoolByVolume.token0}/${marketMetrics.topPoolByVolume.token1}`,
                  volume24h: marketMetrics.topPoolByVolume.volume24h,
                }
              : null,
            avgHealthScore:
              poolsWithHealthScores.reduce((sum, pool) => sum + pool.healthScore, 0) /
              poolsWithHealthScores.length,
          },
        });
      }

      case 'top-tvl': {
        const topPools = await getTopPoolsByMetric(pools, 'tvl', limit);

        return NextResponse.json({
          metric: 'top-tvl',
          pools: topPools.map((pool) => ({
            address: pool.poolAddress,
            pair: `${pool.token0}/${pool.token1}`,
            tvl: pool.tvl,
            volume24h: pool.volume24h,
            apr: pool.apr,
            priceChange24h: pool.priceChange24h,
          })),
        });
      }

      case 'top-volume': {
        const topPools = await getTopPoolsByMetric(pools, 'volume24h', limit);

        return NextResponse.json({
          metric: 'top-volume',
          pools: topPools.map((pool) => ({
            address: pool.poolAddress,
            pair: `${pool.token0}/${pool.token1}`,
            volume24h: pool.volume24h,
            tvl: pool.tvl,
            apr: pool.apr,
            priceChange24h: pool.priceChange24h,
          })),
        });
      }

      case 'top-apr': {
        const topPools = await getTopPoolsByMetric(pools, 'apr', limit);

        return NextResponse.json({
          metric: 'top-apr',
          pools: topPools.map((pool) => ({
            address: pool.poolAddress,
            pair: `${pool.token0}/${pool.token1}`,
            apr: pool.apr,
            tvl: pool.tvl,
            volume24h: pool.volume24h,
            priceChange24h: pool.priceChange24h,
          })),
        });
      }

      case 'volume-surges': {
        const threshold = parseFloat(searchParams.get('threshold') || '2.0');
        const surges = await detectVolumeSurges(pools, threshold);

        return NextResponse.json({
          metric: 'volume-surges',
          threshold,
          pools: surges.map((pool) => ({
            address: pool.poolAddress,
            pair: `${pool.token0}/${pool.token1}`,
            volume24h: pool.volume24h,
            tvl: pool.tvl,
            apr: pool.apr,
            priceChange24h: pool.priceChange24h,
          })),
        });
      }

      case 'health-scores': {
        const poolsWithHealthScores = await Promise.all(
          pools.map(async (pool) => ({
            address: pool.poolAddress,
            pair: `${pool.token0}/${pool.token1}`,
            healthScore: await getPoolHealthScore(pool),
            tvl: pool.tvl,
            volume24h: pool.volume24h,
            apr: pool.apr,
            priceChange24h: pool.priceChange24h,
          }))
        );

        const sortedByHealth = poolsWithHealthScores.sort(
          (a, b) => b.healthScore - a.healthScore
        );

        return NextResponse.json({
          metric: 'health-scores',
          pools: sortedByHealth.slice(0, limit),
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid metric type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in metrics API:', error);
    return NextResponse.json(
      {
        error: 'Failed to calculate metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
