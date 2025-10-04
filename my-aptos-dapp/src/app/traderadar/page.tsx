'use client';

import React, { useEffect, useState } from 'react';
import { TokenScreener } from '@/components/traderadar/TokenScreener';
import { PriceChart } from '@/components/traderadar/PriceChart';
import { TradeModal } from '@/components/traderadar/TradeModal';
import { MarketOverview } from '@/components/traderadar/MarketOverview';
import { AlertsPanel } from '@/components/traderadar/AlertsPanel';
import { LiveSwapFeed } from '@/components/traderadar/LiveSwapFeed';
import { VolumeChart } from '@/components/traderadar/VolumeChart';
import { TokenData, PricePoint } from '@/lib/traderadar/types';
import { fetchMultipleTokenPrices } from '@/lib/traderadar/priceOracle';
import { getAllHyperionPools } from '@/lib/traderadar/hyperionUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, BarChart3, AlertTriangle, Activity } from 'lucide-react';

export default function TradeRadarPage() {
  const [tokenData, setTokenData] = useState<TokenData[]>([]);
  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null);
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch market data from Hyperion pools and price oracle
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch Hyperion pool data
        const pools = await getAllHyperionPools();

        // Get unique tokens from pools
        const symbols = new Set<string>();
        pools.forEach(pool => {
          symbols.add(pool.token0);
          symbols.add(pool.token1);
        });

        // Fetch real-time prices from CoinGecko
        const prices = await fetchMultipleTokenPrices(Array.from(symbols));

        // Combine data from Hyperion pools with real prices
        const combinedData: TokenData[] = pools.map(pool => {
          const symbol = `${pool.token0}/${pool.token1}`;
          const price = prices[pool.token0] || 0;

          return {
            symbol,
            price,
            priceChange24h: pool.priceChange24h || 0,
            volume24h: pool.volume24h,
            tvl: pool.tvl,
            apr: pool.apr,
            source: 'hyperion' as const,
          };
        });

        setTokenData(combinedData);

        // Set default selected token (first one with data)
        if (combinedData.length > 0 && !selectedToken) {
          setSelectedToken(combinedData[0]);
        }
      } catch (err) {
        console.error('Error fetching market data:', err);
        setError('Failed to load market data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketData();

    // Refresh data every 30 seconds
    const interval = setInterval(fetchMarketData, 30000);

    return () => clearInterval(interval);
  }, [selectedToken]);

  // Update price history for selected token
  useEffect(() => {
    if (!selectedToken) return;

    const updatePriceHistory = () => {
      const newPoint: PricePoint = {
        timestamp: Date.now(),
        price: selectedToken.price,
        volume: selectedToken.volume24h,
      };

      setPriceHistory(prev => {
        const updated = [...prev, newPoint];
        // Keep only last 50 points
        return updated.slice(-50);
      });
    };

    updatePriceHistory();

    // Update price chart every 5 seconds
    const interval = setInterval(updatePriceHistory, 5000);

    return () => clearInterval(interval);
  }, [selectedToken]);

  const handleSelectToken = (token: TokenData) => {
    setSelectedToken(token);
    setPriceHistory([]); // Reset price history when selecting new token
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading market data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            TradeRadar - Live Market Data
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time DEX analytics powered by Hyperion & CoinGecko
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {tokenData.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-muted-foreground">
              <p>No market data available at the moment.</p>
              <p className="text-sm mt-2">Please check back later or verify your network connection.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {tokenData.length > 0 && (
        <>
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="overview" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="alerts" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                Alerts
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-2">
                <Activity className="h-4 w-4" />
                Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <MarketOverview />

              <div className="grid gap-6 lg:grid-cols-2">
                {selectedToken && (
                  <div className="lg:col-span-2">
                    <PriceChart
                      symbol={selectedToken.symbol}
                      prices={priceHistory}
                      currentPrice={selectedToken.price}
                    />
                  </div>
                )}

                <div className="lg:col-span-2">
                  <TokenScreener
                    data={tokenData}
                    onSelectToken={handleSelectToken}
                  />
                </div>

                {selectedToken && selectedToken.tvl && (
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Pool Information - {selectedToken.symbol}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Value Locked</p>
                            <p className="text-2xl font-bold">
                              ${selectedToken.tvl.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">24h Volume</p>
                            <p className="text-2xl font-bold">
                              ${selectedToken.volume24h.toLocaleString()}
                            </p>
                          </div>
                          {selectedToken.apr && (
                            <div>
                              <p className="text-sm text-muted-foreground">APR</p>
                              <p className="text-2xl font-bold text-green-500">
                                {selectedToken.apr.toFixed(2)}%
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-sm text-muted-foreground">Source</p>
                            <p className="text-lg font-semibold capitalize">
                              {selectedToken.source}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-6">
              <AlertsPanel />

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="lg:col-span-2">
                  <VolumeChart />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <LiveSwapFeed limit={25} />

                <div className="space-y-6">
                  <VolumeChart />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {selectedToken && (
            <TradeModal
              open={tradeModalOpen}
              onOpenChange={setTradeModalOpen}
              symbol={selectedToken.symbol}
              currentPrice={selectedToken.price}
            />
          )}
        </>
      )}

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Market data is fetched in real-time from CoinGecko API and Hyperion liquidity pools.
          Prices update automatically every 30 seconds.
        </AlertDescription>
      </Alert>
    </div>
  );
}
