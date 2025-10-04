'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  DollarSign,
  Layers,
  BarChart3,
  Award,
  Activity,
} from 'lucide-react';

interface MarketMetrics {
  totalTVL: number;
  total24hVolume: number;
  totalPools: number;
  avgAPR: number;
  avgHealthScore: number;
  topPoolByTVL: {
    address: string;
    pair: string;
    tvl: number;
  } | null;
  topPoolByVolume: {
    address: string;
    pair: string;
    volume24h: number;
  } | null;
}

interface MarketOverviewProps {
  refreshInterval?: number;
}

export function MarketOverview({ refreshInterval = 30000 }: MarketOverviewProps) {
  const [metrics, setMetrics] = useState<MarketMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setError(null);

        const response = await fetch('/api/hyperion/metrics?metric=overview');

        if (!response.ok) {
          throw new Error('Failed to fetch metrics');
        }

        const data = await response.json();
        setMetrics(data.metrics);
      } catch (err) {
        console.error('Error fetching metrics:', err);
        setError('Failed to load market metrics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    subtitle,
    color = 'blue',
  }: {
    title: string;
    value: string;
    icon: React.ElementType;
    subtitle?: string;
    color?: 'blue' | 'green' | 'purple' | 'orange';
  }) => {
    const colorClasses = {
      blue: 'bg-blue-500/10 text-blue-500',
      green: 'bg-green-500/10 text-green-500',
      purple: 'bg-purple-500/10 text-purple-500',
      orange: 'bg-orange-500/10 text-orange-500',
    };

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold mt-2">{value}</p>
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
            <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 animate-pulse" />
            Market Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Market Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive py-8">
            {error || 'No metrics available'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Market Overview
        </h2>
        <Badge variant="outline" className="gap-2 px-3 py-1.5">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs">Live Data</span>
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Value Locked"
          value={formatCurrency(metrics.totalTVL)}
          icon={DollarSign}
          subtitle="Across all pools"
          color="green"
        />
        <StatCard
          title="24h Volume"
          value={formatCurrency(metrics.total24hVolume)}
          icon={Activity}
          subtitle="Trading volume"
          color="blue"
        />
        <StatCard
          title="Active Pools"
          value={metrics.totalPools.toString()}
          icon={Layers}
          subtitle="Liquidity pools"
          color="purple"
        />
        <StatCard
          title="Average APR"
          value={`${metrics.avgAPR.toFixed(2)}%`}
          icon={TrendingUp}
          subtitle="Across all pools"
          color="orange"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {metrics.topPoolByTVL && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Top Pool by TVL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pair</span>
                  <Badge variant="secondary">{metrics.topPoolByTVL.pair}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">TVL</span>
                  <span className="text-lg font-bold text-green-500">
                    {formatCurrency(metrics.topPoolByTVL.tvl)}
                  </span>
                </div>
                <a
                  href={`https://explorer.aptoslabs.com/account/${metrics.topPoolByTVL.address}?network=mainnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline block"
                >
                  View on Explorer →
                </a>
              </div>
            </CardContent>
          </Card>
        )}

        {metrics.topPoolByVolume && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-500" />
                Top Pool by Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pair</span>
                  <Badge variant="secondary">{metrics.topPoolByVolume.pair}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">24h Volume</span>
                  <span className="text-lg font-bold text-blue-500">
                    {formatCurrency(metrics.topPoolByVolume.volume24h)}
                  </span>
                </div>
                <a
                  href={`https://explorer.aptoslabs.com/account/${metrics.topPoolByVolume.address}?network=mainnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline block"
                >
                  View on Explorer →
                </a>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Market Health Score
              </p>
              <p className="text-3xl font-bold mt-2">
                {metrics.avgHealthScore.toFixed(1)}/100
              </p>
            </div>
            <div className="text-right">
              <Badge
                variant={
                  metrics.avgHealthScore >= 70
                    ? 'default'
                    : metrics.avgHealthScore >= 50
                    ? 'secondary'
                    : 'destructive'
                }
                className="text-lg px-4 py-2"
              >
                {metrics.avgHealthScore >= 70
                  ? 'Healthy'
                  : metrics.avgHealthScore >= 50
                  ? 'Moderate'
                  : 'Warning'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
