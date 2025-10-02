'use client';

import { useEffect, useState } from 'react';
import { getAllHyperionPools, detectLiquidityAlerts } from '../hyperionUtils';
import { HyperionPool, TokenData, LiquidityAlert } from '../types';

export function useHyperionPools() {
  const [pools, setPools] = useState<HyperionPool[]>([]);
  const [tokenData, setTokenData] = useState<TokenData[]>([]);
  const [alerts, setAlerts] = useState<LiquidityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchHyperionData() {
      try {
        setLoading(true);
        const poolsData = await getAllHyperionPools();

        if (!mounted) return;

        // Convert Hyperion pools to TokenData format
        const formattedData: TokenData[] = poolsData.map(pool => {
          const price = Number(pool.reserve1) / Number(pool.reserve0); // Simplified price calculation
          return {
            symbol: `${pool.token0}/${pool.token1}`,
            price,
            priceChange24h: 0, // Not available from Hyperion
            volume24h: pool.volume24h,
            tvl: pool.tvl,
            apr: pool.apr,
            source: 'hyperion' as const,
          };
        });

        // Detect liquidity alerts
        const detectedAlerts = detectLiquidityAlerts(poolsData).map(alert => ({
          poolAddress: '',
          symbol: alert.pool,
          type: alert.reason.includes('APR') ? 'high_apr' as const : 'low_liquidity' as const,
          message: `${alert.pool}: ${alert.reason} (${alert.value.toFixed(2)})`,
          timestamp: Date.now(),
          value: alert.value,
        }));

        setPools(poolsData);
        setTokenData(formattedData);
        setAlerts(detectedAlerts);
        setError(null);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch Hyperion data');
          console.error('Error in useHyperionPools:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchHyperionData();

    // Poll for updates every 15 seconds (less frequent than Merkle due to RPC limits)
    const interval = setInterval(fetchHyperionData, 15000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return { pools, tokenData, alerts, loading, error };
}
