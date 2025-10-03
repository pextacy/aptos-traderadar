'use client';

import { useEffect, useState, useRef } from 'react';
import { PricePoint } from '../types';
import { getMerkleMarketData } from '../merkleClient';

export function useLivePrices(symbol: string, maxPoints: number = 50) {
  const [prices, setPrices] = useState<PricePoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!symbol) return;

    let mounted = true;
    const ws = wsRef.current;

    // Fetch real price data from Merkle API
    async function fetchLivePrices() {
      try {
        const marketData = await getMerkleMarketData(symbol);

        if (!mounted) return;

        if (marketData) {
          const price = parseFloat(marketData.markPrice || marketData.indexPrice || '0');

          const pricePoint: PricePoint = {
            timestamp: Date.now(),
            price,
            volume: parseFloat(marketData.volume24h || '0'),
          };

          setPrices(prev => {
            const updated = [...prev, pricePoint];
            if (updated.length > maxPoints) {
              return updated.slice(-maxPoints);
            }
            return updated;
          });

          setCurrentPrice(price);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching live prices:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    }

    // Initial fetch
    fetchLivePrices();

    // Poll for updates every 2 seconds
    const interval = setInterval(fetchLivePrices, 2000);

    return () => {
      mounted = false;
      clearInterval(interval);
      if (ws) {
        ws.close();
      }
    };
  }, [symbol, maxPoints]);

  return { prices, currentPrice, loading };
}

// Hook for multiple symbols
export function useMultipleLivePrices(symbols: string[]) {
  const [pricesMap, setPricesMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchMultiplePrices() {
      try {
        const pricePromises = symbols.map(async (symbol) => {
          const marketData = await getMerkleMarketData(symbol);
          const price = marketData
            ? parseFloat(marketData.markPrice || marketData.indexPrice || '0')
            : 0;
          return { symbol, price };
        });

        const results = await Promise.all(pricePromises);

        if (!mounted) return;

        const updated: Record<string, number> = {};
        results.forEach(({ symbol, price }) => {
          updated[symbol] = price;
        });

        setPricesMap(updated);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching multiple live prices:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    }

    // Initial fetch
    fetchMultiplePrices();

    // Poll for updates every 3 seconds
    const interval = setInterval(fetchMultiplePrices, 3000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [symbols]);

  return { pricesMap, loading };
}
