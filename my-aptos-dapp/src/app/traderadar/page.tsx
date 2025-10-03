'use client';

import React, { useState } from 'react';
import { useMerkleData } from '@/lib/traderadar/hooks/useMerkleData';
import { useHyperionPools } from '@/lib/traderadar/hooks/useHyperionPools';
import { useLivePrices } from '@/lib/traderadar/hooks/useLivePrices';
import { TokenScreener } from '@/components/traderadar/TokenScreener';
import { PriceChart } from '@/components/traderadar/PriceChart';
import { TradeModal } from '@/components/traderadar/TradeModal';
import { TokenData } from '@/lib/traderadar/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Activity, AlertCircle, BarChart3, Zap } from 'lucide-react';

export default function TradeRadarPage() {
  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null);
  const [showTradeModal, setShowTradeModal] = useState(false);

  // Fetch data from Merkle and Hyperion
  const { tokenData: merkleData, loading: merkleLoading, error: merkleError } = useMerkleData();
  const {
    tokenData: hyperionData,
    alerts,
    loading: hyperionLoading,
    error: hyperionError,
  } = useHyperionPools();

  // Combine data sources
  const combinedData = [...merkleData, ...hyperionData];

  // Live prices for selected token
  const { prices, currentPrice, loading: pricesLoading } = useLivePrices(
    selectedToken?.symbol || 'BTC_USD'
  );

  const handleTokenSelect = (token: TokenData) => {
    setSelectedToken(token);
  };

  const handleTradeClick = () => {
    if (selectedToken) {
      setShowTradeModal(true);
    }
  };

  // Calculate market metrics
  const totalTVL = combinedData.reduce((sum, token) => sum + (token.tvl || 0), 0);
  const totalVolume24h = combinedData.reduce((sum, token) => sum + token.volume24h, 0);
  const avgFundingRate =
    merkleData.reduce((sum, token) => sum + (token.fundingRate || 0), 0) / merkleData.length || 0;

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            TradeRadar
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time DEX analytics powered by Merkle Trade & Hyperion on Aptos
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-green-500 border-green-500">
            <Zap className="h-3 w-3 mr-1" />
            Live
          </Badge>
          <Badge variant="outline">Aptos Testnet</Badge>
        </div>
      </div>

      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total TVL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalTVL >= 1e6 ? (totalTVL / 1e6).toFixed(2) + 'M' : totalTVL.toFixed(0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              24h Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalVolume24h >= 1e6 ? (totalVolume24h / 1e6).toFixed(2) + 'M' : totalVolume24h.toFixed(0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Funding Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(avgFundingRate * 100).toFixed(3)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.slice(0, 3).map((alert, idx) => (
            <Alert key={idx} variant="default">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Error Handling */}
      {(merkleError || hyperionError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {merkleError || hyperionError}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Token Screener - Takes 2 columns */}
        <div className="lg:col-span-2">
          <TokenScreener data={combinedData} onSelectToken={handleTokenSelect} />
        </div>

        {/* Selected Token Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Selected Token
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedToken ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold">{selectedToken.symbol}</h3>
                    <p className="text-3xl font-bold mt-2">${selectedToken.price.toFixed(2)}</p>
                    <p
                      className={`text-sm mt-1 ${
                        selectedToken.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {selectedToken.priceChange24h >= 0 ? '+' : ''}
                      {selectedToken.priceChange24h.toFixed(2)}% (24h)
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">24h Volume:</span>
                      <span className="font-medium">
                        $
                        {selectedToken.volume24h >= 1e6
                          ? (selectedToken.volume24h / 1e6).toFixed(2) + 'M'
                          : selectedToken.volume24h.toFixed(0)}
                      </span>
                    </div>

                    {selectedToken.tvl && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">TVL:</span>
                        <span className="font-medium">
                          $
                          {selectedToken.tvl >= 1e6
                            ? (selectedToken.tvl / 1e6).toFixed(2) + 'M'
                            : selectedToken.tvl.toFixed(0)}
                        </span>
                      </div>
                    )}

                    {selectedToken.apr && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">APR:</span>
                        <span className="font-medium text-green-500">
                          {selectedToken.apr.toFixed(2)}%
                        </span>
                      </div>
                    )}

                    {selectedToken.fundingRate !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Funding Rate:</span>
                        <span className="font-medium">
                          {(selectedToken.fundingRate * 100).toFixed(3)}%
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Source:</span>
                      <Badge variant={selectedToken.source === 'merkle' ? 'default' : 'secondary'}>
                        {selectedToken.source}
                      </Badge>
                    </div>
                  </div>

                  <Button className="w-full" onClick={handleTradeClick}>
                    Trade on Merkle
                  </Button>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Select a token from the screener to view details
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Price Chart - Full Width */}
      {selectedToken && (
        <div className="w-full">
          <PriceChart symbol={selectedToken.symbol} prices={prices} currentPrice={currentPrice} />
        </div>
      )}

      {/* Trade Modal */}
      {selectedToken && (
        <TradeModal
          open={showTradeModal}
          onOpenChange={setShowTradeModal}
          symbol={selectedToken.symbol}
          currentPrice={selectedToken.price}
        />
      )}

      {/* Loading State */}
      {(merkleLoading || hyperionLoading) && combinedData.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-muted-foreground">Loading market data...</p>
          </div>
        </div>
      )}
    </div>
  );
}
