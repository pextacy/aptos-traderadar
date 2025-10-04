import { NextRequest, NextResponse } from 'next/server';
import {
  getAllHyperionPools,
  detectLiquidityAlerts,
  detectVolumeSurges,
  getPoolHealthScore,
} from '@/lib/traderadar/hyperionUtils';
import { LiquidityAlert } from '@/lib/traderadar/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const alertType = searchParams.get('type') || 'all';
    const severityFilter = searchParams.get('severity');

    const pools = await getAllHyperionPools();

    if (pools.length === 0) {
      return NextResponse.json({
        alerts: [],
        count: 0,
      });
    }

    const alerts: LiquidityAlert[] = [];
    const timestamp = Date.now();

    if (alertType === 'all' || alertType === 'liquidity') {
      const liquidityAlerts = detectLiquidityAlerts(pools);

      for (const alert of liquidityAlerts) {
        const alertType: 'high_apr' | 'low_liquidity' =
          alert.reason === 'High APR opportunity' ? 'high_apr' : 'low_liquidity';

        const pool = pools.find(
          (p) => `${p.token0}/${p.token1}` === alert.pool
        );

        if (pool) {
          alerts.push({
            poolAddress: pool.poolAddress,
            symbol: alert.pool,
            type: alertType,
            message: alert.reason,
            timestamp,
            value: alert.value,
          });
        }
      }
    }

    if (alertType === 'all' || alertType === 'volume') {
      const volumeSurges = await detectVolumeSurges(pools, 2.0);

      for (const pool of volumeSurges) {
        alerts.push({
          poolAddress: pool.poolAddress,
          symbol: `${pool.token0}/${pool.token1}`,
          type: 'volume_spike',
          message: 'Volume spike detected (>2x average)',
          timestamp,
          value: pool.volume24h,
        });
      }
    }

    if (alertType === 'all' || alertType === 'health') {
      const poolsWithHealthScores = await Promise.all(
        pools.map(async (pool) => ({
          pool,
          healthScore: await getPoolHealthScore(pool),
        }))
      );

      const unhealthyPools = poolsWithHealthScores.filter(
        ({ healthScore }) => healthScore < 50
      );

      for (const { pool } of unhealthyPools) {
        alerts.push({
          poolAddress: pool.poolAddress,
          symbol: `${pool.token0}/${pool.token1}`,
          type: 'low_liquidity',
          message: 'Pool health score below 50',
          timestamp,
          value: pool.tvl,
        });
      }
    }

    if (alertType === 'all' || alertType === 'price') {
      const volatilePools = pools.filter(
        (pool) => Math.abs(pool.priceChange24h || 0) > 10
      );

      for (const pool of volatilePools) {
        alerts.push({
          poolAddress: pool.poolAddress,
          symbol: `${pool.token0}/${pool.token1}`,
          type: 'volume_spike',
          message: `High price volatility: ${pool.priceChange24h?.toFixed(2)}%`,
          timestamp,
          value: Math.abs(pool.priceChange24h || 0),
        });
      }
    }

    let filteredAlerts = alerts;

    if (severityFilter === 'high') {
      filteredAlerts = alerts.filter((alert) => {
        if (alert.type === 'low_liquidity' && alert.value < 50000) return true;
        if (alert.type === 'high_apr' && alert.value > 200) return true;
        if (alert.type === 'volume_spike' && alert.value > 1000000) return true;
        return false;
      });
    } else if (severityFilter === 'medium') {
      filteredAlerts = alerts.filter((alert) => {
        if (
          alert.type === 'low_liquidity' &&
          alert.value >= 50000 &&
          alert.value < 100000
        )
          return true;
        if (alert.type === 'high_apr' && alert.value > 100 && alert.value <= 200)
          return true;
        if (
          alert.type === 'volume_spike' &&
          alert.value > 500000 &&
          alert.value <= 1000000
        )
          return true;
        return false;
      });
    } else if (severityFilter === 'low') {
      filteredAlerts = alerts.filter((alert) => {
        if (alert.type === 'low_liquidity' && alert.value >= 100000) return true;
        if (alert.type === 'high_apr' && alert.value <= 100) return true;
        if (alert.type === 'volume_spike' && alert.value <= 500000) return true;
        return false;
      });
    }

    const sortedAlerts = filteredAlerts.sort((a, b) => {
      if (a.type === 'low_liquidity' && b.type === 'low_liquidity') {
        return a.value - b.value;
      }
      if (a.type === 'high_apr' && b.type === 'high_apr') {
        return b.value - a.value;
      }
      if (a.type === 'volume_spike' && b.type === 'volume_spike') {
        return b.value - a.value;
      }
      return 0;
    });

    return NextResponse.json({
      alerts: sortedAlerts,
      count: sortedAlerts.length,
      timestamp,
      filters: {
        type: alertType,
        severity: severityFilter || 'all',
      },
    });
  } catch (error) {
    console.error('Error in alerts API:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch alerts',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
