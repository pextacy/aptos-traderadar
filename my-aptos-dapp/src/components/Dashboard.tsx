'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Target
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getDashboardStatsOnServer } from '@/app/actions';

interface DashboardStats {
  totalTrades: number;
  activeTrades: number;
  totalVolume: number;
  totalTraders: number;
  volumeChange24h: number;
  tradesChange24h: number;
}

export function Dashboard() {
  // Fetch real dashboard stats from database
  const { data: stats, isLoading: loading } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStatsOnServer,
    refetchInterval: 10000, // Refetch every 10 seconds for live updates
  });

  const displayStats = stats || {
    totalTrades: 0,
    activeTrades: 0,
    totalVolume: 0,
    totalTraders: 0,
    volumeChange24h: 0,
    tradesChange24h: 0,
  };

  const StatCard = ({
    title,
    value,
    change,
    icon: Icon,
    format = 'number',
    trend
  }: {
    title: string;
    value: number;
    change?: number;
    icon: React.ElementType;
    format?: 'number' | 'currency';
    trend?: 'up' | 'down';
  }) => {
    const isPositive = change !== undefined ? change > 0 : true;
    const formattedValue = format === 'currency'
      ? `$${(value / 1000).toFixed(1)}K`
      : value.toLocaleString();

    return (
      <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className={`p-2 rounded-lg ${
            trend === 'up' ? 'bg-green-500/10 text-green-500' :
            trend === 'down' ? 'bg-red-500/10 text-red-500' :
            'bg-blue-500/10 text-blue-500'
          }`}>
            <Icon className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-bold tracking-tight">
                {loading ? (
                  <div className="h-9 w-24 bg-muted animate-pulse rounded" />
                ) : (
                  formattedValue
                )}
              </div>
              {change !== undefined && !loading && (
                <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
                  isPositive ? 'text-green-500' : 'text-red-500'
                }`}>
                  {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(change).toFixed(1)}% from yesterday
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Live Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Real-time trading metrics and analytics
          </p>
        </div>
        <Badge variant="outline" className="gap-2 px-3 py-1.5 animate-pulse">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-ping absolute" />
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-xs font-medium">LIVE</span>
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Trades"
          value={displayStats.totalTrades}
          change={displayStats.tradesChange24h}
          icon={Activity}
          trend={displayStats.tradesChange24h > 0 ? 'up' : 'down'}
        />
        <StatCard
          title="Active Trades"
          value={displayStats.activeTrades}
          icon={Zap}
          trend="up"
        />
        <StatCard
          title="Total Volume"
          value={displayStats.totalVolume}
          change={displayStats.volumeChange24h}
          icon={DollarSign}
          format="currency"
          trend={displayStats.volumeChange24h > 0 ? 'up' : 'down'}
        />
        <StatCard
          title="Active Traders"
          value={displayStats.totalTraders}
          icon={Users}
          trend="up"
        />
      </div>

      {/* Activity Indicator */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Trading Activity</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Market is {displayStats.volumeChange24h > 0 ? 'trending up' : 'consolidating'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant={displayStats.volumeChange24h > 0 ? "default" : "secondary"} className="gap-1">
                {displayStats.volumeChange24h > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(displayStats.volumeChange24h).toFixed(1)}%
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Volume Activity</span>
              <span className="font-medium">{displayStats.volumeChange24h > 0 ? 'High' : 'Moderate'}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  displayStats.volumeChange24h > 0 ? 'bg-green-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${Math.min(Math.abs(displayStats.volumeChange24h) * 5, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
