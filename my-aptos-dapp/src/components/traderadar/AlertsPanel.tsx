'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, Droplet, Activity } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Alert {
  poolAddress: string;
  symbol: string;
  type: 'high_apr' | 'low_liquidity' | 'volume_spike';
  message: string;
  timestamp: number;
  value: number;
}

interface AlertsPanelProps {
  refreshInterval?: number;
}

export function AlertsPanel({ refreshInterval = 30000 }: AlertsPanelProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<string>('all');
  const [severity, setSeverity] = useState<string>('all');

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setError(null);

        const params = new URLSearchParams({
          type: alertType,
          ...(severity !== 'all' && { severity }),
        });

        const response = await fetch(`/api/hyperion/alerts?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch alerts');
        }

        const data = await response.json();
        setAlerts(data.alerts || []);
      } catch (err) {
        console.error('Error fetching alerts:', err);
        setError('Failed to load alerts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, refreshInterval);

    return () => clearInterval(interval);
  }, [alertType, severity, refreshInterval]);

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'high_apr':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'low_liquidity':
        return <Droplet className="h-4 w-4 text-yellow-500" />;
      case 'volume_spike':
        return <Activity className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getAlertBadgeVariant = (type: Alert['type']) => {
    switch (type) {
      case 'high_apr':
        return 'default';
      case 'low_liquidity':
        return 'destructive';
      case 'volume_spike':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getSeverityFromValue = (alert: Alert): 'high' | 'medium' | 'low' => {
    if (alert.type === 'low_liquidity') {
      if (alert.value < 50000) return 'high';
      if (alert.value < 100000) return 'medium';
      return 'low';
    }
    if (alert.type === 'high_apr') {
      if (alert.value > 200) return 'high';
      if (alert.value > 100) return 'medium';
      return 'low';
    }
    if (alert.type === 'volume_spike') {
      if (alert.value > 1000000) return 'high';
      if (alert.value > 500000) return 'medium';
      return 'low';
    }
    return 'low';
  };

  const formatValue = (alert: Alert) => {
    if (alert.type === 'high_apr') {
      return `${alert.value.toFixed(2)}% APR`;
    }
    if (alert.type === 'low_liquidity') {
      return `$${(alert.value / 1000).toFixed(1)}K TVL`;
    }
    if (alert.type === 'volume_spike') {
      return `$${(alert.value / 1000).toFixed(1)}K Volume`;
    }
    return alert.value.toFixed(2);
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = Math.floor((now - timestamp) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 animate-pulse" />
            Market Alerts
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Market Alerts
          </CardTitle>
          <Badge variant="outline" className="gap-2">
            {alerts.length} active
          </Badge>
        </div>
        <div className="flex gap-2 mt-4">
          <Select value={alertType} onValueChange={setAlertType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Alert Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="liquidity">Liquidity</SelectItem>
              <SelectItem value="volume">Volume</SelectItem>
              <SelectItem value="health">Health</SelectItem>
              <SelectItem value="price">Price</SelectItem>
            </SelectContent>
          </Select>
          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-center text-destructive py-8">{error}</div>
        ) : alerts.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No alerts matching your filters
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {alerts.map((alert, index) => {
                const alertSeverity = getSeverityFromValue(alert);
                return (
                  <div
                    key={`${alert.poolAddress}-${index}`}
                    className={`border rounded-lg p-3 hover:bg-muted/50 transition-colors ${
                      alertSeverity === 'high' ? 'border-red-500/50 bg-red-500/5' :
                      alertSeverity === 'medium' ? 'border-yellow-500/50 bg-yellow-500/5' :
                      'border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getAlertIcon(alert.type)}
                        <div>
                          <div className="font-medium text-sm">{alert.symbol}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatTimestamp(alert.timestamp)}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={getAlertBadgeVariant(alert.type)} className="text-xs">
                          {alert.type.replace('_', ' ')}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            alertSeverity === 'high' ? 'border-red-500 text-red-500' :
                            alertSeverity === 'medium' ? 'border-yellow-500 text-yellow-500' :
                            'border-green-500 text-green-500'
                          }`}
                        >
                          {alertSeverity}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-sm mb-2">{alert.message}</div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {formatValue(alert)}
                      </span>
                      <a
                        href={`https://explorer.aptoslabs.com/account/${alert.poolAddress}?network=mainnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        View Pool
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
