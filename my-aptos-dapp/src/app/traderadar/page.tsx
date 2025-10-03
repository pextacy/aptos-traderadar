'use client';

import { useState } from 'react';
import { TokenScreener } from '@/components/traderadar/TokenScreener';
import { PriceChart } from '@/components/traderadar/PriceChart';
import { useMerkleData } from '@/lib/traderadar/hooks/useMerkleData';
import { useHyperionPools } from '@/lib/traderadar/hooks/useHyperionPools';
import { useLivePrices } from '@/lib/traderadar/hooks/useLivePrices';
import { TokenData } from '@/lib/traderadar/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

export default function TradeRadarPage() {
  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null);

  // Fetch Merkle data
  const {
    tokenData: merkleTokens,
    loading: merkleLoading,
    error: merkleError,
  } = useMerkleData();

  // Fetch Hyperion pools
  const {
    tokenData: hyperionTokens,
    alerts,
    loading: hyperionLoading,
    error: hyperionError,
  } = useHyperionPools();

  // Fetch live prices for selected token
  const {
    prices,
    currentPrice,
  } = useLivePrices(selectedToken?.symbol || '', 50);

  // Combine all token data
  const allTokens = [...merkleTokens, ...hyperionTokens];

  const handleSelectToken = (token: TokenData) => {
    setSelectedToken(token);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trade Radar</h1>
          <p className="text-muted-foreground mt-1">
            Real-time market data from Merkle Trade and Hyperion DEX
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">
            {merkleLoading ? 'Loading...' : `${merkleTokens.length} Merkle Pairs`}
          </Badge>
          <Badge variant="outline">
            {hyperionLoading ? 'Loading...' : `${hyperionTokens.length} Hyperion Pools`}
          </Badge>
        </div>
      </div>

      {/* Error Alerts */}
      {merkleError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Merkle Error: {merkleError}</AlertDescription>
        </Alert>
      )}

      {hyperionError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Hyperion Error: {hyperionError}</AlertDescription>
        </Alert>
      )}

      {/* Liquidity Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Liquidity Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((alert, idx) => (
                <Alert key={idx}>
                  <AlertDescription>{alert.message}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price Chart - Only shown when a token is selected */}
      {selectedToken && (
        <PriceChart
          symbol={selectedToken.symbol}
          prices={prices}
          currentPrice={currentPrice}
        />
      )}

      {/* Token Screener */}
      {merkleLoading || hyperionLoading ? (
        <Card>
          <CardContent className="p-12">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-3">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                <p className="text-muted-foreground">Loading market data...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <TokenScreener data={allTokens} onSelectToken={handleSelectToken} />
      )}

      {/* Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Markets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allTokens.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              24h Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(allTokens.reduce((acc, t) => acc + t.volume24h, 0) / 1e6).toFixed(2)}M
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total TVL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {(
                allTokens.reduce((acc, t) => acc + (t.tvl || 0), 0) / 1e6
              ).toFixed(2)}
              M
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
