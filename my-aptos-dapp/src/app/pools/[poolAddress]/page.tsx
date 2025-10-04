'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Activity,
  Users,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { LiveSwapFeed } from '@/components/traderadar/LiveSwapFeed';
import { VolumeChart } from '@/components/traderadar/VolumeChart';
import { PriceChart } from '@/components/traderadar/PriceChart';

interface PoolData {
  poolAddress: string;
  token0Symbol: string;
  token1Symbol: string;
  tvlUsd: number;
  volume24h: number;
  apr: number;
  priceChange24h: number;
  liquidity: string;
  feeTier: number;
}

export default function PoolDetailsPage() {
  const params = useParams();
  const poolAddress = params?.poolAddress as string;
  const [poolData, setPoolData] = useState<PoolData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priceHistory, setPriceHistory] = useState<Array<{ timestamp: number; price: number; volume: number }>>([]);

  useEffect(() => {
    if (!poolAddress) return;

    const fetchPoolData = async () => {
      try {
        setError(null);

        const response = await fetch(`/api/hyperion/pools?address=${poolAddress}`);

        if (!response.ok) {
          throw new Error('Failed to fetch pool data');
        }

        const data = await response.json();

        if (!data.pool) {
          throw new Error('Pool not found');
        }

        const pool = data.pool;
        setPoolData({
          poolAddress: pool.pool_address,
          token0Symbol: pool.token0_symbol || 'Token0',
          token1Symbol: pool.token1_symbol || 'Token1',
          tvlUsd: parseFloat(String(pool.tvl_usd || 0)),
          volume24h: parseFloat(String(pool.volume_24h || 0)),
          apr: parseFloat(String(pool.apr || 0)),
          priceChange24h: parseFloat(String(pool.price_change_24h || 0)),
          liquidity: String(pool.liquidity || '0'),
          feeTier: parseInt(String(pool.fee_tier || 3000)),
        });
      } catch (err) {
        console.error('Error fetching pool data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load pool data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPoolData();
    const interval = setInterval(fetchPoolData, 30000);

    return () => clearInterval(interval);
  }, [poolAddress]);

  useEffect(() => {
    if (!poolData) return;

    const updatePriceHistory = () => {
      const newPoint = {
        timestamp: Date.now(),
        price: 0,
        volume: poolData.volume24h,
      };

      setPriceHistory((prev) => {
        const updated = [...prev, newPoint];
        return updated.slice(-50);
      });
    };

    updatePriceHistory();
    const interval = setInterval(updatePriceHistory, 10000);

    return () => clearInterval(interval);
  }, [poolData]);

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading pool data...</p>
        </div>
      </div>
    );
  }

  if (error || !poolData) {
    return (
      <div className="space-y-4">
        <Link href="/traderadar">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to TradeRadar
          </Button>
        </Link>
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-destructive">
              {error || 'Pool not found'}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/traderadar">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              {poolData.token0Symbol}/{poolData.token1Symbol} Pool
            </h1>
            <p className="text-muted-foreground mt-1">
              {formatAddress(poolData.poolAddress)}
            </p>
          </div>
        </div>
        <a
          href={`https://explorer.aptoslabs.com/account/${poolData.poolAddress}?network=mainnet`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            View on Explorer
          </Button>
        </a>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value Locked</p>
                <p className="text-2xl font-bold mt-2">{formatCurrency(poolData.tvlUsd)}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10 text-green-500">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">24h Volume</p>
                <p className="text-2xl font-bold mt-2">{formatCurrency(poolData.volume24h)}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500">
                <Activity className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">APR</p>
                <p className="text-2xl font-bold mt-2 text-green-500">{poolData.apr.toFixed(2)}%</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-500/10 text-orange-500">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">24h Change</p>
                <p
                  className={`text-2xl font-bold mt-2 ${
                    poolData.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {poolData.priceChange24h >= 0 ? '+' : ''}
                  {poolData.priceChange24h.toFixed(2)}%
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/10 text-purple-500">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pool Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Liquidity</p>
              <p className="text-lg font-semibold">{formatCurrency(parseFloat(poolData.liquidity) / 1e8)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fee Tier</p>
              <Badge variant="secondary">{(poolData.feeTier / 10000).toFixed(2)}%</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pool Address</p>
              <code className="text-xs bg-muted px-2 py-1 rounded">{formatAddress(poolData.poolAddress)}</code>
            </div>
          </div>
        </CardContent>
      </Card>

      {priceHistory.length > 0 && (
        <PriceChart
          symbol={`${poolData.token0Symbol}/${poolData.token1Symbol}`}
          prices={priceHistory}
          currentPrice={0}
        />
      )}

      <VolumeChart poolAddress={poolData.poolAddress} />

      <div className="grid gap-6 lg:grid-cols-2">
        <LiveSwapFeed poolAddress={poolData.poolAddress} limit={15} />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Pool Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm text-muted-foreground">Swap Fee</span>
                <Badge>{(poolData.feeTier / 10000).toFixed(2)}%</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm text-muted-foreground">Token Pair</span>
                <Badge variant="secondary">
                  {poolData.token0Symbol}/{poolData.token1Symbol}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm text-muted-foreground">Protocol</span>
                <Badge variant="outline">Hyperion CLMM</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
