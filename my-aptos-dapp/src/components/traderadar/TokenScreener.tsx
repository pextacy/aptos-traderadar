'use client';

import React, { useMemo, useState } from 'react';
import { TokenData } from '@/lib/traderadar/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpIcon, ArrowDownIcon, TrendingUp } from 'lucide-react';

interface TokenScreenerProps {
  data: TokenData[];
  onSelectToken?: (token: TokenData) => void;
}

export function TokenScreener({ data, onSelectToken }: TokenScreenerProps) {
  const [sortBy, setSortBy] = useState<'volume' | 'price' | 'change' | 'tvl'>('volume');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let aVal: number, bVal: number;

      switch (sortBy) {
        case 'volume':
          aVal = a.volume24h;
          bVal = b.volume24h;
          break;
        case 'price':
          aVal = a.price;
          bVal = b.price;
          break;
        case 'change':
          aVal = a.priceChange24h;
          bVal = b.priceChange24h;
          break;
        case 'tvl':
          aVal = a.tvl || 0;
          bVal = b.tvl || 0;
          break;
        default:
          return 0;
      }

      return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
    });
  }, [data, sortBy, sortDir]);

  const formatNumber = (num: number, decimals: number = 2) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(decimals)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(decimals)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(decimals)}K`;
    return `$${num.toFixed(decimals)}`;
  };

  const toggleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(column);
      setSortDir('desc');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Market Screener
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-sm text-muted-foreground">
                <th className="text-left p-2 font-medium">Symbol</th>
                <th
                  className="text-right p-2 font-medium cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort('price')}
                >
                  Price {sortBy === 'price' && (sortDir === 'desc' ? '↓' : '↑')}
                </th>
                <th
                  className="text-right p-2 font-medium cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort('change')}
                >
                  24h % {sortBy === 'change' && (sortDir === 'desc' ? '↓' : '↑')}
                </th>
                <th
                  className="text-right p-2 font-medium cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort('volume')}
                >
                  Volume {sortBy === 'volume' && (sortDir === 'desc' ? '↓' : '↑')}
                </th>
                <th
                  className="text-right p-2 font-medium cursor-pointer hover:text-foreground"
                  onClick={() => toggleSort('tvl')}
                >
                  TVL {sortBy === 'tvl' && (sortDir === 'desc' ? '↓' : '↑')}
                </th>
                <th className="text-right p-2 font-medium">Source</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((token, idx) => (
                <tr
                  key={`${token.symbol}-${idx}`}
                  className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => onSelectToken?.(token)}
                >
                  <td className="p-2 font-medium">{token.symbol}</td>
                  <td className="p-2 text-right">${token.price.toFixed(2)}</td>
                  <td className="p-2 text-right">
                    <span
                      className={`flex items-center justify-end gap-1 ${
                        token.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {token.priceChange24h >= 0 ? (
                        <ArrowUpIcon className="h-3 w-3" />
                      ) : (
                        <ArrowDownIcon className="h-3 w-3" />
                      )}
                      {Math.abs(token.priceChange24h).toFixed(2)}%
                    </span>
                  </td>
                  <td className="p-2 text-right">{formatNumber(token.volume24h)}</td>
                  <td className="p-2 text-right">
                    {token.tvl ? formatNumber(token.tvl) : '-'}
                  </td>
                  <td className="p-2 text-right">
                    <Badge variant={token.source === 'merkle' ? 'default' : 'secondary'}>
                      {token.source}
                    </Badge>
                  </td>
                </tr>
              ))}
              {sortedData.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No market data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
