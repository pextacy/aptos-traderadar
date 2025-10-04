'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, ArrowRight, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Swap {
  transaction_hash: string;
  sender: string;
  pool_address: string;
  amount_in: string;
  amount_out: string;
  token_in: string;
  token_out: string;
  timestamp: number;
  block_height: number;
}

interface LiveSwapFeedProps {
  poolAddress?: string;
  limit?: number;
  refreshInterval?: number;
}

export function LiveSwapFeed({
  poolAddress,
  limit = 20,
  refreshInterval = 10000
}: LiveSwapFeedProps) {
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSwaps = async () => {
      try {
        setError(null);

        const params = new URLSearchParams({
          limit: limit.toString(),
        });

        if (poolAddress) {
          params.append('pool', poolAddress);
        }

        const response = await fetch(`/api/hyperion/swaps?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch swaps');
        }

        const data = await response.json();
        setSwaps(data.swaps || []);
      } catch (err) {
        console.error('Error fetching swaps:', err);
        setError('Failed to load swap data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSwaps();
    const interval = setInterval(fetchSwaps, refreshInterval);

    return () => clearInterval(interval);
  }, [poolAddress, limit, refreshInterval]);

  const formatAddress = (address: string) => {
    if (!address) return 'Unknown';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatAmount = (amount: string, decimals = 8) => {
    const num = parseFloat(amount) / Math.pow(10, decimals);
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toFixed(2);
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 animate-pulse" />
            Live Swap Feed
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

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Live Swap Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive py-8">
            {error}
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
            <Activity className="h-5 w-5" />
            Live Swap Feed
          </CardTitle>
          <Badge variant="outline" className="gap-2 px-3 py-1">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            {swaps.length} swaps
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {swaps.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No swaps found
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {swaps.map((swap, index) => (
                <div
                  key={`${swap.transaction_hash}-${index}`}
                  className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {formatAddress(swap.sender)}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(swap.timestamp)}
                      </span>
                    </div>
                    <a
                      href={`https://explorer.aptoslabs.com/txn/${swap.transaction_hash}?network=mainnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      View Txn
                    </a>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{formatAmount(swap.amount_in)}</span>
                      <Badge variant="outline" className="text-xs">
                        {swap.token_in || 'Token'}
                      </Badge>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{formatAmount(swap.amount_out)}</span>
                      <Badge variant="outline" className="text-xs">
                        {swap.token_out || 'Token'}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground mt-2">
                    Block: {swap.block_height?.toLocaleString() || 'Unknown'}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
